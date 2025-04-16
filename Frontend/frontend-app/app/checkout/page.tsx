'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/context/CartContext';
import stripeService from '@/app/services/payment/stripeService';
import OrderSummary from './OrderSummary';
import EmbeddedCheckout from './EmbeddedCheckout';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutMode, setCheckoutMode] = useState<'embedded' | 'elements'>('embedded');
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
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  // Calculate order totals using a memoized function to prevent unnecessary recalculation
  const calculateOrderTotals = useCallback(() => {
    const subtotal = getCartTotal();
    const shipping = subtotal > 50 ? 0 : 5.99;
    const total = parseFloat((subtotal + shipping).toFixed(2)); // Ensure consistent decimal precision
    
    return { subtotal, shipping, total };
  }, [getCartTotal]);

  // Create checkout session on load
  useEffect(() => {
    const createCheckoutSession = async () => {
      if (items.length > 0) {
        try {
          setLoading(true);
          setError(null);
          
          const { total } = calculateOrderTotals();
          
          // Generate line items from cart items
          const lineItems = items.map(item => ({
            price_data: {
              currency: 'usd',
              product_data: {
                name: item.name,
                description: `${item.brand} - ${item.category}`,
                images: item.images ? [item.images[0]] : [],
              },
              unit_amount: Math.round(item.price * 100), // Convert to cents
            },
            quantity: item.quantity,
          }));

          // Create order metadata
          const metadata = {
            orderId: `order-${Date.now()}`,
            itemCount: items.length.toString(),
            customerEmail: shippingInfo.email || 'guest@example.com',
          };
          
          // Create an embedded checkout session - note: don't include success_url or cancel_url for embedded mode
          const result = await stripeService.createEmbeddedCheckoutSession({
            amount: total * 100, // Convert to cents
            currency: 'usd',
            customerEmail: shippingInfo.email || undefined,
            metadata,
            lineItems,
          });
          
          setClientSecret(result.clientSecret || null);
        } catch (err: unknown) {
          console.error('Error creating checkout session:', err);
          let errorMessage = 'Failed to initialize checkout. Please try again.';
          if (err instanceof Error) {
            errorMessage = err.message || errorMessage;
          }
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      }
    };

    createCheckoutSession();
  }, [items, calculateOrderTotals, shippingInfo.email]);

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
    try {
      // In a real app, you would save the order to your backend here
      clearCart();
      
      // Create a small delay to ensure the payment is processed
      setTimeout(() => {
        router.push('/checkout/success');
      }, 500);
    } catch (error) {
      console.error('Error handling payment success:', error);
      setError('There was an issue finalizing your order. Please contact support.');
    }
  };

  if (items.length === 0) {
    return null; // Will redirect in the useEffect
  }

  const { subtotal, shipping, total } = calculateOrderTotals();

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
            
            {loading ? (
              <div className="flex justify-center items-center py-6">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : clientSecret ? (
              // Render the embedded checkout when we have a client secret
              <EmbeddedCheckout
                clientSecret={clientSecret}
                onComplete={handlePaymentSuccess}
              />
            ) : (
              <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
                Unable to initialize payment. Please refresh the page and try again.
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