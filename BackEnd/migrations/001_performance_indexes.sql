-- =====================================================================
-- RUKUN TERNAK PROJECT - PERFORMANCE OPTIMIZATION MIGRATION
-- =====================================================================
-- Purpose: Create indexes to improve query performance for concurrent users
-- Expected Impact: 
--   - Laporan list queries: 8-12s → 500-800ms (10-15x faster)
--   - Dashboard queries: 5-12s → 1-2s (5-7x faster)
--   - Sustainable concurrent users: 50 → 200+ (4x improvement)
-- =====================================================================

-- START TRANSACTION
BEGIN;

-- =====================================================================
-- PHASE 1: COMPOSITE INDEXES FOR MAIN QUERIES
-- =====================================================================
-- These indexes are CRITICAL for the optimized queries

-- Index 1: Laporan filtering by kelompok_id + sorting by tanggal DESC
-- Used by: GET /api/laporan/list when filtering by kelompok
-- Query: SELECT id FROM laporan WHERE kelompok_id = ? ORDER BY tanggal DESC
CREATE INDEX IF NOT EXISTS idx_laporan_kelompok_tanggal 
ON laporan(kelompok_id, tanggal DESC)
WHERE kelompok_id IS NOT NULL;

-- Index 2: Laporan filtering by user_id + sorting by tanggal DESC  
-- Used by: GET /api/laporan/list when filtering by user
-- Query: SELECT id FROM laporan WHERE user_id = ? ORDER BY tanggal DESC
CREATE INDEX IF NOT EXISTS idx_laporan_user_tanggal 
ON laporan(user_id, tanggal DESC)
WHERE user_id IS NOT NULL;

-- Index 3: Case-insensitive jenis filtering
-- Used by: GET /api/laporan/list when filtering by jenis
-- IMPORTANT: This allows filtering without LOWER() function
-- Query: SELECT id FROM laporan WHERE LOWER(jenis) = 'value'
CREATE INDEX IF NOT EXISTS idx_laporan_jenis_lower 
ON laporan(LOWER(jenis));

-- =====================================================================
-- PHASE 2: INDEXES FOR AGGREGATION QUERIES
-- =====================================================================

-- Index 4: Date grouping for monthly statistics
-- Used by: GET /api/stats/dashboard (GROUP BY month)
-- Query: GROUP BY date_trunc('month', tanggal)
CREATE INDEX IF NOT EXISTS idx_laporan_date_trunc_month
ON laporan(date_trunc('month', tanggal));

-- Index 5: Date range queries (for "this month", "this year" stats)
-- Used by: GET /api/stats/summary
-- Query: WHERE tanggal >= ? AND tanggal <= ?
CREATE INDEX IF NOT EXISTS idx_laporan_tanggal_range 
ON laporan(tanggal DESC)
WHERE tanggal >= NOW() - INTERVAL '1 year';

-- =====================================================================
-- PHASE 3: VERIFY EXISTING INDEXES
-- =====================================================================
-- These should already exist; verify they are present

-- Check existing indexes (admin should verify manually)
-- SELECT indexname, tablename, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'laporan'
-- ORDER BY indexname;

-- =====================================================================
-- PHASE 4: INDEX STATISTICS UPDATES
-- =====================================================================
-- Update statistics so query planner uses these indexes correctly

ANALYZE laporan;
ANALYZE users;
ANALYZE kelompok;

-- =====================================================================
-- PHASE 5: VERIFY MIGRATION
-- =====================================================================
-- These queries verify the indexes were created successfully

-- Query 1: Check all laporan indexes
SELECT 
  indexname,
  indexdef,
  (SELECT pg_size_pretty(pg_relation_size(indexrelname::regclass)) 
   FROM pg_stat_user_indexes 
   WHERE indexname = idx.indexname) as index_size
FROM pg_indexes idx
WHERE tablename = 'laporan'
ORDER BY indexname;

-- Query 2: Check index utilization
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename = 'laporan'
ORDER BY idx_scan DESC;

-- =====================================================================
-- CLEANUP & NOTES
-- =====================================================================
-- If migration fails, run ROLLBACK to undo changes
-- After successful migration:
-- 1. Run VACUUM ANALYZE on laporan table
-- 2. Monitor slow query log for further optimizations
-- 3. Check index usage after 1 week of load testing

-- COMMIT TRANSACTION
COMMIT;

-- =====================================================================
-- OPTIONAL: MONITORING QUERIES (run after deployment)
-- =====================================================================

-- Monitor index performance (run weekly)
-- SELECT 
--   schemaname,
--   tablename,
--   indexname,
--   idx_scan,
--   idx_tup_read,
--   idx_tup_fetch,
--   pg_size_pretty(pg_relation_size(indexrelname::regclass)) as index_size
-- FROM pg_stat_user_indexes
-- WHERE tablename = 'laporan'
-- ORDER BY idx_scan DESC;

-- Monitor unused indexes (to remove later)
-- SELECT 
--   schemaname,
--   tablename,
--   indexname,
--   idx_scan,
--   pg_size_pretty(pg_relation_size(indexrelname::regclass)) as index_size
-- FROM pg_stat_user_indexes
-- WHERE tablename = 'laporan'
-- AND idx_scan = 0
-- AND indexname NOT LIKE 'pg_toast%'
-- ORDER BY pg_relation_size(indexrelname::regclass) DESC;

-- Monitor table bloat (to run VACUUM if needed)
-- SELECT 
--   schemaname,
--   tablename,
--   round(100.0 * (pg_total_relation_size(schemaname||'.'||tablename) - 
--     pg_relation_size(schemaname||'.'||tablename)) / 
--     pg_total_relation_size(schemaname||'.'||tablename), 2) as bloat_percentage
-- FROM pg_tables
-- WHERE tablename IN ('laporan', 'users', 'kelompok')
-- ORDER BY bloat_percentage DESC;
