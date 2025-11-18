/*
  # Create Gift Partners Table

  1. New Tables
    - `gift_partners`
      - `id` (uuid, primary key)
      - `name` (text) - Partner/vendor name
      - `description` (text) - Partner description
      - `logo_url` (text, nullable) - Partner logo URL
      - `website_url` (text) - Partner website
      - `discount_code` (text, nullable) - Exclusive discount code
      - `discount_description` (text, nullable) - Discount details
      - `categories` (text[]) - Product categories
      - `is_active` (boolean) - Whether to show partner
      - `display_order` (integer) - Sort order for display
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `gift_partners` table
    - Allow all users (authenticated and anonymous) to view active partners
    - No insert/update/delete policies (admin only via direct database access)

  3. Indexes
    - Index on is_active for filtering
    - Index on display_order for sorting
*/

CREATE TABLE IF NOT EXISTS gift_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  logo_url text,
  website_url text NOT NULL,
  discount_code text,
  discount_description text,
  categories text[] DEFAULT ARRAY[]::text[],
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE gift_partners ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view active gift partners
CREATE POLICY "Anyone can view active gift partners"
  ON gift_partners FOR SELECT
  TO public
  USING (is_active = true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_gift_partners_is_active 
  ON gift_partners(is_active);

CREATE INDEX IF NOT EXISTS idx_gift_partners_display_order 
  ON gift_partners(display_order);

-- Add trigger for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column'
  ) THEN
    CREATE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $func$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;
  END IF;
END $$;

CREATE TRIGGER update_gift_partners_updated_at
  BEFORE UPDATE ON gift_partners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
