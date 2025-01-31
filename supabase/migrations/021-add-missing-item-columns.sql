-- Add missing columns to items table if they don't exist
DO $$
BEGIN
    -- Add category column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'items' AND column_name = 'category'
    ) THEN
        ALTER TABLE items ADD COLUMN category TEXT NOT NULL;
    END IF;

    -- Add quality column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'items' AND column_name = 'quality'
    ) THEN
        ALTER TABLE items ADD COLUMN quality TEXT NOT NULL;
    END IF;

    -- Add location column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'items' AND column_name = 'location'
    ) THEN
        ALTER TABLE items ADD COLUMN location TEXT NOT NULL;
    END IF;

    -- Add status column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'items' AND column_name = 'status'
    ) THEN
        ALTER TABLE items ADD COLUMN status TEXT NOT NULL DEFAULT 'available';
    END IF;

    -- Add views column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'items' AND column_name = 'views'
    ) THEN
        ALTER TABLE items ADD COLUMN views INTEGER NOT NULL DEFAULT 0;
    END IF;

    -- Add favorites column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'items' AND column_name = 'favorites'
    ) THEN
        ALTER TABLE items ADD COLUMN favorites INTEGER NOT NULL DEFAULT 0;
    END IF;

    -- Add conversations column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'items' AND column_name = 'conversations'
    ) THEN
        ALTER TABLE items ADD COLUMN conversations INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$; 