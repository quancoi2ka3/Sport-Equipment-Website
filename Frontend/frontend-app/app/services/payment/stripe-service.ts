import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51NxmVWE4n2TrIlSgdjO4VXvCNEGRdoQHWGjYXmN5Ij1uXI22igQXmFl60bTLQGnIkXDGRLy6kGRATUShwTL3MfSH00AZg2JLzP');

export interface LineItem {
  price_data: {
    currency: string;
    product_data: {
      name: string;
      images?: string[];
      description?: string;
    };
    unit_amount: number; // in cents
  };
  quantity: number;
}

export interface CreateCheckoutSessionParams {
  lineItems: LineItem[];
  successUrl: string;
  cancelUrl: string;
}

export interface PaymentIntent {
  id: string;
  status: string;
  amount: number;
  currency: string;
  metadata: Record<string, string>;
  isSuccessful: boolean;
}

/**
 * Creates a Stripe checkout session for payment processing
 */
export async function createCheckoutSession(params: CreateCheckoutSessionParams) {
  try {
    const response = await fetch('/api/payment/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create checkout session');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Verifies the status of a payment
 */
export async function verifyPayment(paymentIntentId: string): Promise<PaymentIntent> {
  try {
    const response = await fetch(`/api/payment/verify-payment?paymentIntentId=${paymentIntentId}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to verify payment');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
}

/**
 * Redirects to Stripe Checkout
 */
export async function redirectToCheckout(sessionId: string) {
  const stripe = await stripePromise;
  if (!stripe) {
    throw new Error('Stripe failed to initialize');
  }
  
  const { error } = await stripe.redirectToCheckout({ sessionId });
  
  if (error) {
    throw new Error(error.message || 'Failed to redirect to checkout');
  }
}