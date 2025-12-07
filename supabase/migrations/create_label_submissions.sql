-- Create label_submissions table for demo submissions
-- Execute this in Supabase Dashboard → SQL Editor

-- Create the table
CREATE TABLE IF NOT EXISTS label_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  track_title TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  genre TEXT,
  file_url TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE label_submissions ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_label_submissions_user_id ON label_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_label_submissions_status ON label_submissions(status);
CREATE INDEX IF NOT EXISTS idx_label_submissions_created_at ON label_submissions(created_at DESC);

-- RLS Policy: Users can view their own submissions
CREATE POLICY "Users can view own submissions"
  ON label_submissions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policy: Users can create submissions
CREATE POLICY "Users can create submissions"
  ON label_submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Admins can view all submissions
CREATE POLICY "Admins can view all submissions"
  ON label_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policy: Admins can update submissions (status, feedback)
CREATE POLICY "Admins can update submissions"
  ON label_submissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Add updated_at column and trigger
ALTER TABLE label_submissions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE OR REPLACE FUNCTION update_label_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_label_submissions_updated_at_trigger
  BEFORE UPDATE ON label_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_label_submissions_updated_at();
