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
