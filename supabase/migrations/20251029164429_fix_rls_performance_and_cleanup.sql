/*
  # Fix RLS Performance and Database Cleanup

  This migration addresses security and performance issues:

  1. RLS Performance Optimization
    - Updates all RLS policies to use `(select auth.uid())` instead of `auth.uid()`
    - This prevents re-evaluation of auth.uid() for each row, significantly improving query performance at scale
    - Affects all tables: profiles, people, gift_ideas, reminders, person_preferences, gift_analysis

  2. Remove Unused Indexes
    - Drops indexes that are not being used by queries
    - Reduces database overhead and maintenance costs
    - Removes: gift_ideas_user_id_idx, reminders_date_idx, person_preferences_user_id_idx, 
      gift_analysis_gift_idea_id_idx, gift_analysis_user_id_idx

  3. Fix Function Search Path
    - Updates update_updated_at_column function to have a stable search path
    - Prevents potential security issues from search path manipulation

  Security Impact: HIGH - Improves both security and performance
*/

-- Drop and recreate all RLS policies with optimized auth.uid() calls

-- PROFILES TABLE
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- PEOPLE TABLE
DROP POLICY IF EXISTS "Users can view own people" ON people;
DROP POLICY IF EXISTS "Users can insert own people" ON people;
DROP POLICY IF EXISTS "Users can update own people" ON people;
DROP POLICY IF EXISTS "Users can delete own people" ON people;

CREATE POLICY "Users can view own people"
  ON people FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own people"
  ON people FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own people"
  ON people FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own people"
  ON people FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- GIFT_IDEAS TABLE
DROP POLICY IF EXISTS "Users can view own gift ideas" ON gift_ideas;
DROP POLICY IF EXISTS "Users can insert own gift ideas" ON gift_ideas;
DROP POLICY IF EXISTS "Users can update own gift ideas" ON gift_ideas;
DROP POLICY IF EXISTS "Users can delete own gift ideas" ON gift_ideas;

CREATE POLICY "Users can view own gift ideas"
  ON gift_ideas FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own gift ideas"
  ON gift_ideas FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own gift ideas"
  ON gift_ideas FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own gift ideas"
  ON gift_ideas FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- REMINDERS TABLE
DROP POLICY IF EXISTS "Users can view own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can insert own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can update own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can delete own reminders" ON reminders;

CREATE POLICY "Users can view own reminders"
  ON reminders FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own reminders"
  ON reminders FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own reminders"
  ON reminders FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own reminders"
  ON reminders FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- PERSON_PREFERENCES TABLE
DROP POLICY IF EXISTS "Users can view own person preferences" ON person_preferences;
DROP POLICY IF EXISTS "Users can insert own person preferences" ON person_preferences;
DROP POLICY IF EXISTS "Users can update own person preferences" ON person_preferences;
DROP POLICY IF EXISTS "Users can delete own person preferences" ON person_preferences;

CREATE POLICY "Users can view own person preferences"
  ON person_preferences FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own person preferences"
  ON person_preferences FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own person preferences"
  ON person_preferences FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own person preferences"
  ON person_preferences FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- GIFT_ANALYSIS TABLE
DROP POLICY IF EXISTS "Users can view own gift analysis" ON gift_analysis;
DROP POLICY IF EXISTS "Users can insert own gift analysis" ON gift_analysis;
DROP POLICY IF EXISTS "Users can update own gift analysis" ON gift_analysis;
DROP POLICY IF EXISTS "Users can delete own gift analysis" ON gift_analysis;

CREATE POLICY "Users can view own gift analysis"
  ON gift_analysis FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own gift analysis"
  ON gift_analysis FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own gift analysis"
  ON gift_analysis FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own gift analysis"
  ON gift_analysis FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Remove unused indexes to reduce database overhead
DROP INDEX IF EXISTS gift_ideas_user_id_idx;
DROP INDEX IF EXISTS reminders_date_idx;
DROP INDEX IF EXISTS person_preferences_user_id_idx;
DROP INDEX IF EXISTS gift_analysis_gift_idea_id_idx;
DROP INDEX IF EXISTS gift_analysis_user_id_idx;

-- Fix function search path for update_updated_at_column
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers for tables that use this function
DO $$
DECLARE
  t record;
BEGIN
  FOR t IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'people', 'gift_ideas', 'reminders', 'person_preferences', 'gift_analysis')
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS update_updated_at_trigger ON %I', t.tablename);
    EXECUTE format('CREATE TRIGGER update_updated_at_trigger 
                    BEFORE UPDATE ON %I 
                    FOR EACH ROW 
                    EXECUTE FUNCTION update_updated_at_column()', t.tablename);
  END LOOP;
END $$;
