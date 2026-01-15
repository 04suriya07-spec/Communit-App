-- Add password_hash column to auth_profiles table
-- Run this in Supabase SQL Editor if Prisma migration is stuck

ALTER TABLE auth_profiles 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'auth_profiles'
ORDER BY ordinal_position;
