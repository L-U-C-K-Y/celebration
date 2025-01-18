/*
  # Fix Schema Issues

  1. Changes
    - Add missing 'date' column to celebrations table
    - Fix relationship between events and event_reminders
    - Add missing indexes

  2. Security
    - Ensure RLS policies are in place
*/

-- Add date column to celebrations
ALTER TABLE celebrations ADD COLUMN IF NOT EXISTS date timestamptz NOT NULL DEFAULT now();

-- Create index on celebrations date
CREATE INDEX IF NOT EXISTS idx_celebrations_date ON celebrations(date);

-- Fix event_reminders relationship by recreating the table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'event_reminders') THEN
    CREATE TABLE event_reminders (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id uuid REFERENCES events(id) ON DELETE CASCADE,
      days_before integer NOT NULL,
      notification_type text NOT NULL DEFAULT 'email',
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    ALTER TABLE event_reminders ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can manage their event reminders"
      ON event_reminders
      USING (
        EXISTS (
          SELECT 1 FROM events
          WHERE events.id = event_reminders.event_id
          AND events.created_by = auth.uid()
        )
      );

    CREATE INDEX idx_event_reminders_event_id ON event_reminders(event_id);
  END IF;
END $$;