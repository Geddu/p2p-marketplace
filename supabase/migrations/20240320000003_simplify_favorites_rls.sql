-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;

-- Create new simplified policies
CREATE POLICY "Users can insert their own favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT p.id 
      FROM profiles p 
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (
    user_id IN (
      SELECT p.id 
      FROM profiles p 
      WHERE p.user_id = auth.uid()
    )
  ); 