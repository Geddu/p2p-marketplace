-- Drop existing update policy
DROP POLICY IF EXISTS "Invites can be accepted during signup" ON invites;

-- Create a simpler, more permissive update policy
CREATE POLICY "Allow invite acceptance"
ON invites FOR UPDATE
TO anon, authenticated
USING (
    status = 'pending' AND
    (
        SELECT COUNT(*) = 0
        FROM profiles
        WHERE profiles.invited_by_id = invites.inviter_id
        AND profiles.user_id = auth.uid()
    )
)
WITH CHECK (
    status IN ('accepted', 'expired') AND
    CASE 
        WHEN status = 'accepted' THEN accepted_at IS NOT NULL
        ELSE true
    END
); 