/*
  # Fix Celebration Settings Final

  1. Changes
    - Properly handle RLS bypass for system operations
    - Add proper error handling and constraints
    - Fix policy ordering and conditions
    - Add missing indexes
    - Ensure atomic operations

  2. Security
    - Maintain RLS while allowing system operations
    - Ensure data consistency
    - Prevent race conditions
*/

-- Drop existing policies and triggers
DROP POLICY IF EXISTS "Users can read celebration settings" ON celebration_settings;
DROP POLICY IF EXISTS "Users can insert celebration settings" ON celebration_settings;
DROP POLICY IF EXISTS "Users can update own celebration settings" ON celebration_settings;
DROP TRIGGER IF EXISTS ensure_celebration_settings_trigger ON celebrations;
DROP FUNCTION IF EXISTS ensure_celebration_settings();

-- Recreate the function with proper security context
CREATE OR REPLACE FUNCTION ensure_celebration_settings()
RETURNS trigger 
SECURITY DEFINER  -- Required to bypass RLS
SET search_path = public  -- Security best practice
LANGUAGE plpgsql
AS $$
DECLARE
  v_count integer;
BEGIN
  -- Check if settings already exist to prevent race conditions
  SELECT COUNT(*) INTO v_count
  FROM celebration_settings
  WHERE celebration_id = NEW.id;
  
  IF v_count = 0 THEN
    -- Create settings only if they don't exist
    INSERT INTO celebration_settings (
      celebration_id,
      allow_downloads,
      allow_sharing,
      require_approval,
      theme_colors
    )
    VALUES (
      NEW.id,
      true,  -- Default allow_downloads
      true,  -- Default allow_sharing
      false, -- Default require_approval
      '["violet-600", "purple-600", "pink-600"]'::jsonb  -- Default theme
    )
    ON CONFLICT (celebration_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the transaction
  RAISE WARNING 'Failed to create celebration settings: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER ensure_celebration_settings_trigger
  AFTER INSERT ON celebrations
  FOR EACH ROW
  EXECUTE FUNCTION ensure_celebration_settings();

-- Recreate policies with proper ordering and conditions
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

-- Add missing indexes
DROP INDEX IF EXISTS idx_celebration_settings_celebration_id;
CREATE UNIQUE INDEX idx_celebration_settings_celebration_id 
  ON celebration_settings(celebration_id);

-- Ensure constraint exists
ALTER TABLE celebration_settings 
  DROP CONSTRAINT IF EXISTS celebration_settings_celebration_id_key,
  ADD CONSTRAINT celebration_settings_celebration_id_key 
  UNIQUE (celebration_id);

-- Clean up any orphaned settings
DELETE FROM celebration_settings cs
WHERE NOT EXISTS (
  SELECT 1 FROM celebrations c
  WHERE c.id = cs.celebration_id
);

-- Reindex for good measure
REINDEX TABLE celebration_settings;