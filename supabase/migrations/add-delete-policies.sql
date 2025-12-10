-- Allow admins to delete label submissions
CREATE POLICY "Admins can delete label submissions"
ON label_submissions
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Allow users to delete their own label submissions
CREATE POLICY "Users can delete their own label submissions"
ON label_submissions
FOR DELETE
USING (auth.uid() = user_id);

-- Allow admins to delete studio requests
CREATE POLICY "Admins can delete studio requests"
ON studio_requests
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Allow users to delete their own studio requests
CREATE POLICY "Users can delete their own studio requests"
ON studio_requests
FOR DELETE
USING (auth.uid() = user_id);
