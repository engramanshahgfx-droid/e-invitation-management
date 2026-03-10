-- Migration: Add bank transfer fields to payments table
-- This migration adds support for bank transfer payment method

-- Add missing columns if they don't exist
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS reference_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS proof_image_url TEXT;

-- Update status check constraint to include new statuses
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE payments 
ADD CONSTRAINT payments_status_check CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'approved', 'rejected'));

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_reference_code ON payments(reference_code);
