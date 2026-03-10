'use client';

import { useState } from 'react';
import QRScannerViewport from './QRScannerViewport';
import LiveAttendancePanel from './LiveAttendancePanel';
import RecentCheckInsFeed from './RecentCheckInsFeed';
import ManualCheckInSearch from './ManualCheckInSearch';
import EventSelectorDropdown from './EventSelectorDropdown';

const QRCheckInInteractive = () => {
  const [selectedEventId, setSelectedEventId] = useState(1);

  const handleScanSuccess = (code: string) => {
    console.log('QR Code scanned:', code);
  };

  const handleManualCheckIn = (guestId: number) => {
    console.log('Manual check-in for guest:', guestId);
  };

  const handleEventChange = (eventId: number) => {
    setSelectedEventId(eventId);
    console.log('Event changed to:', eventId);
  };

  return (
    <div className="space-y-6">
      <EventSelectorDropdown onEventChange={handleEventChange} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <QRScannerViewport onScanSuccess={handleScanSuccess} isActive={true} />
          <ManualCheckInSearch onCheckIn={handleManualCheckIn} />
        </div>

        <div className="space-y-6">
          <LiveAttendancePanel />
          <RecentCheckInsFeed />
        </div>
      </div>
    </div>
  );
};

export default QRCheckInInteractive;