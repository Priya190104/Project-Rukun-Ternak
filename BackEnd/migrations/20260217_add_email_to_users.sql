-- Migration: Add email column to users table
-- Created: 2026-02-17
-- Purpose: Support password reset feature

-- Add email column (allow NULL initially for existing users)
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Add unique constraint on email (only for non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON users(email) WHERE email IS NOT NULL;

-- Add index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Add comment to column
COMMENT ON COLUMN users.email IS 'User email address (required for password reset)';

-- Display warning for existing users without email
DO $$
DECLARE
    users_without_email INTEGER;
BEGIN
    SELECT COUNT(*) INTO users_without_email FROM users WHERE email IS NULL;
    IF users_without_email > 0 THEN
        RAISE NOTICE '⚠️  Warning: % existing users do not have email addresses.', users_without_email;
        RAISE NOTICE '   Please update their emails for password reset feature to work.';
    END IF;
END $$;
