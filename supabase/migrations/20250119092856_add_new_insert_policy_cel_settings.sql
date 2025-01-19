DROP TRIGGER IF EXISTS ensure_celebration_settings_trigger ON celebrations;
DROP FUNCTION IF EXISTS ensure_celebration_settings();

CREATE POLICY "Users can insert celebration settings"
ON celebration_settings FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM celebrations c
    WHERE c.id = celebration_id
      AND c.created_by = auth.uid()
  )
);