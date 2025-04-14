import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51NxmVWE4n2TrIlSgdKx8zX31o1aMN52OTlhR0SsHXhwnybBMBQQhJKkecRNXgvT0BwHSiIuM82qDfpC0wdpVJmvD00zJv3fWHp', {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lineItems, successUrl, cancelUrl } = body;

    // Validate request parameters
    if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
      return NextResponse.json(
        { message: 'Invalid line items provided' },
        { status: 400 }
      );
    }

    if (!successUrl || !cancelUrl) {
      return NextResponse.json(
        { message: 'Success URL and cancel URL are required' },
        { status: 400 }
      );
    }

    // Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'VN'], // Add more countries as needed
      },
      // Set custom fields for additional information
      custom_fields: [
        {
          key: 'shipping_notes',
          label: {
            type: 'custom',
            custom: 'Delivery instructions',
          },
          type: 'text',
          optional: true,
        },
      ],
      // Enable automatic tax calculation
      automatic_tax: { enabled: true },
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}