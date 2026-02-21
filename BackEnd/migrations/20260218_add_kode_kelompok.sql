-- Migration: Add kode_kelompok column to kelompok table
-- Tanggal: 2026-02-18
-- Deskripsi: Menambahkan kolom kode_kelompok (VARCHAR) yang dapat diinput dan diedit oleh user.
--            Kolom ini bersifat unik dan opsional (bisa null untuk kelompok lama).
--            ID integer internal (primary key) tidak diubah.

ALTER TABLE kelompok 
ADD COLUMN IF NOT EXISTS kode_kelompok VARCHAR(50) DEFAULT NULL;

-- Create unique index (allow NULLs - multiple NULLs are allowed in PostgreSQL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_kelompok_kode_kelompok 
ON kelompok (kode_kelompok) 
WHERE kode_kelompok IS NOT NULL;

-- Optional: tambahkan comment untuk dokumentasi
COMMENT ON COLUMN kelompok.kode_kelompok IS 'Kode/ID kelompok yang dapat diinput dan diedit oleh pengguna. Unik dan opsional.';
