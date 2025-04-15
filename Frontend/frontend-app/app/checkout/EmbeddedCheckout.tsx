'use client';

import React, { useEffect, useState } from 'react';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import stripeService from '../services/payment/stripeService';

interface EmbeddedCheckoutComponentProps {
  clientSecret: string;
  onComplete: () => void;
}

const EmbeddedCheckoutComponent: React.FC<EmbeddedCheckoutComponentProps> = ({ 
  clientSecret, 
  onComplete 
}) => {
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Stripe on component mount
  useEffect(() => {
    try {
      // Get the Stripe instance directly rather than relying on the service
      const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      if (!publishableKey) {
        throw new Error('Stripe publishable key is not defined');
      }
      
      // Load Stripe directly
      const stripeInstance = loadStripe(publishableKey);
      setStripePromise(stripeInstance);
      
      console.log('Stripe initialization started');
    } catch (err) {
      console.error('Failed to initialize Stripe:', err);
      setError('Failed to initialize payment system. Please try again later.');
    }
  }, []);

  useEffect(() => {
    // Verify client secret exists
    if (!clientSecret) {
      setError('Missing client secret. Cannot initialize checkout.');
      setLoading(false);
      return;
    }
    
    if (stripePromise) {
      setLoading(false);
    }
  }, [clientSecret, stripePromise]);

  // Handle successful checkout completion
  const handleCheckoutComplete = () => {
    console.log('Checkout completed successfully');
    onComplete();
  };

  // Handle checkout errors
  const handleCheckoutError = (event: any) => {
    console.error('Checkout error:', event);
    setError('There was a problem with the checkout process. Please try again.');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-gray-700">Loading payment form...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-300 rounded-md p-4 bg-red-50 text-red-800">
        <p className="font-medium">Error initializing checkout</p>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 font-medium py-2 px-4 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-md shadow-sm">
      {clientSecret && stripePromise && (
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{ clientSecret }}
        >
          <EmbeddedCheckout
            onComplete={handleCheckoutComplete}
            onError={handleCheckoutError}
            className="h-[500px] w-full"
          />
        </EmbeddedCheckoutProvider>
      )}
    </div>
  );
};

export default EmbeddedCheckoutComponent;