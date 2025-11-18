/*
  # Add User Profile Fields for Personalization

  1. Changes
    - Add `user_interests` column to `profiles` table (text array)
    - Add `user_preferences` column to `profiles` table (jsonb)
  
  2. Purpose
    - Enable users to save their gift preferences
    - Provide data for personalized offers and recommendations
    - Support "When You Give, You Get" program
  
  3. Notes
    - user_interests: Array of interest strings
    - user_preferences: JSONB containing categories, price range, frequency, notes
*/

-- Add user profile columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'user_interests'
  ) THEN
    ALTER TABLE profiles ADD COLUMN user_interests text[] DEFAULT ARRAY[]::text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'user_preferences'
  ) THEN
    ALTER TABLE profiles ADD COLUMN user_preferences jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;