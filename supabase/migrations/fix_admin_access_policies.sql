-- =============================================
-- FIX: Admin/Superadmin access to ALL tables
-- Run this in Supabase Dashboard > SQL Editor
-- =============================================

-- =============================================
-- 1. FIX LABEL_SUBMISSIONS POLICIES
--    Bug: policies only check role = 'admin', not 'superadmin'
-- =============================================

DROP POLICY IF EXISTS "Admins can view all submissions" ON label_submissions;
DROP POLICY IF EXISTS "Admins can update submissions" ON label_submissions;
DROP POLICY IF EXISTS "Admins can delete submissions" ON label_submissions;
DROP POLICY IF EXISTS "Admins can delete label submissions" ON label_submissions;

CREATE POLICY "Admins can view all submissions"
  ON label_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can update submissions"
  ON label_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can delete submissions"
  ON label_submissions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- =============================================
-- 2. FIX STUDIO_REQUESTS POLICIES
--    Bug: NO SELECT/UPDATE policy for admins at all
-- =============================================

DROP POLICY IF EXISTS "Admins can view all studio requests" ON studio_requests;
DROP POLICY IF EXISTS "Admins can update studio requests" ON studio_requests;
DROP POLICY IF EXISTS "Admins can delete studio requests" ON studio_requests;

CREATE POLICY "Admins can view all studio requests"
  ON studio_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can update studio requests"
  ON studio_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can delete studio requests"
  ON studio_requests FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- Ensure users can still see their own requests
DROP POLICY IF EXISTS "Users can view own studio requests" ON studio_requests;
CREATE POLICY "Users can view own studio requests"
  ON studio_requests FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create studio requests" ON studio_requests;
CREATE POLICY "Users can create studio requests"
  ON studio_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own studio requests" ON studio_requests;
CREATE POLICY "Users can update own studio requests"
  ON studio_requests FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================
-- 3. FIX NOTIFICATIONS POLICIES
--    Bug: no admin SELECT policy
-- =============================================

DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
CREATE POLICY "Admins can view all notifications"
  ON notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- =============================================
-- 4. FIX SHARED_LINKS POLICIES
--    Ensure superadmin is included
-- =============================================

DROP POLICY IF EXISTS "Admins can manage shared links" ON shared_links;
CREATE POLICY "Admins can manage shared links"
  ON shared_links FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );
