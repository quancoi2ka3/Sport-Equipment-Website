'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { useCart } from '@/app/context/CartContext';
import stripeService from '@/app/services/payment/stripeService';
import CheckoutForm from './CheckoutForm';
import OrderSummary from './OrderSummary';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  });

  // Redirect to cart if no items
  React.useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  // Create payment intent on load
  React.useEffect(() => {
    const createIntent = async () => {
      if (items.length > 0) {
        try {
          setLoading(true);
          setError(null);
          
          const subtotal = getCartTotal();
          const shipping = subtotal > 50 ? 0 : 5.99;
          const total = subtotal + shipping;
          
          const result = await stripeService.createPaymentIntent({
            amount: total,
            currency: 'usd',
            metadata: {
              orderId: `order-${Date.now()}`, // In a real app, this would be a proper order ID
            }
          });
          
          setClientSecret(result.clientSecret);
        } catch (err) {
          console.error('Error creating payment intent:', err);
          setError('Failed to initialize payment. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };

    createIntent();
  }, [items, getCartTotal]);

  const handleShippingInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateShippingInfo = () => {
    // Check if all required fields are filled
    const { name, email, address, city, state, zipCode, country } = shippingInfo;
    if (!name || !email || !address || !city || !state || !zipCode || !country) {
      setError('Please fill in all shipping information fields');
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleSubmitShipping = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateShippingInfo()) {
      // Focus on payment section
      document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePaymentSuccess = () => {
    // In a real app, you would save the order to your backend here
    clearCart();
    router.push('/checkout/success');
  };

  if (items.length === 0) {
    return null; // Will redirect in the useEffect
  }

  const subtotal = getCartTotal();
  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Main Checkout Form */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Shipping Information</h2>
            
            <form onSubmit={handleSubmitShipping}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="name" className="block text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={shippingInfo.name}
                    onChange={handleShippingInfoChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={shippingInfo.email}
                    onChange={handleShippingInfoChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleShippingInfoChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="city" className="block text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleShippingInfoChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="state" className="block text-gray-700 mb-2">State/Province</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={shippingInfo.state}
                    onChange={handleShippingInfoChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="zipCode" className="block text-gray-700 mb-2">ZIP/Postal Code</label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={shippingInfo.zipCode}
                    onChange={handleShippingInfoChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="country" className="block text-gray-700 mb-2">Country</label>
                  <select
                    id="country"
                    name="country"
                    value={shippingInfo.country}
                    onChange={handleShippingInfoChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="JP">Japan</option>
                    <option value="CN">China</option>
                    {/* Add more countries as needed */}
                  </select>
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Continue to Payment
              </button>
            </form>
            
            <h2 id="payment-section" className="text-xl font-bold text-gray-800 mb-6 mt-8">Payment Method</h2>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
                {error}
              </div>
            )}
            
            {clientSecret && (
              <Elements stripe={stripeService.getStripe()}>
                <CheckoutForm 
                  clientSecret={clientSecret}
                  onPaymentSuccess={handlePaymentSuccess}
                />
              </Elements>
            )}
            
            {loading && (
              <div className="flex justify-center items-center py-6">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-1/3">
          <OrderSummary 
            items={items}
            subtotal={subtotal}
            shipping={shipping}
            total={total}
          />
        </div>
      </div>
    </div>
  );
}