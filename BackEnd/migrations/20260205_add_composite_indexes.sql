-- =====================================================================
-- RUKUN TERNAK PROJECT - ADD COMPOSITE INDEXES
-- =====================================================================
-- Purpose: Optimize queries filtering by status and date

-- Composite index for hewan_ternak: status + tanggal_lahir DESC (for age queries)
CREATE INDEX IF NOT EXISTS idx_hewan_ternak_status_tanggal_lahir 
ON hewan_ternak(status, tanggal_lahir DESC)
WHERE status != 'TERJUAL';

-- Composite index for hewan_ternak: kelompok_id + status + tanggal_lahir
CREATE INDEX IF NOT EXISTS idx_hewan_ternak_kelompok_status_tanggal 
ON hewan_ternak(kelompok_id, status, tanggal_lahir DESC)
WHERE status IN ('AKTIF', 'TIDAK_AKTIF');

-- Composite index for update_ternak: kelompok_id + status + tanggal_update
CREATE INDEX IF NOT EXISTS idx_update_ternak_kelompok_status_tanggal 
ON update_ternak(kelompok_id, status, tanggal_update DESC);

-- Index for hewan_ternak: source filter (often queried)
CREATE INDEX IF NOT EXISTS idx_hewan_ternak_source 
ON hewan_ternak(source, tanggal_lahir DESC);

-- Verification query
SELECT 
  schemaname, 
  tablename, 
  indexname 
FROM pg_indexes 
WHERE tablename IN ('hewan_ternak', 'update_ternak')
ORDER BY tablename, indexname;
