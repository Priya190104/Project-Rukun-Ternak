-- Migration: Add new fields to kelompok table for inventory & farming data
-- Date: 2025-12-28
-- Purpose: Sync database with UI fields for kandang, ternak, pakan, kesehatan

ALTER TABLE kelompok ADD COLUMN IF NOT EXISTS jumlah_kandang INTEGER;
ALTER TABLE kelompok ADD COLUMN IF NOT EXISTS jumlah_ternak INTEGER;
ALTER TABLE kelompok ADD COLUMN IF NOT EXISTS pakan_list JSONB;
ALTER TABLE kelompok ADD COLUMN IF NOT EXISTS kesehatan_list JSONB;

-- Add comment for clarity
COMMENT ON COLUMN kelompok.jumlah_kandang IS 'Jumlah kandang yang dimiliki kelompok';
COMMENT ON COLUMN kelompok.jumlah_ternak IS 'Total ternak yang dimiliki kelompok';
COMMENT ON COLUMN kelompok.pakan_list IS 'List pakan dalam format JSON: [{jenisPakan, jumlahPakan}]';
COMMENT ON COLUMN kelompok.kesehatan_list IS 'List kesehatan/vaksin dalam format JSON: [{jenisKesehatan, jumlah}]';
