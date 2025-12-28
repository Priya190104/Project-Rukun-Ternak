/**
 * CACHE MIDDLEWARE: src/middleware/cache.js
 * 
 * In-memory caching for frequently accessed dashboard/stats data
 * TTL: 5 minutes for dashboard, 10 minutes for stats
 * 
 * Features:
 * - Automatic TTL expiration
 * - Manual invalidation on writes
 * - Cache statistics for monitoring
 */

const NodeCache = require('node-cache');

// Initialize caches with different TTLs
const dashboardCache = new NodeCache({
  stdTTL: 300,        // 5 minutes standard TTL
  checkperiod: 60,    // Check for expired keys every 60 seconds
  useClones: true     // Clone data to prevent external mutations
});

const statsCache = new NodeCache({
  stdTTL: 600,        // 10 minutes standard TTL
  checkperiod: 120,
  useClones: true
});

// Cache statistics tracking
let cacheStats = {
  hits: 0,
  misses: 0,
  invalidations: 0,
  startTime: Date.now()
};

/**
 * Middleware: Attach cache methods to response object
 */
function cacheMiddleware(req, res, next) {
  // Add cache methods to response
  res.setDashboardCache = (key, value, ttl = 300) => {
    dashboardCache.set(key, value, ttl);
    cacheStats.hits++;
  };

  res.getDashboardCache = (key) => {
    const value = dashboardCache.get(key);
    if (value) {
      cacheStats.hits++;
    } else {
      cacheStats.misses++;
    }
    return value;
  };

  res.setStatsCache = (key, value, ttl = 600) => {
    statsCache.set(key, value, ttl);
  };

  res.getStatsCache = (key) => {
    const value = statsCache.get(key);
    if (value) {
      cacheStats.hits++;
    } else {
      cacheStats.misses++;
    }
    return value;
  };

  next();
}

/**
 * Invalidate dashboard cache for a specific user/kelompok
 */
function invalidateUserDashboard(userId, kelompokId = null) {
  const keys = [
    `dashboard_${userId}`,
    `dashboard_user_${userId}`,
    `monthly_${userId}`
  ];

  if (kelompokId) {
    keys.push(`dashboard_kelompok_${kelompokId}`);
    keys.push(`dashboard_${kelompokId}`);
    keys.push(`monthly_kelompok_${kelompokId}`);
  }

  keys.forEach(key => {
    if (dashboardCache.has(key)) {
      dashboardCache.del(key);
      cacheStats.invalidations++;
    }
  });

  return keys;
}

/**
 * Invalidate stats cache for a specific kelompok
 */
function invalidateKelompokStats(kelompokId) {
  const keys = [
    `summary_kelompok_${kelompokId}`,
    `stats_kelompok_${kelompokId}`,
    `dashboard_${kelompokId}`
  ];

  keys.forEach(key => {
    if (statsCache.has(key)) {
      statsCache.del(key);
      cacheStats.invalidations++;
    }
  });

  return keys;
}

/**
 * Invalidate all caches (use sparingly)
 */
function invalidateAllCaches() {
  const dashboardKeys = dashboardCache.keys().length;
  const statsKeys = statsCache.keys().length;

  dashboardCache.flushAll();
  statsCache.flushAll();
  cacheStats.invalidations += (dashboardKeys + statsKeys);

  console.log(`[Cache] All caches invalidated (${dashboardKeys + statsKeys} keys)`);
  
  return {
    dashboardKeysInvalidated: dashboardKeys,
    statsKeysInvalidated: statsKeys
  };
}

/**
 * Get cache statistics and health
 */
function getCacheStats() {
  const uptime = Date.now() - cacheStats.startTime;
  const hitRate = cacheStats.hits / (cacheStats.hits + cacheStats.misses);

  return {
    dashboard: {
      keys: dashboardCache.keys().length,
      ttl: '5 minutes'
    },
    stats: {
      keys: statsCache.keys().length,
      ttl: '10 minutes'
    },
    statistics: {
      totalHits: cacheStats.hits,
      totalMisses: cacheStats.misses,
      hitRate: isNaN(hitRate) ? 0 : (hitRate * 100).toFixed(2) + '%',
      totalInvalidations: cacheStats.invalidations,
      uptime: Math.floor(uptime / 1000) + 's'
    }
  };
}

/**
 * Reset cache statistics
 */
function resetCacheStats() {
  const prev = { ...cacheStats };
  cacheStats = {
    hits: 0,
    misses: 0,
    invalidations: 0,
    startTime: Date.now()
  };
  return prev;
}

/**
 * Express endpoint: GET /api/admin/cache/status
 * Returns cache statistics and performance metrics
 */
function createCacheStatusRoute(router, authenticateAdmin) {
  router.get('/admin/cache/status', authenticateAdmin, (req, res) => {
    return res.json({
      success: true,
      data: {
        ...getCacheStats(),
        endpoints: {
          invalidateAll: 'POST /api/admin/cache/invalidate',
          statistics: 'GET /api/admin/cache/statistics'
        }
      }
    });
  });

  router.get('/admin/cache/statistics', authenticateAdmin, (req, res) => {
    return res.json({
      success: true,
      data: getCacheStats()
    });
  });

  router.post('/admin/cache/invalidate', authenticateAdmin, (req, res) => {
    const result = invalidateAllCaches();
    return res.json({
      success: true,
      message: 'All caches invalidated',
      data: result
    });
  });

  return router;
}

/**
 * Auto-clear cache on interval (optional)
 * Useful for preventing memory leaks in long-running servers
 */
function startCacheMaintenanceTimer(intervalSeconds = 3600) {
  return setInterval(() => {
    const dashboardKeysCount = dashboardCache.keys().length;
    const statsKeysCount = statsCache.keys().length;

    if (dashboardKeysCount > 1000 || statsKeysCount > 1000) {
      console.warn(`[Cache] HIGH MEMORY USAGE - Dashboard: ${dashboardKeysCount}, Stats: ${statsKeysCount}`);
      
      // Clear stale entries
      dashboardCache.prune();
      statsCache.prune();
    }
  }, intervalSeconds * 1000);
}

module.exports = {
  // Cache instances
  dashboardCache,
  statsCache,

  // Middleware
  cacheMiddleware,

  // Invalidation functions
  invalidateUserDashboard,
  invalidateKelompokStats,
  invalidateAllCaches,

  // Statistics
  getCacheStats,
  resetCacheStats,

  // Router setup
  createCacheStatusRoute,

  // Maintenance
  startCacheMaintenanceTimer
};
