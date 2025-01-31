-- Enable the UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop ALL existing policies on items table
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    -- Drop all policies for the items table
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'items'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON items', pol.policyname);
    END LOOP;
END $$;

-- Disable RLS
ALTER TABLE items DISABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  avatar_url TEXT,
  location TEXT,
  bio TEXT,
  rating DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Modify items table to use UUID and add foreign keys
ALTER TABLE items 
  ALTER COLUMN id TYPE UUID USING id::UUID,
  ALTER COLUMN id SET DEFAULT uuid_generate_v4(),
  DROP COLUMN IF EXISTS category,
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id),
  ALTER COLUMN user_id TYPE UUID USING user_id::UUID,
  ADD FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- Re-enable RLS on items
ALTER TABLE items ENABLE ROW LEVEL SECURITY; 