'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getImagePath } from '@/app/utils/image-utils';
import { CartItem } from '@/app/context/CartContext';

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
}

// Explicitly export the component type for TypeScript
export type { OrderSummaryProps };

export default function OrderSummary({ items, subtotal, shipping, total }: OrderSummaryProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
      
      <div className="divide-y">
        {items.map((item) => {
          const itemPrice = item.discount 
            ? item.price - (item.price * item.discount / 100) 
            : item.price;
            
          return (
            <div key={item.id} className="py-4 flex items-center">
              <div className="h-16 w-16 relative flex-shrink-0">
                <Image
                  src={getImagePath(item.image)}
                  alt={item.name}
                  fill
                  className="object-cover rounded"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-800">{item.name}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                <p className="text-sm font-medium text-gray-800">
                  ${(itemPrice * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="border-t border-gray-200 mt-6 pt-6 space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-800 font-medium">${subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span className="text-gray-800 font-medium">
            {shipping > 0 ? `$${shipping.toFixed(2)}` : 'Free'}
          </span>
        </div>
        
        <div className="flex justify-between border-t border-gray-200 pt-4">
          <span className="text-gray-800 font-bold">Total</span>
          <span className="text-gray-800 font-bold">${total.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="mt-6 text-xs text-gray-500">
        <p>By completing your purchase, you agree to our <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.</p>
      </div>
    </div>
  );
}