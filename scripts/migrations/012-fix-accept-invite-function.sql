-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS accept_invite(UUID, UUID);

-- Create a function to accept invites
CREATE OR REPLACE FUNCTION accept_invite(
  p_invite_id UUID,
  p_user_id UUID
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rows_affected int;
BEGIN
  -- Check if invite exists and is pending
  UPDATE invites
  SET 
    status = 'accepted',
    accepted_at = NOW()
  WHERE 
    id = p_invite_id 
    AND status = 'pending'
    AND expires_at > NOW();

  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
  
  RETURN v_rows_affected = 1;
END;
$$; 