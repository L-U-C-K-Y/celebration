/*
  # Add celebration fields and type constraints

  1. Changes
    - Add type, celebrant_name, and birth_date columns to celebrations
    - Add CHECK constraint to both events and celebrations
    - Ensure type consistency across tables
    - Add proper indexes and comments
*/

-- First clean up any invalid event types
UPDATE events
SET type = 'Other'
WHERE type NOT IN (
  'Birthday',
  'Anniversary',
  'Graduation',
  'Wedding',
  'Baby Shower',
  'Retirement',
  'Other'
);

-- Add CHECK constraint to events table
ALTER TABLE events
  DROP CONSTRAINT IF EXISTS events_type_check,
  ADD CONSTRAINT events_type_check CHECK (
    type IN (
      'Birthday',
      'Anniversary',
      'Graduation',
      'Wedding',
      'Baby Shower',
      'Retirement',
      'Other'
    )
  );

-- Add new columns and constraint to celebrations
ALTER TABLE celebrations 
  ADD COLUMN IF NOT EXISTS type text CHECK (
    type IN (
      'Birthday',
      'Anniversary',
      'Graduation',
      'Wedding',
      'Baby Shower',
      'Retirement',
      'Other'
    )
  ),
  ADD COLUMN IF NOT EXISTS celebrant_name text,
  ADD COLUMN IF NOT EXISTS celebrant_birth_date date;

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_celebrations_type 
  ON celebrations(type);
CREATE INDEX IF NOT EXISTS idx_celebrations_birth_date 
  ON celebrations(celebrant_birth_date);

-- Add helpful comments
COMMENT ON COLUMN events.type IS 
  'Type of event (Birthday, Anniversary, etc.)';
COMMENT ON COLUMN celebrations.type IS 
  'Type of celebration, matching event types (Birthday, Anniversary, etc.)';
COMMENT ON COLUMN celebrations.celebrant_birth_date IS 
  'Birth date of the person being celebrated for birthday celebrations';
COMMENT ON COLUMN celebrations.celebrant_name IS 
  'Name of the person or people being celebrated';