-- Drop existing insert policies
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "System can create profiles during signup" ON profiles;

-- Create new upsert policy
CREATE POLICY "Allow profile creation and updates during signup"
ON profiles FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Update policy for existing profiles
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true); 