-- Drop existing policy
DROP POLICY IF EXISTS "Users can insert their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;

-- Create new policies that correctly check against profile IDs
CREATE POLICY "Users can insert their own favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = user_id 
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = user_id 
      AND profiles.user_id = auth.uid()
    )
  ); 