/*
  # Celebration Settings Concurrency Fix

  1. Changes
    - Improve concurrency handling for celebration settings
    - Simplify trigger function with direct INSERT ON CONFLICT
    - Ensure proper indexing and constraints
    - Remove unnecessary error handling for cleaner operation

  2. Security
    - Maintain SECURITY DEFINER for proper RLS bypass
    - Set explicit search path for security
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS ensure_celebration_settings_trigger ON celebrations;
DROP FUNCTION IF EXISTS ensure_celebration_settings();

-- Recreate the function with proper concurrency handling
CREATE OR REPLACE FUNCTION ensure_celebration_settings()
RETURNS trigger 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Use INSERT ... ON CONFLICT to handle race conditions
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
END;
$$;

-- Recreate the trigger
CREATE TRIGGER ensure_celebration_settings_trigger
  AFTER INSERT ON celebrations
  FOR EACH ROW
  EXECUTE FUNCTION ensure_celebration_settings();

-- Ensure proper indexing
DROP INDEX IF EXISTS idx_celebration_settings_celebration_id;
CREATE UNIQUE INDEX idx_celebration_settings_celebration_id 
  ON celebration_settings(celebration_id);

-- Ensure constraint exists
ALTER TABLE celebration_settings 
  DROP CONSTRAINT IF EXISTS celebration_settings_celebration_id_key,
  ADD CONSTRAINT celebration_settings_celebration_id_key 
  UNIQUE (celebration_id);