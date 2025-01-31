-- Create a function to debug the RLS conditions
CREATE OR REPLACE FUNCTION debug_favorite_access(test_user_id uuid)
RETURNS TABLE (
  profile_id uuid,
  auth_user_id uuid,
  has_access boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as profile_id,
    p.user_id::uuid as auth_user_id,
    (p.user_id = auth.uid()) as has_access
  FROM profiles p
  WHERE p.id = test_user_id;
END;
$$; 