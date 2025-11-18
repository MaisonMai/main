/*
  # Add Missing Foreign Key Indexes for Performance

  This migration adds indexes for foreign keys that were previously unindexed.
  
  1. Performance Optimization
    - Creates indexes on foreign key columns to optimize JOIN operations
    - Prevents full table scans when querying related data
    - Improves query performance for gift_analysis, gift_ideas, and person_preferences tables
  
  2. Indexes Added
    - gift_analysis.gift_idea_id - Optimizes lookups of analysis by gift idea
    - gift_analysis.user_id - Optimizes user-specific analysis queries
    - gift_ideas.user_id - Optimizes user-specific gift idea queries
    - person_preferences.user_id - Optimizes user-specific preference queries
  
  Security Impact: HIGH - Improves performance and prevents potential denial-of-service through slow queries
  
  Note: These indexes were previously removed but are needed for optimal query performance.
  The RLS policies use these columns for filtering, making indexes essential.
*/

-- Add index for gift_analysis foreign keys
CREATE INDEX IF NOT EXISTS idx_gift_analysis_gift_idea_id 
  ON gift_analysis(gift_idea_id);

CREATE INDEX IF NOT EXISTS idx_gift_analysis_user_id 
  ON gift_analysis(user_id);

-- Add index for gift_ideas foreign key
CREATE INDEX IF NOT EXISTS idx_gift_ideas_user_id 
  ON gift_ideas(user_id);

-- Add index for person_preferences foreign key
CREATE INDEX IF NOT EXISTS idx_person_preferences_user_id 
  ON person_preferences(user_id);
