'use client'

import Header from '@/components/common/Header'
import QuickActionToolbar from '@/components/common/QuickActionToolbar'
import StatusIndicatorBar from '@/components/common/StatusIndicatorBar'
import UserAuthGuard from '@/components/UserAuthGuard'
import { useLocale } from 'next-intl'
import QRCheckInInteractive from './components/QRCheckInInteractive'

export default function QRCheckInSystemPage() {
  const locale = useLocale()
  const isArabic = locale === 'ar'

  return (
    <UserAuthGuard>
      <div className="min-h-screen bg-background">
        <Header />
        <StatusIndicatorBar className="mt-20" />

        <main className="px-8 pb-12 pt-6">
          <div className="mx-auto max-w-[1600px]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="mb-2 font-heading text-3xl font-bold text-text-primary">
                  {isArabic ? 'نظام تسجيل الحضور بالرمز السريع' : 'QR Check-in System'}
                </h1>
                <p className="text-text-secondary">
                  {isArabic
                    ? 'تتبع الحضور فوريًا باستخدام الرمز السريع أو خيار التسجيل اليدوي'
                    : 'Real-time attendance tracking with secure QR code scanning and manual check-in options'}
                </p>
              </div>
              <QuickActionToolbar />
            </div>

            <QRCheckInInteractive />
          </div>
        </main>
      </div>
    </UserAuthGuard>
  )
}
