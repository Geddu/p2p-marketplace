-- Create a function to accept invites
CREATE OR REPLACE FUNCTION accept_invite(
  p_invite_id UUID,
  p_user_id UUID
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invite_exists boolean;
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

  GET DIAGNOSTICS v_invite_exists = ROW_COUNT;
  
  RETURN v_invite_exists > 0;
END;
$$; 