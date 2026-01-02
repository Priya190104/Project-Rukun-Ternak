-- Add bobot column to update_ternak table
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'update_ternak' AND column_name = 'bobot'
  ) THEN
    ALTER TABLE update_ternak ADD COLUMN bobot DOUBLE PRECISION;
  END IF;
END $$;

COMMENT ON COLUMN update_ternak.bobot IS 'Bobot hewan yang diupdate (kg)';
