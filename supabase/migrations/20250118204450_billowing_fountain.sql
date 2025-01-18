/*
  # Add Missing Features

  1. New Tables
    - `media_items`
      - Store media metadata
      - Support multiple media types
      - Track processing status
    - `celebration_settings`
      - Store celebration preferences
      - Control visibility and sharing options

  2. Changes
    - Add media processing status tracking
    - Add celebration sharing settings
    - Add user preferences

  3. Security
    - RLS policies for new tables
    - Updated policies for existing tables
*/

-- Media Items table
CREATE TABLE IF NOT EXISTS media_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid REFERENCES activities(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('image', 'video')),
  metadata jsonb DEFAULT '{}'::jsonb,
  processing_status text DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read media items of visible celebrations"
  ON media_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM activities a
      JOIN celebrations c ON c.id = a.celebration_id
      WHERE a.id = media_items.activity_id
      AND (c.is_public OR c.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can upload media"
  ON media_items FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Celebration Settings table
CREATE TABLE IF NOT EXISTS celebration_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  celebration_id uuid REFERENCES celebrations(id) ON DELETE CASCADE,
  allow_downloads boolean DEFAULT true,
  allow_sharing boolean DEFAULT true,
  require_approval boolean DEFAULT false,
  background_music_url text,
  theme_colors jsonb DEFAULT '["violet-600", "purple-600", "pink-600"]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE celebration_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read settings of visible celebrations"
  ON celebration_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM celebrations c
      WHERE c.id = celebration_id
      AND (c.is_public OR c.created_by = auth.uid())
    )
  );

CREATE POLICY "Creators can update settings"
  ON celebration_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM celebrations c
      WHERE c.id = celebration_id
      AND c.created_by = auth.uid()
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_media_items_activity ON media_items(activity_id);
CREATE INDEX IF NOT EXISTS idx_media_items_status ON media_items(processing_status);
CREATE INDEX IF NOT EXISTS idx_celebration_settings_celebration ON celebration_settings(celebration_id);

-- Function to handle media processing status updates
CREATE OR REPLACE FUNCTION update_media_processing_status()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for media processing status updates
CREATE TRIGGER on_media_status_change
  BEFORE UPDATE OF processing_status ON media_items
  FOR EACH ROW
  EXECUTE FUNCTION update_media_processing_status();

-- Function to create default celebration settings
CREATE OR REPLACE FUNCTION create_default_celebration_settings()
RETURNS trigger AS $$
BEGIN
  INSERT INTO celebration_settings (celebration_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default settings for new celebrations
CREATE TRIGGER on_celebration_created
  AFTER INSERT ON celebrations
  FOR EACH ROW
  EXECUTE FUNCTION create_default_celebration_settings();