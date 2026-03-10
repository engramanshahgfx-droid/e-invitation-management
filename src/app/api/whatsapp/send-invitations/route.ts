import { supabase } from '@/lib/supabase'
import { sendBulkWhatsAppMessages } from '@/lib/twilio'
import { NextRequest, NextResponse } from 'next/server'

import { ErrorResponses, handleAPIError } from '@/lib/errorHandler'

export async function POST(request: NextRequest) {
  try {
    const { userId, eventId, guestIds } = await request.json()

    if (!userId || !eventId || !guestIds || guestIds.length === 0) {
      return ErrorResponses.missingFields(['userId', 'eventId', 'guestIds'])
    }

    // Check user's subscription and limits
    const { data: userData, error: userError } = await (supabase as any)
      .from('users')
      .select('subscription_status, plan_type, whatsapp_limit_per_month, whatsapp_sent_this_month')
      .eq('id', userId)
      .single()

    if (userError || !userData) {
      return ErrorResponses.userNotFound()
    }

    // Check if subscription is active
    if ((userData as any).subscription_status !== 'active') {
      return ErrorResponses.subscriptionRequired()
    }

    // Check monthly limit
    if (
      (userData as any).whatsapp_limit_per_month > 0 &&
      (userData as any).whatsapp_sent_this_month + guestIds.length > (userData as any).whatsapp_limit_per_month
    ) {
      return ErrorResponses.limitExceeded(
        'WhatsApp messages',
        (userData as any).whatsapp_sent_this_month + guestIds.length,
        (userData as any).whatsapp_limit_per_month
      )
    }

    // Get event details
    const { data: eventData, error: eventError } = await (supabase as any)
      .from('events')
      .select('name, date')
      .eq('id', eventId)
      .eq('user_id', userId)
      .single()

    if (eventError || !eventData) {
      return ErrorResponses.notFound('Event')
    }

    // Get guest details
    const { data: guests, error: guestsError } = await (supabase as any)
      .from('guests')
      .select('id, phone, name, qr_token')
      .in('id', guestIds)
      .eq('event_id', eventId)

    if (guestsError || !guests) {
      return ErrorResponses.internalError('Failed to fetch guests')
    }

    // Prepare WhatsApp messages
    const messages = (guests as any).map((guest: any) => ({
      phone: guest.phone,
      message: `Hi ${guest.name}! You're invited to ${(eventData as any).name} on ${(eventData as any).date}. Please confirm your attendance.`,
    }))

    // Send WhatsApp messages
    const { results, errors } = await sendBulkWhatsAppMessages(messages)

    // Record sent messages in database
    const messageRecords = results.map((result) => {
      const guest = (guests as any).find((g: any) => g.phone === result.phone)
      return {
        guest_id: guest?.id,
        event_id: eventId,
        message_type: 'invitation',
        status: 'sent',
        sent_at: new Date().toISOString(),
      }
    })

    if (messageRecords.length > 0) {
      await (supabase as any).from('messages').insert(messageRecords)
    }

    // Update user WhatsApp sent count
    await (supabase as any)
      .from('users')
      .update({
        whatsapp_sent_this_month: (userData as any).whatsapp_sent_this_month + results.length,
      })
      .eq('id', userId)

    return NextResponse.json({
      success: true,
      sent: results.length,
      failed: errors.length,
      results,
      errors,
    })
  } catch (error) {
    return handleAPIError(error)
  }
}
