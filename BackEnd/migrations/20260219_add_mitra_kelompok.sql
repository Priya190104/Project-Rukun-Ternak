-- Migration: Add Mitra Kelompok support
-- Date: 2026-02-19
-- Description: Adds parent_kelompok_id to kelompok table for self-referencing hierarchy
--   Admin -> Kelompok -> Mitra Kelompok

-- 1. Add parent_kelompok_id column to kelompok table
ALTER TABLE kelompok 
  ADD COLUMN IF NOT EXISTS parent_kelompok_id INT REFERENCES kelompok(id) ON DELETE CASCADE;

-- 2. Add index for performance
CREATE INDEX IF NOT EXISTS idx_kelompok_parent ON kelompok(parent_kelompok_id);

-- 3. Add mitra_kelompok role to users (no schema change needed, role is VARCHAR)
--    Future users can have role = 'mitra_kelompok'

-- Verify
-- SELECT id, name, parent_kelompok_id FROM kelompok ORDER BY id;
