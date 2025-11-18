/*
  # Create Partner Messages Table

  1. New Tables
    - `partner_messages`
      - `id` (uuid, primary key)
      - `partner_id` (uuid, foreign key to gift_partners)
      - `user_id` (uuid, foreign key to auth.users) - The user sending/receiving messages
      - `sender_type` (text) - 'user' or 'partner' to identify who sent the message
      - `message` (text) - The message content
      - `read` (boolean) - Whether the message has been read
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `partner_conversations`
      - `id` (uuid, primary key)
      - `partner_id` (uuid, foreign key to gift_partners)
      - `user_id` (uuid, foreign key to auth.users)
      - `last_message_at` (timestamptz)
      - `unread_partner_count` (integer) - Unread messages for partner
      - `unread_user_count` (integer) - Unread messages for user
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can view/create messages in their own conversations
    - Partners can view/create messages for their partner profile
    - Both users and partners can mark messages as read

  3. Indexes
    - Index on partner_id and user_id for conversations
    - Index on conversation lookups
    - Index on created_at for sorting
*/

-- Create partner_conversations table
CREATE TABLE IF NOT EXISTS partner_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES gift_partners(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_at timestamptz DEFAULT now(),
  unread_partner_count integer DEFAULT 0,
  unread_user_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(partner_id, user_id)
);

-- Create partner_messages table
CREATE TABLE IF NOT EXISTS partner_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES partner_conversations(id) ON DELETE CASCADE,
  sender_type text NOT NULL CHECK (sender_type IN ('user', 'partner')),
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE partner_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for partner_conversations

-- Users can view their own conversations
CREATE POLICY "Users can view own conversations"
  ON partner_conversations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Partners can view conversations for their partner profile
CREATE POLICY "Partners can view own partner conversations"
  ON partner_conversations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gift_partners
      WHERE gift_partners.id = partner_conversations.partner_id
      AND gift_partners.user_id = auth.uid()
    )
  );

-- Users can create conversations (when initiating chat)
CREATE POLICY "Users can create conversations"
  ON partner_conversations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own conversations (mark read, etc)
CREATE POLICY "Users can update own conversations"
  ON partner_conversations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Partners can update their partner conversations
CREATE POLICY "Partners can update own partner conversations"
  ON partner_conversations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gift_partners
      WHERE gift_partners.id = partner_conversations.partner_id
      AND gift_partners.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gift_partners
      WHERE gift_partners.id = partner_conversations.partner_id
      AND gift_partners.user_id = auth.uid()
    )
  );

-- RLS Policies for partner_messages

-- Users can view messages in their own conversations
CREATE POLICY "Users can view own messages"
  ON partner_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM partner_conversations
      WHERE partner_conversations.id = partner_messages.conversation_id
      AND partner_conversations.user_id = auth.uid()
    )
  );

-- Partners can view messages in their partner conversations
CREATE POLICY "Partners can view partner messages"
  ON partner_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM partner_conversations
      JOIN gift_partners ON gift_partners.id = partner_conversations.partner_id
      WHERE partner_conversations.id = partner_messages.conversation_id
      AND gift_partners.user_id = auth.uid()
    )
  );

-- Users can send messages in their own conversations
CREATE POLICY "Users can send messages"
  ON partner_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM partner_conversations
      WHERE partner_conversations.id = conversation_id
      AND partner_conversations.user_id = auth.uid()
    )
  );

-- Partners can send messages in their partner conversations
CREATE POLICY "Partners can send messages"
  ON partner_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM partner_conversations
      JOIN gift_partners ON gift_partners.id = partner_conversations.partner_id
      WHERE partner_conversations.id = conversation_id
      AND gift_partners.user_id = auth.uid()
    )
  );

-- Users can update messages (mark as read)
CREATE POLICY "Users can update messages"
  ON partner_messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM partner_conversations
      WHERE partner_conversations.id = partner_messages.conversation_id
      AND partner_conversations.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM partner_conversations
      WHERE partner_conversations.id = partner_messages.conversation_id
      AND partner_conversations.user_id = auth.uid()
    )
  );

-- Partners can update messages (mark as read)
CREATE POLICY "Partners can update messages"
  ON partner_messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM partner_conversations
      JOIN gift_partners ON gift_partners.id = partner_conversations.partner_id
      WHERE partner_conversations.id = partner_messages.conversation_id
      AND gift_partners.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM partner_conversations
      JOIN gift_partners ON gift_partners.id = partner_conversations.partner_id
      WHERE partner_conversations.id = partner_messages.conversation_id
      AND gift_partners.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_partner_conversations_partner_id 
  ON partner_conversations(partner_id);

CREATE INDEX IF NOT EXISTS idx_partner_conversations_user_id 
  ON partner_conversations(user_id);

CREATE INDEX IF NOT EXISTS idx_partner_conversations_last_message 
  ON partner_conversations(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_partner_messages_conversation_id 
  ON partner_messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_partner_messages_created_at 
  ON partner_messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_partner_messages_read 
  ON partner_messages(read) WHERE read = false;

-- Add trigger for updated_at on partner_conversations
CREATE TRIGGER update_partner_conversations_updated_at
  BEFORE UPDATE ON partner_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add trigger for updated_at on partner_messages
CREATE TRIGGER update_partner_messages_updated_at
  BEFORE UPDATE ON partner_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
