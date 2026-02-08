/**
 * CACHE MONITORING ROUTES: src/routes/cacheRoutes.js
 * 
 * Admin endpoints for monitoring and managing caches:
 * - GET  /api/cache/status       - Cache statistics
 * - GET  /api/cache/queries      - Query cache performance
 * - POST /api/cache/invalidate   - Invalidate all caches
 * - POST /api/cache/reset-stats  - Reset statistics
 */

const express = require('express');
const router = express.Router();
const { dashboardCache, statsCache, getCacheStats, invalidateAllCaches } = require('../middleware/cache');
const queryCache = require('../utils/queryCache');

/**
 * GET /cache/status
 * Dashboard and stats cache health
 */
router.get('/status', (req, res) => {
  try {
    // Allow admin or viewer
    if (req.user?.role !== 'admin' && req.user?.role !== 'viewer') {
      return res.status(403).json({ success: false, message: 'Admin/Viewer access required' });
    }

    const cacheStats = getCacheStats();
    return res.json({
      success: true,
      data: {
        ...cacheStats,
        timestamp: new Date().toISOString(),
        dashboardCacheKeys: dashboardCache.keys().length,
        statsCacheKeys: statsCache.keys().length
      }
    });
  } catch (error) {
    console.error('[cacheRoutes] Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /cache/queries
 * Query-level cache performance metrics
 */
router.get('/queries', (req, res) => {
  try {
    // Allow admin or viewer
    if (req.user?.role !== 'admin' && req.user?.role !== 'viewer') {
      return res.status(403).json({ success: false, message: 'Admin/Viewer access required' });
    }

    const stats = queryCache.getStats();
    return res.json({
      success: true,
      data: {
        ...stats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[cacheRoutes] Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /cache/invalidate
 * Force invalidate all caches (admin only)
 */
router.post('/invalidate', (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const result = invalidateAllCaches();
    return res.json({
      success: true,
      message: 'All caches invalidated',
      data: {
        ...result,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[cacheRoutes] Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /cache/reset-stats
 * Reset cache and query statistics (admin only)
 */
router.post('/reset-stats', (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    queryCache.resetStats();
    return res.json({
      success: true,
      message: 'Cache statistics reset',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[cacheRoutes] Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
