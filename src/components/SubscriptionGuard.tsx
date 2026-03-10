'use client'

import UpgradeModal from '@/components/common/UpgradeModal'
import { supabase } from '@/lib/supabase'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface SubscriptionGuardProps {
  userId: string
  requiredFeatures?: string[]
  onUnauthorized?: () => void
  children: React.ReactNode
}

const FREE_RESTRICTED_FEATURES = [
  'whatsapp_sending',
  'excel_export',
  'advanced_reports',
  'remove_branding',
  'bulk_whatsapp',
]

export function SubscriptionGuard({ userId, requiredFeatures = [], onUnauthorized, children }: SubscriptionGuardProps) {
  const router = useRouter()
  const locale = useLocale()
  const [authorized, setAuthorized] = useState(true)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [blockedFeature, setBlockedFeature] = useState('')
  const [userPlan, setUserPlan] = useState<string>('basic')

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('users')
          .select('subscription_status, plan_type, subscription_expiry, account_type, demo_expiry')
          .eq('id', userId)
          .single()

        if (error) throw error

        const accountType = (data as any).account_type || 'free'
        const isFree = accountType === 'free'
        const subscriptionStatus = (data as any).subscription_status

        setUserPlan((data as any).plan_type)

        // Free user with restricted feature
        if (isFree) {
          const restricted = requiredFeatures.find((f) => FREE_RESTRICTED_FEATURES.includes(f))
          if (restricted) {
            setBlockedFeature(restricted.replace(/_/g, ' '))
            setShowUpgradeModal(true)
            setAuthorized(false)
            return
          }
          // Free user accessing allowed features
          setAuthorized(true)
          return
        }

        // Paid user check
        const isActive =
          subscriptionStatus === 'active' &&
          (!(data as any).subscription_expiry || new Date((data as any).subscription_expiry) > new Date())

        if (!isActive) {
          setAuthorized(false)
          setShowUpgradeModal(true)
          setBlockedFeature('dashboard access')
          onUnauthorized?.()
        }
      } catch (error) {
        console.error('Error checking authorization:', error)
        setAuthorized(false)
      }
    }

    checkAuthorization()
  }, [userId, requiredFeatures, onUnauthorized])

  if (showUpgradeModal) {
    return (
      <UpgradeModal
        feature={blockedFeature || 'This feature'}
        onClose={() => {
          setShowUpgradeModal(false)
          router.push(`/${locale}/event-management-dashboard`)
        }}
      />
    )
  }

  if (!authorized) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Subscription Required</h2>
          <p className="mb-6 text-gray-600">
            Your subscription has expired or is inactive. Please upgrade your subscription to access this feature.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push(`/${locale}/pricing`)}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
            >
              Upgrade Subscription
            </button>
            <button
              onClick={() => router.push(`/${locale}/event-management-dashboard`)}
              className="w-full rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-900 transition-colors hover:bg-gray-300"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

interface LimitExceededProps {
  limit: string
  current: number
  max: number
  feature: string
  onUpgrade: () => void
}

export function LimitExceededModal({ limit, current, max, feature, onUpgrade }: LimitExceededProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Limit Reached</h2>
        <p className="mb-4 text-gray-600">
          You have reached your {feature} limit ({current}/{max}). Upgrade your plan to continue.
        </p>
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            <strong>Current Limit:</strong> {max} {limit}
          </p>
        </div>
        <button
          onClick={onUpgrade}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
        >
          Upgrade Plan
        </button>
      </div>
    </div>
  )
}
