-- Migration: Add superadmin role
-- This adds the superadmin role which is the highest level of access
-- Only maxime.moodz@gmail.com should have this role

-- First, we need to update the role constraint to include 'superadmin'
-- Note: This assumes the role column uses a CHECK constraint or enum

-- If using CHECK constraint, we need to drop and recreate it
-- ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add the new constraint that includes superadmin
-- ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
--   CHECK (role IN ('user', 'client', 'artist', 'admin', 'superadmin'));

-- Alternative: If the role column is just a text column, we can directly update

-- Set maxime.moodz@gmail.com as superadmin
-- Find the user by email and update their role
UPDATE profiles
SET role = 'superadmin'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'maxime.moodz@gmail.com'
);

-- Create a function to prevent changing superadmin role (except by superadmin)
CREATE OR REPLACE FUNCTION prevent_superadmin_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If someone is trying to change FROM superadmin, block it
  IF OLD.role = 'superadmin' AND NEW.role != 'superadmin' THEN
    RAISE EXCEPTION 'Cannot change superadmin role';
  END IF;

  -- If someone is trying to change TO superadmin (who is not already superadmin)
  IF NEW.role = 'superadmin' AND OLD.role != 'superadmin' THEN
    -- Only allow if the current user is superadmin
    IF NOT EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'superadmin'
    ) THEN
      RAISE EXCEPTION 'Only superadmin can promote to superadmin role';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS prevent_superadmin_role_change_trigger ON profiles;
CREATE TRIGGER prevent_superadmin_role_change_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_superadmin_role_change();
