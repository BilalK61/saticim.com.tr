-- 1. Ensure 'is_admin' column exists in 'profiles' table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Grant admin privileges to your user.
-- IMPORTANT: Replace 'YOUR_EMAIL_HERE' with the email address you use to log in.
UPDATE profiles
SET is_admin = TRUE
WHERE id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'YOUR_EMAIL_HERE'
);

-- 3. Verify the change was successful
SELECT * FROM profiles WHERE is_admin = TRUE;
