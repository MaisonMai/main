/*
  # Add Admin Policies for Product Review
  
  1. Changes
    - Add policy for admins to view all products (all statuses)
    - Add policy for admins to update all products (approve/reject)
    - Add policy for admins to delete products
    
  2. Security
    - Only users in admin_users table with is_active = true can use these policies
    - Admins can view, update, and delete any product regardless of status
*/

-- Admin can view all products (all statuses)
CREATE POLICY "Admins can view all products"
  ON gift_partner_products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (SELECT auth.uid())
      AND admin_users.is_active = true
    )
  );

-- Admin can update all products
CREATE POLICY "Admins can update all products"
  ON gift_partner_products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (SELECT auth.uid())
      AND admin_users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (SELECT auth.uid())
      AND admin_users.is_active = true
    )
  );

-- Admin can delete all products
CREATE POLICY "Admins can delete all products"
  ON gift_partner_products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (SELECT auth.uid())
      AND admin_users.is_active = true
    )
  );
