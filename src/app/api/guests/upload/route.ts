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

// Helper to convert scientific notation back to normal numbers (Excel converts large numbers)
function convertScientificNotation(value: string): string {
  if (!value || typeof value !== 'string') return value;
  
  // Match scientific notation (e.g., 9.665E+11)
  const scientificMatch = value.match(/^(\d+\.?\d*)E\+(\d+)$/i);
  if (scientificMatch) {
    const base = parseFloat(scientificMatch[1]);
    const exponent = parseInt(scientificMatch[2]);
    
    // Convert back to string with proper decimal places
    const num = base * Math.pow(10, exponent);
    // Return as integer string without decimals
    return Math.floor(num).toString();
  }
  
  return value;
}

// Helper to parse CSV content
function parseCSV(content: string): any[] {
  let lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  if (lines.length < 2) {
    throw new Error('CSV file must have headers and at least one data row');
  }

  // Detect delimiter (comma or tab)
  const firstLine = lines[0];
  const delimiter = firstLine.includes('\t') ? '\t' : ',';
  
  // Parse header - normalize by removing spaces and converting to lowercase
  const rawHeaders = firstLine.split(delimiter).map(h => {
    // Remove quotes if present
    let cleanHeader = h.trim().replace(/^["']|["']$/g, '');
    return cleanHeader;
  });
  
  const headers = rawHeaders.map(h => 
    h.toLowerCase()
      .replace(/\s+/g, '') // Remove all spaces
      .replace(/[^\w]/g, '') // Remove special characters except word characters
  );
  
  console.log('Raw headers:', rawHeaders);
  console.log('Normalized headers:', headers);

  // Find the column indices for required fields (flexible matching)
  const nameIdx = headers.findIndex(h => 
    h === 'name' || 
    h === 'guestname' || 
    h === 'fullname' ||
    h === 'firstname' ||
    h === 'guest'
  );
  
  const phoneIdx = headers.findIndex(h => 
    h.includes('phone') || 
    h === 'tel' || 
    h === 'telephone' ||
    h === 'contact'
  );
  
  const emailIdx = headers.findIndex(h => 
    h === 'email' || 
    h === 'emailaddress' ||
    h === 'e_mail' ||
    h === 'mail'
  );
  
  console.log('Column indices - name:', nameIdx, 'phone:', phoneIdx, 'email:', emailIdx);

  if (nameIdx === -1 || phoneIdx === -1 || emailIdx === -1) {
    const missing = [];
    if (nameIdx === -1) missing.push('Name');
    if (phoneIdx === -1) missing.push('Phone');
    if (emailIdx === -1) missing.push('Email');
    throw new Error(`Missing required columns: ${missing.join(', ')}. Found headers: ${rawHeaders.join(', ')}`);
  }

  // Find optional column indices
  const plusOnesIdx = headers.findIndex(h => 
    h.includes('plusone') || 
    h.includes('plus1') || 
    h.includes('guests') ||
    h.includes('accompany') ||
    h.includes('companion')
  );
  
  const notesIdx = headers.findIndex(h => 
    h.includes('note') || 
    h.includes('special') || 
    h.includes('remark') ||
    h.includes('comment') ||
    h.includes('dietary') ||
    h.includes('preference')
  );

  // Parse data rows
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    if (!rawLine.trim()) continue; // Skip empty lines
    
    // Handle quoted fields and different delimiters
    const values = rawLine.split(delimiter).map(v => {
      let cleanValue = v.trim().replace(/^["']|["']$/g, '');
      // Convert scientific notation back to normal (Excel converts large phone numbers)
      cleanValue = convertScientificNotation(cleanValue);
      return cleanValue;
    });

    // Ensure we have enough columns
    if (values.length <= Math.max(nameIdx, phoneIdx, emailIdx)) {
      console.log(`Skipping incomplete row ${i}: expected ${Math.max(nameIdx, phoneIdx, emailIdx) + 1} columns, got ${values.length}`);
      continue;
    }

    const row: any = {
      name: values[nameIdx]?.trim() || '',
      phone: values[phoneIdx]?.trim() || '',
      email: values[emailIdx]?.trim() || '',
    };

    if (plusOnesIdx !== -1 && values[plusOnesIdx]) {
      row['plus_ones'] = values[plusOnesIdx].trim() || '0';
    }
    if (notesIdx !== -1 && values[notesIdx]) {
      row['notes'] = values[notesIdx].trim() || '';
    }

    if (row.name && row.phone && row.email) {
      data.push(row);
      console.log('Added guest:', row);
    }
  }

  if (data.length === 0) {
    throw new Error('No valid guest records found in file');
  }

  console.log(`Parsed ${data.length} guests from CSV`);
  return data;
}

// Helper to parse file content
async function parseFileContent(file: File): Promise<any[]> {
  const content = await file.text();
  
  // Check for Excel file by filename and starting bytes
  if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
    // Excel files start with PK (ZIP signature) in binary
    if (content.startsWith('PK')) {
      throw new Error(
        'Excel files (.xlsx, .xls) require conversion to CSV format. ' +
        'Please open your Excel file and export it as CSV:\n' +
        '1. Open the Excel file\n' +
        '2. Go to File > Save As\n' +
        '3. Choose format: CSV UTF-8 (.csv)\n' +
        '4. Save and upload the CSV file here'
      );
    }
  }
  
  // Try CSV parsing
  if (file.name.endsWith('.csv') || content.includes(',') || content.includes('\t')) {
    return parseCSV(content);
  }

  throw new Error(
    'Unsupported file format. Please use CSV format. ' +
    'If you have an Excel file, export it as CSV first:\n' +
    '1. Open Excel > File > Save As\n' +
    '2. Format: CSV UTF-8 (.csv)'
  );
}

export async function POST(request: NextRequest) {
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

    console.log('Processing guest upload for event:', eventId, 'user:', user.id);

    // Parse FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

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

    // Parse file
    const guestData = await parseFileContent(file);
    console.log(`Parsed ${guestData.length} guests from file`);

    // Normalize phone numbers in guest data for consistency
    const normalizedGuestData = guestData.map((row: any) => ({
      ...row,
      phone: normalizePhone(row.phone)
    }));

    // Get the replace_existing flag from query params
    const replaceExisting = searchParams.get('replace') === 'true';

    // Check for existing guests with these phone numbers
    const phoneNumbers = normalizedGuestData.map((row: any) => row.phone);
    const { data: existingGuests, error: checkError } = await supabase
      .from('guests')
      .select('phone')
      .eq('event_id', eventId)
      .in('phone', phoneNumbers);

    if (checkError) {
      console.error('Error checking existing guests:', checkError);
      return NextResponse.json(
        { error: 'Failed to check for duplicate guests' },
        { status: 400 }
      );
    }

    const existingPhones = new Set(existingGuests?.map((g: any) => g.phone) || []);
    const duplicatePhones = phoneNumbers.filter(p => existingPhones.has(p));

    // If there are duplicates and user didn't request to replace
    if (duplicatePhones.length > 0 && !replaceExisting) {
      console.log('Duplicate phones found:', duplicatePhones);
      return NextResponse.json(
        {
          error: 'Duplicate guests detected',
          duplicates: duplicatePhones,
          message: `Found ${duplicatePhones.length} guest(s) with phone numbers already in this event. Delete the existing guests first or use replace=true to overwrite the entire guest list.`,
          suggestion: 'duplicate_phones'
        },
        { status: 409 }
      );
    }

    // If user wants to replace, delete existing guests first
    if (replaceExisting) {
      console.log('Replacing entire guest list for event:', eventId);
      const { error: deleteError } = await supabase
        .from('guests')
        .delete()
        .eq('event_id', eventId);

      if (deleteError) {
        console.error('Error deleting existing guests:', deleteError);
        return NextResponse.json(
          { error: 'Failed to delete existing guests' },
          { status: 400 }
        );
      }
    }

    // Insert guests into database
    const guests = normalizedGuestData.map((row: any) => ({
      id: randomUUID(),
      event_id: eventId,
      name: row.name,
      phone: row.phone,
      email: row.email,
      plus_ones: parseInt(row.plus_ones || row['plus ones'] || row['plusones'] || '0'),
      notes: row.notes || row['special notes'] || row['special_notes'] || '',
      status: 'no_response',
      qr_token: randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { data: insertedGuests, error: insertError } = await supabase
      .from('guests')
      .insert(guests)
      .select();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json(
        { error: insertError.message || 'Failed to save guests' },
        { status: 400 }
      );
    }

    console.log(`Successfully inserted ${insertedGuests?.length || 0} guests`);

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${insertedGuests?.length || 0} guests`,
      guestsCount: insertedGuests?.length || 0,
      guests: insertedGuests,
    }, { status: 200 });
  } catch (error) {
    console.error('Guest upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process file';
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}
