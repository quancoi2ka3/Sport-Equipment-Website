'use client';

import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

interface CheckoutFormProps {
  clientSecret: string;
  onPaymentSuccess: () => void;
}

// Explicitly export the component type for TypeScript
export type { CheckoutFormProps };

export default function CheckoutForm({ clientSecret, onPaymentSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    // Check the payment status on load
    if (clientSecret) {
      stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
        switch (paymentIntent?.status) {
          case "succeeded":
            setMessage("Payment successful!");
            onPaymentSuccess();
            break;
          case "processing":
            setMessage("Your payment is processing.");
            break;
          case "requires_payment_method":
            setMessage("Please provide your payment details.");
            break;
          default:
            setMessage("Something went wrong.");
            break;
        }
      });
    }
  }, [stripe, clientSecret, onPaymentSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      return;
    }

    setIsLoading(true);
    setMessage(null);

    // Use Stripe.js to handle the payment
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
      redirect: 'if_required'
    });

    if (error) {
      // Show error to customer
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || "An unexpected error occurred.");
      } else {
        setMessage("An unexpected error occurred.");
      }
      setIsLoading(false);
    } else {
      // The payment has been processed!
      onPaymentSuccess();
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-4">
        <PaymentElement id="payment-element" options={{
          layout: {
            type: 'tabs',
            defaultCollapsed: false,
          },
        }} />
      </div>

      <button
        disabled={isLoading || !stripe || !elements}
        type="submit"
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-300"
      >
        {isLoading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
        ) : (
          "Pay Now"
        )}
      </button>
      
      {/* Show any payment error or success message */}
      {message && (
        <div className={`mt-4 p-4 rounded-md ${message.includes("successful") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
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
      </div>
    </form>
  );
}