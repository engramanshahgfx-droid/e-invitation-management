// API Route: Generate Shareable Link
// Location: src/app/api/invitations/[invitationId]/share/route.ts

import { generateShareableLinkCompat } from '@/lib/invitationTemplateCompat'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

interface RouteParams {
  params: {
    invitationId: string
  }
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '')

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { invitationId } = params

    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check authorization
    let authorized = false

    const modernFetch = await (supabase.from('invitation_templates') as any)
      .select('created_by')
      .eq('id', invitationId)
      .maybeSingle()

    if (!modernFetch.error && modernFetch.data) {
      authorized = modernFetch.data.created_by === user.id
    } else {
      const legacyFetch = await (supabase.from('invitation_templates') as any)
        .select('user_id')
        .eq('id', invitationId)
        .maybeSingle()
      authorized = Boolean(!legacyFetch.error && legacyFetch.data && legacyFetch.data.user_id === user.id)
    }

    if (!authorized) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Generate shareable link
    const shareLink = await generateShareableLinkCompat(supabase as any, invitationId)

    // Get base URL from request
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
    const baseUrl = `${protocol}://${host}`

    return NextResponse.json({
      shareable_link: shareLink,
      shareable_url: `${baseUrl}/en/invitations/${shareLink}`,
      success: true,
    })
  } catch (error) {
    console.error('Error generating shareable link:', error)
    return NextResponse.json({ error: 'Failed to generate shareable link' }, { status: 500 })
  }
}
