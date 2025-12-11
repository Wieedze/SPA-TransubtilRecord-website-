-- Migration: Add linked_artist_id to profiles table
-- This allows linking a user account to an artist from the catalogue

-- Add the linked_artist_id column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linked_artist_id INTEGER;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_linked_artist_id ON profiles(linked_artist_id);

-- Update RLS policy to allow admins to update any profile's role and linked_artist_id
-- First, drop existing update policy if it exists
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

-- Users can update their own profile (but not role or linked_artist_id)
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (
      -- If not admin, cannot change role or linked_artist_id
      (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
      OR (role = (SELECT role FROM profiles WHERE id = auth.uid())
          AND linked_artist_id IS NOT DISTINCT FROM (SELECT linked_artist_id FROM profiles WHERE id = auth.uid()))
    )
  );

-- Admins can update any profile
CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
