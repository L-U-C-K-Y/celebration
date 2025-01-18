/*
  # Fix RLS Policies and Celebration Settings

  1. Changes
    - Fix RLS policies for celebration_settings table
    - Add trigger to create default settings on celebration creation
    - Add missing policies for celebrations table

  2. Security
    - Enable RLS on all tables
    - Add proper policies for authenticated users
*/

-- Fix celebration_settings RLS policies
DROP POLICY IF EXISTS "Users can read settings of visible celebrations" ON celebration_settings;
DROP POLICY IF EXISTS "Creators can update settings" ON celebration_settings;

CREATE POLICY "Users can read celebration settings"
  ON celebration_settings FOR SELECT
  TO authenticated
  USING (true);

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

-- Fix celebrations RLS policies
DROP POLICY IF EXISTS "Users can read public celebrations" ON celebrations;
DROP POLICY IF EXISTS "Users can create celebrations" ON celebrations;

CREATE POLICY "Users can read celebrations"
  ON celebrations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create celebrations"
  ON celebrations FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own celebrations"
  ON celebrations FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Function to ensure celebration settings exist
CREATE OR REPLACE FUNCTION ensure_celebration_settings()
RETURNS trigger AS $$
BEGIN
  INSERT INTO celebration_settings (celebration_id)
  VALUES (NEW.id)
  ON CONFLICT (celebration_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS ensure_celebration_settings_trigger ON celebrations;

-- Create trigger for new celebrations
CREATE TRIGGER ensure_celebration_settings_trigger
  AFTER INSERT ON celebrations
  FOR EACH ROW
  EXECUTE FUNCTION ensure_celebration_settings();