import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
let stripe: Stripe | null = null;

// Only initialize Stripe if the API key is available
try {
  if (stripeSecretKey) {
    stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16', // Using a stable version compatible with Node.js 18
      typescript: true,
    });
    console.log('Stripe initialized successfully for checkout session');
  } else {
    console.warn('Warning: STRIPE_SECRET_KEY is not defined in environment variables');
  }
} catch (error) {
  console.error('Failed to initialize Stripe:', error);
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
    
    const body = await request.json();
    const { lineItems, successUrl, cancelUrl, customerEmail } = body;

    // Validate request parameters
    if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
      return NextResponse.json(
        { message: 'Invalid line items provided' },
        { status: 400 }
      );
    }

    if (!successUrl || !cancelUrl) {
      return NextResponse.json(
        { message: 'Success URL and cancel URL are required' },
        { status: 400 }
      );
    }

    // Construct the session parameters
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'VN'], // Add more countries as needed
      },
      billing_address_collection: 'auto',
    };

    // Add customer email if provided
    if (customerEmail) {
      sessionParams.customer_email = customerEmail;
    }

    // Create a Checkout Session
    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ 
      id: session.id, 
      url: session.url 
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    // Handle different types of errors
    const stripeError = error as { type?: string; message?: string; statusCode?: number };
    
    if (stripeError?.type === 'StripeAuthenticationError') {
      return NextResponse.json(
        { message: 'Invalid API Key provided. Please check your Stripe secret key.' },
        { status: 401 }
      );
    }
    
    if (error instanceof Stripe.errors.StripeError) {
      console.error('Stripe error details:', {
        type: stripeError.type,
        code: (error as any).code,
        statusCode: stripeError.statusCode,
        message: stripeError.message,
      });
      
      return NextResponse.json(
        { message: stripeError.message || 'Stripe error occurred' },
        { status: stripeError.statusCode || 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}