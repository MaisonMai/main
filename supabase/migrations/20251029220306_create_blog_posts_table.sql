/*
  # Create Blog Posts Table

  1. New Tables
    - `blog_posts`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `slug` (text, unique, not null) - URL-friendly version of title
      - `excerpt` (text) - Short description/preview
      - `content` (text, not null) - Full blog post content
      - `featured_image_url` (text) - Cover image
      - `author_name` (text, not null)
      - `published_at` (timestamptz) - When post was published
      - `is_published` (boolean, default false)
      - `tags` (text[]) - Array of tags/categories
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Allow anyone to read published blog posts
    - Only admins can create, update, or delete blog posts

  3. Indexes
    - Index on slug for fast lookups
    - Index on published_at for sorting
    - Index on is_published for filtering
*/

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text NOT NULL,
  featured_image_url text,
  author_name text NOT NULL,
  published_at timestamptz,
  is_published boolean DEFAULT false,
  tags text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published blog posts"
  ON blog_posts
  FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can view all blog posts"
  ON blog_posts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can create blog posts"
  ON blog_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can update blog posts"
  ON blog_posts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can delete blog posts"
  ON blog_posts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_is_published ON blog_posts(is_published);
