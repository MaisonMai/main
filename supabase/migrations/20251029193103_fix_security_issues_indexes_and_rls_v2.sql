/*
  # Fix Security Issues - Indexes and RLS Performance

  1. Add Missing Indexes
    - Add indexes for foreign keys on gift_partner_products (reviewed_by, submitted_by)

  2. Fix RLS Policies
    - Update all RLS policies to use (select auth.uid()) instead of auth.uid()
    - This prevents re-evaluation for each row and improves performance

  3. Fix Function Search Paths
    - Replace is_admin and get_admin_role functions with improved versions
*/

-- Add missing foreign key indexes
CREATE INDEX IF NOT EXISTS idx_gift_partner_products_reviewed_by 
  ON gift_partner_products(reviewed_by);

CREATE INDEX IF NOT EXISTS idx_gift_partner_products_submitted_by 
  ON gift_partner_products(submitted_by);

-- Drop and recreate RLS policies with optimized auth.uid() calls

-- gift_partner_products policies
DROP POLICY IF EXISTS "Partners can view own products" ON gift_partner_products;
CREATE POLICY "Partners can view own products"
  ON gift_partner_products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gift_partners
      WHERE gift_partners.id = gift_partner_products.partner_id
      AND gift_partners.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Partners can create own products" ON gift_partner_products;
CREATE POLICY "Partners can create own products"
  ON gift_partner_products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gift_partners
      WHERE gift_partners.id = partner_id
      AND gift_partners.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Partners can update own products" ON gift_partner_products;
CREATE POLICY "Partners can update own products"
  ON gift_partner_products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gift_partners
      WHERE gift_partners.id = gift_partner_products.partner_id
      AND gift_partners.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gift_partners
      WHERE gift_partners.id = partner_id
      AND gift_partners.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Partners can delete own products" ON gift_partner_products;
CREATE POLICY "Partners can delete own products"
  ON gift_partner_products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gift_partners
      WHERE gift_partners.id = gift_partner_products.partner_id
      AND gift_partners.user_id = (select auth.uid())
    )
  );

-- gift_partner_clicks policies
DROP POLICY IF EXISTS "Users can view own clicks" ON gift_partner_clicks;
CREATE POLICY "Users can view own clicks"
  ON gift_partner_clicks FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- admin_users policies
DROP POLICY IF EXISTS "Users can view own admin status" ON admin_users;
CREATE POLICY "Users can view own admin status"
  ON admin_users FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- partner_conversations policies
DROP POLICY IF EXISTS "Users can view own conversations" ON partner_conversations;
CREATE POLICY "Users can view own conversations"
  ON partner_conversations FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Partners can view own partner conversations" ON partner_conversations;
CREATE POLICY "Partners can view own partner conversations"
  ON partner_conversations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gift_partners
      WHERE gift_partners.id = partner_conversations.partner_id
      AND gift_partners.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create conversations" ON partner_conversations;
CREATE POLICY "Users can create conversations"
  ON partner_conversations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own conversations" ON partner_conversations;
CREATE POLICY "Users can update own conversations"
  ON partner_conversations FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Partners can update own partner conversations" ON partner_conversations;
CREATE POLICY "Partners can update own partner conversations"
  ON partner_conversations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gift_partners
      WHERE gift_partners.id = partner_conversations.partner_id
      AND gift_partners.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gift_partners
      WHERE gift_partners.id = partner_conversations.partner_id
      AND gift_partners.user_id = (select auth.uid())
    )
  );

-- partner_messages policies
DROP POLICY IF EXISTS "Users can view own messages" ON partner_messages;
CREATE POLICY "Users can view own messages"
  ON partner_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM partner_conversations
      WHERE partner_conversations.id = partner_messages.conversation_id
      AND partner_conversations.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Partners can view partner messages" ON partner_messages;
CREATE POLICY "Partners can view partner messages"
  ON partner_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM partner_conversations
      JOIN gift_partners ON gift_partners.id = partner_conversations.partner_id
      WHERE partner_conversations.id = partner_messages.conversation_id
      AND gift_partners.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can send messages" ON partner_messages;
CREATE POLICY "Users can send messages"
  ON partner_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM partner_conversations
      WHERE partner_conversations.id = conversation_id
      AND partner_conversations.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Partners can send messages" ON partner_messages;
CREATE POLICY "Partners can send messages"
  ON partner_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM partner_conversations
      JOIN gift_partners ON gift_partners.id = partner_conversations.partner_id
      WHERE partner_conversations.id = conversation_id
      AND gift_partners.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update messages" ON partner_messages;
CREATE POLICY "Users can update messages"
  ON partner_messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM partner_conversations
      WHERE partner_conversations.id = partner_messages.conversation_id
      AND partner_conversations.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM partner_conversations
      WHERE partner_conversations.id = partner_messages.conversation_id
      AND partner_conversations.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Partners can update messages" ON partner_messages;
CREATE POLICY "Partners can update messages"
  ON partner_messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM partner_conversations
      JOIN gift_partners ON gift_partners.id = partner_conversations.partner_id
      WHERE partner_conversations.id = partner_messages.conversation_id
      AND gift_partners.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM partner_conversations
      JOIN gift_partners ON gift_partners.id = partner_conversations.partner_id
      WHERE partner_conversations.id = partner_messages.conversation_id
      AND gift_partners.user_id = (select auth.uid())
    )
  );

-- Replace function with CASCADE to handle dependencies
DROP FUNCTION IF EXISTS is_admin() CASCADE;
CREATE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
    AND is_active = true
  );
END;
$$;

DROP FUNCTION IF EXISTS get_admin_role() CASCADE;
CREATE FUNCTION get_admin_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
DECLARE
  admin_role text;
BEGIN
  SELECT role INTO admin_role
  FROM admin_users
  WHERE user_id = auth.uid()
  AND is_active = true;
  
  RETURN admin_role;
END;
$$;

-- Recreate policies that were dropped by CASCADE
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

CREATE POLICY "Admins can view all contact submissions"
  ON contact_submissions FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update contact submissions"
  ON contact_submissions FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
