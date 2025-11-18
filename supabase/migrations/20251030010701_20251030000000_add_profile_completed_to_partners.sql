/*
  # Add Profile Completion Status to Gift Partners

  1. Changes
    - Add `profile_completed` column to `gift_partners` table
      - `profile_completed` (boolean) - Whether partner has completed their profile
      - Defaults to false for new partners
      - Must be true for partners to appear in public listings
    
  2. Security
    - Update RLS policy to only show partners where profile_completed = true AND is_active = true
    - Partners can update their own profile_completed status
    
  3. Notes
    - Admins can create partner accounts, but partners won't be visible until they complete their profile
    - Partners complete profile by adding business details, logo, description, etc.
*/

-- Add profile_completed column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gift_partners' AND column_name = 'profile_completed'
  ) THEN
    ALTER TABLE gift_partners ADD COLUMN profile_completed boolean DEFAULT false;
  END IF;
END $$;

-- Drop existing public viewing policy
DROP POLICY IF EXISTS "Anyone can view active gift partners" ON gift_partners;

-- Create new policy that checks both is_active AND profile_completed
CREATE POLICY "Anyone can view active and completed partner profiles"
  ON gift_partners FOR SELECT
  TO public
  USING (is_active = true AND profile_completed = true);

-- Allow partners to view their own profile regardless of completion status
CREATE POLICY "Partners can view own profile"
  ON gift_partners FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow partners to update their own profile
CREATE POLICY "Partners can update own profile"
  ON gift_partners FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create index for profile_completed
CREATE INDEX IF NOT EXISTS idx_gift_partners_profile_completed 
  ON gift_partners(profile_completed) WHERE profile_completed = true;