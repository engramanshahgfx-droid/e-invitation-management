import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { adminId, userId, planType } = await request.json()

    // Verify admin is super_admin
    const { data: adminData } = await supabase.from('users').select('role').eq('id', adminId).single()

    if (!adminData || adminData.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 })
    }

    // Validate plan_type
    const validPlans = ['free', 'basic', 'pro', 'enterprise']
    if (!validPlans.includes(planType)) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 })
    }

    // Update user with new plan
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        plan_type: planType,
        account_type: planType === 'free' ? 'free' : 'paid',
        subscription_status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()

    if (error) {
      console.error('Failed to upgrade user:', error)
      return NextResponse.json({ error: 'Failed to upgrade user account' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      user: updatedUser?.[0],
      message: `User upgraded to ${planType} plan`,
    })
  } catch (error) {
    console.error('Upgrade error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
