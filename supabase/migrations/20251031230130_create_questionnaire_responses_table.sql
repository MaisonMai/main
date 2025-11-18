/*
  # Add Questionnaire Responses Table

  ## Overview
  This migration creates a table to store detailed questionnaire responses for each person,
  enabling highly personalized gift recommendations.

  ## New Tables
  
  ### `questionnaire_responses`
  Stores comprehensive questionnaire data for personalizing gift suggestions
  
  **Columns:**
  - `id` (uuid, primary key) - Unique identifier
  - `person_id` (uuid, foreign key) - References the person this questionnaire is for
  - `user_id` (uuid, foreign key) - The user who filled out the questionnaire
  - `age_range` (text) - Age range of the recipient
  - `gender` (text) - Gender preference for gift selection
  - `interests` (text array) - List of interests and hobbies
  - `favorite_brands` (text array) - Preferred brands
  - `price_range` (text) - Ideal price range per gift
  - `gift_preference` (text) - Budget/mid/premium/mix preference
  - `occasion` (text) - The occasion for the gift
  - `occasion_date` (date) - Date of the occasion
  - `personality_traits` (text array) - Up to 3 personality descriptors
  - `experience_vs_physical` (text) - Preference for experiences vs physical gifts
  - `surprise_vs_practical` (text) - Surprise or practical gift preference
  - `restrictions_notes` (text) - Any restrictions or special notes
  - `remember_preferences` (boolean) - Whether to remember for future
  - `auto_generate_gifts` (boolean) - Whether to auto-generate gift ideas
  - `completed_at` (timestamptz) - When questionnaire was completed
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ## Security
  - Enable RLS on `questionnaire_responses` table
  - Users can only view/edit questionnaires for their own people
  - Policies enforce user ownership through person_id relationship

  ## Notes
  - One questionnaire per person (enforced by unique constraint)
  - Can be updated to reflect changing preferences
  - Used to enhance AI gift suggestions with rich context
*/

-- Create questionnaire_responses table
CREATE TABLE IF NOT EXISTS questionnaire_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid REFERENCES people(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  age_range text,
  gender text,
  interests text[] DEFAULT '{}',
  favorite_brands text[] DEFAULT '{}',
  price_range text,
  gift_preference text,
  occasion text,
  occasion_date date,
  personality_traits text[] DEFAULT '{}',
  experience_vs_physical text,
  surprise_vs_practical text,
  restrictions_notes text,
  remember_preferences boolean DEFAULT true,
  auto_generate_gifts boolean DEFAULT true,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(person_id)
);

-- Enable RLS
ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own questionnaire responses
CREATE POLICY "Users can view own questionnaire responses"
  ON questionnaire_responses FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Users can insert their own questionnaire responses
CREATE POLICY "Users can insert own questionnaire responses"
  ON questionnaire_responses FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own questionnaire responses
CREATE POLICY "Users can update own questionnaire responses"
  ON questionnaire_responses FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can delete their own questionnaire responses
CREATE POLICY "Users can delete own questionnaire responses"
  ON questionnaire_responses FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_person_id ON questionnaire_responses(person_id);
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_user_id ON questionnaire_responses(user_id);