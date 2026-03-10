'use client'

import { useState } from 'react'
import EventSelectorDropdown from './EventSelectorDropdown'
import LiveAttendancePanel from './LiveAttendancePanel'
import ManualCheckInSearch from './ManualCheckInSearch'
import QRScannerViewport from './QRScannerViewport'
import RecentCheckInsFeed from './RecentCheckInsFeed'

const QRCheckInInteractive = () => {
  const [selectedEventId, setSelectedEventId] = useState(1)

  const handleScanSuccess = (code: string) => {
    console.log('QR Code scanned:', code)
  }

  const handleManualCheckIn = (guestId: number) => {
    console.log('Manual check-in for guest:', guestId)
  }

  const handleEventChange = (eventId: number) => {
    setSelectedEventId(eventId)
    console.log('Event changed to:', eventId)
  }

  return (
    <div className="space-y-6">
      <EventSelectorDropdown onEventChange={handleEventChange} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <QRScannerViewport onScanSuccess={handleScanSuccess} isActive={true} />
          <ManualCheckInSearch onCheckIn={handleManualCheckIn} />
        </div>

        <div className="space-y-6">
          <LiveAttendancePanel />
          <RecentCheckInsFeed />
        </div>
      </div>
    </div>
  )
}

export default QRCheckInInteractive
