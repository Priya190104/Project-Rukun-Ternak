-- Add id_hewan column to hewan_ternak table
-- This allows storing user-provided identifier separately from database ID

ALTER TABLE hewan_ternak
ADD COLUMN id_hewan VARCHAR(255) NULL;

-- Create unique constraint (per kelompok is better, but we'll use global unique for simplicity)
CREATE UNIQUE INDEX idx_hewan_ternak_id_hewan ON hewan_ternak(id_hewan) WHERE id_hewan IS NOT NULL;

-- Update the index to include id_hewan for better query performance
CREATE INDEX idx_hewan_ternak_kelompok_id_hewan ON hewan_ternak(kelompok_id, id_hewan) WHERE id_hewan IS NOT NULL;

COMMIT;
