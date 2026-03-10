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
    const user = await getAuthorizedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the event ID from query params
    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { error: 'eventId query parameter is required' },
        { status: 400 }
      );
    }

    console.log('Deleting all guests for event:', eventId, 'user:', user.id);

    // Verify event belongs to user
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, user_id')
      .eq('id', eventId)
      .eq('user_id', user.id)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete all guests for this event
    const { error: deleteError } = await supabase
      .from('guests')
      .delete()
      .eq('event_id', eventId);

    if (deleteError) {
      console.error('Error deleting guests:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete guests' },
        { status: 400 }
      );
    }

    console.log(`Successfully deleted all guests for event: ${eventId}`);

    return NextResponse.json({
      success: true,
      message: 'All guests deleted successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Delete guests error:', error);
    return NextResponse.json(
      { error: 'Failed to delete guests' },
      { status: 500 }
    );
  }
}
