/*
  # Create partnership enquiries table

  1. New Tables
    - `partnership_enquiries`
      - `id` (uuid, primary key)
      - `name` (text, required) - Name of person enquiring
      - `company_name` (text, required) - Company name
      - `email` (text, required) - Contact email
      - `phone_number` (text, required) - Contact phone number
      - `created_at` (timestamp)
      - `status` (text) - Status of enquiry (new, contacted, in_progress, closed)
      - `admin_notes` (text) - Notes from admin team

  2. Security
    - Enable RLS on `partnership_enquiries` table
    - Add policy for public to insert enquiries
    - Add policy for authenticated admins to view all enquiries
    - Add policy for authenticated admins to update enquiries

  3. Indexes
    - Index on email for faster lookups
    - Index on created_at for sorting
    - Index on status for filtering
*/

CREATE TABLE IF NOT EXISTS partnership_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company_name text NOT NULL,
  email text NOT NULL,
  phone_number text NOT NULL,
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'in_progress', 'closed')),
  admin_notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE partnership_enquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit partnership enquiries"
  ON partnership_enquiries
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view all partnership enquiries"
  ON partnership_enquiries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update partnership enquiries"
  ON partnership_enquiries
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_partnership_enquiries_email ON partnership_enquiries(email);
CREATE INDEX IF NOT EXISTS idx_partnership_enquiries_created_at ON partnership_enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_partnership_enquiries_status ON partnership_enquiries(status);