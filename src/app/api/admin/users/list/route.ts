import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const { adminId } = await request.json();

    if (!adminId) {
      return NextResponse.json(
        { error: 'adminId is required' },
        { status: 400 }
      );
    }

    // Verify that requester is a super_admin
    const { data: admin, error: adminError } = await supabase
      .from('users')
      .select('role')
      .eq('id', adminId)
      .single() as any;

    if (adminError || (admin as any)?.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Super admin access required' },
        { status: 403 }
      );
    }

    // Fetch all users from the users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersError) {
      return NextResponse.json(
        { error: usersError.message || 'Failed to fetch users' },
        { status: 400 }
      );
    }

    // Also fetch from auth.users to check if any users exist in auth but not in app
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (!authError && authUsers?.users) {
      // Check for users in auth but not in app users table
      const appUserIds = new Set((users || []).map((u: any) => u.id));
      const missingUsers = authUsers.users.filter((authUser: any) => !appUserIds.has(authUser.id));

      if (missingUsers.length > 0) {
        // Create missing user profiles
        for (const authUser of missingUsers) {
          try {
            await supabase.from('users').insert({
              id: authUser.id,
              email: authUser.email,
              phone: authUser.phone || null,
              full_name: authUser.user_metadata?.full_name || '',
              role: 'user',
              account_type: 'free',
              subscription_status: 'trial',
              plan_type: 'free',
              event_limit: 1,
            });
          } catch (error) {
            console.warn(`Could not create profile for user ${authUser.id}:`, error);
          }
        }

        // Re-fetch users to include newly created profiles
        const { data: updatedUsers } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        return NextResponse.json({
          success: true,
          users: updatedUsers || [],
          synced: missingUsers.length,
          message: `Synced ${missingUsers.length} missing user profiles`,
        });
      }
    }

    return NextResponse.json({
      success: true,
      users: users || [],
      synced: 0,
    });
  } catch (error: any) {
    console.error('Admin list users error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
