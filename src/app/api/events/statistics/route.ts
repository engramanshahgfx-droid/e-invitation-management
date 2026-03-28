import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '')

async function getAuthorizedUserId(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return null
  }

  const match = authHeader.match(/Bearer\s+(.+)/i)
  if (!match?.[1]) {
    return null
  }

  const token = match[1]

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error) {
      console.warn('Authorization failed while resolving user:', error.message)
      return null
    }

    return user?.id ?? null
  } catch (error) {
    console.error('Supabase getUser exception:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const eventId = request.nextUrl.searchParams.get('eventId')
    const queryUserId = request.nextUrl.searchParams.get('userId')
    const authorizedUserId = await getAuthorizedUserId(request)

    if (!authorizedUserId && !queryUserId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 401 })
    }

    // Prefer authenticated user ID, fallback to query userId for backend helpers or admin tooling.
    const userId = authorizedUserId ?? queryUserId

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 401 })
    }

    if (!eventId) {
      // Return aggregated stats for all user's events
      const { data: events, error: eventsError } = await supabase.from('events').select('id').eq('user_id', userId)

      if (eventsError) {
        return NextResponse.json({ error: eventsError.message }, { status: 400 })
      }

      const eventIds = (events || []).map((event) => event.id)
      if (eventIds.length === 0) {
        return NextResponse.json({ invitationsSent: 0, confirmedGuests: 0, pendingResponses: 0, checkedIn: 0 })
      }

      const { data: guests, error } = await supabase
        .from('guests')
        .select('status, checked_in')
        .in('event_id', eventIds)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      const stats = {
        invitationsSent: guests?.length || 0,
        confirmedGuests: guests?.filter((g) => g.status === 'confirmed').length || 0,
        pendingResponses: guests?.filter((g) => g.status === 'no_response').length || 0,
        checkedIn: guests?.filter((g) => g.checked_in).length || 0,
      }

      return NextResponse.json(stats)
    }

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .eq('user_id', userId)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Return stats for specific event
    const { data: guests, error } = await supabase.from('guests').select('status, checked_in').eq('event_id', eventId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const stats = {
      invitationsSent: guests?.length || 0,
      confirmedGuests: guests?.filter((g) => g.status === 'confirmed').length || 0,
      pendingResponses: guests?.filter((g) => g.status === 'no_response').length || 0,
      checkedIn: guests?.filter((g) => g.checked_in).length || 0,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching event statistics:', error)
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
