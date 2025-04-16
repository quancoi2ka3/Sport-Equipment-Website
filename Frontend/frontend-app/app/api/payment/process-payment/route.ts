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
  try {
    stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16', // Using a stable version compatible with Node.js 18
      typescript: true,
    });
    console.log('Stripe initialized successfully for payment processing');
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
  }
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
    
    console.log(`Confirming payment intent: ${paymentIntentId} with payment method: ${paymentMethodId}`);
    
    // Confirm the payment intent with the payment method
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });

    console.log(`Payment confirmation result: ${paymentIntent.status}`);

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
      console.error('Stripe error details:', {
        type: error.type,
        code: (error as any).code,
        statusCode: error.statusCode,
        message: error.message
      });
      
      return NextResponse.json(
        { 
          success: false,
          message: error.message,
          code: error.type,
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