import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId, name, date, time, venue, description, eventType, expectedGuests, status } = await request.json();

    // Validation
    if (!name || !date || !venue) {
      return NextResponse.json(
        { error: 'name, date, and venue are required' },
        { status: 400 }
      );
    }

    // Ensure userId matches authenticated user
    if (userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: userId mismatch' },
        { status: 403 }
      );
    }

    // Create event in database
    const { data: event, error } = await supabase
      .from('events')
      .insert({
        user_id: user.id,
        name,
        date,
        time: time || '18:00',
        venue,
        description: description || '',
        event_type: eventType || 'wedding',
        expected_guests: expectedGuests || 100,
        status: status || 'draft',
      })
      .select()
      .single();

    if (error) {
      console.error('Event creation error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to create event' },
        { status: 400 }
      );
    }

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Event creation exception:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
