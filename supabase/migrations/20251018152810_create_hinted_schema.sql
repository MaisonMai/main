/*
  # Hinted MVP Database Schema

  ## Overview
  Creates the core database structure for the Hinted gift reminder app, including:
  - User profiles (extends Supabase auth.users)
  - People/contacts to track
  - Gift ideas for each person
  - Special dates and reminders

  ## Tables Created

  ### 1. profiles
  Stores extended user profile information
  - `id` (uuid, FK to auth.users) - User's unique identifier
  - `email` (text) - User's email address
  - `full_name` (text) - User's display name
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. people
  Stores contacts/people for whom users want to track gifts
  - `id` (uuid, PK) - Unique person identifier
  - `user_id` (uuid, FK to auth.users) - Owner of this contact
  - `name` (text) - Person's name
  - `relationship` (text) - Relationship type (e.g., "Friend", "Family", "Colleague")
  - `birthday` (date, optional) - Person's birthday
  - `notes` (text, optional) - Additional notes about the person
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. gift_ideas
  Stores gift ideas for each person
  - `id` (uuid, PK) - Unique gift idea identifier
  - `person_id` (uuid, FK to people) - Associated person
  - `user_id` (uuid, FK to auth.users) - Owner
  - `title` (text) - Gift idea title/name
  - `description` (text, optional) - Detailed description
  - `url` (text, optional) - Link to product/reference
  - `price` (numeric, optional) - Estimated/actual price
  - `priority` (text) - Priority level: "low", "medium", "high"
  - `is_purchased` (boolean) - Whether gift has been purchased
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. reminders
  Stores special dates and reminder settings
  - `id` (uuid, PK) - Unique reminder identifier
  - `person_id` (uuid, FK to people) - Associated person
  - `user_id` (uuid, FK to auth.users) - Owner
  - `title` (text) - Reminder title (e.g., "Birthday", "Anniversary")
  - `date` (date) - The special date
  - `is_recurring` (boolean) - Whether reminder repeats annually
  - `days_before_notification` (integer) - Days in advance to notify (default: 7)
  - `is_active` (boolean) - Whether reminder is enabled
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - RLS (Row Level Security) enabled on all tables
  - Users can only access their own data
  - Separate policies for SELECT, INSERT, UPDATE, DELETE operations
  - All policies verify authentication and ownership

  ## Notes
  - All timestamps use `timestamptz` for timezone awareness
  - Foreign keys ensure referential integrity
  - Cascading deletes: deleting a person removes associated gifts and reminders
  - Default values provided for booleans and timestamps
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create people table
CREATE TABLE IF NOT EXISTS people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  relationship text DEFAULT '' NOT NULL,
  birthday date,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create gift_ideas table
CREATE TABLE IF NOT EXISTS gift_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid REFERENCES people(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  url text DEFAULT '',
  price numeric(10, 2),
  priority text DEFAULT 'medium' NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  is_purchased boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid REFERENCES people(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  date date NOT NULL,
  is_recurring boolean DEFAULT true NOT NULL,
  days_before_notification integer DEFAULT 7 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS people_user_id_idx ON people(user_id);
CREATE INDEX IF NOT EXISTS gift_ideas_person_id_idx ON gift_ideas(person_id);
CREATE INDEX IF NOT EXISTS gift_ideas_user_id_idx ON gift_ideas(user_id);
CREATE INDEX IF NOT EXISTS reminders_person_id_idx ON reminders(person_id);
CREATE INDEX IF NOT EXISTS reminders_user_id_idx ON reminders(user_id);
CREATE INDEX IF NOT EXISTS reminders_date_idx ON reminders(date);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- People policies
CREATE POLICY "Users can view own people"
  ON people FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own people"
  ON people FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own people"
  ON people FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own people"
  ON people FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Gift ideas policies
CREATE POLICY "Users can view own gift ideas"
  ON gift_ideas FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gift ideas"
  ON gift_ideas FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gift ideas"
  ON gift_ideas FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own gift ideas"
  ON gift_ideas FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Reminders policies
CREATE POLICY "Users can view own reminders"
  ON reminders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders"
  ON reminders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders"
  ON reminders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders"
  ON reminders FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_people_updated_at
  BEFORE UPDATE ON people
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gift_ideas_updated_at
  BEFORE UPDATE ON gift_ideas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at
  BEFORE UPDATE ON reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();