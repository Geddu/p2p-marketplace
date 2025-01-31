-- Drop the existing view
DROP VIEW IF EXISTS invite_details;

-- Create a secure view for detailed invite information with fixed JOIN
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
    LEFT JOIN auth.users u ON (
        i.status = 'accepted' 
        AND i.email = u.email
    )
    LEFT JOIN profiles invited ON (
        u.id = invited.user_id
    )
WHERE 
    -- Security check: only show invites where the current user is the inviter
    EXISTS (
        SELECT 1 
        FROM profiles 
        WHERE profiles.id = i.inviter_id 
        AND profiles.user_id = auth.uid()
    ); 