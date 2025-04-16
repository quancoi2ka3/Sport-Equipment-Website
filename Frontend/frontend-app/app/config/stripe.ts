'use client';

// This file centralizes Stripe configuration to ensure consistent API key usage

// Get the publishable key from environment variables
export const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

// Log which publishable key prefix we're using (for debugging without exposing the full key)
if (process.env.NODE_ENV !== 'production') {
  // Show just the prefix for security while debugging
  const keyPrefix = stripePublishableKey ? stripePublishableKey.substring(0, 10) + '...' : 'undefined';
  console.log(`Using Stripe publishable key with prefix: ${keyPrefix}`);
}

// Export this key for consistent use throughout the application
export default stripePublishableKey;