/*
  # Add Locale to Profiles

  1. Changes
    - Add `locale` column to `profiles` table (text, for formatting preferences, defaults to 'en-US')
  
  2. Purpose
    - Enable locale-based formatting preferences
    - Support internationalization
    - Improve user experience with localized formatting
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'locale'
  ) THEN
    ALTER TABLE profiles ADD COLUMN locale text NOT NULL DEFAULT 'en-US';
  END IF;
END $$;