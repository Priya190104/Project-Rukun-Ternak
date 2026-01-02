-- Add tanggal_status_tidak_aktif column to hewan_ternak
-- This column stores the date when hewan status changes to TIDAK_AKTIF
-- Used to freeze the age calculation (umur) at the time of death

ALTER TABLE "hewan_ternak" ADD COLUMN "tanggal_status_tidak_aktif" TIMESTAMP(3) NULL;

-- Add comment for documentation
COMMENT ON COLUMN "hewan_ternak"."tanggal_status_tidak_aktif" IS 'Tanggal ketika status berubah menjadi TIDAK_AKTIF (untuk freeze perhitungan umur)';
