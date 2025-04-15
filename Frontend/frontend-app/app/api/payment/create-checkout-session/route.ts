import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import getConfig from 'next/config';

// Get runtime config
const { serverRuntimeConfig } = getConfig() || {};

// Initialize Stripe with your secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || serverRuntimeConfig?.STRIPE_SECRET_KEY;
let stripe: Stripe | null = null;

// Only initialize Stripe if the API key is available
if (stripeSecretKey) {
  stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-03-31.basil', // Match the correct type for Stripe v18
  });
} else {
  console.warn('Warning: STRIPE_SECRET_KEY is not defined in environment variables');
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
    
    if (error instanceof Stripe.errors.StripeError) {
      console.error('Stripe error details:', {
        type: error.type,
        code: error.code,
        statusCode: error.statusCode,
        message: error.message,
        param: error.param
      });
      
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}