/*
  # Create Analytics Events Table

  ## Overview
  This migration creates a table to store all user events for analytics tracking.
  Events are logged throughout the user journey to provide comprehensive analytics.

  ## New Tables
  
  ### `analytics_events`
  Stores all user interaction events for the analytics dashboard
  
  **Columns:**
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - References auth.users
  - `session_id` (text) - Browser session identifier
  - `event_type` (text) - Type of event (e.g., page_view, account_created)
  - `timestamp` (timestamptz) - When the event occurred
  - `metadata` (jsonb) - Additional event-specific data
  - `created_at` (timestamptz) - Record creation timestamp
  
  ## Security
  - Enable RLS on `analytics_events` table
  - Admin users can read all events
  - Regular users cannot access analytics events directly
  - Events are inserted through the tracking system

  ## Notes
  - High-volume table - events are written frequently
  - Indexed on user_id, event_type, and timestamp for fast queries
  - Metadata stores flexible event-specific information
*/

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text NOT NULL,
  event_type text NOT NULL,
  timestamp timestamptz DEFAULT now() NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Policy: Only admin users can view analytics events
CREATE POLICY "Admin users can view all analytics events"
  ON analytics_events FOR SELECT
  TO authenticated
  USING (is_admin());

-- Policy: Authenticated users can insert their own events
CREATE POLICY "Users can insert their own events"
  ON analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Allow anonymous event tracking for page views
CREATE POLICY "Allow anonymous event insertion"
  ON analytics_events FOR INSERT
  TO anon
  WITH CHECK (true);
