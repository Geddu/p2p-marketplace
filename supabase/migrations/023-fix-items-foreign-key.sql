-- Drop the existing foreign key constraint
ALTER TABLE items DROP CONSTRAINT IF EXISTS items_user_id_fkey;

-- Add the correct foreign key constraint
ALTER TABLE items
  ADD CONSTRAINT items_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Update the RLS policy to match
DROP POLICY IF EXISTS "Users can insert their own items" ON items;
DROP POLICY IF EXISTS "Users can update own items" ON items;
DROP POLICY IF EXISTS "Users can delete own items" ON items;

-- Create policies
CREATE POLICY "Users can insert their own items"
ON items FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own items"
ON items FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own items"
ON items FOR DELETE
TO authenticated
USING (auth.uid() = user_id); 