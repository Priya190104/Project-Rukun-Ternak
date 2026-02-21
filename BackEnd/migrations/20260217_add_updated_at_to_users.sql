-- Add updated_at column to users table for password update tracking
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
  END IF;
END $$;

-- Add index for updated_at for potential queries
CREATE INDEX IF NOT EXISTS idx_users_updated_at ON users(updated_at);

-- Add comment
COMMENT ON COLUMN users.updated_at IS 'Timestamp when user record was last updated';
