-- Migration: Add fields for Penyaluran & Bantuan feature
-- Date: 2025-12-29
-- Purpose: Support auto-generated hewan ternak and initial laporan from kelompok creation

-- 1. Add 'source' field to hewan_ternak table
ALTER TABLE hewan_ternak
ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'Kelahiran';

-- Add index on source field for filtering
CREATE INDEX IF NOT EXISTS idx_hewan_ternak_source ON hewan_ternak(source);

-- 2. Add 'laporan_type' field to laporan table
ALTER TABLE laporan
ADD COLUMN IF NOT EXISTS laporan_type VARCHAR(100) DEFAULT 'regular';

-- Add index on laporan_type field
CREATE INDEX IF NOT EXISTS idx_laporan_laporan_type ON laporan(laporan_type);

-- 3. Verify kelompok table has pakan_list and kesehatan_list (should already exist)
-- These columns should exist from previous migration: 20251228_add_inventory_fields_to_kelompok

COMMIT;
