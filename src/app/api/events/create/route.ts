import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '')

export async function POST(request: NextRequest) {
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

    const { userId, name, date, time, venue, description, eventType, expectedGuests, status } = await request.json()

    // Validation
    if (!name || !date || !venue) {
      return NextResponse.json({ error: 'name, date, and venue are required' }, { status: 400 })
    }

    // Ensure userId matches authenticated user
    if (userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized: userId mismatch' }, { status: 403 })
    }

    const { data: userProfile, error: profileError } = await (supabase as any)
      .from('users')
      .select('account_type, event_limit, plan_type')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const { count: eventCount, error: countError } = await (supabase as any)
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (countError) {
      console.error('Event count error:', countError)
      return NextResponse.json({ error: 'Failed to verify event limit' }, { status: 500 })
    }

    const currentEventCount = eventCount || 0
    const eventLimit = userProfile.event_limit

    if (typeof eventLimit === 'number' && currentEventCount >= eventLimit) {
      const isFreeUser = userProfile.account_type === 'free'

      return NextResponse.json(
        {
          error: isFreeUser
            ? 'Free plan allows only 1 event. Upgrade your plan to create more events.'
            : `Your current plan allows only ${eventLimit} events. Upgrade to create more events.`,
          code: 'EVENT_LIMIT_REACHED',
          limitDetails: {
            feature: 'events',
            current: currentEventCount,
            limit: eventLimit,
            planType: userProfile.plan_type,
            accountType: userProfile.account_type,
          },
        },
        { status: 403 }
      )
    }

    // Create event in database
    const { data: event, error } = await supabase
      .from('events')
      .insert({
        user_id: user.id,
        name,
        date,
        time: time || '18:00',
        venue,
        description: description || '',
        event_type: eventType || 'wedding',
        expected_guests: expectedGuests || 100,
        status: status || 'draft',
      })
      .select()
      .single()

    if (error) {
      console.error('Event creation error:', error)
      return NextResponse.json({ error: error.message || 'Failed to create event' }, { status: 400 })
    }

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Event creation exception:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
