'use client';

import React, { useEffect, useState } from 'react';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import stripePublishableKey from '../config/stripe';

interface EmbeddedCheckoutComponentProps {
  clientSecret: string;
  onComplete: () => void;
}

// Create a singleton Stripe promise using our centralized config
let stripePromise: Promise<any> | null = null;

const getStripePromise = () => {
  if (!stripePromise && stripePublishableKey) {
    console.log('Initializing Stripe instance for embedded checkout');
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

const EmbeddedCheckoutComponent: React.FC<EmbeddedCheckoutComponentProps> = ({ 
  clientSecret, 
  onComplete 
}) => {
  const [stripeInstance, setStripeInstance] = useState<Promise<any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Stripe on component mount
  useEffect(() => {
    const initializeStripe = async () => {
      try {
        setLoading(true);
        
        if (!stripePublishableKey) {
          console.error('Stripe publishable key is missing in environment variables');
          setError('Missing Stripe configuration. Please contact support.');
          setLoading(false);
          return;
        }
        
        // Use the singleton Stripe promise from our centralized config
        const stripePromise = getStripePromise();
        setStripeInstance(stripePromise);
        
        console.log('Stripe initialized successfully for embedded checkout');
      } catch (err) {
        console.error('Failed to initialize Stripe:', err);
        setError('Failed to initialize payment system. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    initializeStripe();
  }, []);

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

  if (!clientSecret) {
    return (
      <div className="border border-yellow-300 rounded-md p-4 bg-yellow-50 text-yellow-800">
        <p className="font-medium">Missing payment information</p>
        <p>Could not initialize the payment form. Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-md shadow-sm">
      {clientSecret && stripeInstance && (
        <EmbeddedCheckoutProvider
          stripe={stripeInstance}
          options={{ clientSecret }}
        >
          <EmbeddedCheckout
            onComplete={handleCheckoutComplete}
            onError={handleCheckoutError}
            className="h-full w-full" // Increased height from 500px to 700px
          />
        </EmbeddedCheckoutProvider>
      )}
    </div>
  );
};

export default EmbeddedCheckoutComponent;