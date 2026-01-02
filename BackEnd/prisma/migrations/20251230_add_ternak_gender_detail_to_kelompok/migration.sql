-- Add gender-detailed ternak columns to kelompok table
ALTER TABLE kelompok ADD COLUMN ternak_jantan INTEGER;
ALTER TABLE kelompok ADD COLUMN ternak_betina INTEGER;

-- Add comments for documentation
COMMENT ON COLUMN kelompok.ternak_jantan IS 'Jumlah hewan ternak jantan yang disalurkan';
COMMENT ON COLUMN kelompok.ternak_betina IS 'Jumlah hewan ternak betina yang disalurkan';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_kelompok_ternak_gender ON kelompok(id, ternak_jantan, ternak_betina);
