-- FIX 500 ERROR (RLS Infinite Recursion)

-- The previous policy caused an infinite loop:
-- To check if you can see the 'profiles' table, it tried to read the 'profiles' table to see if you are an admin.
-- This repeats forever -> Server Error 500.

-- 1. Create a secure function to check admin status without triggering RLS loops
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 'SECURITY DEFINER' means this function runs with the privileges of the database owner,
-- bypassing RLS checks for the internal query.

-- 2. Fix 'profiles' table policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Allow users to see their OWN profile OR if they are an admin (using the safe function)
CREATE POLICY "Users and Admins view profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR is_admin()
);

-- 3. Update 'listings' policies to use the new safe function (Cleaner & Faster)
DROP POLICY IF EXISTS "Admins can view all listings" ON listings;
CREATE POLICY "Admins can view all listings"
ON listings FOR SELECT
TO authenticated
USING (
  -- Public can usually see active listings, but Admins can see ALL (including pending/rejected)
  (status = 'active') OR (auth.uid() = user_id) OR is_admin()
);

DROP POLICY IF EXISTS "Admins can update all listings" ON listings;
CREATE POLICY "Admins can update all listings"
ON listings FOR UPDATE
TO authenticated
USING (
  (auth.uid() = user_id) OR is_admin()
);

DROP POLICY IF EXISTS "Admins can delete all listings" ON listings;
CREATE POLICY "Admins can delete all listings"
ON listings FOR DELETE
TO authenticated
USING (
  (auth.uid() = user_id) OR is_admin()
);
