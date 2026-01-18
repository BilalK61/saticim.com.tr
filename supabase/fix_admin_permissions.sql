-- Admin Permissions Fix
-- Run this in your Supabase SQL Editor to grant admins access to all data

-- 1. Admin Policies for 'listings' table
DROP POLICY IF EXISTS "Admins can view all listings" ON listings;
CREATE POLICY "Admins can view all listings"
ON listings FOR SELECT
TO authenticated
USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
);

DROP POLICY IF EXISTS "Admins can update all listings" ON listings;
CREATE POLICY "Admins can update all listings"
ON listings FOR UPDATE
TO authenticated
USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
);

DROP POLICY IF EXISTS "Admins can delete all listings" ON listings;
CREATE POLICY "Admins can delete all listings"
ON listings FOR DELETE
TO authenticated
USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
);

-- 2. Admin Policies for 'profiles' table
-- Necessary so the admin panel can fetch user details (name, email) for each listing
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
);
