-- Drop the existing update policy
DROP POLICY IF EXISTS "Invites are updatable by system" ON invites;

-- Create a new update policy that allows updates during signup
CREATE POLICY "Invites can be accepted during signup"
ON invites FOR UPDATE
TO anon, authenticated
USING (
    status = 'pending' -- Only pending invites can be updated
)
WITH CHECK (
    status = 'accepted' -- Can only update to accepted status
); 