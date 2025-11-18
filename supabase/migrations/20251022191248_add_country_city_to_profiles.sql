/*
  # Add Country and City to Profiles

  1. Changes
    - Add `country` column to `profiles` table (ISO country code, defaults to 'US')
    - Add `city` column to `profiles` table (user's city for localized recommendations)
  
  2. Purpose
    - Enable location-based gift recommendations
    - Support regional and local gift suggestions
    - Improve personalization based on user location
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'country'
  ) THEN
    ALTER TABLE profiles ADD COLUMN country text NOT NULL DEFAULT 'US';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'city'
  ) THEN
    ALTER TABLE profiles ADD COLUMN city text;
  END IF;
END $$;