import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: userData } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single();

    if (!userData) {
      // Don't reveal if email exists (security)
      return NextResponse.json({
        success: true,
        message: 'If email exists, OTP has been sent',
      });
    }

    // Generate and store OTP (in production, send via email)
    const otp = '123456'; // Fixed OTP for demo

    // Store OTP in verification_codes table
    const { error: otpError } = await supabase
      .from('verification_codes')
      .insert({
        email,
        code: otp,
        expires_at: new Date(Date.now() + 10 * 60000).toISOString(), // 10 minutes
      });

    if (otpError) {
      console.error('OTP insert error:', otpError);
      return NextResponse.json(
        { error: 'Failed to generate OTP' },
        { status: 500 }
      );
    }

    // In a real app, you would send this via email
    console.log(`Password reset OTP for ${email}: ${otp}`);

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your email. Use code: 123456 (demo)',
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
