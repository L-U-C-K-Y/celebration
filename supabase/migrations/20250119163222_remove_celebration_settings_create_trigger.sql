-- Drop the trigger first
DROP TRIGGER IF EXISTS on_celebration_created ON celebrations;

-- Drop the function
DROP FUNCTION IF EXISTS create_default_celebration_settings();
