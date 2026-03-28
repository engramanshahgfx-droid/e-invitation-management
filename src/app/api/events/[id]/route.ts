import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '')

async function persistFallbackBankAccount(details: {
  bankAccountHolder?: string
  bankName?: string
  bankAccountNumber?: string
  bankIban?: string
}) {
  if (!details.bankAccountHolder || !details.bankName || !details.bankAccountNumber) {
    return
  }

  const { data: activeBankAccount } = await supabase
    .from('bank_accounts')
    .select('id')
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()

  if ((activeBankAccount as any)?.id) {
    await supabase
      .from('bank_accounts')
      .update({
        account_holder: details.bankAccountHolder,
        bank_name: details.bankName,
        account_number: details.bankAccountNumber,
        iban: details.bankIban || null,
        is_active: true,
      })
      .eq('id', (activeBankAccount as any).id)
  } else {
    await supabase.from('bank_accounts').insert({
      account_holder: details.bankAccountHolder,
      bank_name: details.bankName,
      account_number: details.bankAccountNumber,
      iban: details.bankIban || null,
      is_active: true,
    })
  }
}

// Helper to get authorized user
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

// GET a single event
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthorizedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }
      console.error('Event fetch error:', error)
      return NextResponse.json({ error: error.message || 'Failed to fetch event' }, { status: 400 })
    }

    return NextResponse.json(event, { status: 200 })
  } catch (error) {
    console.error('Event fetch exception:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// UPDATE an event
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthorizedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const {
      name,
      date,
      time,
      venue,
      description,
      eventType,
      expectedGuests,
      status,
      templateId,
      bankAccountHolder,
      bankName,
      bankAccountNumber,
      bankIban,
    } = await request.json()

    // Validation
    if (!name || !date || !venue) {
      return NextResponse.json({ error: 'name, date, and venue are required' }, { status: 400 })
    }

    const templateColumnMissing = (err: any) => String(err?.message || '').includes('template_id')
    const bankColumnsMissing = (err: any) => String(err?.message || '').includes('bank_account_holder')

    const baseUpdatePayload: Record<string, unknown> = {
      name,
      date,
      time: time || '18:00',
      venue,
      description: description || '',
      event_type: eventType,
      expected_guests: expectedGuests,
      status: status,
      updated_at: new Date().toISOString(),
    }

    const updatePayloadWithBank: Record<string, unknown> = {
      ...baseUpdatePayload,
      bank_account_holder: bankAccountHolder || null,
      bank_name: bankName || null,
      bank_account_number: bankAccountNumber || null,
      bank_iban: bankIban || null,
    }

    if (templateId) {
      baseUpdatePayload.template_id = templateId
      updatePayloadWithBank.template_id = templateId
    }

    let event: any = null
    let error: any = null

    const runUpdate = async (payload: Record<string, unknown>) => {
      return supabase.from('events').update(payload).eq('id', id).eq('user_id', user.id).select().single()
    }

    const payloadWithoutTemplateWithBank = { ...updatePayloadWithBank }
    delete payloadWithoutTemplateWithBank.template_id

    const payloadWithoutTemplate = { ...baseUpdatePayload }
    delete payloadWithoutTemplate.template_id

    let updateWithBank = await runUpdate(updatePayloadWithBank)

    if (updateWithBank.error && templateColumnMissing(updateWithBank.error)) {
      updateWithBank = await runUpdate(payloadWithoutTemplateWithBank)
    }

    event = updateWithBank.data
    error = updateWithBank.error

    if (error && bankColumnsMissing(error)) {
      let updateWithoutBank = await runUpdate(baseUpdatePayload)

      if (updateWithoutBank.error && templateColumnMissing(updateWithoutBank.error)) {
        updateWithoutBank = await runUpdate(payloadWithoutTemplate)
      }

      event = updateWithoutBank.data
      error = updateWithoutBank.error

      if (!error) {
        await persistFallbackBankAccount({
          bankAccountHolder,
          bankName,
          bankAccountNumber,
          bankIban,
        })
      }
    }

    if (error) {
      console.error('Event update error:', error)
      return NextResponse.json({ error: error.message || 'Failed to update event' }, { status: 400 })
    }

    return NextResponse.json(event, { status: 200 })
  } catch (error) {
    console.error('Event update exception:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE an event
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthorizedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const { error } = await supabase.from('events').delete().eq('id', id).eq('user_id', user.id)

    if (error) {
      console.error('Event delete error:', error)
      return NextResponse.json({ error: error.message || 'Failed to delete event' }, { status: 400 })
    }

    return NextResponse.json({ message: 'Event deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Event delete exception:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
