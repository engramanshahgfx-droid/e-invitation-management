import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId, email, fullName } = await request.json();

    // Check if customer already exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: userData } = await (supabase as any)
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (userData?.stripe_customer_id) {
      return NextResponse.json({ customerId: userData.stripe_customer_id });
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email,
      name: fullName || '',
      metadata: {
        supabase_user_id: userId,
      },
    });

    // Save Stripe customer ID to database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('users')
      .update({ stripe_customer_id: customer.id })
      .eq('id', userId);

    return NextResponse.json({ customerId: customer.id });
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
