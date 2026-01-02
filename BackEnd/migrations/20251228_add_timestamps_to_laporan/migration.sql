-- Migration: Add timestamps to laporan table
-- Date: 2025-12-28
-- Purpose: Track when laporan is created and last updated

ALTER TABLE laporan ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE laporan ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_laporan_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_laporan_timestamp ON laporan;
CREATE TRIGGER update_laporan_timestamp BEFORE UPDATE ON laporan
  FOR EACH ROW EXECUTE FUNCTION update_laporan_updated_at();

-- Add comment
COMMENT ON COLUMN laporan.created_at IS 'Waktu laporan dibuat';
COMMENT ON COLUMN laporan.updated_at IS 'Waktu laporan terakhir diupdate';
