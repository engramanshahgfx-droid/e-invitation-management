'use client'

import DemoBanner from '@/components/common/DemoBanner'
import Header from '@/components/common/Header'
import QuickActionToolbar from '@/components/common/QuickActionToolbar'
import StatusIndicatorBar from '@/components/common/StatusIndicatorBar'
import UserAuthGuard from '@/components/UserAuthGuard'
import { checkSubscriptionStatus, getCurrentUser } from '@/lib/auth'
import { useEffect, useState } from 'react'
import EventManagementInteractive from './components/EventManagementInteractive'

export default function EventManagementDashboardPage() {
  const [isFree, setIsFree] = useState(false)
  const [eventLimit, setEventLimit] = useState(1)
  const [guestLimit, setGuestLimit] = useState(50)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const user = await getCurrentUser()
        if (user) {
          const sub = await checkSubscriptionStatus(user.id)
          setIsFree(sub.isFree)
          setEventLimit(sub.eventLimit ?? 1)
          setGuestLimit(sub.guestLimit ?? 50)
        }
      } catch {
        // ignore
      }
    }
    checkStatus()
  }, [])

  return (
    <UserAuthGuard>
      <div className="min-h-screen bg-background">
        <Header />
        {isFree && <DemoBanner eventLimit={eventLimit} guestLimit={guestLimit} className="mt-20" />}
        <StatusIndicatorBar className={isFree ? '' : 'mt-20'} />

        <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="mb-2 font-heading text-3xl font-bold text-text-primary">Event Management Dashboard</h1>
                <p className="text-text-secondary">
                  Create and manage your events, customize invitations, and track guest responses
                </p>
              </div>
              <QuickActionToolbar />
            </div>
          </div>

          <EventManagementInteractive />
        </main>
      </div>
    </UserAuthGuard>
  )
}
