-- Create a new storage bucket for item images if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'items-images'
    ) THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('items-images', 'items-images', false);
    END IF;
END $$;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "View item images" ON storage.objects;
DROP POLICY IF EXISTS "Upload item images" ON storage.objects;
DROP POLICY IF EXISTS "Delete own item images" ON storage.objects;

-- Create policies
-- Allow viewing images that are referenced in items
CREATE POLICY "View item images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'items-images' AND (
  EXISTS (
    SELECT 1 FROM public.items 
    WHERE SPLIT_PART(storage.objects.name, '/', 1) = ANY(items.images)
  ) OR
  SPLIT_PART(storage.objects.name, '/', 1) = 'new'
));

-- Allow uploading images for own items or new items
CREATE POLICY "Upload item images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'items-images' AND (
    EXISTS (
      SELECT 1 FROM public.items 
      WHERE items.user_id = auth.uid() 
      AND SPLIT_PART(storage.objects.name, '/', 1) = items.id::text
    ) OR
    SPLIT_PART(storage.objects.name, '/', 1) = 'new'
  )
);

-- Allow deleting own item images
CREATE POLICY "Delete own item images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'items-images' AND (
    EXISTS (
      SELECT 1 FROM public.items 
      WHERE items.user_id = auth.uid() 
      AND SPLIT_PART(storage.objects.name, '/', 1) = items.id::text
    ) OR
    SPLIT_PART(storage.objects.name, '/', 1) = 'new'
  )
); 