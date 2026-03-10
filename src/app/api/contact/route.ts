import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '')

// Submit contact message
export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('contact_messages')
      .insert({
        name,
        email,
        message,
        status: 'unread',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      messageId: data.id,
      message: 'Message received. We will get back to you soon!',
    })
  } catch (error) {
    console.error('Contact message error:', error)
    return NextResponse.json({ error: 'Failed to submit message' }, { status: 500 })
  }
}

// Get all messages (Admin only)
export async function GET(request: NextRequest) {
  try {
    const adminId = request.headers.get('x-admin-id')

    if (!adminId) {
      return NextResponse.json({ error: 'Admin ID required' }, { status: 400 })
    }

    // Verify admin role
    const { data: admin } = await supabase.from('users').select('role').eq('id', adminId).single()

    if (admin?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized: Super admin access required' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ messages: data })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}
