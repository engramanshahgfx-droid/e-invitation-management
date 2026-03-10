#!/usr/bin/env node
/**
 * Setup script to run database migrations for bank transfer support
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL');
  console.error('Make sure these are set in your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🔄 Running payment table migration...');

    // Migration 1: Add columns to payments table
    const { error: error1 } = await supabase.rpc('execute_sql', {
      sql: `
        ALTER TABLE payments 
        ADD COLUMN IF NOT EXISTS reference_code TEXT UNIQUE,
        ADD COLUMN IF NOT EXISTS proof_image_url TEXT;
      `
    }).catch(() => {
      // If execute_sql doesn't exist, we'll try raw SQL
      return { error: 'Need to execute manually' };
    });

    if (error1) {
      console.warn('⚠️  Could not execute via RPC. Please run this SQL in Supabase dashboard:');
      console.log(`
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS reference_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS proof_image_url TEXT;
      `);
    } else {
      console.log('✅ Columns added successfully');
    }

    // Check if columns exist
    const { data, error: checkError } = await supabase
      .from('payments')
      .select('proof_image_url, reference_code')
      .limit(1);

    if (!checkError) {
      console.log('✅ Payment table has all required columns');
    } else if (checkError.message.includes('column')) {
      console.error('❌ Columns are missing. Please run the migration manually in Supabase dashboard');
      process.exit(1);
    }

    console.log(`
✅ Migration check complete!

Next steps:
1. Go to Supabase Storage: https://app.supabase.com/project/_/storage/buckets
2. Create a new bucket named 'payment-proofs' (Public visibility)
3. Test the payment flow again

For detailed setup instructions, see: BANK_TRANSFER_SETUP.md
    `);

  } catch (error) {
    console.error('❌ Migration error:', error.message);
    console.log(`
Please run this SQL manually in Supabase dashboard SQL editor:

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS reference_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS proof_image_url TEXT;
    `);
  }
}

runMigration();
