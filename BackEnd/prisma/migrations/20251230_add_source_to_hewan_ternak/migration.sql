-- AddColumn source to hewan_ternak if it doesn't exist
ALTER TABLE "hewan_ternak"
ADD COLUMN IF NOT EXISTS "source" VARCHAR(50) NOT NULL DEFAULT 'Kelahiran';

-- Create index on source column for performance
CREATE INDEX IF NOT EXISTS "idx_hewan_ternak_source" ON "hewan_ternak"("source");
