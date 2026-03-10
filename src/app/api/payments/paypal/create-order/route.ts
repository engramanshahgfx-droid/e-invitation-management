import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Create PayPal order
export async function POST(request: NextRequest) {
  try {
    const { planId, userId } = await request.json();

    // Get plan details
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 400 });
    }

    // In production, call PayPal API to create order
    // For now, return a mock transaction ID
    const transactionId = `PAYPAL-${Date.now()}`;

    // Store pending payment in database
    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        plan_id: planId,
        amount: plan.price_paypal,
        payment_method: 'paypal',
        status: 'pending',
        paypal_transaction_id: transactionId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      transactionId,
      amount: plan.price_paypal,
      paymentId: payment.id,
    });
  } catch (error) {
    console.error('PayPal create order error:', error);
    return NextResponse.json(
      { error: 'Failed to create PayPal order' },
      { status: 500 }
    );
  }
}
