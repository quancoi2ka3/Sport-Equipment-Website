'use client';

import { loadStripe, Stripe } from '@stripe/stripe-js';

// Replace with your own Stripe publishable key
const stripePublishableKey = 'pk_test_51NxmVWE4n2TrIlSgjnw1JZI1s3wE30xQsGGtG1jJhZ5hHW9YvmIYQXd9MYnq7TzTv20DVrCIsTdVRbSI7SvOQnDW00kHqTvgAR';

interface PaymentIntentRequest {
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
}

interface PaymentIntentResponse {
  clientSecret: string;
  id: string;
}

// Singleton pattern to ensure we only load Stripe once
let stripePromise: Promise<Stripe | null>;

const stripeService = {
  // Initialize and get the Stripe instance
  getStripe: () => {
    if (!stripePromise) {
      stripePromise = loadStripe(stripePublishableKey);
    }
    return stripePromise;
  },

  // Create a payment intent
  createPaymentIntent: async (data: PaymentIntentRequest): Promise<PaymentIntentResponse> => {
    try {
      const response = await fetch('/api/payment/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(data.amount * 100), // Convert to cents
          currency: data.currency || 'usd',
          metadata: data.metadata || {},
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  // Create a checkout session (alternative to PaymentIntent)
  createCheckoutSession: async (data: {
    lineItems: Array<{ price: string; quantity: number }>;
    successUrl: string;
    cancelUrl: string;
  }) => {
    try {
      const response = await fetch('/api/payment/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
      }

      const session = await response.json();
      
      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({
          sessionId: session.id,
        });

        if (error) {
          throw new Error(error.message || 'Failed to redirect to checkout');
        }
      }

      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  },

  // Verify payment
  verifyPayment: async (paymentIntentId: string) => {
    try {
      const response = await fetch(`/api/payment/verify-payment?paymentIntentId=${paymentIntentId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
      }

      return await response.json();
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  },
};

export default stripeService;