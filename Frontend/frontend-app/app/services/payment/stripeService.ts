'use client';

import { loadStripe, Stripe } from '@stripe/stripe-js';
import stripePublishableKey from '../../config/stripe';

// Singleton pattern to ensure we only load Stripe once
let stripePromise: Promise<Stripe | null>;

// Improved initializeStripe function for better error handling
const initializeStripe = () => {
  if (stripePromise) {
    return stripePromise;
  }

  if (!stripePublishableKey) {
    console.error('Cannot initialize Stripe: Missing publishable key');
    return Promise.reject(new Error('Stripe publishable key is missing'));
  }

  try {
    console.log('Initializing Stripe with publishable key');
    stripePromise = loadStripe(stripePublishableKey);
    return stripePromise;
  } catch (error) {
    console.error('Error initializing Stripe:', error);
    return Promise.reject(error);
  }
};

interface PaymentIntentRequest {
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
}

interface PaymentIntentResponse {
  clientSecret: string;
  id: string;
}

interface CheckoutSessionRequest {
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

interface CheckoutSessionResponse {
  id: string;
  clientSecret?: string | null;
  url?: string | null;
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

const stripeService = {
  // Initialize and get the Stripe instance with better error handling
  getStripe: async (): Promise<Stripe | null> => {
    try {
      return await initializeStripe();
    } catch (error) {
      console.error('Failed to get Stripe instance:', error);
      return null;
    }
  },

  // Create a payment intent
  createPaymentIntent: async (data: PaymentIntentRequest): Promise<PaymentIntentResponse> => {
    try {
      console.log('Creating payment intent:', data);
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
        console.error('Payment intent API error:', errorData);
        throw new Error(errorData.message || 'Something went wrong with the payment request');
      }

      const result = await response.json();
      console.log('Payment intent created successfully:', result.id);
      return result;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  // Create embedded checkout session
  createEmbeddedCheckoutSession: async (data: CheckoutSessionRequest): Promise<CheckoutSessionResponse> => {
    try {
      console.log('Creating embedded checkout session');
      
      // For embedded checkout, we need to either provide returnUrl or disable redirects
      const requestBody = {
        amount: data.amount,
        currency: data.currency || 'usd',
        customerEmail: data.customerEmail,
        metadata: data.metadata || {},
        lineItems: data.lineItems || [],
        // Add returnUrl for handling completion redirects - this is required for embedded checkout
        returnUrl: `${window.location.origin}/checkout/success`
      };

      const response = await fetch('/api/payment/create-embedded-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Embedded checkout API error:', errorData);
        throw new Error(errorData.message || 'Failed to create checkout session');
      }

      const result = await response.json();
      console.log('Checkout session created:', result.id);
      
      return result;
    } catch (error) {
      console.error('Error creating embedded checkout session:', error);
      throw error;
    }
  },

  // Create a redirect checkout session (alternative to embedded checkout)
  createCheckoutSession: async (data: CheckoutSessionRequest): Promise<CheckoutSessionResponse> => {
    try {
      console.log('Creating redirect checkout session');
      const response = await fetch('/api/payment/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Checkout session API error:', errorData);
        throw new Error(errorData.message || 'Something went wrong');
      }

      const session = await response.json();
      
      // If there's a direct URL, use it instead of redirectToCheckout
      if (session.url) {
        console.log('Redirecting to Stripe checkout:', session.url);
        window.location.href = session.url;
        return session;
      }
      
      // Redirect to Stripe Checkout
      const stripe = await initializeStripe();
      if (stripe) {
        console.log('Using Stripe.js redirect to checkout with session ID:', session.id);
        const { error } = await stripe.redirectToCheckout({
          sessionId: session.id,
        });

        if (error) {
          console.error('Stripe redirect error:', error);
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
      console.log('Verifying payment:', paymentIntentId);
      const response = await fetch(`/api/payment/verify-payment?paymentIntentId=${paymentIntentId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Verify payment API error:', errorData);
        throw new Error(errorData.message || 'Something went wrong');
      }

      const result = await response.json();
      console.log('Payment verification result:', result.status);
      return result;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  },
  
  // Confirm payment (handle additional actions like 3D Secure)
  confirmPayment: async (paymentIntentId: string, paymentMethodId: string) => {
    try {
      console.log('Confirming payment:', paymentIntentId);
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
        console.error('Confirm payment API error:', errorData);
        throw new Error(errorData.message || 'Something went wrong with payment confirmation');
      }

      const result = await response.json();
      console.log('Payment confirmed successfully:', result);
      return result;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  },
};

export default stripeService;