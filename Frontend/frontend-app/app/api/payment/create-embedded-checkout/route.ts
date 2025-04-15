import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Environment variable for Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// Initialize Stripe with robust error handling
let stripe: Stripe | null = null;

try {
  if (!stripeSecretKey) {
    console.warn('Warning: STRIPE_SECRET_KEY is not defined in environment variables');
  } else {
    // Initialize Stripe without specifying API version for better compatibility with Node 18+
    stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2022-11-15', // Use a stable version instead of future dated version
      typescript: true,
    });
    console.log('Stripe initialized successfully for embedded checkout');
  }
} catch (error) {
  console.error('Failed to initialize Stripe:', error);
}

// Define interface for request body
interface RequestBody {
  amount: number;
  currency?: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
  lineItems?: Array<{
    price_data?: {
      currency: string;
      product_data: {
        name: string;
        images?: string[];
        description?: string;
      };
      unit_amount: number;
    };
    price?: string;
    quantity: number;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe was initialized properly
    if (!stripe) {
      return NextResponse.json(
        { message: 'Stripe is not configured properly. Please check your API key.' },
        { status: 500 }
      );
    }

    // Parse the request body
    const body: RequestBody = await request.json();
    const {
      amount,
      currency = 'usd',
      successUrl,
      cancelUrl,
      customerEmail,
      metadata = {},
      lineItems = [],
    } = body;

    // Validate inputs
    if (!successUrl || !cancelUrl) {
      return NextResponse.json(
        { message: 'Success and cancel URLs are required' },
        { status: 400 }
      );
    }

    console.log(`Creating checkout session with amount: ${amount} ${currency}`);
    console.log(`Line items count: ${lineItems.length}`);

    // Fallback line items if none provided
    const checkoutLineItems = lineItems.length > 0 ? lineItems : [
      {
        price_data: {
          currency,
          product_data: {
            name: 'Order Payment',
            description: 'Payment for your order',
          },
          unit_amount: Math.round(amount),
        },
        quantity: 1,
      },
    ];

    // Create the checkout session using a simpler approach
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: checkoutLineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail || undefined,
      metadata,
      // Use hosted checkout instead of embedded if there are compatibility issues
      // ui_mode: 'embedded', 
    });

    console.log(`Checkout session created: ${session.id}`);

    // Return the session details - client secret may not be present with hosted checkout
    return NextResponse.json({
      id: session.id,
      clientSecret: session.client_secret || null,
      url: session.url || null,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    // Handle different types of errors
    const stripeError = error as unknown as { type?: string; message?: string; statusCode?: number };
    
    if (stripeError?.type === 'StripeAuthenticationError') {
      return NextResponse.json(
        { message: 'Invalid API Key provided. Please check your Stripe secret key.' },
        { status: 401 }
      );
    }
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { message: stripeError.message || 'Stripe error occurred' },
        { status: stripeError.statusCode || 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Internal server error while creating checkout session' },
      { status: 500 }
    );
  }
}