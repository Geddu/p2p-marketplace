-- Drop the existing view policy
DROP POLICY IF EXISTS "Invites are viewable by creator" ON invites;

-- Create the corrected view policy
CREATE POLICY "Invites are viewable by creator"
ON invites FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.id = invites.inviter_id 
    AND profiles.user_id = auth.uid()
  )
); 