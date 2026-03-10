import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { adminId } = await request.json();

    if (!adminId) {
      return NextResponse.json({ error: 'adminId is required' }, { status: 400 });
    }

    const { data: adminData, error: adminError } = await supabase
      .from('users')
      .select('role')
      .eq('id', adminId)
      .single();

    if (adminError || !adminData || adminData.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select(`
        id,
        user_id,
        plan_id,
        amount,
        currency,
        status,
        payment_method,
        receipt_url,
        created_at,
        updated_at,
        users (
          id,
          email,
          full_name,
          phone
        ),
        subscription_plans (
          id,
          name,
          price_monthly
        )
      `)
      .order('created_at', { ascending: false });

    if (paymentsError) {
      console.error('Failed to fetch payments:', paymentsError);
      return NextResponse.json(
        { error: 'Failed to fetch payments' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      payments: payments || [],
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
