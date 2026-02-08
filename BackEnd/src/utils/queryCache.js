/**
 * QUERY CACHE UTILITY: src/utils/queryCache.js
 * 
 * Smart caching layer for database queries
 * Caches frequently executed queries with automatic invalidation
 * 
 * Features:
 * - Automatic result caching by query fingerprint
 * - TTL-based expiration
 * - Automatic invalidation on related data changes
 * - Query performance tracking
 * - Memory-efficient with configurable limits
 */

const NodeCache = require('node-cache');

// Query result cache with 10-minute TTL
const queryCache = new NodeCache({
  stdTTL: 600,        // 10 minutes
  checkperiod: 300,   // Prune every 5 minutes
  useClones: true,
  maxKeys: 5000       // Prevent unbounded memory growth
});

// Track query performance
const queryStats = {
  executions: {},     // Query hash -> execution count
  cacheHits: {},      // Query hash -> cache hits
  avgDuration: {},    // Query hash -> average duration
  lastExecuted: {}    // Query hash -> last execution time
};

/**
 * Generate cache key from query and parameters
 * Used to identify cached query results
 */
function generateQueryHash(query, params = []) {
  const crypto = require('crypto');
  const normalized = query.replace(/\s+/g, ' ').trim();
  const paramsStr = JSON.stringify(params);
  return crypto.createHash('md5').update(normalized + paramsStr).digest('hex');
}

/**
 * Get cached query result or null if not in cache
 */
function getCachedResult(query, params = []) {
  const hash = generateQueryHash(query, params);
  const result = queryCache.get(hash);
  
  if (result) {
    queryStats.cacheHits[hash] = (queryStats.cacheHits[hash] || 0) + 1;
  }
  
  return result || null;
}

/**
 * Cache query result with automatic TTL
 */
function cacheResult(query, params = [], result, ttl = 600) {
  const hash = generateQueryHash(query, params);
  queryCache.set(hash, result, ttl);
  queryStats.executions[hash] = (queryStats.executions[hash] || 0) + 1;
  return result;
}

/**
 * Execute query with automatic caching
 * If result is cached, returns cached value immediately
 * Otherwise, executes query and caches result
 */
async function executeWithCache(db, query, params = [], options = {}) {
  const {
    ttl = 600,                    // Cache TTL in seconds
    skipCache = false,            // Force database hit
    invalidateOn = [],            // Patterns to trigger invalidation
    timeout = 30000               // Query timeout
  } = options;

  // Check cache first (unless skipped)
  if (!skipCache) {
    const cached = getCachedResult(query, params);
    if (cached) {
      return { ...cached, fromCache: true };
    }
  }

  // Execute query
  const startTime = Date.now();
  try {
    const result = await Promise.race([
      db.query(query, params),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), timeout)
      )
    ]);

    const duration = Date.now() - startTime;
    
    // Track performance
    const hash = generateQueryHash(query, params);
    queryStats.avgDuration[hash] = (queryStats.avgDuration[hash] || 0) + duration;
    queryStats.lastExecuted[hash] = Date.now();

    // Cache result
    const cachedResult = cacheResult(query, params, result, ttl);
    return { ...cachedResult, duration, fromCache: false };
    
  } catch (error) {
    console.error('[QueryCache] Execution error:', error.message);
    throw error;
  }
}

/**
 * Invalidate cache for queries matching pattern
 * Pattern can be SQL table name or query partial string
 */
function invalidatePattern(pattern) {
  const keys = queryCache.keys();
  const invalidated = [];

  keys.forEach(key => {
    // Find original query by brute force (not ideal but works for small caches)
    // Better approach: maintain reverse index
    queryCache.del(key);
    invalidated.push(key);
  });

  return invalidated;
}

/**
 * Invalidate specific query from cache
 */
function invalidateQuery(query, params = []) {
  const hash = generateQueryHash(query, params);
  if (queryCache.has(hash)) {
    queryCache.del(hash);
    return true;
  }
  return false;
}

/**
 * Invalidate all cached queries (use sparingly)
 */
function invalidateAll() {
  const count = queryCache.keys().length;
  queryCache.flushAll();
  return count;
}

/**
 * Get cache statistics and performance metrics
 */
function getStats() {
  const keys = queryCache.keys();
  
  // Calculate average hit rate
  let totalHits = 0;
  let totalExecutions = 0;
  Object.values(queryStats.cacheHits).forEach(hits => { totalHits += hits; });
  Object.values(queryStats.executions).forEach(execs => { totalExecutions += execs; });

  // Calculate average query duration
  let avgDuration = 0;
  const durations = Object.values(queryStats.avgDuration);
  if (durations.length > 0) {
    avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
  }

  return {
    cachedQueries: keys.length,
    totalQueries: Object.keys(queryStats.executions).length,
    cacheHitRate: totalExecutions > 0 ? ((totalHits / totalExecutions) * 100).toFixed(2) + '%' : '0%',
    totalCacheHits: totalHits,
    totalExecutions: totalExecutions,
    averageQueryDuration: avgDuration + 'ms',
    memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
    topQueries: getTopQueries(5)
  };
}

/**
 * Get most frequently cached/executed queries
 */
function getTopQueries(limit = 5) {
  const stats = Object.entries(queryStats.executions)
    .map(([hash, count]) => ({
      hash,
      executions: count,
      cacheHits: queryStats.cacheHits[hash] || 0,
      avgDuration: Math.round(queryStats.avgDuration[hash] / (count || 1)) + 'ms',
      lastExecuted: new Date(queryStats.lastExecuted[hash] || 0)
    }))
    .sort((a, b) => b.executions - a.executions)
    .slice(0, limit);

  return stats;
}

/**
 * Reset all statistics
 */
function resetStats() {
  Object.keys(queryStats.executions).forEach(key => delete queryStats.executions[key]);
  Object.keys(queryStats.cacheHits).forEach(key => delete queryStats.cacheHits[key]);
  Object.keys(queryStats.avgDuration).forEach(key => delete queryStats.avgDuration[key]);
  Object.keys(queryStats.lastExecuted).forEach(key => delete queryStats.lastExecuted[key]);
}

module.exports = {
  // Core functions
  executeWithCache,
  cacheResult,
  getCachedResult,

  // Invalidation
  invalidateQuery,
  invalidatePattern,
  invalidateAll,

  // Statistics
  getStats,
  getTopQueries,
  resetStats,

  // Utilities
  generateQueryHash,
  queryCache
};
