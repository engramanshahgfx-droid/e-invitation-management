import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

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

// Helper to normalize phone numbers for consistent comparison
function normalizePhone(phone: string): string {
  if (!phone) return '';
  // Remove all whitespace, dashes, parentheses, and dots
  return phone.replace(/[\s\-\(\)\.]/g, '').trim();
}

// Helper to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper to validate phone number format
function isValidPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  // Basic validation: should be numbers with optional + prefix, minimum 10 digits
  return /^\+?\d{10,15}$/.test(normalized);
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getAuthorizedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { eventId, name, phone, email, plusOnes, notes } = body;

    // Validate required fields
    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Guest name is required' },
        { status: 400 }
      );
    }

    if (!phone || !phone.trim()) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone format
    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Please include country code (e.g., +966)' },
        { status: 400 }
      );
    }

    // Verify event belongs to user
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .eq('user_id', user.id)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found or access denied' },
        { status: 404 }
      );
    }

    // Check for duplicate phone number in this event
    const normalizedPhone = normalizePhone(phone);
    const { data: existingGuests } = await supabase
      .from('guests')
      .select('phone')
      .eq('event_id', eventId);

    if (existingGuests && existingGuests.length > 0) {
      const duplicate = existingGuests.find(g => 
        normalizePhone(g.phone) === normalizedPhone
      );

      if (duplicate) {
        return NextResponse.json(
          { error: 'A guest with this phone number already exists for this event' },
          { status: 409 }
        );
      }
    }

    // Generate unique QR token
    const qrToken = randomUUID().replace(/-/g, '');

    // Parse plus ones (default to 0)
    const plusOnesCount = parseInt(String(plusOnes || '0'), 10) || 0;

    // Create guest record
    const guestData = {
      event_id: eventId,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      plus_ones: plusOnesCount,
      notes: notes?.trim() || null,
      qr_token: qrToken,
      status: 'no_response',
      checked_in: false,
      created_at: new Date().toISOString(),
    };

    const { data: insertedGuest, error: insertError } = await supabase
      .from('guests')
      .insert([guestData])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting guest:', insertError);
      return NextResponse.json(
        { error: `Failed to create guest: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Guest added successfully',
      guest: {
        id: insertedGuest.id,
        name: insertedGuest.name,
        phone: insertedGuest.phone,
        email: insertedGuest.email,
        plusOnes: insertedGuest.plus_ones,
        qrToken: insertedGuest.qr_token,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error in create guest API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
