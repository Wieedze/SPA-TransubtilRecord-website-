-- Migration: Fix all policies to include superadmin role
-- This ensures superadmin has the same access as admin everywhere

-- =============================================
-- 1. UPDATE is_admin() FUNCTION TO INCLUDE SUPERADMIN
-- =============================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'superadmin')
  );
$$;

-- =============================================
-- 2. FIX ARTISTS TABLE POLICIES
-- =============================================
DROP POLICY IF EXISTS "Admins can insert artists" ON artists;
DROP POLICY IF EXISTS "Admins can update artists" ON artists;
DROP POLICY IF EXISTS "Admins can delete artists" ON artists;

CREATE POLICY "Admins can insert artists" ON artists
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can update artists" ON artists
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can delete artists" ON artists
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- =============================================
-- 3. FIX RELEASES TABLE POLICIES
-- =============================================
DROP POLICY IF EXISTS "Admins can insert releases" ON releases;
DROP POLICY IF EXISTS "Admins can update releases" ON releases;
DROP POLICY IF EXISTS "Admins can delete releases" ON releases;

CREATE POLICY "Admins can insert releases" ON releases
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can update releases" ON releases
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can delete releases" ON releases
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- =============================================
-- 4. FIX PROFILES UPDATE POLICY
-- Prevent admin from promoting themselves to superadmin
-- =============================================
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;

-- Users can update their own profile (but not role)
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Prevent users from changing their own role
    AND (
      -- If role is changing, user must be admin/superadmin
      (role = (SELECT role FROM profiles WHERE id = auth.uid()))
      OR
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'superadmin')
      )
    )
  );

-- Admins can update any profile (except promoting to superadmin - handled by trigger)
CREATE POLICY "Admins can update profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- =============================================
-- 5. ENHANCED TRIGGER: Prevent admin self-promotion to superadmin
-- =============================================
CREATE OR REPLACE FUNCTION prevent_superadmin_role_change()
RETURNS TRIGGER AS $$
DECLARE
  current_user_role TEXT;
BEGIN
  -- Get current user's role
  SELECT role INTO current_user_role
  FROM profiles
  WHERE id = auth.uid();

  -- If someone is trying to change FROM superadmin, block it (only superadmin can do this to themselves)
  IF OLD.role = 'superadmin' AND NEW.role != 'superadmin' THEN
    IF current_user_role != 'superadmin' THEN
      RAISE EXCEPTION 'Cannot change superadmin role';
    END IF;
  END IF;

  -- If someone is trying to change TO superadmin
  IF NEW.role = 'superadmin' AND OLD.role != 'superadmin' THEN
    -- Only superadmin can promote to superadmin
    IF current_user_role != 'superadmin' THEN
      RAISE EXCEPTION 'Only superadmin can promote to superadmin role';
    END IF;
  END IF;

  -- Prevent admin from promoting themselves to admin (they already are)
  -- But allow superadmin to promote others to admin
  IF NEW.role = 'admin' AND OLD.role != 'admin' THEN
    IF auth.uid() = NEW.id AND current_user_role != 'superadmin' THEN
      RAISE EXCEPTION 'Cannot promote yourself to admin';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS prevent_superadmin_role_change_trigger ON profiles;
CREATE TRIGGER prevent_superadmin_role_change_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_superadmin_role_change();
