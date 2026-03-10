import Stripe from 'stripe'

let stripeClient: Stripe | null = null

function getStripeClient() {
  if (stripeClient) {
    return stripeClient
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }

  stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-02-25.clover',
  })

  return stripeClient
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    const client = getStripeClient() as unknown as Record<PropertyKey, unknown>
    const value = Reflect.get(client, prop, receiver)

    return typeof value === 'function' ? value.bind(client) : value
  },
}) as Stripe

export async function getOrCreateStripeCustomer(userId: string, email: string, fullName?: string) {
  const response = await fetch('/api/stripe/get-or-create-customer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, email, fullName }),
  })

  if (!response.ok) {
    throw new Error('Failed to get or create Stripe customer')
  }

  const data = await response.json()
  return data.customerId
}

export async function createCheckoutSession(params: {
  customerId: string
  priceId: string
  successUrl: string
  cancelUrl: string
  mode?: 'subscription' | 'payment'
}) {
  const session = await stripe.checkout.sessions.create({
    customer: params.customerId,
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    mode: params.mode || 'subscription',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  })

  return session
}

export async function getSubscription(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId)
}

export async function cancelSubscription(subscriptionId: string) {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  })
}
