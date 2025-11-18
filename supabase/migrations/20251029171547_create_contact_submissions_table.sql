/*
  # Create Contact Submissions Table

  1. New Tables
    - `contact_submissions`
      - `id` (uuid, primary key)
      - `name` (text) - Submitter's name
      - `email` (text) - Submitter's email
      - `subject` (text) - Message subject
      - `message` (text) - Message content
      - `user_id` (uuid, nullable) - If submitted by logged-in user
      - `status` (text) - Submission status (new, read, resolved)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `contact_submissions` table
    - Allow anyone (authenticated or not) to insert submissions
    - Only authenticated users can view their own submissions
    - No update/delete policies (submissions are immutable from user side)

  3. Indexes
    - Index on created_at for sorting
    - Index on status for filtering
    - Index on user_id for user-specific queries
*/

CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert contact submissions
CREATE POLICY "Anyone can submit contact form"
  ON contact_submissions FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow authenticated users to view their own submissions
CREATE POLICY "Users can view own submissions"
  ON contact_submissions FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at 
  ON contact_submissions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_status 
  ON contact_submissions(status);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_user_id 
  ON contact_submissions(user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_contact_submissions_updated_at
  BEFORE UPDATE ON contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
