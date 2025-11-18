/*
  # Add City Field to Profiles

  ## Changes Made
  
  1. Modifications to `profiles` table
    - Add `city` column (text, optional) - User's city for local gift recommendations
    - Make country, currency, and locale nullable to support two-step signup
  
  2. Notes
    - City helps provide more localized gift recommendations
    - Fields are nullable to allow account creation before profile completion
*/

-- Add city field and make fields nullable for two-step signup
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'city'
  ) THEN
    ALTER TABLE profiles ADD COLUMN city text;
  END IF;
END $$;

-- Make country, currency, and locale nullable
ALTER TABLE profiles ALTER COLUMN country DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN currency DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN locale DROP NOT NULL;
