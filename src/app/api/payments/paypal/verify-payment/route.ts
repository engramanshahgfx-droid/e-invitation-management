import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '')

// Verify PayPal payment and activate subscription
export async function POST(request: NextRequest) {
  try {
    const { paymentId, transactionId, userId } = await request.json()

    // Get payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single()

    if (paymentError || !payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 400 })
    }

    // Get plan details
    const { data: plan } = await supabase.from('subscription_plans').select('*').eq('id', payment.plan_id).single()

    // Update payment status to approved
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'approved',
        updated_at: new Date(),
      })
      .eq('id', paymentId)

    if (updateError) throw updateError

    // Update user subscription
    const expiryDate = new Date()
    expiryDate.setMonth(expiryDate.getMonth() + 1)

    const { error: userError } = await supabase
      .from('users')
      .update({
        subscription_status: 'active',
        account_type: 'paid',
        plan_type: plan.name.toLowerCase().includes('pro') ? 'pro' : 'basic',
        subscription_expiry: expiryDate.toISOString(),
        event_limit: plan.event_limit || 999,
        updated_at: new Date(),
      })
      .eq('id', userId)

    if (userError) throw userError

    return NextResponse.json({
      success: true,
      message: 'Subscription activated successfully',
    })
  } catch (error) {
    console.error('PayPal verify error:', error)
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 })
  }
}
