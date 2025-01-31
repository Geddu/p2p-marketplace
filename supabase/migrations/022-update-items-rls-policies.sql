-- Enable RLS
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Items are viewable by everyone" ON items;
DROP POLICY IF EXISTS "Users can insert their own items" ON items;
DROP POLICY IF EXISTS "Users can update own items" ON items;
DROP POLICY IF EXISTS "Users can delete own items" ON items;

-- Create policies
-- Allow anyone to view items
CREATE POLICY "Items are viewable by everyone"
ON items FOR SELECT
USING (true);

-- Allow authenticated users to create items
CREATE POLICY "Users can insert their own items"
ON items FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = user_id
  AND profiles.user_id = auth.uid()
));

-- Allow users to update their own items
CREATE POLICY "Users can update own items"
ON items FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = user_id
  AND profiles.user_id = auth.uid()
));

-- Allow users to delete their own items
CREATE POLICY "Users can delete own items"
ON items FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = user_id
  AND profiles.user_id = auth.uid()
)); 