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

// GET /api/events/:id/guest-payments - List all guest payments + attendance for an event (admin only)
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthorizedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status')

    // Verify event belongs to user
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, user_id, name')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found or not authorized' }, { status: 404 })
    }

    // Build query for payments
    let query = supabase
      .from('guest_payments')
      .select(
        `
        id,
        event_id,
        guest_id,
        amount,
        payment_date,
        status,
        proof_url,
        proof_file_name,
        notes,
        created_at,
        guests(name, email, phone, status as guest_status)
      `
      )
      .eq('event_id', id)

    // Filter by payment status if provided
    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    // Order by created_at descending
    query = query.order('created_at', { ascending: false })

    const { data: payments, error: paymentsError } = await query

    if (paymentsError) {
      console.error('Payments query error:', paymentsError)
      // If guest_payments table doesn't exist yet, return empty
      if (
        String(paymentsError.message).includes('guest_payments') ||
        String(paymentsError.message).includes('does not exist')
      ) {
        return NextResponse.json({
          payments: [],
          guests: [],
          message: 'Payment system not yet initialized. Please run database migrations.',
        })
      }
      throw paymentsError
    }

    // Fetch all guests for this event to show attendance + no-payment guests
    const { data: allGuests, error: guestError } = await supabase
      .from('guests')
      .select('id, name, email, phone, status, checked_in, checked_in_at, qr_token, created_at')
      .eq('event_id', id)
      .order('created_at', { ascending: false })

    if (guestError) {
      console.error('Guests query error:', guestError)
      throw guestError
    }

    // Create a map of payments by guest_id
    const paymentsByGuestId: Record<string, any> = {}
    if (payments) {
      payments.forEach((p: any) => {
        paymentsByGuestId[p.guest_id] = {
          id: p.id,
          amount: p.amount,
          payment_date: p.payment_date,
          status: p.status,
          proof_url: p.proof_url,
          proof_file_name: p.proof_file_name,
          notes: p.notes,
          created_at: p.created_at,
        }
      })
    }

    // Enrich guests with payment info
    const enrichedGuests = (allGuests || []).map((guest: any) => ({
      ...guest,
      payment: paymentsByGuestId[guest.id] || null,
      has_paid: paymentsByGuestId[guest.id]?.status === 'paid',
    }))

    return NextResponse.json({
      payments: payments || [],
      guests: enrichedGuests,
      event,
    })
  } catch (error) {
    console.error('Error fetching guest payments:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/events/:id/guest-payments - Update payment status (admin only)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthorizedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { paymentId, status } = await request.json()

    if (!paymentId || !status) {
      return NextResponse.json({ error: 'paymentId and status are required' }, { status: 400 })
    }

    // Verify event belongs to user
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found or not authorized' }, { status: 404 })
    }

    // Update payment status
    const { data: updated, error: updateError } = await supabase
      .from('guest_payments')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId)
      .eq('event_id', id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true, payment: updated }, { status: 200 })
  } catch (error) {
    console.error('Error updating payment status:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
