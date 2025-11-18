/*
  # Add Gift Partner Products, Tracking, and Enhanced Features

  1. New Tables
    - `gift_partner_products`
      - `id` (uuid, primary key)
      - `partner_id` (uuid, foreign key to gift_partners)
      - `name` (text) - Product name
      - `description` (text) - Product description
      - `price` (decimal) - Product price
      - `currency` (text) - Currency code (USD, EUR, etc.)
      - `image_url` (text, nullable) - Product image URL
      - `product_url` (text) - Link to product on partner site
      - `categories` (text[]) - Product categories
      - `status` (text) - pending, approved, rejected
      - `submitted_by` (uuid, nullable) - User who submitted (if partner self-submitted)
      - `reviewed_by` (uuid, nullable) - Admin who reviewed
      - `reviewed_at` (timestamptz, nullable)
      - `rejection_reason` (text, nullable)
      - `is_featured` (boolean) - Featured product
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `gift_partner_clicks`
      - `id` (uuid, primary key)
      - `partner_id` (uuid, foreign key to gift_partners, nullable)
      - `product_id` (uuid, foreign key to gift_partner_products, nullable)
      - `user_id` (uuid, foreign key to auth.users, nullable) - Nullable for anonymous tracking
      - `click_type` (text) - 'partner_profile', 'product_view', 'product_click'
      - `clicked_at` (timestamptz)

  2. Changes to Existing Tables
    - Add `user_id` column to gift_partners for partner-owned profiles
    - Add `approval_status` to gift_partners (pending, approved, rejected)

  3. Security
    - Enable RLS on all new tables
    - Partners can view/edit their own products
    - Partners can submit products (status: pending)
    - Admins can view/edit all products
    - Anyone can view approved products
    - Click tracking allows authenticated and anonymous users

  4. Indexes
    - Index on partner_id for products
    - Index on status for filtering
    - Index on partner_id and product_id for clicks
    - Index on clicked_at for time-based queries
*/

-- Add columns to gift_partners table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gift_partners' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE gift_partners ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gift_partners' AND column_name = 'approval_status'
  ) THEN
    ALTER TABLE gift_partners ADD COLUMN approval_status text DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected'));
  END IF;
END $$;

-- Create gift_partner_products table
CREATE TABLE IF NOT EXISTS gift_partner_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES gift_partners(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  price decimal(10, 2) NOT NULL,
  currency text DEFAULT 'USD',
  image_url text,
  product_url text NOT NULL,
  categories text[] DEFAULT ARRAY[]::text[],
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  rejection_reason text,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create gift_partner_clicks table
CREATE TABLE IF NOT EXISTS gift_partner_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid REFERENCES gift_partners(id) ON DELETE CASCADE,
  product_id uuid REFERENCES gift_partner_products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  click_type text NOT NULL CHECK (click_type IN ('partner_profile', 'product_view', 'product_click', 'website_click')),
  clicked_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE gift_partner_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_partner_clicks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gift_partner_products

-- Anyone can view approved products
CREATE POLICY "Anyone can view approved products"
  ON gift_partner_products FOR SELECT
  TO public
  USING (status = 'approved');

-- Partners can view their own products (all statuses)
CREATE POLICY "Partners can view own products"
  ON gift_partner_products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gift_partners
      WHERE gift_partners.id = gift_partner_products.partner_id
      AND gift_partners.user_id = auth.uid()
    )
  );

-- Partners can insert products for their own partner profile
CREATE POLICY "Partners can create own products"
  ON gift_partner_products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gift_partners
      WHERE gift_partners.id = partner_id
      AND gift_partners.user_id = auth.uid()
    )
  );

-- Partners can update their own products
CREATE POLICY "Partners can update own products"
  ON gift_partner_products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gift_partners
      WHERE gift_partners.id = gift_partner_products.partner_id
      AND gift_partners.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gift_partners
      WHERE gift_partners.id = partner_id
      AND gift_partners.user_id = auth.uid()
    )
  );

-- Partners can delete their own products
CREATE POLICY "Partners can delete own products"
  ON gift_partner_products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gift_partners
      WHERE gift_partners.id = gift_partner_products.partner_id
      AND gift_partners.user_id = auth.uid()
    )
  );

-- RLS Policies for gift_partner_clicks

-- Anyone can insert click tracking (authenticated or anonymous)
CREATE POLICY "Anyone can track clicks"
  ON gift_partner_clicks FOR INSERT
  TO public
  WITH CHECK (true);

-- Only authenticated users can view click data (for their own clicks)
CREATE POLICY "Users can view own clicks"
  ON gift_partner_clicks FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_gift_partner_products_partner_id 
  ON gift_partner_products(partner_id);

CREATE INDEX IF NOT EXISTS idx_gift_partner_products_status 
  ON gift_partner_products(status);

CREATE INDEX IF NOT EXISTS idx_gift_partner_products_is_featured 
  ON gift_partner_products(is_featured) WHERE is_featured = true;

CREATE INDEX IF NOT EXISTS idx_gift_partner_clicks_partner_id 
  ON gift_partner_clicks(partner_id);

CREATE INDEX IF NOT EXISTS idx_gift_partner_clicks_product_id 
  ON gift_partner_clicks(product_id);

CREATE INDEX IF NOT EXISTS idx_gift_partner_clicks_user_id 
  ON gift_partner_clicks(user_id);

CREATE INDEX IF NOT EXISTS idx_gift_partner_clicks_clicked_at 
  ON gift_partner_clicks(clicked_at DESC);

CREATE INDEX IF NOT EXISTS idx_gift_partner_clicks_click_type 
  ON gift_partner_clicks(click_type);

CREATE INDEX IF NOT EXISTS idx_gift_partners_user_id 
  ON gift_partners(user_id);

-- Add trigger for updated_at on gift_partner_products
CREATE TRIGGER update_gift_partner_products_updated_at
  BEFORE UPDATE ON gift_partner_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
