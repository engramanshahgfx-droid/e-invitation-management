import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { email, newPassword } = await request.json();

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'Email and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    console.log('Attempting to reset password for email:', email);

    // Try to find user by email in auth.users
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('List users error:', listError);
      return NextResponse.json(
        { error: 'Failed to find user account' },
        { status: 500 }
      );
    }

    const authUser = users?.find(u => u.email === email);

    if (!authUser) {
      console.log('User not found in auth, creating new account...');
      
      // Create new user in Supabase Auth
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password: newPassword,
        email_confirm: true,
      });

      if (createError) {
        console.error('Create user error:', createError);
        return NextResponse.json(
          { error: 'Failed to create account: ' + createError.message },
          { status: 500 }
        );
      }

      if (!newUser.user) {
        return NextResponse.json(
          { error: 'Account creation failed' },
          { status: 500 }
        );
      }

      // Create user profile in public.users table
      const { error: profileError } = await supabase.from('users').insert({
        id: newUser.user.id,
        email,
        account_type: 'free',
        subscription_status: 'trial',
        plan_type: 'free',
      });
      if (profileError) {
        console.warn('Profile creation failed:', profileError);
      }

      return NextResponse.json({
        success: true,
        message: 'Account created and password set successfully. You can now sign in.',
      });
    }

    // Update existing user's password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      authUser.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Update password error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update password: ' + updateError.message },
        { status: 500 }
      );
    }

    // Delete used OTP
    const { error: deleteError } = await supabase
      .from('verification_codes')
      .delete()
      .eq('email', email);
    if (deleteError) {
      console.warn('OTP cleanup failed:', deleteError);
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now sign in with your new password.',
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
