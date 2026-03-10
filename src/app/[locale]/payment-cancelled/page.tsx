'use client'

import { useLocale } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function PaymentCancelledPage() {
  const router = useRouter()
  const locale = useLocale()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-gray-900">Payment Cancelled</h2>
          <p className="mt-2 text-gray-600">
            Your payment has been cancelled. You can review your plans and try again.
          </p>

          <div className="mt-8 space-y-3">
            <button
              onClick={() => router.push(`/${locale}/pricing`)}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
            >
              Back to Pricing
            </button>
            <Link href={`/${locale}`} className="block text-center text-gray-600 hover:text-gray-900">
              Back to Home
            </Link>
          </div>

          <p className="mt-6 text-sm text-gray-500">If you have questions, please contact our support team.</p>
        </div>
      </div>
    </div>
  )
}
