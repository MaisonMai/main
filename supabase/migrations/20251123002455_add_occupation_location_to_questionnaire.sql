/*
  # Add Occupation and Location to Questionnaire Responses

  ## Overview
  This migration adds optional occupation and location fields to the questionnaire_responses table
  to enable better gift personalization, especially for location-based experiences.

  ## Changes
  
  ### Modified Tables
  - `questionnaire_responses`
    - Add `occupation` (text, optional) - The recipient's occupation/profession
    - Add `location` (text) - The recipient's location for local experiences/services

  ## Notes
  - Occupation is optional to gather context about the person
  - Location is important for recommending local experiences, spas, restaurants, etc.
  - These fields enhance AI gift recommendations with additional context
*/

-- Add occupation field (optional)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'questionnaire_responses' AND column_name = 'occupation'
  ) THEN
    ALTER TABLE questionnaire_responses ADD COLUMN occupation text;
  END IF;
END $$;

-- Add location field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'questionnaire_responses' AND column_name = 'location'
  ) THEN
    ALTER TABLE questionnaire_responses ADD COLUMN location text;
  END IF;
END $$;
