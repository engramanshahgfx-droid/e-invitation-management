import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || ''
);

interface OTPResult {
  success: boolean;
  message: string;
  expiresIn?: number;
}

export async function sendOTP(email: string): Promise<OTPResult> {
  try {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in database with 15-minute expiry
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    const { error } = await supabase.from('verification_codes').insert({
      email,
      code: otp,
      expires_at: expiresAt.toISOString(),
    });

    if (error) throw error;

    // Send OTP via email (using SendGrid)
    const emailResponse = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });

    if (!emailResponse.ok) {
      throw new Error('Failed to send OTP email');
    }

    return {
      success: true,
      message: 'OTP sent to your email',
      expiresIn: 900, // 15 minutes in seconds
    };
  } catch (error: any) {
    console.error('Send OTP error:', error);
    return {
      success: false,
      message: error.message || 'Failed to send OTP',
    };
  }
}

export async function verifyOTP(email: string, code: string): Promise<OTPResult> {
  try {
    // Check if OTP exists and is valid
    const { data, error } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      return {
        success: false,
        message: 'Invalid or expired OTP',
      };
    }

    // Delete used OTP
    await supabase.from('verification_codes').delete().eq('id', data.id);

    return {
      success: true,
      message: 'OTP verified successfully',
    };
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return {
      success: false,
      message: error.message || 'Failed to verify OTP',
    };
  }
}
