'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState({
    id: '',
    status: 'processing',
    date: new Date().toLocaleDateString(),
  });

  useEffect(() => {
    // Get the session_id from URL query params if it exists
    const sessionId = searchParams.get('session_id');
    
    if (sessionId) {
      // In a production app, you would verify the session with your backend
      setOrderDetails({
        id: sessionId.slice(-8),
        status: 'completed',
        date: new Date().toLocaleDateString(),
      });
    }
    
    // If there's no session ID, we could redirect back to checkout
    // But for now we'll just show generic success info
  }, [searchParams]);

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Order Confirmed!</h1>
        <p className="text-gray-600 mb-8">
          Thank you for your purchase. Your order has been processed successfully.
        </p>
        
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Details</h2>
          <div className="flex flex-col space-y-3 text-left">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-medium">#{orderDetails.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Order Date:</span>
              <span className="font-medium">{orderDetails.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium text-green-600 capitalize">{orderDetails.status}</span>
            </div>
          </div>
        </div>
        
        <p className="text-gray-600 mb-6">
          We are sent you an email with your order details and tracking information.
        </p>
        
        <div className="space-y-4">
          <Link href="/" className="block w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors">
            Continue Shopping
          </Link>
          <Link href="/account/orders" className="block w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-md font-medium hover:bg-gray-50 transition-colors">
            View My Orders
          </Link>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>Need help? <a href="/contact" className="text-blue-600 hover:underline">Contact our support team</a></p>
        </div>
      </div>
    </div>
  );
}