-- =============================================
-- CREATE STORAGE BUCKET FOR CATALOGUE IMAGES
-- =============================================

-- Create the bucket for catalogue images (artists & releases)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'catalogue-images',
  'catalogue-images',
  true,  -- Public bucket so images can be viewed by anyone
  5242880,  -- 5MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- =============================================
-- STORAGE POLICIES
-- =============================================

-- Anyone can view images (public bucket)
CREATE POLICY "Public can view catalogue images"
ON storage.objects FOR SELECT
USING (bucket_id = 'catalogue-images');

-- Only admins can upload images
CREATE POLICY "Admins can upload catalogue images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'catalogue-images'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Only admins can update images
CREATE POLICY "Admins can update catalogue images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'catalogue-images'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Only admins can delete images
CREATE POLICY "Admins can delete catalogue images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'catalogue-images'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
