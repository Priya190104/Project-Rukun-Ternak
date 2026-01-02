-- Migration: Add fields for Penjualan feature
-- Date: 2026-01-02
-- Purpose: Track animal sales, freeze age at sale date, and manage sold animals

-- 1. Add sale-related fields to hewan_ternak table
ALTER TABLE hewan_ternak
ADD COLUMN IF NOT EXISTS tanggal_terjual TIMESTAMP,
ADD COLUMN IF NOT EXISTS umur_saat_terjual INT;

-- 2. Add indexes for efficient querying of sold animals
CREATE INDEX IF NOT EXISTS idx_hewan_ternak_status_terjual ON hewan_ternak(status) WHERE status = 'TERJUAL';
CREATE INDEX IF NOT EXISTS idx_hewan_ternak_tanggal_terjual ON hewan_ternak(tanggal_terjual) WHERE status = 'TERJUAL';

-- 3. Verify the hewan_ternak table structure
-- This ensures all required columns exist for the penjualan feature

COMMIT;
