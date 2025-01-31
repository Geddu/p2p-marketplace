-- Create a secure view for detailed invite information
CREATE OR REPLACE VIEW invite_details AS
SELECT 
    i.id,
    i.code,
    i.status,
    i.email,
    i.created_at,
    i.expires_at,
    i.accepted_at,
    i.inviter_id,
    -- Inviter details
    inviter.full_name as inviter_name,
    inviter.reputation_score as inviter_reputation,
    -- Invited person details (if they've accepted)
    invited.full_name as invited_name,
    invited.reputation_score as invited_reputation,
    -- Calculate reputation effect (only for accepted invites)
    CASE 
        WHEN i.status = 'accepted' AND invited.reputation_score IS NOT NULL 
        THEN 
            CASE
                -- If invited person has higher reputation, positive effect
                WHEN invited.reputation_score > inviter.reputation_score 
                THEN LEAST(invited.reputation_score - inviter.reputation_score, 0.5)
                -- If invited person has lower reputation, negative effect
                WHEN invited.reputation_score < inviter.reputation_score 
                THEN GREATEST(invited.reputation_score - inviter.reputation_score, -0.5)
                ELSE 0
            END
        ELSE NULL
    END as reputation_effect
FROM 
    invites i
    INNER JOIN profiles inviter ON i.inviter_id = inviter.id
    LEFT JOIN profiles invited ON (
        i.status = 'accepted' 
        AND invited.invited_by_id = i.inviter_id 
        AND EXISTS (
            SELECT 1 
            FROM auth.users u 
            WHERE u.email = i.email 
            AND u.id = invited.user_id
        )
    )
WHERE 
    -- Security check: only show invites where the current user is the inviter
    EXISTS (
        SELECT 1 
        FROM profiles 
        WHERE profiles.id = i.inviter_id 
        AND profiles.user_id = auth.uid()
    );

-- Create policy for the view
DROP POLICY IF EXISTS "Users can view their own invite details" ON invite_details;

CREATE POLICY "Users can view their own invite details"
ON invite_details FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 
        FROM profiles 
        WHERE profiles.id = inviter_id 
        AND profiles.user_id = auth.uid()
    )
);

-- Enable RLS on the view
ALTER VIEW invite_details ENABLE ROW LEVEL SECURITY; 