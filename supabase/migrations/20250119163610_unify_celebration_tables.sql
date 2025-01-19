/*
  # Merge celebration_settings into celebrations table
  
  1. Changes
    - Add settings columns to celebrations table
    - Migrate existing settings data
    - Drop celebration_settings table
    - Update RLS policies
  
  2. Security
    - Maintain existing RLS policies
    - Transfer relevant policies from settings to celebrations
*/

-- First, add the settings columns to celebrations table
ALTER TABLE celebrations ADD COLUMN IF NOT EXISTS allow_downloads boolean DEFAULT true;
ALTER TABLE celebrations ADD COLUMN IF NOT EXISTS allow_sharing boolean DEFAULT true;
ALTER TABLE celebrations ADD COLUMN IF NOT EXISTS require_approval boolean DEFAULT false;
ALTER TABLE celebrations ADD COLUMN IF NOT EXISTS background_music_url text;
ALTER TABLE celebrations ADD COLUMN IF NOT EXISTS theme_colors jsonb DEFAULT '["violet-600", "purple-600", "pink-600"]'::jsonb;

-- Migrate existing settings data
UPDATE celebrations c
SET 
  allow_downloads = cs.allow_downloads,
  allow_sharing = cs.allow_sharing,
  require_approval = cs.require_approval,
  background_music_url = cs.background_music_url,
  theme_colors = cs.theme_colors
FROM celebration_settings cs
WHERE cs.celebration_id = c.id;

-- Drop the celebration_settings table and its related objects
DROP TABLE IF EXISTS celebration_settings CASCADE;

-- Update RLS policies for celebrations to include settings management
DROP POLICY IF EXISTS "Users can update own celebrations" ON celebrations;

CREATE POLICY "Users can update own celebrations"
  ON celebrations FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Add comments to new columns
COMMENT ON COLUMN celebrations.allow_downloads IS 'Whether users can download media from this celebration';
COMMENT ON COLUMN celebrations.allow_sharing IS 'Whether users can share this celebration';
COMMENT ON COLUMN celebrations.require_approval IS 'Whether posts require approval before being visible';
COMMENT ON COLUMN celebrations.background_music_url IS 'Optional background music URL for the celebration';
COMMENT ON COLUMN celebrations.theme_colors IS 'Theme colors for the celebration UI';

-- Update any related functions or triggers that referenced celebration_settings
DROP FUNCTION IF EXISTS ensure_celebration_settings() CASCADE;