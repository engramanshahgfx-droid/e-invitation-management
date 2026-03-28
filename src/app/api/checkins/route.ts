import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '')

async function getAuthorizedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return null
  }

  const token = authHeader.replace('Bearer ', '')
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token)

  return error ? null : user
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthorizedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { eventId, guestId, qrToken, method } = await request.json()

    if (!eventId || (!guestId && !qrToken)) {
      return NextResponse.json({ error: 'eventId and guestId or qrToken are required' }, { status: 400 })
    }

    const checkInMethod = method === 'manual' ? 'manual' : 'qr_scan'

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, user_id, name')
      .eq('id', eventId)
      .eq('user_id', user.id)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found or access denied' }, { status: 404 })
    }

    const guestSelection = 'id, name, phone, email, qr_token, checked_in, checked_in_at, status, plus_ones'

    let guest: any = null
    let guestError: any = null

    if (guestId) {
      const guestResult = await supabase
        .from('guests')
        .select(guestSelection)
        .eq('event_id', eventId)
        .eq('id', guestId)
        .single()

      guest = guestResult.data
      guestError = guestResult.error
    } else {
      const normalizedQrToken = String(qrToken).trim()

      const exactGuestResult = await supabase
        .from('guests')
        .select(guestSelection)
        .eq('event_id', eventId)
        .eq('qr_token', normalizedQrToken)
        .maybeSingle()

      guest = exactGuestResult.data
      guestError = exactGuestResult.error

      if (!guest && !guestError && normalizedQrToken.length >= 6) {
        const prefixGuestResult = await supabase
          .from('guests')
          .select(guestSelection)
          .eq('event_id', eventId)
          .ilike('qr_token', `${normalizedQrToken}%`)
          .limit(2)

        if (prefixGuestResult.error) {
          guestError = prefixGuestResult.error
        } else if ((prefixGuestResult.data || []).length === 1) {
          guest = prefixGuestResult.data?.[0]
        } else if ((prefixGuestResult.data || []).length > 1) {
          return NextResponse.json(
            {
              error: 'Multiple guests match this short QR code. Use the full token or scan the QR image.',
            },
            { status: 409 }
          )
        }
      }
    }

    if (guestError || !guest) {
      return NextResponse.json({ error: 'Guest not found for this event' }, { status: 404 })
    }

    if (guest.checked_in) {
      return NextResponse.json(
        {
          success: false,
          duplicate: true,
          message: 'Guest is already checked in',
          guest: {
            id: guest.id,
            name: guest.name,
            phone: guest.phone,
            email: guest.email,
            qrCode: guest.qr_token,
            checkedInAt: guest.checked_in_at,
          },
        },
        { status: 409 }
      )
    }

    const checkedInAt = new Date().toISOString()

    const { error: updateError } = await supabase
      .from('guests')
      .update({ checked_in: true, checked_in_at: checkedInAt, updated_at: checkedInAt })
      .eq('id', guest.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message || 'Failed to update guest check-in' }, { status: 500 })
    }

    const { error: insertError } = await supabase.from('checkins').insert({
      guest_id: guest.id,
      event_id: eventId,
      checked_in_by: user.id,
      checked_in_at: checkedInAt,
      check_in_method: checkInMethod,
    })

    if (insertError) {
      console.error('Failed to insert check-in record:', insertError)
    }

    return NextResponse.json({
      success: true,
      message: 'Guest checked in successfully',
      guest: {
        id: guest.id,
        name: guest.name,
        phone: guest.phone,
        email: guest.email,
        qrCode: guest.qr_token,
        checkedInAt,
        plusOnes: guest.plus_ones || 0,
        status: guest.status,
      },
      event: {
        id: event.id,
        name: event.name,
      },
    })
  } catch (error) {
    console.error('Check-in API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
