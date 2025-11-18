/*
  # Create Admin Users Table

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users) - Link to auth user
      - `role` (text) - Admin role (super_admin, admin, moderator)
      - `permissions` (jsonb) - Specific permissions
      - `is_active` (boolean) - Whether admin access is active
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `admin_users` table
    - Only authenticated users can check if they are admins
    - Users can only view their own admin status
    - No public insert/update/delete (only via direct database access)

  3. Indexes
    - Index on user_id for fast lookups
    - Index on is_active for filtering
    - Unique constraint on user_id

  4. Helper Function
    - Create function to check if a user is an admin
*/

CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  permissions jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_admin_user UNIQUE(user_id),
  CONSTRAINT valid_role CHECK (role IN ('super_admin', 'admin', 'moderator'))
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to check if they are admins
CREATE POLICY "Users can view own admin status"
  ON admin_users FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id 
  ON admin_users(user_id);

CREATE INDEX IF NOT EXISTS idx_admin_users_is_active 
  ON admin_users(is_active);

-- Helper function to check if current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM admin_users 
    WHERE user_id = auth.uid() 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user's admin role
CREATE OR REPLACE FUNCTION get_admin_role()
RETURNS text AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM admin_users 
  WHERE user_id = auth.uid() 
  AND is_active = true;
  
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger for updated_at
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update gift_partners RLS to allow admins to manage
DROP POLICY IF EXISTS "Anyone can view active gift partners" ON gift_partners;

CREATE POLICY "Anyone can view active gift partners"
  ON gift_partners FOR SELECT
  TO public
  USING (is_active = true OR is_admin());

CREATE POLICY "Admins can insert gift partners"
  ON gift_partners FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update gift partners"
  ON gift_partners FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete gift partners"
  ON gift_partners FOR DELETE
  TO authenticated
  USING (is_admin());

-- Update contact_submissions RLS to allow admins to view all
CREATE POLICY "Admins can view all contact submissions"
  ON contact_submissions FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update contact submissions"
  ON contact_submissions FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
