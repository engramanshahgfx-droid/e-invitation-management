#!/usr/bin/env node
/**
 * Setup script: adds bank columns to events + creates guest_payments table + payment-proofs bucket
 * Run with: node -r dotenv/config scripts/setup-guest-payments.js
 * or:       node scripts/setup-guest-payments.js  (if .env is loaded by your shell)
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('    Make sure these are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ─── SQL migrations ────────────────────────────────────────────────────────────

const SQL_BANK_COLUMNS = `
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS bank_account_holder TEXT,
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
  ADD COLUMN IF NOT EXISTS bank_iban TEXT;
`;

const SQL_GUEST_PAYMENTS_TABLE = `
CREATE TABLE IF NOT EXISTS guest_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  payment_method TEXT NOT NULL DEFAULT 'bank_transfer' CHECK (payment_method = 'bank_transfer'),
  amount NUMERIC(10, 2) NOT NULL,
  payment_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'unpaid', 'rejected')),
  proof_url TEXT NOT NULL,
  proof_file_name TEXT,
  notes TEXT,
  bank_account_holder TEXT,
  bank_name TEXT,
  bank_account_number TEXT,
  bank_iban TEXT,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guest_payments_event_id   ON guest_payments(event_id);
CREATE INDEX IF NOT EXISTS idx_guest_payments_guest_id   ON guest_payments(guest_id);
CREATE INDEX IF NOT EXISTS idx_guest_payments_status     ON guest_payments(status);
CREATE INDEX IF NOT EXISTS idx_guest_payments_payment_date ON guest_payments(payment_date);
`;

const SQL_TRIGGER = `
CREATE OR REPLACE FUNCTION sync_guest_status_on_payment_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'paid' THEN
    UPDATE guests SET status = 'confirmed', updated_at = NOW() WHERE id = NEW.guest_id;
  ELSIF NEW.status IN ('unpaid', 'rejected') THEN
    UPDATE guests SET status = 'no_response', updated_at = NOW() WHERE id = NEW.guest_id;
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_guest_status_on_payment_update ON guest_payments;
CREATE TRIGGER trg_sync_guest_status_on_payment_update
BEFORE UPDATE ON guest_payments
FOR EACH ROW EXECUTE FUNCTION sync_guest_status_on_payment_update();
`;

// ─── helpers ──────────────────────────────────────────────────────────────────

async function tryRpc(sql, label) {
  try {
    const { error } = await supabase.rpc('execute_sql', { sql });
    if (!error) {
      console.log(`  ✅  ${label}`);
      return true;
    }
    console.warn(`  ⚠️   RPC execute_sql not available for "${label}": ${error.message}`);
    return false;
  } catch (e) {
    console.warn(`  ⚠️   Exception during "${label}": ${e.message}`);
    return false;
  }
}

async function checkTableExists(tableName) {
  const { error } = await supabase.from(tableName).select('id').limit(1);
  if (!error) return true;
  return !String(error.message).toLowerCase().includes("doesn't exist") &&
         !String(error.message).toLowerCase().includes('does not exist') &&
         !String(error.message).toLowerCase().includes('schema cache');
}

async function checkEventBankColumns() {
  const { data, error } = await supabase
    .from('events')
    .select('bank_account_holder')
    .limit(1);
  if (!error) return true;
  return !String(error.message).includes('bank_account_holder');
}

async function ensureBucket(bucketName) {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = (buckets || []).some((b) => b.name === bucketName);
  if (exists) {
    console.log(`  ✅  Storage bucket '${bucketName}' already exists`);
    return;
  }
  const { error } = await supabase.storage.createBucket(bucketName, { public: true });
  if (error) {
    console.warn(`  ⚠️   Could not create bucket '${bucketName}': ${error.message}`);
    console.warn(`       Create it manually in Supabase → Storage → New bucket (public)`);
  } else {
    console.log(`  ✅  Created storage bucket '${bucketName}'`);
  }
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🔄  Running guest payments migration...\n');

  // 1. Bank columns on events
  console.log('1/3  Adding bank columns to events table...');
  const bankColsOk = await checkEventBankColumns();
  if (bankColsOk) {
    console.log('  ✅  Bank columns already present');
  } else {
    const ok = await tryRpc(SQL_BANK_COLUMNS, 'ALTER TABLE events – bank columns');
    if (!ok) {
      console.log('\n  👉  Run this SQL manually in Supabase SQL Editor:');
      console.log('  ─'.repeat(50));
      console.log(SQL_BANK_COLUMNS);
      console.log('  ─'.repeat(50));
    }
  }

  // 2. guest_payments table + trigger
  console.log('\n2/3  Creating guest_payments table...');
  const tableOk = await checkTableExists('guest_payments');
  if (tableOk) {
    console.log('  ✅  guest_payments table already exists');
  } else {
    const ok1 = await tryRpc(SQL_GUEST_PAYMENTS_TABLE + SQL_TRIGGER, 'CREATE TABLE guest_payments');
    if (!ok1) {
      console.log('\n  👉  Run this SQL manually in Supabase SQL Editor:');
      console.log('  ─'.repeat(50));
      console.log(SQL_GUEST_PAYMENTS_TABLE);
      console.log(SQL_TRIGGER);
      console.log('  ─'.repeat(50));
    }
  }

  // 3. Storage bucket
  console.log('\n3/3  Checking payment-proofs storage bucket...');
  await ensureBucket('payment-proofs');

  console.log(`
─────────────────────────────────────────────────
✅  Setup complete!

If any step showed a manual SQL block above:
  1. Open  https://app.supabase.com/project/_/sql/new
  2. Paste the SQL and click Run
  3. Re-run this script to verify

After migration is done:
  • Bank details will persist when editing events
  • Guests can upload payment proof from the invitation
  • Payment history will be visible in the invitation page
─────────────────────────────────────────────────
`);
}

main().catch((e) => {
  console.error('❌  Unexpected error:', e);
  process.exit(1);
});
