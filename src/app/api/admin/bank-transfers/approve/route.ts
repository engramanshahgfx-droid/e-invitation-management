import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { adminId, paymentId, action } = await request.json();

    // Validate action
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be approve or reject' },
        { status: 400 }
      );
    }

    // Verify admin is super_admin
    const { data: adminData } = await supabase
      .from('users')
      .select('role')
      .eq('id', adminId)
      .single();

    if (!adminData || adminData.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    // Get payment details
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (action === 'approve') {
      // Update payment status
      const { error: updatePaymentError } = await supabase
        .from('payments')
        .update({
          status: 'paid',
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      if (updatePaymentError) {
        throw updatePaymentError;
      }

      // Get the plan to determine plan_type
      const { data: plan } = await supabase
        .from('subscription_plans')
        .select('name')
        .eq('id', payment.plan_id)
        .single();

      // Update user subscription status
      const planType = plan?.name?.toLowerCase() || 'basic';
      const { error: updateUserError } = await supabase
        .from('users')
        .update({
          subscription_status: 'active',
          account_type: 'paid',
          plan_type: planType,
          payment_status: 'paid',
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.user_id);

      if (updateUserError) {
        throw updateUserError;
      }

      return NextResponse.json({
        success: true,
        message: `Payment approved! User account upgraded to ${planType} plan`,
        status: 'approved',
      });
    } else if (action === 'reject') {
      // Update payment status to failed
      const { error: updatePaymentError } = await supabase
        .from('payments')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      if (updatePaymentError) {
        throw updatePaymentError;
      }

      return NextResponse.json({
        success: true,
        message: 'Payment rejected',
        status: 'rejected',
      });
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
