'use client'

import { getCurrentSession } from '@/lib/auth'
import { useEffect, useState } from 'react'
import EventSelectorDropdown, { type QRCheckInEvent } from './EventSelectorDropdown'
import LiveAttendancePanel from './LiveAttendancePanel'
import ManualCheckInSearch, { type QRCheckInGuest } from './ManualCheckInSearch'
import QRScannerViewport, { type ScanSubmissionResult } from './QRScannerViewport'
import RecentCheckInsFeed from './RecentCheckInsFeed'

const QRCheckInInteractive = () => {
  const [selectedEventId, setSelectedEventId] = useState('')
  const [events, setEvents] = useState<QRCheckInEvent[]>([])
  const [guests, setGuests] = useState<QRCheckInGuest[]>([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [isLoadingGuests, setIsLoadingGuests] = useState(false)
  const [checkInError, setCheckInError] = useState<string | null>(null)

  const sendAuthorizedRequest = async (input: string, init: RequestInit = {}) => {
    const execute = async (authToken: string) => {
      const headers = new Headers(init.headers)
      headers.set('Authorization', `Bearer ${authToken}`)

      return fetch(input, {
        ...init,
        headers,
      })
    }

    const initialSession = await getCurrentSession().catch(() => null)
    const initialToken = initialSession?.access_token || null

    if (!initialToken) {
      throw new Error('Your session expired. Please sign in again.')
    }

    let response = await execute(initialToken)

    if (response.status === 401) {
      const refreshedSession = await getCurrentSession().catch(() => null)
      const refreshedToken = refreshedSession?.access_token || null

      if (refreshedToken && refreshedToken !== initialToken) {
        response = await execute(refreshedToken)
      }
    }

    return response
  }

  const fetchGuests = async (eventId: string) => {
    setIsLoadingGuests(true)
    try {
      const response = await sendAuthorizedRequest(`/api/guests/list?eventId=${eventId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch guests')
      }

      const data = await response.json()
      const nextGuests: QRCheckInGuest[] = (data.guests || []).map((guest: any) => ({
        id: String(guest.id),
        name: guest.name,
        email: guest.email || '',
        phone: guest.phone,
        responseStatus: guest.responseStatus,
        checkInTime: guest.checkInTime,
        qrCode: guest.qrCode,
        plusOnes: guest.plusOnes || 0,
      }))

      setGuests(nextGuests)
      setEvents((current) =>
        current.map((event) =>
          event.id === eventId
            ? {
                ...event,
                checkedIn: nextGuests.filter((guest) => guest.checkInTime).length,
                totalGuests: nextGuests.length,
              }
            : event
        )
      )
    } catch (error) {
      console.error('Failed to fetch guests for QR check-in:', error)
    } finally {
      setIsLoadingGuests(false)
    }
  }

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoadingEvents(true)
        const session = await getCurrentSession()
        if (!session?.access_token) {
          return
        }

        const response = await sendAuthorizedRequest('/api/events/list', {
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch events')
        }

        const eventsData = await response.json()
        const nextEvents: QRCheckInEvent[] = (eventsData || []).map((event: any) => ({
          id: String(event.id),
          name: event.name,
          date: event.date,
          venue: event.venue,
          totalGuests: event.expected_guests || 0,
          checkedIn: 0,
          status: event.status,
        }))

        setEvents(nextEvents)
        if (nextEvents.length > 0) {
          setSelectedEventId(nextEvents[0].id)
          await fetchGuests(nextEvents[0].id)
        }
      } catch (error) {
        console.error('Failed to initialize QR check-in:', error)
      } finally {
        setIsLoadingEvents(false)
      }
    }

    initialize()
  }, [])

  const submitCheckIn = async (payload: {
    guestId?: string
    qrToken?: string
    method: 'manual' | 'qr_scan'
  }): Promise<ScanSubmissionResult> => {
    if (!selectedEventId) {
      return {
        status: 'error',
        message: 'Select an event first',
      }
    }

    setCheckInError(null)

    try {
      const response = await sendAuthorizedRequest('/api/checkins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: selectedEventId,
          guestId: payload.guestId,
          qrToken: payload.qrToken,
          method: payload.method,
        }),
      })

      const data = await response.json()

      if (response.status === 409) {
        await fetchGuests(selectedEventId)
        return {
          status: 'duplicate',
          message: data.message || 'Guest is already checked in',
          guestName: data.guest?.name,
          code: data.guest?.qrCode,
        }
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Check-in failed')
      }

      await fetchGuests(selectedEventId)

      return {
        status: 'success',
        message: data.message || 'Guest checked in successfully',
        guestName: data.guest?.name,
        code: data.guest?.qrCode,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Check-in failed'
      setCheckInError(message)
      return {
        status: 'error',
        message,
      }
    }
  }

  const handleScanSuccess = async (code: string) => submitCheckIn({ qrToken: code, method: 'qr_scan' })

  const handleManualCheckIn = async (guestId: string) => submitCheckIn({ guestId, method: 'manual' })

  const handleEventChange = async (eventId: string) => {
    setSelectedEventId(eventId)
    setCheckInError(null)
    await fetchGuests(eventId)
  }

  const selectedEvent = events.find((event) => event.id === selectedEventId) || null
  const checkedInGuests = guests.filter((guest) => guest.checkInTime)
  const exampleCode = guests.find((guest) => !guest.checkInTime)?.qrCode || guests[0]?.qrCode || null

  return (
    <div className="space-y-6">
      <EventSelectorDropdown
        events={events}
        selectedEventId={selectedEventId}
        onEventChange={handleEventChange}
        isLoading={isLoadingEvents}
      />

      {checkInError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{checkInError}</div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <QRScannerViewport onScanSuccess={handleScanSuccess} isActive={true} exampleCode={exampleCode} />
          <ManualCheckInSearch guests={guests} isLoading={isLoadingGuests} onCheckIn={handleManualCheckIn} />
        </div>

        <div className="space-y-6">
          <LiveAttendancePanel
            totalGuests={guests.length}
            checkedInGuests={checkedInGuests.length}
            confirmedGuests={guests.filter((guest) => guest.responseStatus === 'confirmed').length}
            eventName={selectedEvent?.name || null}
          />
          <RecentCheckInsFeed guests={checkedInGuests} />
        </div>
      </div>
    </div>
  )
}

export default QRCheckInInteractive
