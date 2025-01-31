-- Make email field optional in invites table
ALTER TABLE invites ALTER COLUMN email DROP NOT NULL; 