import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

import { ErrorResponses, handleAPIError } from '@/lib/errorHandler'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return ErrorResponses.missingFields(['userId'])
    }

    // Get user subscription info
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: userData, error: userError } = await (supabase as any)
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !userData) {
      return ErrorResponses.userNotFound()
    }

    // Get subscription plan details
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: planData } = await (supabase as any)
      .from('subscription_plans')
      .select('*')
      .eq('name', userData.plan_type)
      .single()

    // Get event count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: events, error: eventsError } = await (supabase as any)
      .from('events')
      .select('id')
      .eq('user_id', userId)

    const eventCount = events?.length || 0

    // Get total guest count across all events
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: guestData } = await (supabase as any)
      .from('guests')
      .select('id')
      .in('event_id', events?.map((e: any) => e.id) || [])

    const guestCount = guestData?.length || 0

    // Check if limits are exceeded
    let limitExceeded = false
    let limitDetails = {}

    if (planData) {
      if (planData.event_limit && eventCount >= planData.event_limit) {
        limitExceeded = true
        limitDetails = {
          events: {
            limit: planData.event_limit,
            used: eventCount,
            exceeded: true,
          },
        }
      }

      if (planData.guest_limit && guestCount >= planData.guest_limit) {
        limitExceeded = true
        limitDetails = {
          ...limitDetails,
          guests: {
            limit: planData.guest_limit,
            used: guestCount,
            exceeded: true,
          },
        }
      }
    }

    return NextResponse.json({
      user: userData,
      plan: planData,
      usage: {
        events: eventCount,
        guests: guestCount,
        whatsappSentThisMonth: userData.whatsapp_sent_this_month,
        whatsappLimitPerMonth: userData.whatsapp_limit_per_month,
      },
      limitExceeded,
      limitDetails,
    })
  } catch (error) {
    return handleAPIError(error)
  }
}
