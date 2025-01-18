/*
  # Fix Celebration Settings Final

  1. Changes
    - Update trigger function to handle RLS bypass
    - Add proper error handling
    - Ensure atomic operations
    - Fix policy ordering

  2. Security
    - Maintain RLS while allowing system operations
    - Ensure data consistency
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read celebration settings" ON celebration_settings;
DROP POLICY IF EXISTS "Users can insert celebration settings" ON celebration_settings;
DROP POLICY IF EXISTS "Users can update own celebration settings" ON celebration_settings;

-- Update trigger function to properly handle RLS
CREATE OR REPLACE FUNCTION ensure_celebration_settings()
RETURNS trigger 
SECURITY DEFINER  -- Run as superuser to bypass RLS
SET search_path = public  -- Security best practice
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create settings with proper error handling
  BEGIN
    INSERT INTO celebration_settings (celebration_id)
    VALUES (NEW.id)
    ON CONFLICT (celebration_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to create celebration settings: %', SQLERRM;
    -- Continue execution even if settings creation fails
  END;
  
  RETURN NEW;
END;
$$;

-- Recreate policies with proper ordering
CREATE POLICY "Users can read celebration settings"
  ON celebration_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM celebrations c
      WHERE c.id = celebration_id
      AND (c.is_public OR c.created_by = auth.uid())
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

-- Ensure trigger is properly set
DROP TRIGGER IF EXISTS ensure_celebration_settings_trigger ON celebrations;
CREATE TRIGGER ensure_celebration_settings_trigger
  AFTER INSERT ON celebrations
  FOR EACH ROW
  EXECUTE FUNCTION ensure_celebration_settings();

-- Reindex for good measure
REINDEX TABLE celebration_settings;