-- Drop existing trigger and function
DROP TRIGGER IF EXISTS delete_item_images_trigger ON items;
DROP FUNCTION IF EXISTS delete_item_images();

-- Create updated function to clean up images when an item is deleted
CREATE OR REPLACE FUNCTION delete_item_images()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete all images associated with the item from storage
  DELETE FROM storage.objects 
  WHERE bucket_id = 'items-images' 
  AND SPLIT_PART(name, '/', 1) = ANY(OLD.images);
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically delete images when item is deleted
CREATE TRIGGER delete_item_images_trigger
BEFORE DELETE ON items
FOR EACH ROW
EXECUTE FUNCTION delete_item_images(); 