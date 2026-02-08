require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { attachUser, requireAuth } = require('./src/middleware/auth');
const timeout = require('connect-timeout');
const rateLimit = require('express-rate-limit');
const { cacheMiddleware, startCacheMaintenanceTimer } = require('./src/middleware/cache');

const app = express();
const port = process.env.PORT || 4000;

// CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://202.10.45.79:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

// Apply attachUser middleware GLOBALLY before routes
app.use(attachUser);

// =====================================================================
// REQUEST TIMEOUT MIDDLEWARE
// =====================================================================
// Prevents hanging requests from consuming connections
app.use(timeout('30s'));

// Handle timeout errors
app.use((req, res, next) => {
  if (!req.timedout) {
    next();
  } else {
    res.status(503).json({
      success: false,
      message: 'Request timeout - server too busy'
    });
  }
});

// =====================================================================
// RATE LIMITING
// =====================================================================
// Prevents abuse and helps with connection pool management
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1 minute window
  max: 300,                  // 300 requests per minute per IP
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,     // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,      // Disable `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/ping';
  }
});

app.use('/api/', limiter);

// =====================================================================
// CACHE MIDDLEWARE
// =====================================================================
// Provides cache helpers to controllers
app.use(cacheMiddleware);

// Start cache maintenance timer (clean stale entries every hour)
startCacheMaintenanceTimer(3600);

// routes
try {
  app.use('/api/auth', require('./src/routes/auth'));
  app.use('/api/laporan', require('./src/routes/laporan'));
  app.use('/api/users', require('./src/routes/users'));
  app.use('/api/kelompok', require('./src/routes/kelompok'));
  app.use('/api/notifikasi', require('./src/routes/notifikasi'));
  app.use('/api/stats', require('./src/routes/stats'));
  app.use('/api/public', require('./src/routes/public'));
  app.use('/api/cache', requireAuth, require('./src/routes/cacheRoutes'));
  app.use('/api', require('./src/routes/hewan'));
} catch (err) {
  console.error('Error loading routes:', err.message);
  process.exit(1);
}

app.get('/api/health', (req, res) => res.json({ success: true, data: 'ok' }));

// =====================================================================
// ADMIN HEALTH MONITORING ENDPOINT
// =====================================================================
// Returns server health and stats
app.get('/api/admin/health', (req, res) => {
  const db = require('./src/db');
  
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    server: {
      uptime: process.uptime(),
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
        external: Math.round(process.memoryUsage().external / 1024 / 1024) + 'MB'
      },
      nodejs: process.version
    },
    database: db.getPoolStatus ? db.getPoolStatus() : { status: 'unknown' }
  });
});

app.use('/api', (req, res) => res.status(404).json({ success: false, message: 'API route not found' }));

// =====================================================================
// UNHANDLED REJECTION HANDLER
// =====================================================================
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server] Unhandled Rejection at:', promise, 'reason:', reason);
});

// =====================================================================
// UNCAUGHT EXCEPTION HANDLER
// =====================================================================
process.on('uncaughtException', (error) => {
  console.error('[Server] Uncaught Exception:', error);
  process.exit(1);
});

// =====================================================================
// GRACEFUL SHUTDOWN HANDLER
// =====================================================================
let isShuttingDown = false;

process.on('SIGTERM', async () => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log('[Server] SIGTERM received, starting graceful shutdown...');

  // Stop accepting new requests
  server.close(() => {
    console.log('[Server] HTTP server closed');
  });

  // Close database connection pool
  try {
    const db = require('./src/db');
    if (db.pool) {
      await db.pool.end();
      console.log('[Server] Database pool closed');
    }
  } catch (err) {
    console.error('[Server] Error closing database pool:', err.message);
  }

  // Timeout after 30 seconds
  setTimeout(() => {
    console.error('[Server] Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
});

// =====================================================================
// PERFORMANCE METRICS LOGGING (Development)
// =====================================================================
if (process.env.NODE_ENV !== 'production') {
  setInterval(() => {
    try {
      const db = require('./src/db');
      const { getCacheStats } = require('./src/middleware/cache');

      console.log('═══════════════════════════════════════════════');
      console.log('[Metrics] Database:', db.getPoolStatus ? db.getPoolStatus() : 'N/A');
      console.log('[Metrics] Cache:', getCacheStats ? getCacheStats() : 'N/A');
      console.log('[Metrics] Memory:', {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
      });
      console.log('═══════════════════════════════════════════════');
    } catch (err) {
      console.error('[Metrics] Error logging metrics:', err.message);
    }
  }, 60000); // Every 60 seconds
}

const server = app.listen(port, () => console.log(`Backend listening on ${port}`));

server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});
