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
    const { amount, currency = 'usd', metadata = {} } = body;

    // Validate the amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { message: 'Invalid amount provided' },
        { status: 400 }
      );
    }

    // Create a PaymentIntent with the specified amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency,
      metadata,
      // Use only automatic_payment_methods to avoid conflicts
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Return the client secret and payment intent ID
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
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