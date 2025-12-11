-- Migration: Allow admins to read all profiles (FIXED - no recursion)
-- This is needed for the User Management page
-- Uses auth.jwt() to avoid infinite recursion

-- Drop ALL existing SELECT policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Single policy that handles both cases without recursion
-- Uses JWT claims instead of querying the profiles table
CREATE POLICY "Users can view profiles" ON profiles
  FOR SELECT
  USING (
    auth.uid() = id  -- Users can always see their own profile
    OR
    (auth.jwt() ->> 'role')::text = 'admin'  -- Admins can see all (from JWT)
    OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data ->> 'role') = 'admin'
    )
  );

-- Alternative approach using a security definer function
-- This is more reliable as it bypasses RLS

-- Create a function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$;

-- Drop the previous policy and create a cleaner one
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Admins can view all profiles (using security definer function)
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT
  USING (public.is_admin());
