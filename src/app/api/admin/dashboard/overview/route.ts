import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { adminId } = await request.json()

    if (!adminId) {
      return NextResponse.json({ error: 'adminId is required' }, { status: 400 })
    }

    const { data: admin, error: adminError } = await supabase.from('users').select('role').eq('id', adminId).single()

    if (adminError || !admin || admin.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized: Super admin access required' }, { status: 403 })
    }

    const { data: appUsers, error: usersError } = await supabase
      .from('users')
      .select('id, email, full_name, phone, created_at')

    if (usersError) {
      return NextResponse.json({ error: usersError.message || 'Failed to fetch users' }, { status: 500 })
    }

    const { data: authUsersData, error: authUsersError } = await supabase.auth.admin.listUsers()

    let totalUsers = appUsers?.length || 0

    if (!authUsersError && authUsersData?.users) {
      const appUserIds = new Set((appUsers || []).map((user: any) => user.id))
      const missingUsers = authUsersData.users.filter((authUser: any) => !appUserIds.has(authUser.id))

      for (const authUser of missingUsers) {
        try {
          await supabase.from('users').insert({
            id: authUser.id,
            email: authUser.email,
            phone: authUser.phone || null,
            full_name: authUser.user_metadata?.full_name || '',
            role: 'user',
            account_type: 'free',
            subscription_status: 'trial',
            plan_type: 'free',
            event_limit: 1,
          })
        } catch (error) {
          console.warn(`Could not create profile for user ${authUser.id}:`, error)
        }
      }

      totalUsers += missingUsers.length
    }

    const [paymentsResult, eventsResult, activeSubscriptionsResult] = await Promise.all([
      supabase.from('payments').select('amount, status, payment_method'),
      supabase.from('events').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('subscription_status', 'active'),
    ])

    if (paymentsResult.error) {
      return NextResponse.json({ error: paymentsResult.error.message || 'Failed to fetch payments' }, { status: 500 })
    }

    if (eventsResult.error) {
      return NextResponse.json({ error: eventsResult.error.message || 'Failed to fetch events' }, { status: 500 })
    }

    if (activeSubscriptionsResult.error) {
      return NextResponse.json(
        { error: activeSubscriptionsResult.error.message || 'Failed to fetch subscriptions' },
        { status: 500 }
      )
    }

    const payments = paymentsResult.data || []
    const paidStatuses = new Set(['paid', 'approved'])
    const totalRevenue = payments
      .filter((payment: any) => paidStatuses.has(payment.status))
      .reduce((sum: number, payment: any) => sum + Number(payment.amount || 0), 0)

    const pendingApprovals = payments.filter(
      (payment: any) => payment.payment_method === 'bank_transfer' && payment.status === 'pending'
    ).length

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalRevenue: totalRevenue.toFixed(2),
        activeSubscriptions: activeSubscriptionsResult.count || 0,
        totalEvents: eventsResult.count || 0,
        pendingApprovals,
      },
    })
  } catch (error: any) {
    console.error('Admin dashboard overview error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch dashboard stats' }, { status: 500 })
  }
}
