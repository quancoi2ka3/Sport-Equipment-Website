import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Environment variable for Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
let stripe: Stripe | null = null;

// Initialize Stripe without specifying API version for better compatibility
try {
  if (stripeSecretKey) {
    stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2022-11-15', // Use a stable version that works with Node 18
      typescript: true,
    });
    console.log('Stripe initialized successfully for payment intent creation');
  } else {
    console.warn('Warning: STRIPE_SECRET_KEY is not defined in environment variables');
  }
} catch (error) {
  console.error('Failed to initialize Stripe:', error);
}

// Define interface for Stripe errors
interface StripeErrorLike {
  type?: string;
  message?: string;
  statusCode?: number;
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
    
    console.log(`Creating payment intent for amount: ${amount} ${currency}`);
    
    // Create a PaymentIntent with the specified amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency,
      metadata,
      payment_method_types: ['card'],
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log(`Payment intent created: ${paymentIntent.id}`);

    // Return the client secret and payment intent ID
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
    });
  } catch (error: unknown) {
    console.error('Error creating payment intent:', error);
    
    // Type guard to check if error is an object with certain properties
    const stripeError = error as StripeErrorLike;
    
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
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}