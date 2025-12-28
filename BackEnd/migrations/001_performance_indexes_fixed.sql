-- =====================================================================
-- RUKUN TERNAK PROJECT - PERFORMANCE OPTIMIZATION MIGRATION (FIXED)
-- =====================================================================
-- Purpose: Create composite indexes for query optimization

-- Index 1: Composite index for kelompok filter + date sort
CREATE INDEX IF NOT EXISTS idx_laporan_kelompok_tanggal 
ON laporan(kelompok_id, tanggal DESC)
WHERE kelompok_id IS NOT NULL;

-- Index 2: Composite index for user filter + date sort
CREATE INDEX IF NOT EXISTS idx_laporan_user_tanggal 
ON laporan(user_id, tanggal DESC)
WHERE user_id IS NOT NULL;

-- Index 3: Case-insensitive jenis filtering
CREATE INDEX IF NOT EXISTS idx_laporan_jenis_lower 
ON laporan(LOWER(jenis));

-- Index 4: Date sorting for latest records
CREATE INDEX IF NOT EXISTS idx_laporan_tanggal_desc 
ON laporan(tanggal DESC);

-- Run verification
SELECT 
  schemaname, 
  tablename, 
  indexname 
FROM pg_indexes 
WHERE tablename = 'laporan' 
ORDER BY indexname;
