import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '')

// DEVELOPMENT MODE: Using hardcoded OTP 123456
// TODO: Replace with actual MailSlurp/SendGrid when credentials available
const DEVELOPMENT_OTP = '123456'

// User registration endpoint - creates account immediately
export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, phoneNumber } = await request.json()

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Email, password, and full name are required' }, { status: 400 })
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      console.error('Auth creation error:', authError)
      return NextResponse.json({ error: authError.message || 'Failed to create account' }, { status: 400 })
    }

    // Create user profile with trial setup
    const trialExpiry = new Date()
    trialExpiry.setDate(trialExpiry.getDate() + 3) // 3-day trial

    const { data: userData, error: userError } = (await supabase
      .from('users')
      .insert({
        id: authData.user?.id,
        email,
        full_name: fullName,
        phone_number: phoneNumber || null,
        role: 'user',
        account_type: 'free',
        subscription_status: 'trial',
        plan_type: 'free',
        event_limit: 1,
        subscription_expiry: trialExpiry.toISOString(),
      })
      .select()
      .single()) as any

    if (userError) {
      console.error('User profile creation error:', userError)
      // Clean up auth user if profile creation fails
      if (authData.user?.id) {
        await supabase.auth.admin.deleteUser(authData.user.id)
      }
      return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 })
    }

    // Store development OTP
    const otp = DEVELOPMENT_OTP
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 min

    const { error: otpError } = await supabase
      .from('verification_codes')
      .insert([{ email, code: otp, expires_at: expiresAt }])

    if (otpError) {
      console.error('OTP storage error:', otpError)
    }

    // Log to console
    console.log(`\n✅ ACCOUNT CREATED SUCCESSFULLY`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`User: ${fullName}`)
    console.log(`Email: ${email}`)
    console.log(`Phone: ${phoneNumber || 'Not provided'}`)
    console.log(``)
    console.log(`🔐 DEVELOPMENT OTP: ${otp}`)
    console.log(``)
    console.log(`✨ Free Trial: 3 days`)
    console.log(`📱 Free Events: 1`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

    return NextResponse.json({
      success: true,
      user: userData,
      otp: otp, // Development testing only
      message: `✅ Account created! Use OTP: ${otp}. You now have a 3-day free trial with 1 free event.`,
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 })
  }
}
