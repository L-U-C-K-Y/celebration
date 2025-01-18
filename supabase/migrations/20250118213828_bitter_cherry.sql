/*
  # Update Celebration Settings Policies and Security

  1. Changes
    - Improve RLS policies for celebration settings
    - Add system-level policy for trigger operations
    - Update trigger function with better error handling
    - Add foreign key constraint with cascade delete
    - Clean up orphaned settings

  2. Security
    - Add dedicated system policy for postgres role
    - Maintain proper RLS for authenticated users
    - Ensure proper cascading deletes
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read celebration settings" ON celebration_settings;
DROP POLICY IF EXISTS "Users can insert celebration settings" ON celebration_settings;
DROP POLICY IF EXISTS "Users can update own celebration settings" ON celebration_settings;
DROP POLICY IF EXISTS "System can manage celebration settings" ON celebration_settings;

-- Add system-level policy for trigger operations
CREATE POLICY "System can manage celebration settings"
  ON celebration_settings
  TO postgres
  USING (true)
  WITH CHECK (true);

-- Add user-level policies
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

-- Drop and recreate the trigger function with proper security context
DROP TRIGGER IF EXISTS ensure_celebration_settings_trigger ON celebrations;
DROP FUNCTION IF EXISTS ensure_celebration_settings();

CREATE OR REPLACE FUNCTION ensure_celebration_settings()
RETURNS trigger
SECURITY DEFINER  -- Required to bypass RLS
SET search_path = public  -- Security best practice
LANGUAGE plpgsql
AS $$
DECLARE
  v_count integer;
BEGIN
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

-- Ensure proper constraints
ALTER TABLE celebration_settings 
  DROP CONSTRAINT IF EXISTS celebration_settings_celebration_id_fkey,
  ADD CONSTRAINT celebration_settings_celebration_id_fkey 
    FOREIGN KEY (celebration_id) 
    REFERENCES celebrations(id) 
    ON DELETE CASCADE;

-- Clean up any orphaned settings
DELETE FROM celebration_settings cs
WHERE NOT EXISTS (
  SELECT 1 FROM celebrations c
  WHERE c.id = cs.celebration_id
);