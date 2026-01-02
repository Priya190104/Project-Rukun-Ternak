-- Add audit trail timestamps to laporan table
ALTER TABLE laporan ADD COLUMN created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE laporan ADD COLUMN updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Create trigger function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_laporan_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on any UPDATE
DROP TRIGGER IF EXISTS trigger_laporan_updated_at ON laporan;
CREATE TRIGGER trigger_laporan_updated_at
BEFORE UPDATE ON laporan
FOR EACH ROW
EXECUTE FUNCTION update_laporan_updated_at();

COMMENT ON COLUMN laporan.created_at IS 'Waktu pembuatan laporan';
COMMENT ON COLUMN laporan.updated_at IS 'Waktu perubahan terakhir laporan';
