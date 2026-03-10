-- Add plus_ones and notes columns to guests table
-- This migration supports guest list imports with additional guest information

ALTER TABLE IF EXISTS guests
ADD COLUMN IF NOT EXISTS plus_ones INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add index for better query performance on guests with notes
CREATE INDEX IF NOT EXISTS idx_guests_plus_ones ON guests(plus_ones);

-- Update timestamp
ALTER TABLE guests 
ALTER COLUMN updated_at SET DEFAULT NOW();
