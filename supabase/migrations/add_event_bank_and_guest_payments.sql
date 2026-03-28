-- Add per-event bank account details and guest direct bank transfer records

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS bank_account_holder TEXT,
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
  ADD COLUMN IF NOT EXISTS bank_iban TEXT;

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

CREATE INDEX IF NOT EXISTS idx_guest_payments_event_id ON guest_payments(event_id);
CREATE INDEX IF NOT EXISTS idx_guest_payments_guest_id ON guest_payments(guest_id);
CREATE INDEX IF NOT EXISTS idx_guest_payments_status ON guest_payments(status);
CREATE INDEX IF NOT EXISTS idx_guest_payments_payment_date ON guest_payments(payment_date);

-- Keep guest RSVP status in sync when payment is marked paid/unpaid
CREATE OR REPLACE FUNCTION sync_guest_status_on_payment_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'paid' THEN
    UPDATE guests
    SET status = 'confirmed', updated_at = NOW()
    WHERE id = NEW.guest_id;
  ELSIF NEW.status IN ('unpaid', 'rejected') THEN
    UPDATE guests
    SET status = 'no_response', updated_at = NOW()
    WHERE id = NEW.guest_id;
  END IF;

  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_guest_status_on_payment_update ON guest_payments;
CREATE TRIGGER trg_sync_guest_status_on_payment_update
BEFORE UPDATE ON guest_payments
FOR EACH ROW
EXECUTE FUNCTION sync_guest_status_on_payment_update();
