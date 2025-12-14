-- Add optional geo coordinates for map display
ALTER TABLE "kelompok" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
ALTER TABLE "kelompok" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;
