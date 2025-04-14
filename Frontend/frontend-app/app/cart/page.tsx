'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/context/CartContext';
import { getImagePath } from '@/app/utils/image-utils';

export default function CartPage() {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);

  const handleQuantityChange = (id: string, quantity: number) => {
    updateQuantity(id, quantity);
  };

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
  };

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple coupon validation - in a real app this would come from an API
    if (couponCode.toLowerCase() === 'sport10') {
      setCouponApplied(true);
      setCouponDiscount(10);
      setCouponError('');
    } else if (couponCode.toLowerCase() === 'welcome20') {
      setCouponApplied(true);
      setCouponDiscount(20);
      setCouponError('');
    } else {
      setCouponApplied(false);
      setCouponDiscount(0);
      setCouponError('Invalid coupon code');
    }
  };

  const subtotal = getCartTotal();
  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 5.99;
  const discount = couponApplied ? (subtotal * couponDiscount / 100) : 0;
  const total = subtotal + shipping - discount;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Cart</h1>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Looks like you haven&apos;t added any products to your cart yet.</p>
          <Link 
            href="/products" 
            className="bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="border-b p-4 bg-gray-50">
              <div className="grid grid-cols-12 gap-4 font-medium text-gray-600">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-center">Total</div>
              </div>
            </div>
            
            {/* Cart Items List */}
            <div className="divide-y">
              {items.map((item) => {
                const itemPrice = item.discount 
                  ? item.price - (item.price * item.discount / 100) 
                  : item.price;
                
                return (
                  <div key={item.id} className="p-4">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Product Info */}
                      <div className="col-span-6 flex space-x-4">
                        <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden relative">
                          <Image
                            src={getImagePath(item.image)}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex flex-col justify-center">
                          <Link href={`/products/${item.id}`} className="font-medium text-gray-800 hover:text-blue-600 transition-colors">
                            {item.name}
                          </Link>
                          {item.discount && (
                            <div className="text-sm text-red-600 mt-1">
                              {item.discount}% OFF
                            </div>
                          )}
                          <button 
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-sm text-red-500 hover:text-red-700 transition-colors mt-2 text-left"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      
                      {/* Price */}
                      <div className="col-span-2 text-center">
                        <div className="font-medium text-gray-800">
                          ${itemPrice.toFixed(2)}
                        </div>
                        {item.discount && (
                          <div className="text-xs text-gray-500 line-through">
                            ${item.price.toFixed(2)}
                          </div>
                        )}
                      </div>
                      
                      {/* Quantity */}
                      <div className="col-span-2 flex justify-center">
                        <div className="flex border rounded max-w-[120px]">
                          <button 
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                            className="w-12 text-center px-2 py-1 border-x focus:outline-none"
                          />
                          <button 
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      {/* Total */}
                      <div className="col-span-2 text-center font-medium text-gray-800">
                        ${(itemPrice * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Cart Actions */}
            <div className="p-4 border-t flex justify-between items-center bg-gray-50">
              <button 
                onClick={clearCart}
                className="text-red-600 hover:text-red-800 font-medium transition-colors"
              >
                Clear Cart
              </button>
              <Link 
                href="/products" 
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
            
            {/* Coupon Code */}
            <form onSubmit={handleCouponSubmit} className="mb-6">
              <label htmlFor="coupon" className="block text-gray-700 mb-2">
                Coupon Code
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="coupon"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  className="flex-grow px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 transition-colors"
                >
                  Apply
                </button>
              </div>
              {couponError && (
                <p className="text-red-600 text-sm mt-2">{couponError}</p>
              )}
              {couponApplied && (
                <p className="text-green-600 text-sm mt-2">Coupon applied: {couponDiscount}% off</p>
              )}
            </form>
            
            {/* Price Details */}
            <div className="border-t pt-4">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-800">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-gray-800">
                  {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              {couponApplied && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-green-600">-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-t mt-2">
                <span className="text-lg font-bold text-gray-800">Total</span>
                <span className="text-lg font-bold text-gray-800">${total.toFixed(2)}</span>
              </div>
            </div>
            
            {/* Checkout Button */}
            <button 
              onClick={() => router.push('/checkout')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium mt-6 hover:bg-blue-700 transition-colors"
            >
              Proceed to Checkout
            </button>
            
            {/* Payment Methods */}
            <div className="flex justify-center space-x-4 mt-6">
              <div className="text-gray-400">
                <svg className="h-8 w-auto" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="36" height="24" rx="4" fill="#F3F4F6"/>
                  <path d="M10.5 16.5H7.5V7.5H10.5V16.5Z" fill="#6B7280"/>
                  <path d="M18 7.5C16.35 7.5 15 8.85 15 10.5V16.5H18C19.65 16.5 21 15.15 21 13.5V10.5C21 8.85 19.65 7.5 18 7.5Z" fill="#6B7280"/>
                  <path d="M25.5 16.5H28.5V7.5H25.5V16.5Z" fill="#6B7280"/>
                </svg>
              </div>
              <div className="text-gray-400">
                <svg className="h-8 w-auto" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="36" height="24" rx="4" fill="#F3F4F6"/>
                  <path d="M21 12C21 9.5 18.5 7.5 15.5 7.5H7.5V16.5H15.5C18.5 16.5 21 14.5 21 12Z" fill="#6B7280"/>
                  <path d="M28.5 7.5H25.5V16.5H28.5V7.5Z" fill="#6B7280"/>
                </svg>
              </div>
              <div className="text-gray-400">
                <svg className="h-8 w-auto" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="36" height="24" rx="4" fill="#F3F4F6"/>
                  <circle cx="12" cy="12" r="4.5" fill="#6B7280"/>
                  <circle cx="24" cy="12" r="4.5" fill="#6B7280"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}