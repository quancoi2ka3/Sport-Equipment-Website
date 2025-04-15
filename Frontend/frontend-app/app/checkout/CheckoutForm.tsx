'use client';

import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

interface CheckoutFormProps {
  clientSecret: string;
  onPaymentSuccess: () => void;
}

export type { CheckoutFormProps };

export default function CheckoutForm({ clientSecret, onPaymentSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [isElementLoading, setIsElementLoading] = useState(true);
  const [elementError, setElementError] = useState<string | null>(null);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    // Check the payment status on load
    if (clientSecret) {
      setIsProcessing(true);
      stripe.retrievePaymentIntent(clientSecret)
        .then(({ paymentIntent }) => {
          if (paymentIntent) {
            setPaymentStatus(paymentIntent.status);
            
            switch (paymentIntent.status) {
              case "succeeded":
                setMessage("Payment successful! You will be redirected shortly.");
                onPaymentSuccess();
                break;
              case "processing":
                setMessage("Your payment is processing. Please wait a moment.");
                break;
              case "requires_payment_method":
                setMessage("Please provide your payment details to complete checkout.");
                break;
              case "requires_action":
                setMessage("Additional verification required. Please follow the prompts.");
                // Handle 3D Secure or other authentication here
                stripe.handleNextAction({ clientSecret })
                  .then(({ paymentIntent }) => {
                    if (paymentIntent && paymentIntent.status === 'succeeded') {
                      setMessage("Payment authentication successful! Redirecting...");
                      onPaymentSuccess();
                    }
                  })
                  .catch(error => {
                    console.error("Error handling payment authentication:", error);
                    setMessage("Payment authentication failed. Please try again.");
                  });
                break;
              default:
                setMessage("Something went wrong with the payment. Please try again.");
                break;
            }
          }
        })
        .catch(error => {
          console.error("Error checking payment status:", error);
          setMessage("Unable to verify payment status. Please try again.");
        })
        .finally(() => {
          setIsProcessing(false);
        });
    }
  }, [stripe, clientSecret, onPaymentSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      setMessage("Payment system is initializing. Please wait and try again.");
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Use Stripe.js to handle the payment - make sure PaymentElement is mounted
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
        redirect: 'if_required'
      });

      if (error) {
        // Show error to customer
        if (error.type === "card_error" || error.type === "validation_error") {
          setMessage(error.message || "There was a problem with your payment method. Please check your details and try again.");
        } else {
          setMessage("An unexpected error occurred while processing your payment. Please try again later.");
          console.error("Stripe payment error:", error);
        }
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // The payment has been processed successfully!
        setMessage("Payment successful! You will be redirected shortly.");
        onPaymentSuccess();
      } else if (paymentIntent) {
        // Handle other payment intent statuses
        setPaymentStatus(paymentIntent.status);
        switch(paymentIntent.status) {
          // ...existing code...
        }
      }
    } catch (unexpectedError) {
      console.error("Unexpected error during payment confirmation:", unexpectedError);
      setMessage("An error occurred during payment processing. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle payment element loading and error states
  const handlePaymentElementReady = () => {
    setIsElementLoading(false);
  };

  const handlePaymentElementError = (event: { elementType: "payment"; error: { type: string; message?: string; code?: string; } }) => {
    console.error("Payment element error:", event);
    setElementError("There was a problem loading the payment form. Please refresh the page and try again.");
    setIsElementLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      {isProcessing && (
        <div className="flex justify-center items-center mb-4">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600 mr-2"></div>
          <p>Checking payment status...</p>
        </div>
      )}
      
      {/* Show loading indicator while payment element is initializing */}
      {isElementLoading && (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mr-2"></div>
          <p>Loading payment options...</p>
        </div>
      )}

      {/* Show element error if it occurs */}
      {elementError && (
        <div className="p-4 rounded-md bg-red-50 text-red-600 mb-4">
          {elementError}
        </div>
      )}
      
      {/* Payment Element with updated styling and event handlers */}
      <div className={`mb-4 rounded-md border border-gray-300 p-4 ${isElementLoading ? 'hidden' : ''}`}>
        <PaymentElement 
          id="payment-element" 
          onReady={handlePaymentElementReady}
          onLoadError={handlePaymentElementError}
          options={{
            layout: {
              type: 'tabs',
              defaultCollapsed: false,
              radios: true,
              spacedAccordionItems: true
            },
          }} 
        />
      </div>

      {/* Show saved payment methods toggle */}
      <div className="flex items-center mb-4">
        <input 
          type="checkbox" 
          id="save-payment-method"
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="save-payment-method" className="ml-2 block text-sm text-gray-900">
          Save my payment information for future purchases
        </label>
      </div>

      <button
        disabled={isLoading || !stripe || !elements || paymentStatus === 'succeeded' || isElementLoading || !!elementError}
        type="submit"
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
        ) : paymentStatus === 'succeeded' ? (
          "Payment Complete"
        ) : (
          "Pay Now"
        )}
      </button>
      
      {/* Show any payment error or success message */}
      {message && (
        <div className={`mt-4 p-4 rounded-md ${
          message.includes("successful") || message.includes("Complete") 
            ? "bg-green-50 text-green-600" 
            : "bg-red-50 text-red-600"
        }`}>
          {message}
        </div>
      )}

      {/* Payment method information */}
      <div className="mt-6 pt-6 border-t">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Accepted Payment Methods</h3>
        <div className="flex flex-wrap gap-2">
          <div className="px-3 py-1 border rounded text-sm text-gray-700">Visa</div>
          <div className="px-3 py-1 border rounded text-sm text-gray-700">Mastercard</div>
          <div className="px-3 py-1 border rounded text-sm text-gray-700">American Express</div>
          <div className="px-3 py-1 border rounded text-sm text-gray-700">Discover</div>
          <div className="px-3 py-1 border rounded text-sm text-gray-700">Apple Pay</div>
          <div className="px-3 py-1 border rounded text-sm text-gray-700">Google Pay</div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Your payment information is processed securely. We do not store your credit card details.
        </p>
        <p className="text-xs text-gray-500 mt-1">
          All transactions are secured and encrypted by Stripe.
        </p>
      </div>
    </form>
  );
}