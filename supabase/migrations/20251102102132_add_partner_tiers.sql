/*
  # Add Partner Tier System
  
  1. Changes
    - Add `tier` column to gift_partners table
      - Values: 'starter' (free), 'featured' (£50/month), 'premium' (£300/month)
    - Add `tier_started_at` column to track when tier subscription began
    - Add `tier_expires_at` column for subscription expiry
    - Add `tier_price` column to store actual price paid (for Black Friday deals)
    
  2. Notes
    - Default tier is 'starter' (free)
    - Premium tier locks in price for full year
    - Tracks custom pricing for promotional periods
*/

-- Add tier columns to gift_partners
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gift_partners' AND column_name = 'tier'
  ) THEN
    ALTER TABLE gift_partners ADD COLUMN tier text DEFAULT 'starter' CHECK (tier IN ('starter', 'featured', 'premium'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gift_partners' AND column_name = 'tier_started_at'
  ) THEN
    ALTER TABLE gift_partners ADD COLUMN tier_started_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gift_partners' AND column_name = 'tier_expires_at'
  ) THEN
    ALTER TABLE gift_partners ADD COLUMN tier_expires_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gift_partners' AND column_name = 'tier_price'
  ) THEN
    ALTER TABLE gift_partners ADD COLUMN tier_price decimal(10, 2);
  END IF;
END $$;

-- Create index for tier filtering
CREATE INDEX IF NOT EXISTS idx_gift_partners_tier 
  ON gift_partners(tier);

-- Create index for expiry tracking
CREATE INDEX IF NOT EXISTS idx_gift_partners_tier_expires_at 
  ON gift_partners(tier_expires_at) WHERE tier_expires_at IS NOT NULL;
