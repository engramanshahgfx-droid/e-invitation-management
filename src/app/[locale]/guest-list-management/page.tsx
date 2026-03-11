'use client'

import Header from '@/components/common/Header'
import QuickActionToolbar from '@/components/common/QuickActionToolbar'
import StatusIndicatorBar from '@/components/common/StatusIndicatorBar'
import UserAuthGuard from '@/components/UserAuthGuard'
import { useState } from 'react'
import GuestListInteractive from './components/GuestListInteractive'

export default function GuestListManagementPage() {
  const [selectedEventId, setSelectedEventId] = useState<string>('')

  return (
    <UserAuthGuard>
      <div className="min-h-screen bg-background">
        <Header />
        <StatusIndicatorBar className="mt-20" eventId={selectedEventId} />

        <main className="px-8 py-8">
          <div className="mx-auto max-w-[1600px]">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="mb-2 font-heading text-3xl font-semibold text-text-primary">Guest List Management</h1>
                <p className="text-text-secondary">
                  Manage invitations, track responses, and coordinate guest communications
                </p>
              </div>
              <QuickActionToolbar />
            </div>

            <GuestListInteractive onEventSelected={setSelectedEventId} />
          </div>
        </main>
      </div>
    </UserAuthGuard>
  )
}
