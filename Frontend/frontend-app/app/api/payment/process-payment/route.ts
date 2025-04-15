import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
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
    const { paymentMethodId, paymentIntentId } = body;
    
    // Validate required parameters
    if (!paymentIntentId) {
      return NextResponse.json(
        { message: 'Payment intent ID is required' },
        { status: 400 }
      );
    }
    
    if (!paymentMethodId) {
      return NextResponse.json(
        { message: 'Payment method ID is required' },
        { status: 400 }
      );
    }
    
    // Confirm the payment intent with the payment method
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });

    return NextResponse.json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      }
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { 
          success: false,
          message: error.message,
          code: error.code,
          type: error.type
        },
        { status: error.statusCode || 500 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Failed to process payment' },
      { status: 500 }
    );
  }
}