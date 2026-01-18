-- Add a unique constraint to the username column in the profiles table
ALTER TABLE profiles
ADD CONSTRAINT unique_username UNIQUE (username);
