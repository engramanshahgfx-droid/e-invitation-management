import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '')

interface SubscriptionLimits {
  canCreateEvent: boolean
  eventCount: number
  eventLimit: number
  subscriptionStatus: string
  accountType: string
}

export async function checkSubscriptionLimits(userId: string): Promise<SubscriptionLimits> {
  try {
    // Get user subscription info
    const { data: user } = await supabase
      .from('users')
      .select('event_limit, subscription_status, account_type')
      .eq('id', userId)
      .single()

    if (!user) {
      return {
        canCreateEvent: false,
        eventCount: 0,
        eventLimit: 1,
        subscriptionStatus: 'inactive',
        accountType: 'free',
      }
    }

    // Get user's event count
    const { count } = await supabase.from('events').select('*', { count: 'exact', head: true }).eq('user_id', userId)

    const eventCount = count || 0

    return {
      canCreateEvent: user.subscription_status === 'active' && eventCount < (user.event_limit || 1),
      eventCount,
      eventLimit: user.event_limit || 1,
      subscriptionStatus: user.subscription_status,
      accountType: user.account_type,
    }
  } catch (error) {
    console.error('Error checking subscription limits:', error)
    return {
      canCreateEvent: false,
      eventCount: 0,
      eventLimit: 1,
      subscriptionStatus: 'error',
      accountType: 'free',
    }
  }
}

export async function isEventLimitReached(userId: string): Promise<boolean> {
  const limits = await checkSubscriptionLimits(userId)
  return !limits.canCreateEvent
}

export async function canAccessFeature(
  userId: string,
  feature: 'advanced_reports' | 'csv_export' | 'priority_support'
): Promise<boolean> {
  try {
    const { data: user } = await supabase.from('users').select('plan_type, account_type').eq('id', userId).single()

    if (!user || user.account_type !== 'paid') {
      return false
    }

    // Check plan features
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('features')
      .eq('name', user.plan_type === 'pro' ? 'Pro Plan' : 'Basic Plan')
      .single()

    if (!plan || !plan.features) {
      return false
    }

    return plan.features[feature] === true
  } catch (error) {
    console.error('Error checking feature access:', error)
    return false
  }
}
