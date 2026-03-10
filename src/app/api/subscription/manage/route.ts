import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

import { ErrorResponses, handleAPIError } from '@/lib/errorHandler'

export async function POST(request: NextRequest) {
  try {
    const { userId, action, newPlanId } = await request.json()

    if (!userId || !action) {
      return ErrorResponses.missingFields(['userId', 'action'])
    }

    // Get user's Stripe subscription
    const { data: userData, error: userError } = (await supabase
      .from('users')
      .select('stripe_subscription_id, stripe_customer_id')
      .eq('id', userId)
      .single()) as any

    if (userError || !(userData as any)?.stripe_subscription_id) {
      return ErrorResponses.notFound('Subscription')
    }

    switch (action) {
      case 'cancel':
        return await handleCancelSubscription(userId, userData.stripe_subscription_id)

      case 'downgrade':
      case 'upgrade':
        if (!newPlanId) {
          return ErrorResponses.missingFields(['newPlanId'])
        }
        return await handleChangePlan(userId, userData.stripe_subscription_id, newPlanId)

      case 'resume':
        return await handleResumeSubscription(userId, userData.stripe_subscription_id)

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    return handleAPIError(error)
  }
}

async function handleCancelSubscription(userId: string, subscriptionId: string) {
  try {
    // Cancel subscription at end of period
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })

    // Update user status
    await (supabase as any)
      .from('users')
      .update({
        subscription_status: 'cancelled',
      })
      .eq('id', userId)

    // Update subscription record
    await (supabase as any)
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    return NextResponse.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the billing period',
      subscription,
    })
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    throw error
  }
}

async function handleChangePlan(userId: string, subscriptionId: string, newPlanId: string) {
  try {
    // Get new plan details
    const { data: newPlan } = (await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', newPlanId)
      .single()) as any

    if (!newPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Get current subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    // Get the price ID for the new plan (use monthly by default)
    const newPriceId = (newPlan as any).stripe_price_id_monthly

    if (!newPriceId) {
      return NextResponse.json({ error: 'New plan is not available for purchase' }, { status: 400 })
    }

    // Update subscription
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
    })

    // Update user plan
    await (supabase as any)
      .from('users')
      .update({
        plan_type: (newPlan as any).name.toLowerCase(),
        whatsapp_limit_per_month: (newPlan as any).whatsapp_limit || 0,
      })
      .eq('id', userId)

    // Update subscription record
    await (supabase as any)
      .from('subscriptions')
      .update({
        plan_id: newPlanId,
      })
      .eq('user_id', userId)

    return NextResponse.json({
      success: true,
      message: `Plan changed to ${(newPlan as any).name}`,
      subscription: updatedSubscription,
    })
  } catch (error) {
    console.error('Error changing plan:', error)
    throw error
  }
}

async function handleResumeSubscription(userId: string, subscriptionId: string) {
  try {
    // Resume subscription
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    })

    // Update user status
    await (supabase as any)
      .from('users')
      .update({
        subscription_status: 'active',
      })
      .eq('id', userId)

    // Update subscription record
    await (supabase as any)
      .from('subscriptions')
      .update({
        status: 'active',
      })
      .eq('user_id', userId)

    return NextResponse.json({
      success: true,
      message: 'Subscription resumed',
      subscription,
    })
  } catch (error) {
    console.error('Error resuming subscription:', error)
    throw error
  }
}
