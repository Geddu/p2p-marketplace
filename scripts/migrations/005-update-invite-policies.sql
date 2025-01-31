-- First, get a list of all policies on the invites table
DO $$ 
DECLARE 
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'invites'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON invites', pol.policyname);
    END LOOP;
END $$;

-- Enable RLS
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- Create function to set invite code
CREATE OR REPLACE FUNCTION set_invite_code(p_invite_code TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM set_config('app.invite_code', p_invite_code, true);
END;
$$;

-- Create policies
CREATE POLICY "Invites are viewable by creator"
ON invites FOR SELECT
TO authenticated
USING (inviter_id = auth.uid());

CREATE POLICY "Invites are viewable by code verification"
ON invites FOR SELECT
TO anon, authenticated
USING (status = 'pending');  -- Only allow viewing pending invites

CREATE POLICY "Invites are insertable by authenticated users"
ON invites FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.invites_left > 0
  )
);

CREATE POLICY "Invites are updatable by system"
ON invites FOR UPDATE
TO anon, authenticated
USING (status = 'pending')
WITH CHECK (true); 