-- First, get a list of all policies on the profiles table
DO $$ 
DECLARE 
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', pol.policyname);
    END LOOP;
END $$;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Profiles are viewable by anyone"
ON profiles FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Users can create their own profile"
ON profiles FOR INSERT
TO anon, authenticated
WITH CHECK (
    auth.uid() = user_id
);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow profile creation during signup
CREATE POLICY "System can create profiles during signup"
ON profiles FOR INSERT
TO anon
WITH CHECK (true); 