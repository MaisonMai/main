/*
  # Add Person Preferences and AI Analysis Tables

  ## Overview
  Adds intelligent profile learning capabilities to track and analyze gift preferences
  for each person, enabling personalized AI-powered gift suggestions.

  ## New Tables

  ### 1. person_preferences
  Stores learned preferences and interests for each person based on their profile,
  notes, gift ideas, and external links.
  
  - `id` (uuid, PK) - Unique preference record identifier
  - `person_id` (uuid, FK to people) - Associated person
  - `user_id` (uuid, FK to auth.users) - Owner
  - `interests` (jsonb) - Array of identified interests/hobbies
  - `style_preferences` (jsonb) - Style and aesthetic preferences
  - `price_range_preferences` (jsonb) - Typical price ranges they appreciate
  - `categories` (jsonb) - Product/gift categories they like
  - `brands` (jsonb) - Preferred brands
  - `last_analyzed_at` (timestamptz) - Last time AI analyzed the profile
  - `confidence_score` (numeric) - AI confidence in the analysis (0-1)
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. gift_analysis
  Stores AI analysis of individual gift ideas and URLs to improve future suggestions
  
  - `id` (uuid, PK) - Unique analysis identifier
  - `gift_idea_id` (uuid, FK to gift_ideas) - Associated gift idea
  - `user_id` (uuid, FK to auth.users) - Owner
  - `extracted_info` (jsonb) - Information extracted from URLs/descriptions
  - `category` (text) - Identified category
  - `price_point` (text) - Price point classification
  - `analyzed_at` (timestamptz) - Analysis timestamp
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - RLS enabled on all new tables
  - Users can only access their own data
  - Policies for SELECT, INSERT, UPDATE, DELETE operations
  
  ## Notes
  - JSONB fields allow flexible storage of AI-extracted information
  - Confidence scores help prioritize suggestions
  - Analysis timestamps enable tracking freshness of data
*/

-- Create person_preferences table
CREATE TABLE IF NOT EXISTS person_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid REFERENCES people(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  interests jsonb DEFAULT '[]'::jsonb NOT NULL,
  style_preferences jsonb DEFAULT '{}'::jsonb NOT NULL,
  price_range_preferences jsonb DEFAULT '{}'::jsonb NOT NULL,
  categories jsonb DEFAULT '[]'::jsonb NOT NULL,
  brands jsonb DEFAULT '[]'::jsonb NOT NULL,
  last_analyzed_at timestamptz DEFAULT now() NOT NULL,
  confidence_score numeric(3, 2) DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(person_id)
);

-- Create gift_analysis table
CREATE TABLE IF NOT EXISTS gift_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_idea_id uuid REFERENCES gift_ideas(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  extracted_info jsonb DEFAULT '{}'::jsonb NOT NULL,
  category text DEFAULT '',
  price_point text DEFAULT '',
  analyzed_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS person_preferences_person_id_idx ON person_preferences(person_id);
CREATE INDEX IF NOT EXISTS person_preferences_user_id_idx ON person_preferences(user_id);
CREATE INDEX IF NOT EXISTS gift_analysis_gift_idea_id_idx ON gift_analysis(gift_idea_id);
CREATE INDEX IF NOT EXISTS gift_analysis_user_id_idx ON gift_analysis(user_id);

-- Enable Row Level Security
ALTER TABLE person_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_analysis ENABLE ROW LEVEL SECURITY;

-- Person preferences policies
CREATE POLICY "Users can view own person preferences"
  ON person_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own person preferences"
  ON person_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own person preferences"
  ON person_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own person preferences"
  ON person_preferences FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Gift analysis policies
CREATE POLICY "Users can view own gift analysis"
  ON gift_analysis FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gift analysis"
  ON gift_analysis FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gift analysis"
  ON gift_analysis FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own gift analysis"
  ON gift_analysis FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_person_preferences_updated_at
  BEFORE UPDATE ON person_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
