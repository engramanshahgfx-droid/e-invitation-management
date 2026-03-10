import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 })
    }

    // Fixed OTP for demo: 123456
    if (otp !== '123456') {
      return NextResponse.json({ error: 'Invalid OTP. Please use: 123456' }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully. You can now reset your password.',
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 })
  }
}
