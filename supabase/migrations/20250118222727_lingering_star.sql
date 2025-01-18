/*
  # Add event recurrence functionality
  
  1. Changes
    - Add recurrence pattern fields to events table
    - Add function to generate recurring event instances
    - Add view for expanded recurring events
  
  2. New Fields
    - recurrence_pattern: Pattern type (yearly, monthly, weekly)
    - recurrence_interval: Interval between occurrences
    - recurrence_end_date: Optional end date for recurrence
    - recurrence_days: Array of days for weekly recurrence
    - recurrence_day_of_month: Specific day for monthly recurrence
    - recurrence_week_of_month: Specific week for monthly recurrence
*/

-- Add recurrence fields to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS recurrence_pattern text CHECK (recurrence_pattern IN ('yearly', 'monthly', 'weekly', null));
ALTER TABLE events ADD COLUMN IF NOT EXISTS recurrence_interval integer DEFAULT 1;
ALTER TABLE events ADD COLUMN IF NOT EXISTS recurrence_end_date date;
ALTER TABLE events ADD COLUMN IF NOT EXISTS recurrence_days integer[] DEFAULT '{}'; -- For weekly pattern (0=Sunday, 6=Saturday)
ALTER TABLE events ADD COLUMN IF NOT EXISTS recurrence_day_of_month integer; -- For monthly pattern (1-31)
ALTER TABLE events ADD COLUMN IF NOT EXISTS recurrence_week_of_month integer; -- For monthly pattern (1=first, -1=last)

-- Function to generate recurring event instances
CREATE OR REPLACE FUNCTION get_recurring_event_instances(
  start_date timestamptz,
  end_date timestamptz,
  pattern text,
  interval_val integer,
  rec_end_date date DEFAULT NULL,
  rec_days integer[] DEFAULT NULL,
  day_of_month integer DEFAULT NULL,
  week_of_month integer DEFAULT NULL
)
RETURNS TABLE (instance_date timestamptz) AS $$
DECLARE
  current_date timestamptz := start_date;
  max_end_date timestamptz;
BEGIN
  -- Set maximum end date
  IF rec_end_date IS NOT NULL THEN
    max_end_date := LEAST(end_date, rec_end_date::timestamptz);
  ELSE
    max_end_date := end_date;
  END IF;

  CASE pattern
    WHEN 'yearly' THEN
      -- Return yearly occurrences
      RETURN QUERY 
      SELECT current_date + (INTERVAL '1 year' * generate_series(0, EXTRACT(YEAR FROM max_end_date)::integer - EXTRACT(YEAR FROM current_date)::integer))
      WHERE (current_date + (INTERVAL '1 year' * generate_series(0, EXTRACT(YEAR FROM max_end_date)::integer - EXTRACT(YEAR FROM current_date)::integer))) <= max_end_date;
      
    WHEN 'monthly' THEN
      IF week_of_month IS NOT NULL THEN
        -- Monthly by week (e.g., "first Monday")
        RETURN QUERY 
        WITH RECURSIVE months AS (
          SELECT current_date AS month_start
          UNION ALL
          SELECT month_start + INTERVAL '1 month'
          FROM months
          WHERE month_start < max_end_date
        )
        SELECT DISTINCT
          CASE 
            WHEN week_of_month > 0 THEN
              date_trunc('month', month_start) + 
              ((week_of_month - 1) * INTERVAL '7 days' + 
              (7 + day_of_month - EXTRACT(DOW FROM date_trunc('month', month_start))::integer) % 7 * INTERVAL '1 day')
            ELSE
              date_trunc('month', month_start) + INTERVAL '1 month' - INTERVAL '1 day' -
              (abs(week_of_month) - 1) * INTERVAL '7 days' -
              (EXTRACT(DOW FROM date_trunc('month', month_start) + INTERVAL '1 month' - INTERVAL '1 day')::integer - day_of_month + 7) % 7 * INTERVAL '1 day'
          END AS instance_date
        FROM months
        WHERE month_start <= max_end_date
        LIMIT 1000;
      ELSE
        -- Monthly by day of month
        RETURN QUERY 
        WITH RECURSIVE months AS (
          SELECT current_date AS month_start
          UNION ALL
          SELECT month_start + INTERVAL '1 month'
          FROM months
          WHERE month_start < max_end_date
        )
        SELECT date_trunc('month', month_start) + ((day_of_month - 1) * INTERVAL '1 day')
        FROM months
        WHERE month_start <= max_end_date
        LIMIT 1000;
      END IF;

    WHEN 'weekly' THEN
      -- Weekly on specific days
      RETURN QUERY 
      WITH RECURSIVE weeks AS (
        SELECT current_date AS week_start
        UNION ALL
        SELECT week_start + (interval_val * INTERVAL '1 week')
        FROM weeks
        WHERE week_start < max_end_date
      )
      SELECT DISTINCT week_start + (day * INTERVAL '1 day')
      FROM weeks, unnest(rec_days) AS day
      WHERE week_start + (day * INTERVAL '1 day') <= max_end_date
      ORDER BY 1
      LIMIT 1000;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Create a view for expanded recurring events
CREATE OR REPLACE VIEW expanded_events AS
WITH recurring_instances AS (
  SELECT 
    e.id,
    instance_date AS date,
    e.title,
    e.type,
    e.created_by,
    e.created_at,
    e.updated_at,
    e.reminder_days,
    true AS is_recurring
  FROM events e
  CROSS JOIN LATERAL get_recurring_event_instances(
    e.date,
    CURRENT_TIMESTAMP + INTERVAL '2 years',
    e.recurrence_pattern,
    e.recurrence_interval,
    e.recurrence_end_date,
    e.recurrence_days,
    e.recurrence_day_of_month,
    e.recurrence_week_of_month
  ) AS instance_date
  WHERE e.recurrence_pattern IS NOT NULL
)
SELECT 
  id,
  date,
  title,
  type,
  created_by,
  created_at,
  updated_at,
  reminder_days,
  false AS is_recurring
FROM events
WHERE recurrence_pattern IS NULL
UNION ALL
SELECT * FROM recurring_instances
ORDER BY date;