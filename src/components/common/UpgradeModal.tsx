'use client'

import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'

interface UpgradeModalProps {
  feature: string
  onClose: () => void
}

export default function UpgradeModal({ feature, onClose }: UpgradeModalProps) {
  const router = useRouter()
  const locale = useLocale()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">Upgrade Your Plan</h2>
          <p className="mb-6 text-gray-600">
            <strong>{feature}</strong> is not available in Demo Mode. Upgrade your plan to unlock this feature and more.
          </p>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => router.push(`/${locale}/pricing`)}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-700"
          >
            View Plans & Upgrade
          </button>
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-gray-100 px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  )
}
