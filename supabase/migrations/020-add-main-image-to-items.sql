-- Add main_image column to items table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'items'
        AND column_name = 'main_image'
    ) THEN
        ALTER TABLE items 
        ADD COLUMN main_image TEXT;
    END IF;
END $$;

-- Create a trigger to ensure main_image is always in the images array
CREATE OR REPLACE FUNCTION ensure_main_image_in_images()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.main_image IS NOT NULL AND NOT (NEW.main_image = ANY(NEW.images)) THEN
        NEW.images = array_append(NEW.images, NEW.main_image);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_main_image_in_images_trigger ON items;
CREATE TRIGGER ensure_main_image_in_images_trigger
BEFORE INSERT OR UPDATE ON items
FOR EACH ROW
EXECUTE FUNCTION ensure_main_image_in_images(); 