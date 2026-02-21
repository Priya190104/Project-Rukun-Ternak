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
 * GET /api/stats/admin/dashboard - Comprehensive admin dashboard
 * Returns: All data needed for admin dashboard UI
 * Includes: Population, births, deaths, sales, reports, users, kelompok, news
 * Time: 1-2s first request, <100ms cached
 * Cache TTL: 5 minutes
 */
async function getAdminDashboard(req, res) {
  try {
    // Allow admin and viewer (viewer in read-only mode)
    if (req.user?.role !== 'admin' && req.user?.role !== 'viewer') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const cacheKey = 'admin_dashboard_all';
    
    // Try cache first
    const cached = dashboardCache.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        fromCache: true,
        cacheAge: Math.round((Date.now() - cached.generatedAt) / 1000) + 's'
      });
    }

    // Execute all queries in parallel for better performance
    const [
      countResult,
      populationResult,
      kelahiranResult,
      kematianResult,
      penjualanResult,
      monthlyResult,
      kelompokStatsResult,
      usersResult,
      kelompokResult
    ] = await Promise.all([
      // COUNT basic totals
      db.query(`
        SELECT 
          COUNT(*)::int as total_laporan,
          COUNT(CASE WHEN DATE_TRUNC('month', tanggal) = DATE_TRUNC('month', NOW()) THEN 1 END)::int as laporan_this_month
        FROM laporan
      `),
      
      // POPULASI TERNAK - Total hewan aktif
      db.query(`
        SELECT 
          COUNT(*)::int as total_hewan,
          COUNT(CASE WHEN jenis_kelamin = 'JANTAN' THEN 1 END)::int as hewan_jantan,
          COUNT(CASE WHEN jenis_kelamin = 'BETINA' THEN 1 END)::int as hewan_betina
        FROM hewan_ternak
        WHERE status = 'AKTIF'
      `),
      
      // KELAHIRAN - Hewan dengan source = 'Kelahiran'
      db.query(`
        SELECT 
          COUNT(*)::int as total_kelahiran,
          COUNT(CASE WHEN jenis_kelamin = 'JANTAN' THEN 1 END)::int as kelahiran_jantan,
          COUNT(CASE WHEN jenis_kelamin = 'BETINA' THEN 1 END)::int as kelahiran_betina,
          COUNT(CASE WHEN DATE_TRUNC('month', tanggal_lahir) = DATE_TRUNC('month', NOW()) THEN 1 END)::int as kelahiran_this_month
        FROM hewan_ternak
        WHERE source = 'Kelahiran'
      `),
      
      // KEMATIAN - Hewan dengan status tidak_aktif
      db.query(`
        SELECT 
          COUNT(*)::int as total_mati,
          COUNT(CASE WHEN jenis_kelamin = 'JANTAN' THEN 1 END)::int as mati_jantan,
          COUNT(CASE WHEN jenis_kelamin = 'BETINA' THEN 1 END)::int as mati_betina,
          COUNT(CASE WHEN DATE_TRUNC('month', updated_at) = DATE_TRUNC('month', NOW()) THEN 1 END)::int as mati_this_month
        FROM hewan_ternak
        WHERE status = 'TIDAK_AKTIF'
      `),
      
      // PENJUALAN - Hewan dengan status = 'TERJUAL'
      db.query(`
        SELECT 
          COUNT(*)::int as total_terjual,
          COUNT(CASE WHEN DATE_TRUNC('month', COALESCE(tanggal_terjual, updated_at)) = DATE_TRUNC('month', NOW()) THEN 1 END)::int as terjual_this_month
        FROM hewan_ternak
        WHERE status = 'TERJUAL'
      `),
      
      // MONTHLY LAPORAN - Last 6 months
      db.query(`
        SELECT 
          DATE_TRUNC('month', tanggal)::date as month,
          COUNT(*)::int as count
        FROM laporan
        WHERE tanggal >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', tanggal)
        ORDER BY month DESC
      `),
      
      // KELOMPOK STATS - Per-kelompok laporan count (top 10)
      db.query(`
        SELECT 
          k.id, k.name,
          COUNT(l.id)::int as laporan_count
        FROM kelompok k
        LEFT JOIN laporan l ON l.kelompok_id = k.id
        GROUP BY k.id, k.name
        ORDER BY laporan_count DESC
        LIMIT 10
      `),

      // USERS COUNT
      db.query(`
        SELECT COUNT(*)::int as total_users
        FROM users
      `),

      // KELOMPOK COUNT
      db.query(`
        SELECT COUNT(*)::int as total_kelompok
        FROM kelompok
      `)
    ]);

    // Format response matching frontend expectations
    const adminDashboard = {
      totals: {
        laporan: countResult.rows[0].total_laporan || 0,
        users: usersResult.rows[0].total_users || 0,
        kelompok: kelompokResult.rows[0].total_kelompok || 0
      },
      populasi: {
        total_hewan: populationResult.rows[0].total_hewan || 0,
        hewan_jantan: populationResult.rows[0].hewan_jantan || 0,
        hewan_betina: populationResult.rows[0].hewan_betina || 0
      },
      kelahiran: {
        total_kelahiran: kelahiranResult.rows[0].total_kelahiran || 0,
        kelahiran_jantan: kelahiranResult.rows[0].kelahiran_jantan || 0,
        kelahiran_betina: kelahiranResult.rows[0].kelahiran_betina || 0,
        this_month: kelahiranResult.rows[0].kelahiran_this_month || 0
      },
      kematian: {
        total_mati: kematianResult.rows[0].total_mati || 0,
        mati_jantan: kematianResult.rows[0].mati_jantan || 0,
        mati_betina: kematianResult.rows[0].mati_betina || 0,
        this_month: kematianResult.rows[0].mati_this_month || 0
      },
      penjualan: {
        total_terjual: penjualanResult.rows[0].total_terjual || 0,
        this_month: penjualanResult.rows[0].terjual_this_month || 0
      },
      perMonth: monthlyResult.rows.map(row => ({
        month: row.month,
        count: row.count
      })),
      perKelompok: kelompokStatsResult.rows.map(row => ({
        id: row.id,
        name: row.name,
        laporan_count: row.laporan_count
      })),
      generatedAt: new Date()
    };

    // Cache for 5 minutes
    dashboardCache.set(cacheKey, adminDashboard);

    console.log('[statsController] getAdminDashboard - Success', {
      populasi: adminDashboard.populasi.total_hewan,
      kelahiran: adminDashboard.kelahiran.total_kelahiran,
      kematian: adminDashboard.kematian.total_mati,
      penjualan: adminDashboard.penjualan.total_terjual
    });

    return res.json({
      success: true,
      data: adminDashboard,
      fromCache: false
    });

  } catch (error) {
    console.error('[statsController] Error in getAdminDashboard:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}


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
 * Returns: Pakan, Kandang, Kelahiran, Penjualan stats
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
      penjualan: {
        totalTerjual: 0,
        pejantanTerjual: 0,
        betinaTerjual: 0,
        anakanTerjual: 0
      },
      pengolahan: {
        pupukCair: 0,
        pupukPadat: 0
      },
      penyaluran: {
        jumlahKandang: 0,
        tanggalInput: null
      },
      bantuan: {
        jumlahTernak: 0,
        tanggalInput: null
      }
    };

    // Get latest pakan data
    const pakanQuery = `
      SELECT data->>'jenis_pakan' as jenis_pakan,
             data->>'sumber' as sumber_pakan,
             tanggal
      FROM laporan
      WHERE kelompok_id = $1 AND jenis = 'pakan'
      ORDER BY tanggal DESC, created_at DESC
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

    // Get kandang data - accumulate pengembangan_kandang for kandang anggota
    const kandangQuery = `
      SELECT COALESCE(SUM((data->>'pengembangan_kandang')::int), 0)::int as pengembangan_total
      FROM laporan
      WHERE kelompok_id = $1 AND jenis = 'kandang'
    `;
    const kandangRes = await db.query(kandangQuery, [userKelompokId]);
    if (kandangRes.rows.length > 0) {
      const row = kandangRes.rows[0];
      dashboardData.kandang = {
        pengembanganTotal: row.pengembangan_total || 0
      };
    } else {
      dashboardData.kandang = {
        pengembanganTotal: 0
      };
    }

    // Get kelahiran data from hewan_ternak (not from laporan)
    // Count hewan with source = 'Kelahiran'
    const kelahiranQuery = `
      SELECT 
        COUNT(*)::int as total_ekor,
        COUNT(CASE WHEN jenis_kelamin = 'BETINA' THEN 1 END)::int as anak_betina,
        COUNT(CASE WHEN jenis_kelamin = 'JANTAN' THEN 1 END)::int as anak_jantan
      FROM hewan_ternak
      WHERE kelompok_id = $1 AND source = 'Kelahiran'
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

    // Get penjualan data FROM HEWAN_TERNAK (status = TERJUAL)
    // This is the primary source for sold animals with age-based categorization
    const penjualanHewanQuery = `
      SELECT 
        COUNT(*)::int as total_terjual,
        COUNT(CASE WHEN jenis_kelamin = 'JANTAN' AND (umur_saat_terjual IS NULL OR umur_saat_terjual > 11) THEN 1 END)::int as pejantan_terjual,
        COUNT(CASE WHEN jenis_kelamin = 'BETINA' AND (umur_saat_terjual IS NULL OR umur_saat_terjual > 11) THEN 1 END)::int as indukan_terjual,
        COUNT(CASE WHEN jenis_kelamin = 'JANTAN' AND umur_saat_terjual IS NOT NULL AND umur_saat_terjual >= 8 AND umur_saat_terjual <= 11 THEN 1 END)::int as calon_pejantan_terjual,
        COUNT(CASE WHEN jenis_kelamin = 'BETINA' AND umur_saat_terjual IS NOT NULL AND umur_saat_terjual >= 8 AND umur_saat_terjual <= 11 THEN 1 END)::int as calon_indukan_terjual
      FROM hewan_ternak
      WHERE kelompok_id = $1 AND status = 'TERJUAL'
    `;
    const penjualanHewanRes = await db.query(penjualanHewanQuery, [userKelompokId]);
    
    let totalTerjual = 0;
    let pejantanTerjual = 0;
    let indukanTerjual = 0;
    let calonPejantanTerjual = 0;
    let calonIndukanTerjual = 0;
    let jantanPotongTerjual = 0;
    let betinaPotongTerjual = 0;
    
    if (penjualanHewanRes.rows.length > 0) {
      const row = penjualanHewanRes.rows[0];
      totalTerjual = row.total_terjual || 0;
      pejantanTerjual = row.pejantan_terjual || 0;
      indukanTerjual = row.indukan_terjual || 0;
      calonPejantanTerjual = row.calon_pejantan_terjual || 0;
      calonIndukanTerjual = row.calon_indukan_terjual || 0;
      
      console.log('[statsController] Penjualan counts from hewan_ternak:', {
        totalTerjual,
        pejantanTerjual,
        indukanTerjual,
        calonPejantanTerjual,
        calonIndukanTerjual,
        kelompokId: userKelompokId
      });
    }
    
    // Get Jantan Potong and Betina Potong counts FROM LAPORAN (penjualan)
    // These are counted based on the jenis_hewan field in penjualan_list
    const potongQuery = `
      SELECT 
        COUNT(CASE WHEN item->>'jenis_hewan' = 'Jantan Potong' THEN 1 END)::int as jantan_potong_count,
        COUNT(CASE WHEN item->>'jenis_hewan' = 'Betina Potong' THEN 1 END)::int as betina_potong_count
      FROM laporan,
           jsonb_array_elements((data->'penjualan_list')::jsonb) as item
      WHERE kelompok_id = $1 AND jenis = 'Penjualan' AND data->'penjualan_list' IS NOT NULL
    `;
    const potongRes = await db.query(potongQuery, [userKelompokId]);
    
    if (potongRes.rows.length > 0) {
      const row = potongRes.rows[0];
      jantanPotongTerjual = row.jantan_potong_count || 0;
      betinaPotongTerjual = row.betina_potong_count || 0;
      
      console.log('[statsController] Potong counts from laporan:', {
        jantanPotong: jantanPotongTerjual,
        betinaPotong: betinaPotongTerjual
      });
    }
    
    dashboardData.penjualan = {
      totalTerjual: totalTerjual,
      pejantanTerjual: pejantanTerjual,
      indukanTerjual: indukanTerjual,
      calonPejantanTerjual: calonPejantanTerjual,
      calonIndukanTerjual: calonIndukanTerjual,
      jantanPotongTerjual: jantanPotongTerjual,
      betinaPotongTerjual: betinaPotongTerjual
    };

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

    // Get penyaluran & bantuan data from kelompok table + calculate ternak counts from hewan_ternak
    // POPULASI = COUNT(hewan_ternak WHERE status='AKTIF')
    const penyaluranBantuanQuery = `
      SELECT 
        k.jumlah_kandang,
        k.jumlah_ternak,
        k.pakan_list,
        k.kesehatan_list,
        COUNT(CASE WHEN h.jenis_kelamin = 'JANTAN' AND h.source = 'Penyaluran' AND h.status = 'AKTIF' THEN 1 END)::int as ternak_jantan,
        COUNT(CASE WHEN h.jenis_kelamin = 'BETINA' AND h.source = 'Penyaluran' AND h.status = 'AKTIF' THEN 1 END)::int as ternak_betina,
        COUNT(CASE WHEN h.status = 'AKTIF' THEN 1 END)::int as total_hewan,
        COUNT(CASE WHEN h.jenis_kelamin = 'JANTAN' AND h.status = 'AKTIF' THEN 1 END)::int as total_jantan,
        COUNT(CASE WHEN h.jenis_kelamin = 'BETINA' AND h.status = 'AKTIF' THEN 1 END)::int as total_betina
      FROM kelompok k
      LEFT JOIN hewan_ternak h ON h.kelompok_id = k.id
      WHERE k.id = $1
      GROUP BY k.id, k.jumlah_kandang, k.jumlah_ternak, k.pakan_list, k.kesehatan_list
    `;
    const penyaluranBantuanRes = await db.query(penyaluranBantuanQuery, [userKelompokId]);
    if (penyaluranBantuanRes.rows.length > 0) {
      const row = penyaluranBantuanRes.rows[0];
      
      // Parse pakan_list - handle both string and array formats
      let pakanList = [];
      if (row.pakan_list) {
        try {
          pakanList = typeof row.pakan_list === 'string' 
            ? JSON.parse(row.pakan_list)
            : row.pakan_list;
        } catch (e) {
          console.warn('Could not parse pakan_list:', e);
        }
      }
      
      // Parse kesehatan_list - handle both string and array formats
      let kesehatanList = [];
      if (row.kesehatan_list) {
        try {
          kesehatanList = typeof row.kesehatan_list === 'string'
            ? JSON.parse(row.kesehatan_list)
            : row.kesehatan_list;
        } catch (e) {
          console.warn('Could not parse kesehatan_list:', e);
        }
      }
      
      dashboardData.penyaluran = {
        jumlahKandang: row.jumlah_kandang || 0,
        tanggalInput: new Date().toISOString(),
        pakanList: pakanList,
        tarnakJantan: row.ternak_jantan || 0,
        tarnakBetina: row.ternak_betina || 0
      };
      dashboardData.bantuan = {
        jumlahTernak: row.jumlah_ternak || 0,
        tanggalInput: new Date().toISOString(),
        kesehatanList: kesehatanList
      };
      // Add populasi hewan dari tabel hewan_ternak (untuk card Populasi di Progress Kelompok)
      dashboardData.populasiHewan = {
        total: row.total_hewan || 0,
        jantan: row.total_jantan || 0,
        betina: row.total_betina || 0
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

/**
 * GET /api/stats/kelahiran - Kelahiran statistics from hewan_ternak
 * Returns: Total kelahiran, kelahiran betina, kelahiran jantan
 * Source: Dari hewan_ternak dengan source = 'Kelahiran'
 */
async function getKelahiranStats(req, res) {
  try {
    const userRole = req.user?.role;
    const userKelompokId = req.user?.kelompok_id;

    let whereCondition = "source = 'Kelahiran'";
    const params = [];
    let paramIndex = 1;

    // If user is from kelompok or mitra_kelompok, only get stats for their kelompok
    if (userRole === 'kelompok' || userRole === 'mitra_kelompok') {
      whereCondition = `source = 'Kelahiran' AND kelompok_id = $${paramIndex++}`;
      params.push(userKelompokId);
    }

    // Query to get kelahiran statistics
    const query = `
      SELECT 
        COUNT(*)::int as total_kelahiran,
        COUNT(CASE WHEN jenis_kelamin = 'BETINA' THEN 1 END)::int as kelahiran_betina,
        COUNT(CASE WHEN jenis_kelamin = 'JANTAN' THEN 1 END)::int as kelahiran_jantan
      FROM hewan_ternak
      WHERE ${whereCondition}
    `;

    console.log('[statsController] getKelahiranStats - Role:', userRole, 'Where:', whereCondition);

    const result = await db.query(query, params);
    const stats = result.rows[0];

    return res.json({
      success: true,
      data: {
        total_kelahiran: stats.total_kelahiran || 0,
        kelahiran_betina: stats.kelahiran_betina || 0,
        kelahiran_jantan: stats.kelahiran_jantan || 0,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[statsController] Error in getKelahiranStats:', error);
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
  getAdminDashboard,
  getLaporanByMonth,
  getKelahiranStats,
  getCacheStatus,
  invalidateCache
};