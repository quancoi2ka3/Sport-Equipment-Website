import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import getConfig from 'next/config';

// Get runtime config
const { serverRuntimeConfig } = getConfig() || {};

// Initialize Stripe with your secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || serverRuntimeConfig?.STRIPE_SECRET_KEY;
let stripe: Stripe | null = null;

// Only initialize Stripe if the API key is available
try {
  if (stripeSecretKey) {
    stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16', // Using a stable version compatible with Node.js 18
      typescript: true,
    });
    console.log('Stripe initialized successfully for payment verification');
  } else {
    console.warn('Warning: STRIPE_SECRET_KEY is not defined in environment variables');
  }
} catch (error) {
  console.error('Failed to initialize Stripe:', error);
}

export async function GET(request: NextRequest) {
  try {
    // Check if Stripe was initialized properly
    if (!stripe) {
      return NextResponse.json(
        { message: 'Stripe is not configured properly. Please check your API key.' },
        { status: 500 }
      );
    }
    
    const searchParams = request.nextUrl.searchParams;
    const paymentIntentId = searchParams.get('paymentIntentId');

    if (!paymentIntentId) {
      return NextResponse.json(
        { message: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the payment intent to check its status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Additional logging
    console.log(`Payment intent ${paymentIntentId} status: ${paymentIntent.status}`);
    
    // Enhanced status handling
    const isSuccessful = ['succeeded', 'processing'].includes(paymentIntent.status);
    
    return NextResponse.json({
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata,
      isSuccessful: isSuccessful,
      paymentMethod: paymentIntent.payment_method,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    
    // Log more details for debugging
    if (error instanceof Stripe.errors.StripeError) {
      console.error('Stripe error details:', {
        type: error.type,
        code: (error as any).code,
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