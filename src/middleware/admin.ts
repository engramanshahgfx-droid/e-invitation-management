import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Admin Middleware - Protects admin routes
 * Verifies user is logged in and has super_admin role
 */
export async function adminMiddleware(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )

    // Get user from session
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.redirect(new URL('/admin-login', request.url))
    }

    const token = authHeader.replace('Bearer ', '')

    // Verify token and get user
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data.user) {
      return NextResponse.redirect(new URL('/admin-login', request.url))
    }

    // Check if user is super_admin
    const { data: user } = await supabase.from('users').select('role').eq('id', data.user.id).single()

    if (!user || user.role !== 'super_admin') {
      return NextResponse.redirect(new URL('/admin-login', request.url))
    }

    // User is authorized, continue
    return NextResponse.next()
  } catch (error) {
    console.error('Admin middleware error:', error)
    return NextResponse.redirect(new URL('/admin-login', request.url))
  }
}
