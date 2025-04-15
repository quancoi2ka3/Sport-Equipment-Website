'use client';

import { loadStripe, Stripe } from '@stripe/stripe-js';

// Use environment variable for Stripe publishable key
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

// Log warning if key is missing
if (!stripePublishableKey) {
  console.warn('Warning: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined in environment variables');
}

interface PaymentIntentRequest {
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
}

interface PaymentIntentResponse {
  clientSecret: string;
  id: string;
}

interface VerifyPaymentResponse {
  id: string;
  status: string;
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
  isSuccessful: boolean;
  paymentMethod?: string;
}

// Singleton pattern to ensure we only load Stripe once
let stripePromise: Promise<Stripe | null>;

const stripeService = {
  // Initialize and get the Stripe instance
  getStripe: () => {
    if (!stripePromise && stripePublishableKey) {
      stripePromise = loadStripe(stripePublishableKey, { 
        locale: 'en'
      });
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
        throw new Error(errorData.message || 'Something went wrong with the payment request');
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
    customerEmail?: string;
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
      
      // If there's a direct URL, use it instead of redirectToCheckout
      if (session.url) {
        window.location.href = session.url;
        return session;
      }
      
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
  verifyPayment: async (paymentIntentId: string): Promise<VerifyPaymentResponse> => {
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
  
  // Confirm payment (handle additional actions like 3D Secure)
  confirmPayment: async (paymentIntentId: string, paymentMethodId: string) => {
    try {
      const response = await fetch('/api/payment/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId,
          paymentMethodId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong with payment confirmation');
      }

      return await response.json();
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  },
};

export default stripeService;