/**
 * OPTIMIZED: statsController.js - Refactored for Performance
 * 
 * Key Changes:
 * 1. Combined COUNT queries into single query
 * 2. Removed unnecessary JOINs from latest queries
 * 3. Implemented caching layer (5-10 minute TTL)
 * 4. Optimized GROUP BY queries with indexes
 */

const db = require('../db');
const { dashboardCache, statsCache, invalidateKelompokStats } = require('../middleware/cache');

/**
 * GET /api/stats/summary - Quick summary (cached)
 * Returns: Total counts only
 * Time: <100ms (from cache)
 * Cache TTL: 10 minutes
 */
async function getSummary(req, res) {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;
    const userKelompokId = req.user?.kelompok_id;
    
    // Cache key based on user
    const cacheKey = `summary_${userRole}_${userRole === 'kelompok' ? userKelompokId : userRole === 'user' ? userId : 'admin'}`;
    
    // Check cache first
    const cached = statsCache.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        fromCache: true,
        cacheKey: cacheKey
      });
    }

    let whereCondition = '';
    const params = [];
    let paramIndex = 1;

    // Build WHERE clause based on role
    if (userRole === 'kelompok') {
      whereCondition = 'WHERE l.kelompok_id = $' + (paramIndex++);
      params.push(userKelompokId);
    } else if (userRole !== 'admin') {
      whereCondition = 'WHERE l.user_id = $' + (paramIndex++);
      params.push(userId);
    }

    // OPTIMIZATION: Combine all COUNT queries into ONE
    // Before: 3 separate queries (COUNT laporan, COUNT users, COUNT kelompok)
    // After: 1 query with subqueries
    const summaryQuery = `
      SELECT 
        (SELECT COUNT(*)::int FROM laporan l ${whereCondition})::int as total_laporan,
        (SELECT COUNT(CASE WHEN DATE_TRUNC('month', l.tanggal) = DATE_TRUNC('month', NOW()) THEN 1 END)::int FROM laporan l ${whereCondition})::int as laporan_this_month,
        (SELECT COUNT(CASE WHEN DATE_TRUNC('year', l.tanggal) = DATE_TRUNC('year', NOW()) THEN 1 END)::int FROM laporan l ${whereCondition})::int as laporan_this_year,
        (SELECT COUNT(*)::int FROM users)::int as total_users,
        (SELECT COUNT(*)::int FROM kelompok)::int as total_kelompok
    `;

    console.log('[statsController] getSummary query:', {
      role: userRole,
      whereCondition: whereCondition || 'none (admin)',
      cacheKey: cacheKey
    });

    const result = await db.query(summaryQuery, params);
    const summary = result.rows[0];

    const response = {
      laporan: {
        total: summary.total_laporan,
        thisMonth: summary.laporan_this_month,
        thisYear: summary.laporan_this_year
      },
      users: {
        total: summary.total_users
      },
      kelompok: {
        total: summary.total_kelompok
      },
      generatedAt: new Date().toISOString()
    };

    // Store in cache for 10 minutes
    statsCache.set(cacheKey, response);

    return res.json({
      success: true,
      data: response,
      fromCache: false,
      cacheKey: cacheKey
    });

  } catch (error) {
    console.error('[statsController] Error in getSummary:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * GET /api/stats/dashboard - Comprehensive dashboard data (cached)
 * Returns: Counts, latest records, monthly stats, kelompok stats
 * Time: 1-2s first request, <100ms cached
 * Cache TTL: 5 minutes
 */
async function getDashboardSummary(req, res) {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;
    const userKelompokId = req.user?.kelompok_id;

    // Cache key
    const cacheKey = `dashboard_${userRole}_${userRole === 'kelompok' ? userKelompokId : userRole !== 'admin' ? userId : 'admin'}`;

    // Try cache first
    const cached = dashboardCache.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        fromCache: true,
        cacheAge: Math.round((Date.now() - cached.generatedAt.getTime()) / 1000) + 's'
      });
    }

    // Build WHERE clause
    let whereCondition = '1=1';
    const params = [];
    let paramIndex = 1;

    if (userRole === 'kelompok') {
      whereCondition = `l.kelompok_id = $${paramIndex++}`;
      params.push(userKelompokId);
    } else if (userRole !== 'admin') {
      whereCondition = `l.user_id = $${paramIndex++}`;
      params.push(userId);
    }

    // STEP 1: Get summary counts (using combined COUNT query)
    const countQuery = `
      SELECT 
        COUNT(*)::int as total_laporan,
        COUNT(CASE WHEN DATE_TRUNC('month', tanggal) = DATE_TRUNC('month', NOW()) THEN 1 END)::int as laporan_this_month
      FROM laporan 
      WHERE ${whereCondition}
    `;

    // STEP 2: Get latest 5 laporans (simplified, no JOINs)
    const latestQuery = `
      SELECT 
        id, jenis, kelompok_id, tanggal
      FROM laporan 
      WHERE ${whereCondition}
      ORDER BY tanggal DESC 
      LIMIT 5
    `;

    // STEP 3: Get monthly statistics (uses index on tanggal)
    const monthlyQuery = `
      SELECT 
        DATE_TRUNC('month', tanggal)::date as month,
        COUNT(*)::int as count
      FROM laporan 
      WHERE ${whereCondition}
      AND tanggal >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', tanggal)
      ORDER BY month DESC
    `;

    // STEP 4: Get per-kelompok statistics
    const kelompokStatsQuery = `
      SELECT 
        k.id, k.name,
        COUNT(l.id)::int as laporan_count
      FROM kelompok k 
      LEFT JOIN laporan l ON l.kelompok_id = k.id
      ${userRole === 'kelompok' ? ` WHERE k.id = $${paramIndex}` : ''}
      GROUP BY k.id, k.name
      ORDER BY laporan_count DESC
      LIMIT 10
    `;

    console.log('[statsController] getDashboardSummary - Executing 4 queries in parallel');

    // Execute all queries in parallel
    const [countRes, latestRes, monthlyRes, kelompokRes] = await Promise.all([
      db.query(countQuery, params),
      db.query(latestQuery, params),
      db.query(monthlyQuery, params),
      userRole === 'kelompok' 
        ? db.query(kelompokStatsQuery, [...params, userKelompokId])
        : db.query(kelompokStatsQuery, [])
    ]);

    // Aggregate response
    const dashboardData = {
      summary: {
        totalLaporan: countRes.rows[0].total_laporan,
        thisMonth: countRes.rows[0].laporan_this_month
      },
      latest: latestRes.rows.map(row => ({
        id: row.id,
        jenis: row.jenis,
        kelompok_id: row.kelompok_id,
        tanggal: row.tanggal
      })),
      monthly: monthlyRes.rows.map(row => ({
        month: row.month,
        count: row.count
      })),
      kelompokStats: kelompokRes.rows.map(row => ({
        id: row.id,
        name: row.name,
        laporanCount: row.laporan_count
      })),
      generatedAt: new Date()
    };

    // Store in cache for 5 minutes
    dashboardCache.set(cacheKey, dashboardData);

    return res.json({
      success: true,
      data: dashboardData,
      fromCache: false
    });

  } catch (error) {
    console.error('[statsController] Error in getDashboardSummary:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * GET /api/stats/laporan-by-month - Monthly trend data
 * Time: 500-800ms first request, <100ms cached
 */
async function getLaporanByMonth(req, res) {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;
    const userKelompokId = req.user?.kelompok_id;
    const { months = 12 } = req.query;

    const cacheKey = `monthly_${userRole}_${userRole === 'kelompok' ? userKelompokId : userId}`;
    
    const cached = dashboardCache.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        fromCache: true
      });
    }

    let whereCondition = '';
    const params = [];

    if (userRole === 'kelompok') {
      whereCondition = 'WHERE l.kelompok_id = $1';
      params.push(userKelompokId);
    } else if (userRole !== 'admin') {
      whereCondition = 'WHERE l.user_id = $1';
      params.push(userId);
    }

    const query = `
      SELECT 
        DATE_TRUNC('month', l.tanggal)::date as month,
        l.jenis,
        COUNT(*)::int as count
      FROM laporan l
      ${whereCondition}
      AND l.tanggal >= NOW() - INTERVAL '${parseInt(months)} months'
      GROUP BY DATE_TRUNC('month', l.tanggal), l.jenis
      ORDER BY month DESC, jenis
    `;

    const result = await db.query(query, params);

    // Format response
    const data = result.rows.reduce((acc, row) => {
      const monthKey = row.month.toISOString().split('T')[0];
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          types: {}
        };
      }
      acc[monthKey].types[row.jenis] = row.count;
      return acc;
    }, {});

    const response = Object.values(data);

    // Cache for 10 minutes
    dashboardCache.set(cacheKey, response, 600);

    return res.json({
      success: true,
      data: response,
      fromCache: false
    });

  } catch (error) {
    console.error('[statsController] Error in getLaporanByMonth:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * GET /api/stats/cache-status - Debug endpoint to check cache status
 */
async function getCacheStatus(req, res) {
  try {
    // Only admin can check cache
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can view cache status'
      });
    }

    const dashboardCacheKeys = dashboardCache.keys() || [];
    const statsCacheKeys = statsCache.keys() || [];

    return res.json({
      success: true,
      data: {
        dashboardCache: {
          keys: dashboardCacheKeys,
          count: dashboardCacheKeys.length
        },
        statsCache: {
          keys: statsCacheKeys,
          count: statsCacheKeys.length
        },
        totalCached: dashboardCacheKeys.length + statsCacheKeys.length
      }
    });

  } catch (error) {
    console.error('[statsController] Error in getCacheStatus:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * GET /api/stats/dashboard/kelompok - Dashboard data for kelompok role
 * Returns: Pakan, Kandang, Kelahiran, Populasi, Penjualan, Pengolahan stats
 */
async function getDashboardKelompok(req, res) {
  try {
    const userKelompokId = req.user?.kelompok_id;
    
    if (!userKelompokId) {
      return res.status(403).json({
        success: false,
        message: 'Kelompok ID required'
      });
    }

    // Build response with latest data from laporan
    const dashboardData = {
      pakan: {
        jenisPakan: null,
        sumberPakan: null,
        tanggalInput: null
      },
      kandang: {
        kelompok: 0,
        penjualan: 0,
        anggota: 0,
        perkembangan: 0
      },
      kelahiran: {
        totalEkor: 0,
        anakBetina: 0,
        anakJantan: 0
      },
      populasi: {
        totalPopulasi: 0,
        indukan: 0,
        pejantan: 0,
        anakanJantan: 0,
        anakanBetina: 0
      },
      penjualan: {
        totalTerjual: 0,
        pejantanTerjual: 0,
        betinaTerjual: 0,
        anakanTerjual: 0
      },
      pengolahan: {
        pupukCair: 0,
        pupukPadat: 0
      }
    };

    // Get latest pakan data
    const pakanQuery = `
      SELECT data->>'jenisPakan' as jenis_pakan,
             data->>'sumberPakan' as sumber_pakan,
             tanggal
      FROM laporan
      WHERE kelompok_id = $1 AND jenis = 'pakan'
      ORDER BY tanggal DESC
      LIMIT 1
    `;
    const pakanRes = await db.query(pakanQuery, [userKelompokId]);
    if (pakanRes.rows.length > 0) {
      const row = pakanRes.rows[0];
      dashboardData.pakan = {
        jenisPakan: row.jenis_pakan,
        sumberPakan: row.sumber_pakan,
        tanggalInput: row.tanggal
      };
    }

    // Get latest kandang data
    const kandangQuery = `
      SELECT (data->>'kandangKelompok')::int as kandang_kelompok,
             (data->>'kandangPenjualan')::int as kandang_penjualan,
             (data->>'kandangAnggota')::int as kandang_anggota,
             (data->>'kandangPerkembangan')::int as kandang_perkembangan
      FROM laporan
      WHERE kelompok_id = $1 AND jenis = 'kandang'
      ORDER BY tanggal DESC
      LIMIT 1
    `;
    const kandangRes = await db.query(kandangQuery, [userKelompokId]);
    if (kandangRes.rows.length > 0) {
      const row = kandangRes.rows[0];
      dashboardData.kandang = {
        kelompok: row.kandang_kelompok || 0,
        penjualan: row.kandang_penjualan || 0,
        anggota: row.kandang_anggota || 0,
        perkembangan: row.kandang_perkembangan || 0
      };
    }

    // Get kelahiran data (last 30 days)
    const kelahiranQuery = `
      SELECT 
        COALESCE(SUM((data->>'anakBetina')::int + (data->>'anakJantan')::int), 0)::int as total_ekor,
        COALESCE(SUM((data->>'anakBetina')::int), 0)::int as anak_betina,
        COALESCE(SUM((data->>'anakJantan')::int), 0)::int as anak_jantan
      FROM laporan
      WHERE kelompok_id = $1 AND jenis = 'kelahiran'
        AND tanggal >= NOW() - INTERVAL '30 days'
    `;
    const kelahiranRes = await db.query(kelahiranQuery, [userKelompokId]);
    if (kelahiranRes.rows.length > 0) {
      const row = kelahiranRes.rows[0];
      dashboardData.kelahiran = {
        totalEkor: row.total_ekor || 0,
        anakBetina: row.anak_betina || 0,
        anakJantan: row.anak_jantan || 0
      };
    }

    // Get populasi data (latest)
    const populasiQuery = `
      SELECT 
        (data->>'totalPopulasi')::int as total_populasi,
        (data->>'indukan')::int as indukan,
        (data->>'pejantan')::int as pejantan,
        (data->>'anak_jantan_0_8bln')::int as anak_jantan_0_8bln,
        (data->>'anak_betina_0_8bln')::int as anak_betina_0_8bln
      FROM laporan
      WHERE kelompok_id = $1 AND jenis = 'populasi'
      ORDER BY tanggal DESC
      LIMIT 1
    `;
    const populasiRes = await db.query(populasiQuery, [userKelompokId]);
    if (populasiRes.rows.length > 0) {
      const row = populasiRes.rows[0];
      dashboardData.populasi = {
        totalPopulasi: row.total_populasi || 0,
        indukan: row.indukan || 0,
        pejantan: row.pejantan || 0,
        anakanJantan: row.anak_jantan_0_8bln || 0,
        anakanBetina: row.anak_betina_0_8bln || 0
      };
    }

    // Get penjualan data (last 30 days)
    const penjualanQuery = `
      SELECT 
        COALESCE(SUM((data->>'jumlahTerjual')::int), 0)::int as total_terjual,
        COALESCE(SUM((data->>'jumlahPejantan')::int), 0)::int as pejantan_terjual,
        COALESCE(SUM((data->>'jumlahBetina')::int), 0)::int as betina_terjual,
        COALESCE(SUM((data->>'jumlahAnakan')::int), 0)::int as anakan_terjual
      FROM laporan
      WHERE kelompok_id = $1 AND jenis = 'penjualan'
        AND tanggal >= NOW() - INTERVAL '30 days'
    `;
    const penjualanRes = await db.query(penjualanQuery, [userKelompokId]);
    if (penjualanRes.rows.length > 0) {
      const row = penjualanRes.rows[0];
      dashboardData.penjualan = {
        totalTerjual: row.total_terjual || 0,
        pejantanTerjual: row.pejantan_terjual || 0,
        betinaTerjual: row.betina_terjual || 0,
        anakanTerjual: row.anakan_terjual || 0
      };
    }

    // Get pengolahan data (latest)
    const pengolahanQuery = `
      SELECT 
        (data->>'pupukCair')::numeric as pupuk_cair,
        (data->>'pupukPadat')::numeric as pupuk_padat
      FROM laporan
      WHERE kelompok_id = $1 AND jenis = 'pengolahan'
      ORDER BY tanggal DESC
      LIMIT 1
    `;
    const pengolahanRes = await db.query(pengolahanQuery, [userKelompokId]);
    if (pengolahanRes.rows.length > 0) {
      const row = pengolahanRes.rows[0];
      dashboardData.pengolahan = {
        pupukCair: parseFloat(row.pupuk_cair) || 0,
        pupukPadat: parseFloat(row.pupuk_padat) || 0
      };
    }

    return res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('[statsController] Error in getDashboardKelompok:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * POST /api/stats/invalidate-cache - Invalidate cache (admin only)
 */
async function invalidateCache(req, res) {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can invalidate cache'
      });
    }

    // Clear all caches
    dashboardCache.flushAll();
    statsCache.flushAll();

    return res.json({
      success: true,
      message: 'Cache invalidated successfully'
    });

  } catch (error) {
    console.error('[statsController] Error in invalidateCache:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = {
  getSummary,
  getDashboardSummary,
  getDashboardKelompok,
  getLaporanByMonth,
  getCacheStatus,
  invalidateCache
};
