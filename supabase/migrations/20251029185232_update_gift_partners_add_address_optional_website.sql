/*
  # Update Gift Partners - Add Address and Optional Website

  1. Changes to Existing Tables
    - `gift_partners`
      - Make `website_url` nullable (optional)
      - Add `address` field (text, nullable) - Physical address for partner location
      - Add `city` field (text, nullable)
      - Add `state` field (text, nullable)
      - Add `country` field (text, nullable)
      - Add `postal_code` field (text, nullable)

  2. Purpose
    - Allow partners without websites to still be listed
    - Enable location-based partner features
    - Show physical store locations to users
*/

-- Make website_url nullable
DO $$
BEGIN
  ALTER TABLE gift_partners ALTER COLUMN website_url DROP NOT NULL;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Add address fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gift_partners' AND column_name = 'address'
  ) THEN
    ALTER TABLE gift_partners ADD COLUMN address text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gift_partners' AND column_name = 'city'
  ) THEN
    ALTER TABLE gift_partners ADD COLUMN city text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gift_partners' AND column_name = 'state'
  ) THEN
    ALTER TABLE gift_partners ADD COLUMN state text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gift_partners' AND column_name = 'country'
  ) THEN
    ALTER TABLE gift_partners ADD COLUMN country text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gift_partners' AND column_name = 'postal_code'
  ) THEN
    ALTER TABLE gift_partners ADD COLUMN postal_code text;
  END IF;
END $$;
