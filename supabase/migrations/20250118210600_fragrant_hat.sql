/*
  # Fix Celebration Settings Constraints

  1. Changes
    - Add unique constraint on celebration_id for celebration_settings
    - Update RLS policies for better security
    - Add missing indexes

  2. Security
    - Ensure proper RLS policies for all operations
    - Maintain data integrity with constraints
*/

-- Add unique constraint to celebration_settings
ALTER TABLE celebration_settings 
  DROP CONSTRAINT IF EXISTS celebration_settings_celebration_id_key,
  ADD CONSTRAINT celebration_settings_celebration_id_key UNIQUE (celebration_id);

-- Recreate RLS policies with proper constraints
DROP POLICY IF EXISTS "Users can read celebration settings" ON celebration_settings;
DROP POLICY IF EXISTS "Users can insert celebration settings" ON celebration_settings;
DROP POLICY IF EXISTS "Users can update own celebration settings" ON celebration_settings;

CREATE POLICY "Users can read celebration settings"
  ON celebration_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM celebrations c
      WHERE c.id = celebration_id
    )
  );

CREATE POLICY "Users can insert celebration settings"
  ON celebration_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM celebrations c
      WHERE c.id = celebration_id
      AND c.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update own celebration settings"
  ON celebration_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM celebrations c
      WHERE c.id = celebration_id
      AND c.created_by = auth.uid()
    )
  );

-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_celebration_settings_celebration_id 
  ON celebration_settings(celebration_id);

-- Update trigger function to handle conflicts properly
CREATE OR REPLACE FUNCTION ensure_celebration_settings()
RETURNS trigger AS $$
BEGIN
  INSERT INTO celebration_settings (celebration_id)
  VALUES (NEW.id)
  ON CONFLICT (celebration_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;