/*
  # Add Admin Access to Profiles Table

  1. Changes
    - Add RLS policy allowing admin users to view all profiles
    - This enables admins to see user lists in the admin dashboard

  2. Security
    - Only users in the admin_users table can view all profiles
    - Regular users can still only view their own profile
*/

CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );
