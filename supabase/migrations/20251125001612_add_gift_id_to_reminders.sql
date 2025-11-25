/*
  # Add gift_id to reminders table

  1. Changes
    - Add optional `gift_id` column to reminders table
    - Link reminders to specific gift ideas
    - Allow NULL values (reminders can exist without linked gifts)
  
  2. Security
    - Maintains existing RLS policies
    - No new permissions needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reminders' AND column_name = 'gift_id'
  ) THEN
    ALTER TABLE reminders ADD COLUMN gift_id uuid REFERENCES gift_ideas(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS reminders_gift_id_idx ON reminders(gift_id);
  END IF;
END $$;