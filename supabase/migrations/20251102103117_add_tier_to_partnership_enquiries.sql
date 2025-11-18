/*
  # Add Tier Selection to Partnership Enquiries
  
  1. Changes
    - Add `tier` column to partnership_enquiries table
      - Values: 'starter', 'featured', 'premium'
      - Default: 'starter'
    
  2. Notes
    - Allows tracking which tier prospective partners are interested in
    - Helps partnerships team understand partner needs
*/

-- Add tier column to partnership_enquiries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'partnership_enquiries' AND column_name = 'tier'
  ) THEN
    ALTER TABLE partnership_enquiries ADD COLUMN tier text DEFAULT 'starter' CHECK (tier IN ('starter', 'featured', 'premium'));
  END IF;
END $$;

-- Create index for tier filtering
CREATE INDEX IF NOT EXISTS idx_partnership_enquiries_tier 
  ON partnership_enquiries(tier);
