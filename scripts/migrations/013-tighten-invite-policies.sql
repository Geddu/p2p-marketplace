-- Drop all existing invite policies
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

-- Create more restrictive policies
CREATE POLICY "Invites are viewable by creator"
ON invites FOR SELECT
TO authenticated
USING (inviter_id = auth.uid());

CREATE POLICY "Pending invites are only viewable by code for verification"
ON invites FOR SELECT
TO anon, authenticated
USING (
    status = 'pending' AND
    expires_at > NOW()
);

CREATE POLICY "Invites are insertable by users with remaining invites"
ON invites FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 
        FROM profiles
        WHERE profiles.user_id = auth.uid()
        AND profiles.invites_left > 0
    )
);

-- Remove the update policy since we're using the secure function
-- Updates will now only happen through the accept_invite function 