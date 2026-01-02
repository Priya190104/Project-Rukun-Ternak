-- Add id_hewan column to hewan_ternak table
-- This allows storing user-provided identifier separately from database ID
ALTER TABLE "hewan_ternak" ADD COLUMN "id_hewan" VARCHAR(255) NULL;

-- Create unique constraint for id_hewan (where not null)
CREATE UNIQUE INDEX "idx_hewan_ternak_id_hewan" ON "hewan_ternak"("id_hewan") WHERE "id_hewan" IS NOT NULL;

-- Create composite index for better query performance on (kelompok_id, id_hewan)
CREATE INDEX "idx_hewan_ternak_kelompok_id_hewan" ON "hewan_ternak"("kelompok_id", "id_hewan") WHERE "id_hewan" IS NOT NULL;

-- Create index on id_hewan for fast lookups
CREATE INDEX "idx_hewan_ternak_id_hewan_lookup" ON "hewan_ternak"("id_hewan");
