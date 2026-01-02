-- Drop old global UNIQUE constraint on id_hewan if it exists
ALTER TABLE hewan_ternak DROP CONSTRAINT IF EXISTS "hewan_ternak_id_hewan_key";

-- Add new UNIQUE constraint per kelompok (id_hewan, kelompok_id composite key)
ALTER TABLE hewan_ternak ADD CONSTRAINT "hewan_ternak_kelompok_id_hewan_key" UNIQUE (kelompok_id, id_hewan);

-- Create index for better performance on queries filtering by kelompok_id and id_hewan
CREATE INDEX IF NOT EXISTS "hewan_ternak_kelompok_id_hewan_idx" ON hewan_ternak(kelompok_id, id_hewan);
