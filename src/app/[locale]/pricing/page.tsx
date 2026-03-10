'use client'

import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price_monthly: number
  price_yearly?: number
  event_limit: number | null
  features: any
  is_active: boolean
  display_order: number
}

export default function PricingPage() {
  const router = useRouter()
  const locale = useLocale()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState<{ planId: string; method: 'paypal' | 'bank' } | null>(null)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (error) throw error
      setPlans(data)
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async (planId: string, method: 'paypal' | 'bank') => {
    try {
      const user = await getCurrentUser()
      if (!user) {
        router.push(`/${locale}/auth/login`)
        return
      }

      setSelectedPayment({ planId, method })

      if (method === 'paypal') {
        // Redirect to PayPal checkout
        router.push(`/${locale}/payment/paypal?planId=${planId}`)
      } else {
        // Redirect to bank transfer page
        router.push(`/${locale}/payment/bank-transfer?planId=${planId}`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to process. Please try again.')
    } finally {
      setSelectedPayment(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600">Loading pricing plans...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900">Simple, Transparent Pricing</h1>
          <p className="mt-4 text-xl text-gray-600">Choose the perfect plan for your invitation needs</p>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl border-2 p-8 ${
                plan.name.toLowerCase().includes('pro')
                  ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-white ring-2 ring-blue-100'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {plan.name.toLowerCase().includes('pro') && (
                <div className="mb-4 inline-block rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600">
                  Most Popular
                </div>
              )}

              <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
              <p className="mt-2 text-gray-600">{plan.description}</p>

              <div className="mt-6">
                <span className="text-5xl font-bold text-gray-900">${plan.price_monthly}</span>
                <span className="text-gray-600">/month</span>
              </div>

              {/* Features */}
              <ul className="mt-8 space-y-4">
                {plan.event_limit && (
                  <li className="flex items-center text-gray-700">
                    <span className="mr-3 text-green-500">✓</span>
                    {plan.event_limit === 999 ? 'Unlimited Events' : `Up to ${plan.event_limit} Events`}
                  </li>
                )}
                {plan.features &&
                  typeof plan.features === 'object' &&
                  Object.entries(plan.features).map(
                    ([key, value]: any) =>
                      value && (
                        <li key={key} className="flex items-center text-gray-700">
                          <span className="mr-3 text-green-500">✓</span>
                          {key.replace(/_/g, ' ').replace(/^\w/, (c: string) => c.toUpperCase())}
                        </li>
                      )
                  )}
              </ul>

              {/* Payment Methods */}
              <div className="mt-8 space-y-3">
                <button
                  onClick={() => handlePayment(plan.id, 'paypal')}
                  disabled={selectedPayment?.planId === plan.id}
                  className={`block w-full rounded-lg py-3 text-center font-semibold transition ${
                    plan.name.toLowerCase().includes('pro')
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  } disabled:opacity-50`}
                >
                  {selectedPayment?.planId === plan.id ? 'Processing...' : 'Pay with PayPal'}
                </button>

                <button
                  onClick={() => handlePayment(plan.id, 'bank')}
                  disabled={selectedPayment?.planId === plan.id}
                  className="block w-full rounded-lg border-2 border-green-600 bg-white py-3 text-center font-semibold text-green-600 transition hover:bg-green-50 disabled:opacity-50"
                >
                  {selectedPayment?.planId === plan.id ? 'Processing...' : 'Bank Transfer'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Methods Info */}
        <div className="mx-auto mt-16 max-w-3xl">
          <div className="rounded-2xl bg-gray-50 p-12">
            <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">Flexible Payment Options</h2>

            <div className="grid gap-8 md:grid-cols-2">
              {/* PayPal */}
              <div className="rounded-lg border-2 border-blue-200 bg-white p-6">
                <div className="mb-4 text-3xl font-bold text-blue-600">💳 PayPal</div>
                <p className="text-gray-600">Instant automatic activation. Pay securely with PayPal.</p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  <li>✓ Instant payment processing</li>
                  <li>✓ Automatic subscription activation</li>
                  <li>✓ Secure & encrypted</li>
                </ul>
              </div>

              {/* Bank Transfer */}
              <div className="rounded-lg border-2 border-green-200 bg-white p-6">
                <div className="mb-4 text-3xl font-bold text-green-600">🏦 Bank Transfer</div>
                <p className="text-gray-600">Direct bank transfer with manual admin approval.</p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  <li>✓ Direct bank deposit</li>
                  <li>✓ Admin verification</li>
                  <li>✓ Approval within 24 hours</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mx-auto mt-16 max-w-3xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: 'Can I upgrade my plan anytime?',
                a: 'Yes, you can upgrade to a higher plan at any time. Your new plan features will activate immediately.',
              },
              {
                q: 'How does the bank transfer approval work?',
                a: 'After you submit your payment proof, our admin team reviews it within 24 hours. Once approved, your subscription is activated instantly.',
              },
              {
                q: 'Can I cancel my subscription?',
                a: 'Yes, you can cancel anytime. Your subscription will remain active until the end of your current billing period.',
              },
              {
                q: 'Do you offer a free trial?',
                a: 'Yes! Every new account starts with a trial period. You can create 1 event to explore the platform before upgrading.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="font-bold text-gray-900">{faq.q}</h3>
                <p className="mt-2 text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
