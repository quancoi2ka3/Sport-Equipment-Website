'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import stripeService from '@/app/services/payment/stripeService';

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderInfo, setOrderInfo] = useState({
    id: '',
    status: '',
    amount: 0,
    currency: 'usd'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get payment_intent and payment_intent_client_secret from URL
    const paymentIntentId = searchParams.get('payment_intent');
    const redirectStatus = searchParams.get('redirect_status');
    
    if (paymentIntentId) {
      // Verify the payment with our backend
      const verifyPaymentStatus = async () => {
        try {
          const paymentDetails = await stripeService.verifyPayment(paymentIntentId);
          
          setOrderInfo({
            id: paymentDetails.id,
            status: paymentDetails.status,
            amount: paymentDetails.amount,
            currency: paymentDetails.currency
          });
          
          // In a real application, you would store order details in your database
          // and associate them with the user's account
          
        } catch (error) {
          console.error('Error verifying payment:', error);
          // Handle verification error
          setOrderInfo({
            id: paymentIntentId,
            status: 'verification_failed',
            amount: 0,
            currency: 'usd'
          });
        } finally {
          setLoading(false);
        }
      };
      
      verifyPaymentStatus();
    } else {
      // If there's no payment intent, this page might have been accessed directly
      // You can handle this case accordingly (e.g., redirect to home)
      setTimeout(() => {
        router.push('/');
      }, 5000);
      setLoading(false);
    }
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl w-full text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Thank You For Your Order!</h1>
        
        <p className="text-gray-600 mb-6">
          Your payment was successful and your order has been placed.
        </p>
        
        {orderInfo.id && (
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <p className="text-sm text-gray-600">Order Reference: <span className="font-medium">{orderInfo.id}</span></p>
            <p className="text-sm text-gray-600">Status: <span className="font-medium text-green-600">{orderInfo.status}</span></p>
            <p className="text-sm text-gray-600">Amount: <span className="font-medium">{orderInfo.amount / 100} {orderInfo.currency.toUpperCase()}</span></p>
          </div>
        )}
        
        <p className="text-gray-600 mb-8">
          We are sent a confirmation email with order details and tracking information.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/products" className="w-full sm:w-auto bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 transition-colors">
            Continue Shopping
          </Link>
          
          <Link href="/account/orders" className="w-full sm:w-auto text-blue-600 py-3 px-6 rounded-md font-medium border border-blue-600 hover:bg-blue-50 transition-colors">
            View Order Status
          </Link>
        </div>
      </div>
    </div>
  );
}