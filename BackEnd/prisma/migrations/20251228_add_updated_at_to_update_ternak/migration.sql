-- Add updated_at timestamp to update_ternak table for audit trail (if not already exists)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'update_ternak' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE update_ternak ADD COLUMN updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;
END $$;

-- Create trigger function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_update_ternak_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on any UPDATE
DROP TRIGGER IF EXISTS trigger_update_ternak_updated_at ON update_ternak;
CREATE TRIGGER trigger_update_ternak_updated_at
BEFORE UPDATE ON update_ternak
FOR EACH ROW
EXECUTE FUNCTION update_update_ternak_updated_at();

COMMENT ON COLUMN update_ternak.updated_at IS 'Waktu perubahan terakhir update ternak';
