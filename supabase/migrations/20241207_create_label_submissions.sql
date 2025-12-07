-- Create label_submissions table
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

-- Create index on user_id for faster queries
CREATE INDEX idx_label_submissions_user_id ON label_submissions(user_id);

-- Create index on status for filtering
CREATE INDEX idx_label_submissions_status ON label_submissions(status);

-- Policy: Users can view their own submissions
CREATE POLICY "Users can view own submissions"
  ON label_submissions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own submissions
CREATE POLICY "Users can create submissions"
  ON label_submissions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all submissions
CREATE POLICY "Admins can view all submissions"
  ON label_submissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can update all submissions (status, feedback)
CREATE POLICY "Admins can update submissions"
  ON label_submissions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can delete submissions
CREATE POLICY "Admins can delete submissions"
  ON label_submissions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create storage bucket for label demos (run this in Supabase Dashboard if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('label_demos', 'label_demos', false);

-- Storage policies for label_demos bucket
-- Policy: Authenticated users can upload to their own folder
-- CREATE POLICY "Users can upload demos"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'label_demos'
--     AND auth.uid()::text = (storage.foldername(name))[1]
--   );

-- Policy: Users can read their own files
-- CREATE POLICY "Users can read own demos"
--   ON storage.objects FOR SELECT
--   USING (
--     bucket_id = 'label_demos'
--     AND auth.uid()::text = (storage.foldername(name))[1]
--   );

-- Policy: Admins can read all files
-- CREATE POLICY "Admins can read all demos"
--   ON storage.objects FOR SELECT
--   USING (
--     bucket_id = 'label_demos'
--     AND EXISTS (
--       SELECT 1 FROM profiles
--       WHERE profiles.id = auth.uid()
--       AND profiles.role = 'admin'
--     )
--   );
