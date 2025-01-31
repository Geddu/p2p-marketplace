-- Drop existing policy
DROP POLICY IF EXISTS "Users can insert their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;

-- Create new policies with explicit UUID casting
CREATE POLICY "Users can insert their own favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id::uuid = user_id::uuid 
      AND profiles.user_id::uuid = auth.uid()::uuid
    )
  );

CREATE POLICY "Users can delete their own favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id::uuid = user_id::uuid 
      AND profiles.user_id::uuid = auth.uid()::uuid
    )
  ); 