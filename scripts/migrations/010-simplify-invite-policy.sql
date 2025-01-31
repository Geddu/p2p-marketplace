-- Drop existing policies
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

-- Create basic policies
CREATE POLICY "Invites are viewable by creator"
ON invites FOR SELECT
TO authenticated
USING (inviter_id = auth.uid());

CREATE POLICY "Pending invites are viewable by code"
ON invites FOR SELECT
TO anon, authenticated
USING (status = 'pending');

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

CREATE POLICY "Pending invites can be accepted"
ON invites FOR UPDATE
TO anon, authenticated
USING (status = 'pending')
WITH CHECK (status = 'accepted'); 