-- Migration: Add updated_at to update_ternak table
-- Date: 2025-12-28
-- Purpose: Track when update_ternak record is modified

ALTER TABLE update_ternak ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updateternak_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_updateternak_timestamp ON update_ternak;
CREATE TRIGGER update_updateternak_timestamp BEFORE UPDATE ON update_ternak
  FOR EACH ROW EXECUTE FUNCTION update_updateternak_updated_at();

-- Add comment
COMMENT ON COLUMN update_ternak.updated_at IS 'Waktu record terakhir diupdate';
