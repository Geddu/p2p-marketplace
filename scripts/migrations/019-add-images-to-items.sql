-- Add images column to items table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'items'
        AND column_name = 'images'
    ) THEN
        ALTER TABLE items 
        ADD COLUMN images TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Update the storage policy to use the array contains operator
DROP POLICY IF EXISTS "Authenticated users can view item images" ON storage.objects;
CREATE POLICY "Authenticated users can view item images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'items-images' 
  AND EXISTS (
    SELECT 1 FROM items 
    WHERE SPLIT_PART(storage.objects.name, '/', 1) = ANY(items.images)
  )
);

-- Update the upload policy
DROP POLICY IF EXISTS "Users can upload images for their own items" ON storage.objects;
CREATE POLICY "Users can upload images for their own items"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'items-images'
  AND EXISTS (
    SELECT 1 FROM items 
    WHERE items.user_id = auth.uid()
    AND items.id::text = SPLIT_PART(storage.objects.name, '/', 1)
  )
);

-- Update the delete policy
DROP POLICY IF EXISTS "Users can delete their own item images" ON storage.objects;
CREATE POLICY "Users can delete their own item images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'items-images'
  AND EXISTS (
    SELECT 1 FROM items 
    WHERE items.user_id = auth.uid()
    AND SPLIT_PART(storage.objects.name, '/', 1) = ANY(items.images)
  )
); 