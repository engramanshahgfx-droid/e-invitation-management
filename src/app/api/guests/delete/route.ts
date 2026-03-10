import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Helper to get authorized user
async function getAuthorizedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  return error ? null : user;
}

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getAuthorizedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get guestId from query params
    const { searchParams } = new URL(request.url);
    const guestId = searchParams.get('guestId');

    if (!guestId) {
      return NextResponse.json(
        { error: 'Guest ID is required' },
        { status: 400 }
      );
    }

    // Verify guest exists and belongs to user's event
    const { data: guest, error: guestError } = await supabase
      .from('guests')
      .select('id, event_id, events!inner(user_id)')
      .eq('id', guestId)
      .single();

    if (guestError || !guest) {
      return NextResponse.json(
        { error: 'Guest not found' },
        { status: 404 }
      );
    }

    // Check if the event belongs to the user
    if ((guest as any).events.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Delete the guest
    const { error: deleteError } = await supabase
      .from('guests')
      .delete()
      .eq('id', guestId);

    if (deleteError) {
      console.error('Error deleting guest:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete guest' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Guest deleted successfully',
    }, { status: 200 });

  } catch (error) {
    console.error('Error in delete guest API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
