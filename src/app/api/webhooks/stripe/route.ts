import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

import { ErrorResponses, handleAPIError } from '@/lib/errorHandler'

type StripeSubscriptionWithPeriods = Stripe.Subscription & {
  current_period_start?: number | null
  current_period_end?: number | null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return ErrorResponses.badRequest('Missing signature')
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET || '')
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session
          await handleCheckoutSessionCompleted(session)
          break
        }

        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice
          await handleInvoicePaymentSucceeded(invoice)
          break
        }

        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription
          await handleSubscriptionUpdate(subscription)
          break
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription
          await handleSubscriptionDeleted(subscription)
          break
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice
          await handleInvoicePaymentFailed(invoice)
          break
        }

        default:
          console.log(`Unhandled event type: ${event.type}`)
      }

      return NextResponse.json({ received: true })
    } catch (error) {
      return handleAPIError(error)
    }
  } catch (error) {
    return handleAPIError(error)
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string

  // Get user by Stripe customer ID
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: userData, error: userError } = await (supabase as any)
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (userError || !userData) {
    console.error('User not found for customer:', customerId)
    return
  }

  // Record payment
  if (session.payment_intent) {
    const { error: paymentError } = await (supabase as any).from('payments').insert([
      {
        user_id: userData.id,
        stripe_payment_intent_id: session.payment_intent,
        amount: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency,
        status: 'paid',
        billing_cycle: session.mode === 'subscription' ? 'monthly' : 'once',
      },
    ])

    if (paymentError) {
      console.error('Error recording payment:', paymentError)
    }
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const subscriptionWithPeriods = subscription as StripeSubscriptionWithPeriods
  const customerId = subscription.customer as string

  // Get user by Stripe customer ID
  const { data: userData, error: userError } = await (supabase as any)
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (userError || !userData) {
    console.error('User not found for customer:', customerId)
    return
  }

  // Get plan details from subscription
  const priceId = subscription.items.data[0]?.price.id
  const { data: planData } = await (supabase as any)
    .from('subscription_plans')
    .select('id, name')
    .or(`stripe_price_id_monthly.eq.${priceId},stripe_price_id_yearly.eq.${priceId}`)
    .single()

  const currentPeriodEnd = new Date((subscriptionWithPeriods.current_period_end ?? Date.now() / 1000) * 1000)
  const currentPeriodStart = new Date((subscriptionWithPeriods.current_period_start ?? Date.now() / 1000) * 1000)

  // Update user subscription
  const { error: updateError } = await (supabase as any)
    .from('users')
    .update({
      subscription_status: subscription.status === 'active' ? 'active' : 'inactive',
      plan_type: (planData as any)?.name.toLowerCase() || 'basic',
      subscription_expiry: currentPeriodEnd.toISOString(),
      stripe_subscription_id: subscription.id,
      payment_status: 'paid',
    })
    .eq('id', userData.id)

  if (updateError) {
    console.error('Error updating user subscription:', updateError)
  }

  // Update or create subscription record
  const { error: subError } = await (supabase as any).from('subscriptions').upsert(
    {
      user_id: userData.id,
      plan_id: (planData as any)?.id,
      stripe_subscription_id: subscription.id,
      status: subscription.status === 'active' ? 'active' : 'expired',
      current_period_start: currentPeriodStart.toISOString(),
      current_period_end: currentPeriodEnd.toISOString(),
      auto_renew: !subscription.cancel_at_period_end,
    },
    { onConflict: 'user_id' }
  )

  if (subError) {
    console.error('Error upserting subscription:', subError)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  // Get user by Stripe customer ID
  const { data: userData, error: userError } = await (supabase as any)
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (userError || !userData) {
    console.error('User not found for customer:', customerId)
    return
  }

  // Cancel user subscription
  const { error: updateError } = await (supabase as any)
    .from('users')
    .update({
      subscription_status: 'cancelled',
    })
    .eq('id', userData.id)

  if (updateError) {
    console.error('Error updating user subscription status:', updateError)
  }

  // Update subscription record
  const { error: subError } = await (supabase as any)
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    })
    .eq('user_id', userData.id)

  if (subError) {
    console.error('Error updating subscription record:', subError)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Similar to checkout completed - record successful payment
  console.log('Payment succeeded for invoice:', invoice.id)
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  // Get user by Stripe customer ID
  const { data: userData, error: userError } = await (supabase as any)
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (userError || !userData) {
    return
  }

  // Update user payment status
  await (supabase as any).from('users').update({ payment_status: 'failed' }).eq('id', userData.id)
}
