'use client'

import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'

interface DemoBannerProps {
  eventLimit?: number
  guestLimit?: number
  className?: string
}

export default function DemoBanner({ eventLimit = 1, guestLimit = 50, className = '' }: DemoBannerProps) {
  const router = useRouter()
  const locale = useLocale()

  return (
    <div className={`border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="text-lg">🟡</span>
            <p className="text-sm font-medium text-amber-900">
              You are on the <strong>Free Plan</strong> — {eventLimit} Event · {guestLimit} Guests · Upgrade to unlock
              all features
            </p>
          </div>
          <button
            onClick={() => router.push(`/${locale}/pricing`)}
            className="inline-flex items-center whitespace-nowrap rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Upgrade Now →
          </button>
        </div>
      </div>
    </div>
  )
}
