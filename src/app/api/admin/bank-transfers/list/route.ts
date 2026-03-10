import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { adminId } = await request.json()

    // Verify admin is super_admin
    const { data: adminData } = await supabase.from('users').select('role').eq('id', adminId).single()

    if (!adminData || adminData.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 })
    }

    // Get pending bank transfer payments with user details
    const { data: payments, error } = await supabase
      .from('payments')
      .select(
        `
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
        users!inner (
          id,
          email,
          full_name,
          phone,
          plan_type,
          subscription_status
        ),
        subscription_plans (
          id,
          name,
          price_monthly
        )
      `
      )
      .eq('payment_method', 'bank_transfer')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch bank transfers:', error)
      return NextResponse.json({ error: 'Failed to fetch bank transfers' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      payments: payments || [],
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
