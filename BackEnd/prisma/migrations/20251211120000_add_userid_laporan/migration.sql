-- Add user_id column to Laporan to track owner (client)
ALTER TABLE "laporan" ADD COLUMN IF NOT EXISTS "user_id" INTEGER;
-- Optionally add FK constraint if user table exists and desired:
-- ALTER TABLE "laporan" ADD CONSTRAINT laporan_user_fk FOREIGN KEY ("user_id") REFERENCES "users"(id) ON DELETE SET NULL;