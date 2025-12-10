-- Migration: Create shared_links table for file sharing system
-- Description: This table stores information about files shared by admin with external users
-- Date: 2025-12-10

-- Create the shared_links table
CREATE TABLE IF NOT EXISTS shared_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- File information
  file_path TEXT NOT NULL,              -- Relative path in admin storage
  file_name TEXT NOT NULL,              -- Original filename for display
  file_size BIGINT NOT NULL,            -- File size in bytes

  -- Sharing configuration
  token TEXT UNIQUE NOT NULL,           -- Unique token for the share link
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Security & limits
  expires_at TIMESTAMP WITH TIME ZONE,  -- NULL = never expires
  password_hash TEXT,                   -- NULL = no password required (bcrypt hash)
  max_downloads INTEGER,                -- NULL = unlimited downloads
  download_count INTEGER DEFAULT 0,     -- Current download count

  -- Status
  is_active BOOLEAN DEFAULT TRUE,       -- Can be manually deactivated
  last_accessed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX idx_shared_links_token ON shared_links(token);
CREATE INDEX idx_shared_links_created_by ON shared_links(created_by);
CREATE INDEX idx_shared_links_expires_at ON shared_links(expires_at);
CREATE INDEX idx_shared_links_is_active ON shared_links(is_active);

-- Create a composite index for common queries
CREATE INDEX idx_shared_links_active_unexpired
ON shared_links(is_active, expires_at)
WHERE is_active = TRUE;

-- Enable Row Level Security
ALTER TABLE shared_links ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can manage all shared links
CREATE POLICY "Admins can manage shared links"
ON shared_links
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy: Public read access via token (no auth required)
-- This is handled in the application layer, not via RLS
-- RLS is disabled for SELECT operations on this table for public access

-- Add comment to table
COMMENT ON TABLE shared_links IS 'Stores file sharing links created by admin for external users';
COMMENT ON COLUMN shared_links.token IS 'Unique random token used in the share URL';
COMMENT ON COLUMN shared_links.password_hash IS 'Bcrypt hash of optional password protection';
COMMENT ON COLUMN shared_links.max_downloads IS 'Maximum number of downloads allowed (NULL = unlimited)';
COMMENT ON COLUMN shared_links.download_count IS 'Current number of times the file has been downloaded';
COMMENT ON COLUMN shared_links.is_active IS 'Admin can manually deactivate a link';

-- Create a function to check if a share link is valid and can be accessed
CREATE OR REPLACE FUNCTION is_share_link_valid(link_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  link_record shared_links%ROWTYPE;
BEGIN
  -- Get the link record
  SELECT * INTO link_record
  FROM shared_links
  WHERE token = link_token;

  -- Check if link exists
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Check if active
  IF NOT link_record.is_active THEN
    RETURN FALSE;
  END IF;

  -- Check if expired
  IF link_record.expires_at IS NOT NULL AND link_record.expires_at < NOW() THEN
    RETURN FALSE;
  END IF;

  -- Check download limit
  IF link_record.max_downloads IS NOT NULL AND link_record.download_count >= link_record.max_downloads THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;

-- Create a function to increment download count
CREATE OR REPLACE FUNCTION increment_download_count(link_token TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE shared_links
  SET
    download_count = download_count + 1,
    last_accessed_at = NOW()
  WHERE token = link_token;
END;
$$;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION is_share_link_valid(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_download_count(TEXT) TO anon, authenticated;
