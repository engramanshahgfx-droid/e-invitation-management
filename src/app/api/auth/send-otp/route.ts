import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// DEVELOPMENT MODE: Using hardcoded OTP 123456
// TODO: Replace with actual MailSlurp/SendGrid API when credentials are available
const DEVELOPMENT_OTP = '123456'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Store OTP in Supabase
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Check if email already exists in auth.users
    let existingUser = null
    try {
      const { data, error: listError } = await supabaseAdmin.auth.admin.listUsers()

      if (listError) {
        throw listError
      }

      existingUser = data.users.find((user) => user.email === email) ?? null
    } catch (err) {
      console.error('Error checking existing users:', err)
      // Continue even if list fails - don't block registration
    }

    if (existingUser) {
      return NextResponse.json({ error: 'This email already exists. Please sign in instead.' }, { status: 400 })
    }

    // Also check public.users table
    const { data: existingProfile } = await supabaseAdmin.from('users').select('id').eq('email', email).single()

    if (existingProfile) {
      return NextResponse.json({ error: 'This email already exists. Please sign in instead.' }, { status: 400 })
    }

    // Use hardcoded OTP for development
    const otp = DEVELOPMENT_OTP
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 min

    // Delete any existing codes for this email
    await supabaseAdmin.from('verification_codes').delete().eq('email', email)

    // Insert new code
    const { error: insertError } = await supabaseAdmin
      .from('verification_codes')
      .insert([{ email, code: otp, expires_at: expiresAt }])

    if (insertError) {
      console.error('Failed to store OTP:', insertError.message)
      return NextResponse.json({ error: 'Failed to generate verification code' }, { status: 500 })
    }

    // Log OTP to console for development
    console.log(`\n🔐 DEVELOPMENT OTP CODE`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`Email: ${email}`)
    console.log(`OTP Code: ${otp}`)
    console.log(`⏱️  Expires: 15 minutes`)
    console.log(``)
    console.log(`💡 Use this code to complete registration`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

    return NextResponse.json({
      success: true,
      message: 'Verification code generated. Check console for development OTP.',
      otp: otp, // For development testing
    })
  } catch (error: any) {
    console.error('Send OTP error:', error)
    return NextResponse.json({ error: error.message || 'Failed to send verification code' }, { status: 500 })
  }
}
