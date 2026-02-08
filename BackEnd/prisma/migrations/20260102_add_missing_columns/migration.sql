-- Add missing columns to hewan_ternak if not exists
ALTER TABLE hewan_ternak
ADD COLUMN IF NOT EXISTS tanggal_terjual TIMESTAMP;

ALTER TABLE hewan_ternak
ADD COLUMN IF NOT EXISTS umur_saat_terjual INTEGER;
