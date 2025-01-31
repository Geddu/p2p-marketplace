-- Drop existing bucket if it exists
DROP EXTENSION IF EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the storage bucket for item images if it doesn't exist
DO $$
BEGIN
    -- First, try to delete the bucket if it exists (to ensure a clean state)
    DELETE FROM storage.buckets WHERE id = 'items-images';
    
    -- Then create the bucket with proper settings
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, owner, created_at, updated_at, avif_autodetection)
    VALUES (
        'items-images',
        'items-images',
        false,
        5242880, -- 5MB in bytes
        ARRAY['image/jpeg', 'image/png', 'image/webp']::text[],
        auth.uid(),
        NOW(),
        NOW(),
        false
    );
END $$;

-- Enable RLS on the bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to view images
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

-- Policy to allow users to upload images for their own items
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

-- Policy to allow users to delete their own item images
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

-- Create a function to clean up images when an item is deleted
CREATE OR REPLACE FUNCTION delete_item_images()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete all images associated with the item from storage
  DELETE FROM storage.objects 
  WHERE bucket_id = 'items-images' 
  AND SPLIT_PART(name, '/', 1) = OLD.id::text;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically delete images when item is deleted
CREATE TRIGGER delete_item_images_trigger
BEFORE DELETE ON items
FOR EACH ROW
EXECUTE FUNCTION delete_item_images(); 