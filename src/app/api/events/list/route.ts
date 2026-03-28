import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '')

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch events for the user
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true })

    if (error) {
      console.error('Events fetch error:', error)
      return NextResponse.json({ error: error.message || 'Failed to fetch events' }, { status: 400 })
    }

    const eventIds = (events || []).map((event: any) => event.id)

    if (eventIds.length === 0) {
      return NextResponse.json([], { status: 200 })
    }

    const { data: guests } = await supabase
      .from('guests')
      .select('event_id, status, checked_in')
      .in('event_id', eventIds)

    const { data: invitationTemplates } = await supabase
      .from('invitation_templates')
      .select('event_id, view_count')
      .in('event_id', eventIds)

    const guestStatsByEvent = new Map<string, {
      invitationsSent: number
      confirmed: number
      declined: number
      noResponse: number
      checkedIn: number
    }>()

    for (const guest of guests || []) {
      const eventId = (guest as any).event_id as string
      const current = guestStatsByEvent.get(eventId) || {
        invitationsSent: 0,
        confirmed: 0,
        declined: 0,
        noResponse: 0,
        checkedIn: 0,
      }

      current.invitationsSent += 1
      if ((guest as any).status === 'confirmed') current.confirmed += 1
      if ((guest as any).status === 'declined') current.declined += 1
      if ((guest as any).status === 'no_response') current.noResponse += 1
      if ((guest as any).checked_in) current.checkedIn += 1

      guestStatsByEvent.set(eventId, current)
    }

    const openCountByEvent = new Map<string, number>()
    for (const invitation of invitationTemplates || []) {
      const eventId = (invitation as any).event_id as string
      const currentOpenCount = openCountByEvent.get(eventId) || 0
      openCountByEvent.set(eventId, currentOpenCount + ((invitation as any).view_count || 0))
    }

    const enrichedEvents = (events || []).map((event: any) => {
      const guestStats =
        guestStatsByEvent.get(event.id) ||
        ({ invitationsSent: 0, confirmed: 0, declined: 0, noResponse: 0, checkedIn: 0 } as const)
      const openCount = openCountByEvent.get(event.id) || 0

      return {
        ...event,
        guestCount: guestStats.invitationsSent,
        invitationsSent: guestStats.invitationsSent,
        confirmed: guestStats.confirmed,
        declined: guestStats.declined,
        noResponse: guestStats.noResponse,
        checkedIn: guestStats.checkedIn,
        openCount,
        openRate: guestStats.invitationsSent > 0 ? Math.round((openCount / guestStats.invitationsSent) * 100) : 0,
      }
    })

    return NextResponse.json(enrichedEvents, { status: 200 })
  } catch (error) {
    console.error('Events fetch exception:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
