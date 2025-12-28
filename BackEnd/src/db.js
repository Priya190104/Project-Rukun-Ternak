/**
 * OPTIMIZED: db.js - Database Connection Pool Configuration
 * 
 * Key Changes:
 * 1. Increased pool size (min: 5, max: 50)
 * 2. Added proper timeout configuration
 * 3. Added monitoring and error handling
 * 4. Added pool status endpoint
 */

const { Pool } = require('pg');
require('dotenv').config();

// Create connection pool with optimized configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  
  // CONNECTION POOL CONFIG
  // min: Minimum connections to keep open
  // max: Maximum concurrent connections
  // Scale formula: max = (expected concurrent users * 2) / 4
  // For 100 concurrent users: max = (100 * 2) / 4 = 50
  // For 300 concurrent users: max = (300 * 2) / 4 = 150 (adjust as needed)
  min: 5,               // Keep 5 connections warm (saves startup time)
  max: 50,              // Allow up to 50 concurrent connections
  
  // TIMEOUT CONFIG
  idleTimeoutMillis: 30000,           // Close idle connections after 30 seconds
  connectionTimeoutMillis: 5000,      // Wait 5s max to acquire a connection
  
  // STATEMENT CONFIG
  statement_timeout: 30000,            // Kill queries after 30 seconds
  idle_in_transaction_session_timeout: 10000,  // Kill idle transactions after 10s
  
  // REPLICATION CONFIG (optional)
  replication: 'off',
  
  // SSL CONFIG (adjust based on your database)
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false
});

// Log pool events
pool.on('connect', () => {
  console.log('[DB Pool] New connection established');
});

pool.on('error', (err, client) => {
  console.error('[DB Pool] Unexpected error on idle client:', {
    code: err.code,
    message: err.message,
    severity: err.severity
  });
});

pool.on('remove', () => {
  console.log('[DB Pool] Connection closed');
});

// Monitor pool utilization in development
if (process.env.NODE_ENV !== 'production') {
  setInterval(() => {
    const status = {
      totalConnections: pool.totalCount,
      idleConnections: pool.idleCount,
      waitingRequests: pool.waitingCount,
      timestamp: new Date().toISOString()
    };
    
    if (status.waitingRequests > 0) {
      console.warn('[DB Pool] ⚠️ QUEUE BUILDING:', status);
    } else if (status.totalConnections > 30) {
      console.warn('[DB Pool] ⚠️ HIGH USAGE:', status);
    } else {
      console.debug('[DB Pool] Status:', status);
    }
  }, 60000); // Every 60 seconds
}

// Query wrapper with logging
async function query(text, params) {
  const startTime = Date.now();
  
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - startTime;
    
    // Log slow queries (>1s)
    if (duration > 1000) {
      console.warn('[DB Query] SLOW QUERY:', {
        duration: duration + 'ms',
        query: text.substring(0, 100),
        paramCount: params?.length || 0
      });
    }
    
    return result;
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.error('[DB Query] ERROR:', {
      duration: duration + 'ms',
      code: error.code,
      message: error.message,
      query: text.substring(0, 100)
    });
    
    throw error;
  }
}

// Query with retry (for transient failures)
async function queryWithRetry(text, params, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await query(text, params);
    } catch (error) {
      lastError = error;
      
      // Only retry on transient errors
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        if (attempt < maxRetries) {
          const delayMs = Math.pow(2, attempt - 1) * 100; // Exponential backoff
          console.warn(`[DB Query] Retry attempt ${attempt}/${maxRetries} after ${delayMs}ms`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }
      }
      
      // Non-transient error, don't retry
      throw error;
    }
  }
  
  throw lastError;
}

// Get pool status (useful for monitoring)
function getPoolStatus() {
  return {
    totalConnections: pool.totalCount,
    availableConnections: pool.idleCount,
    activeConnections: pool.totalCount - pool.idleCount,
    waitingRequests: pool.waitingCount,
    pool: {
      min: 5,
      max: 50
    },
    config: {
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      statementTimeout: 30000
    },
    status: pool.waitingCount > 5 ? 'WARNING: Queue building' : 'OK',
    timestamp: new Date().toISOString()
  };
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[DB Pool] SIGTERM received, closing pool...');
  await pool.end();
  console.log('[DB Pool] Pool closed');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[DB Pool] SIGINT received, closing pool...');
  await pool.end();
  console.log('[DB Pool] Pool closed');
  process.exit(0);
});

// Exports
module.exports = {
  query,
  queryWithRetry,
  getPoolStatus,
  pool
};
