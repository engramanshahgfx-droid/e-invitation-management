'use client'

import { getCurrentUser } from '@/lib/auth'
import { checkSubscriptionLimits } from '@/lib/subscriptionGuard'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface SubscriptionGuardProps {
  children: React.ReactNode
}

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const locale = useLocale()
  const router = useRouter()
  const [isValid, setIsValid] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    verifySubscription()
  }, [])

  const verifySubscription = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) {
        router.push(`/${locale}/auth/login`)
        return
      }

      const limits = await checkSubscriptionLimits(user.id)

      if (limits.subscriptionStatus !== 'active' && limits.accountType !== 'paid') {
        // Show upgrade prompt or restrict access
        console.warn('Active subscription required')
      }

      setIsValid(true)
    } catch (error) {
      console.error('Subscription check error:', error)
      router.push(`/${locale}/pricing`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  if (!isValid) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Active Subscription Required</h1>
          <p className="mb-6 text-gray-600">Please upgrade your plan to access this feature.</p>
          <button
            onClick={() => router.push(`/${locale}/pricing`)}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
