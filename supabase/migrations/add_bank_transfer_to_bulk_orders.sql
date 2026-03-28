-- Migration: Add bank transfer fields to bulk_orders table
-- Purpose: Support manual bank transfer payment flow for marketplace services

ALTER TABLE bulk_orders
ADD COLUMN IF NOT EXISTS bank_reference_code TEXT,
ADD COLUMN IF NOT EXISTS proof_image_url TEXT,
ADD COLUMN IF NOT EXISTS proof_submitted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS review_note TEXT;

-- Allow 'pending_verification' and 'bank_transfer_approved' / 'bank_transfer_rejected'
-- alongside existing statuses.
ALTER TABLE bulk_orders DROP CONSTRAINT IF EXISTS bulk_orders_payment_status_check;
ALTER TABLE bulk_orders
ADD CONSTRAINT bulk_orders_payment_status_check
CHECK (payment_status IN ('unpaid', 'paid', 'failed', 'refunded', 'pending_verification', 'rejected'));

CREATE INDEX IF NOT EXISTS idx_bulk_orders_bank_reference ON bulk_orders(bank_reference_code);
CREATE INDEX IF NOT EXISTS idx_bulk_orders_payment_status ON bulk_orders(payment_status);
