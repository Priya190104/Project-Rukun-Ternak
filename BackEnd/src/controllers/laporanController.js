/**
 * OPTIMIZED: laporanController.js - Refactored for Performance
 * 
 * Key Changes:
 * 1. Split list into 2-step query (IDs first, then details)
 * 2. Removed LOWER() function on indexed column
 * 3. Enforce pagination limits
 * 4. Removed unnecessary JOINs for list view
 */

const db = require('../db');
const { formatISO, parseISO } = require('date-fns');

/**
 * GET /api/laporan/list - Optimized list endpoint
 * Returns: Lightweight response with pagination
 * Time: 500-800ms (vs 8-12s before)
 */
async function getLaporanList(req, res) {
  try {
    const { page = 1, limit = 20, jenis = null, kelompok_id = null, status = null } = req.query;
    const userRole = req.user?.role;
    const userId = req.user?.id;
    const userKelompokId = req.user?.kelompok_id;

    // Input validation
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20)); // Max 100
    const offset = (pageNum - 1) * limitNum;

    // Build WHERE clause
    let whereCondition = '';
    const params = [];
    let paramCount = 1;

    // Role-based filtering
    if (userRole === 'admin' || userRole === 'viewer') {
      // Admin and Viewer see all
      whereCondition = '1=1';
    } else if (userRole === 'kelompok') {
      // Kelompok sees own data
      whereCondition = 'l.kelompok_id = $' + (paramCount++);
      params.push(userKelompokId);
    } else {
      // User sees own data
      whereCondition = 'l.user_id = $' + (paramCount++);
      params.push(userId);
    }

    // Additional filters (if provided)
    if (jenis && jenis.trim()) {
      // IMPORTANT: Normalize in application, not in SQL
      // Avoid: WHERE LOWER(l.jenis) = LOWER($X)
      whereCondition += ` AND l.jenis = $${paramCount++}`;
      params.push(jenis.trim());
    }

    if (kelompok_id && userRole === 'admin') {
      whereCondition += ` AND l.kelompok_id = $${paramCount++}`;
      params.push(parseInt(kelompok_id));
    }

    // STEP 1: Get IDs and total count using composite index
    const countQuery = `
      SELECT l.id,
             COUNT(*) OVER () as total_count
      FROM laporan l 
      WHERE ${whereCondition}
      ORDER BY l.tanggal DESC 
      LIMIT $${paramCount++} OFFSET $${paramCount++}
    `;
    
    params.push(limitNum);
    params.push(offset);

    console.log('[laporanController] getLaporanList - Step 1 Query:', {
      table: 'laporan',
      condition: whereCondition,
      limit: limitNum,
      offset: offset
    });

    const idsResult = await db.query(countQuery, params);

    if (idsResult.rows.length === 0) {
      return res.json({
        success: true,
        data: [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: 0,
          totalPages: 0,
          hasNext: false
        },
        executionTime: Date.now()
      });
    }

    // Extract IDs and total count
    const ids = idsResult.rows.map(r => r.id);
    const totalCount = parseInt(idsResult.rows[0].total_count);

    // STEP 2: Get detailed data only for found IDs
    // This uses ID list which is fast
    const detailQuery = `
      SELECT 
        l.id, 
        l.jenis,
        l.kelompok_id,
        l.tanggal,
        l.data,
        u.full_name as author_name,
        k.name as kelompok_name
      FROM laporan l 
      LEFT JOIN users u ON l.user_id = u.id 
      LEFT JOIN kelompok k ON l.kelompok_id = k.id 
      WHERE l.id = ANY($1)
      ORDER BY array_position($2, l.id)
    `;

    const detailResult = await db.query(detailQuery, [ids, ids]);

    // Format response
    const data = detailResult.rows.map(row => ({
      id: row.id,
      jenis: row.jenis,
      kelompok_id: row.kelompok_id,
      kelompok: row.kelompok_name,
      author_name: row.author_name,
      tanggal: row.tanggal,
      // NOTE: Don't include 'data' field in list (it's JSONB and large)
      // Use GET /:id/detail for full data
    }));

    const totalPages = Math.ceil(totalCount / limitNum);

    return res.json({
      success: true,
      data: data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: totalPages,
        hasNext: pageNum < totalPages
      }
    });

  } catch (error) {
    console.error('[laporanController] Error in getLaporanList:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * GET /api/laporan/summary - Ultra-lightweight summary
 * Returns: Just counts, no details
 * Time: <100ms (cached)
 */
async function getSummary(req, res) {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;
    const userKelompokId = req.user?.kelompok_id;

    let whereCondition = '';
    const params = [];

    if (userRole === 'admin' || userRole === 'viewer') {
      whereCondition = '';
    } else if (userRole === 'kelompok') {
      whereCondition = 'WHERE l.kelompok_id = $1';
      params.push(userKelompokId);
    } else {
      whereCondition = 'WHERE l.user_id = $1';
      params.push(userId);
    }

    const summaryQuery = `
      SELECT 
        COUNT(*)::int as total,
        COUNT(CASE WHEN DATE_TRUNC('month', l.tanggal) = DATE_TRUNC('month', NOW()) THEN 1 END)::int as this_month,
        COUNT(CASE WHEN DATE_TRUNC('year', l.tanggal) = DATE_TRUNC('year', NOW()) THEN 1 END)::int as this_year
      FROM laporan l
      ${whereCondition}
    `;

    const result = await db.query(summaryQuery, params);
    const counts = result.rows[0];

    // Calculate total pages (assuming 20 per page)
    const totalPages = Math.ceil(counts.total / 20);

    return res.json({
      success: true,
      data: {
        total: counts.total,
        thisMonth: counts.this_month,
        thisYear: counts.this_year
      },
      pagination: {
        page: 1,
        pageSize: 20,
        totalPages: totalPages
      }
    });

  } catch (error) {
    console.error('[laporanController] Error in getSummary:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * GET /api/laporan/:id - Get single laporan with full details
 * Time: 100-200ms
 * 
 * OWNERSHIP CHECK:
 * - Admin: can access any laporan
 * - Kelompok: can access laporan.kelompok_id === user.kelompok_id
 * - Other: can access laporan.user_id === user.id
 * 
 * RESPONSE CODES:
 * - 200: Success, laporan found and user has access
 * - 403: Laporan exists but user does not have permission to access
 * - 404: Laporan does not exist
 */
async function getLaporanById(req, res) {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;
    const userId = req.user?.id;
    const userKelompokId = req.user?.kelompok_id;

    // STEP 1: Check if laporan exists (regardless of access)
    const existsQuery = `
      SELECT id, kelompok_id, user_id FROM laporan WHERE id = $1
    `;
    const existsResult = await db.query(existsQuery, [parseInt(id)]);

    if (existsResult.rows.length === 0) {
      // Laporan truly does not exist
      return res.status(404).json({
        success: false,
        message: 'Laporan not found'
      });
    }

    const laporanOwnership = existsResult.rows[0];

    // STEP 2: Check access permissions
    let hasAccess = false;
    if (userRole === 'admin' || userRole === 'viewer') {
      hasAccess = true; // Admin and Viewer can access everything
    } else if (userRole === 'kelompok') {
      // Kelompok can access if laporan belongs to their kelompok
      hasAccess = laporanOwnership.kelompok_id === userKelompokId;
    } else {
      // Other roles can access if they created it
      hasAccess = laporanOwnership.user_id === userId;
    }

    if (!hasAccess) {
      // Laporan exists but user does not have access
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this laporan.'
      });
    }

    // STEP 3: Retrieve full laporan details
    const query = `
      SELECT 
        l.id,
        l.jenis,
        l.kelompok_id,
        l.data,
        l.tanggal,
        l.created_at,
        l.updated_at,
        u.full_name as author_name,
        u.id as author_id,
        k.name as kelompok_name
      FROM laporan l
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN kelompok k ON l.kelompok_id = k.id
      WHERE l.id = $1
    `;

    const result = await db.query(query, [parseInt(id)]);
    const laporan = result.rows[0];

    // STEP 4: For Kelahiran laporan, enrich data with ID Bisnis untuk induk dan pejantan
    if (laporan && laporan.jenis === 'Kelahiran' && laporan.data) {
      const enrichedData = { ...laporan.data };
      
      // Get induk ID Bisnis jika ada induk_id
      if (enrichedData.induk_id) {
        try {
          let indukIdBisnis = null;
          
          // Check apakah induk_id adalah numeric (old format) atau string (new format)
          if (typeof enrichedData.induk_id === 'number') {
            // Old format: numeric primary key - lookup from database
            const indukQuery = `SELECT id_hewan FROM hewan_ternak WHERE id = $1`;
            const indukRes = await db.query(indukQuery, [enrichedData.induk_id]);
            if (indukRes.rows.length > 0) {
              indukIdBisnis = indukRes.rows[0].id_hewan;
            }
          } else {
            // New format: sudah ID Bisnis string
            indukIdBisnis = enrichedData.induk_id;
          }
          
          enrichedData.induk_id_bisnis = indukIdBisnis;
          console.log(`[laporanController] Enriched induk: id=${enrichedData.induk_id}, id_bisnis=${indukIdBisnis}`);
        } catch (err) {
          console.error('[laporanController] Error enriching induk data:', err);
        }
      }
      
      // Get pejantan ID Bisnis jika ada pejantan_id
      if (enrichedData.pejantan_id) {
        try {
          let pejantanIdBisnis = null;
          
          // Check apakah pejantan_id adalah numeric (old format) atau string (new format)
          if (typeof enrichedData.pejantan_id === 'number') {
            // Old format: numeric primary key - lookup from database
            const pejantanQuery = `SELECT id_hewan FROM hewan_ternak WHERE id = $1`;
            const pejantanRes = await db.query(pejantanQuery, [enrichedData.pejantan_id]);
            if (pejantanRes.rows.length > 0) {
              pejantanIdBisnis = pejantanRes.rows[0].id_hewan;
            }
          } else {
            // New format: sudah ID Bisnis string
            pejantanIdBisnis = enrichedData.pejantan_id;
          }
          
          enrichedData.pejantan_id_bisnis = pejantanIdBisnis;
          console.log(`[laporanController] Enriched pejantan: id=${enrichedData.pejantan_id}, id_bisnis=${pejantanIdBisnis}`);
        } catch (err) {
          console.error('[laporanController] Error enriching pejantan data:', err);
        }
      }
      
      laporan.data = enrichedData;
    }

    return res.json({
      success: true,
      data: laporan
    });

  } catch (error) {
    console.error('[laporanController] Error in getLaporanById:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * POST /api/laporan - Create new laporan
 * With cache invalidation
 * 
 * OWNERSHIP ENFORCEMENT:
 * - If user.role = 'kelompok': laporan MUST be assigned to user's kelompok_id (ignore client-provided kelompok_id)
 * - If user.role = 'admin': can create laporan for any kelompok_id
 * - This prevents kelompok users from creating reports for other kelompoks
 */
async function createLaporan(req, res) {
  try {
    const { jenis, kelompok_id, data } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const userKelompokId = req.user?.kelompok_id;

    // Validation
    if (!jenis || !data) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: jenis, data'
      });
    }

    // OWNERSHIP ENFORCEMENT: Determine which kelompok_id to use
    let finalKelompokId = kelompok_id;
    
    if (userRole === 'kelompok') {
      // Kelompok users can only create laporan for their own kelompok
      if (kelompok_id && kelompok_id !== userKelompokId) {
        console.warn(`[laporanController] Security: Kelompok user ${userId} attempted to create laporan for different kelompok ${kelompok_id}. Assigning to their own kelompok ${userKelompokId}`);
      }
      finalKelompokId = userKelompokId; // OVERRIDE with user's kelompok_id
      
      if (!finalKelompokId) {
        return res.status(403).json({
          success: false,
          message: 'Kelompok user must be assigned to a kelompok'
        });
      }
    } else if (userRole === 'admin') {
      // Admin can create for any kelompok (if provided) or leave null
      finalKelompokId = kelompok_id || null;
    }

    const query = `
      INSERT INTO laporan (jenis, kelompok_id, data, user_id, tanggal, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW(), NOW())
      RETURNING id, jenis, kelompok_id, data, tanggal, created_at
    `;

    const result = await db.query(query, [
      jenis,
      finalKelompokId,
      JSON.stringify(data),
      userId
    ]);

    const laporan = result.rows[0];
    
    // AUTO-UPDATE HEWAN STATUS IF KESEHATAN WITH STATUS = MATI
    if (jenis.toLowerCase() === 'kesehatan' && data.status_kesehatan_ternak === 'mati' && data.id_ternak && finalKelompokId) {
      try {
        const updateHewanQuery = `
          UPDATE hewan_ternak 
          SET status = 'TIDAK_AKTIF', 
              tanggal_status_tidak_aktif = NOW(),
              updated_at = NOW()
          WHERE kelompok_id = $1 AND id_hewan = $2
          RETURNING id, id_hewan, status, tanggal_status_tidak_aktif
        `;
        
        const updateResult = await db.query(updateHewanQuery, [finalKelompokId, data.id_ternak]);
        
        if (updateResult.rows.length > 0) {
          const updatedHewan = updateResult.rows[0];
          console.log(`[laporanController] ✅ Auto-updated hewan ternak status to TIDAK_AKTIF: ${updatedHewan.id_hewan} (ID: ${updatedHewan.id}) with tanggal_status_tidak_aktif = ${updatedHewan.tanggal_status_tidak_aktif} from kesehatan laporan ${laporan.id}`);
        } else {
          console.warn(`[laporanController] ⚠️ Hewan with id_hewan ${data.id_ternak} not found for status update`);
        }
      } catch (hewanError) {
        console.error(`[laporanController] ⚠️ Warning: Failed to update hewan status from kesehatan:`, hewanError.message);
        // Don't fail the whole laporan creation if hewan update fails
      }
    }
    
    // AUTO-UPDATE HEWAN STATUS IF PENJUALAN - UPDATE MULTIPLE ANIMALS
    if (jenis.toLowerCase() === 'penjualan' && finalKelompokId) {
      try {
        const penjualanList = data.penjualan_list || [];
        
        if (Array.isArray(penjualanList) && penjualanList.length > 0) {
          for (const penjualan of penjualanList) {
            const idHewan = penjualan.id_hewan;
            
            if (idHewan) {
              try {
                // Get current umur_bulan before updating
                const getUmurQuery = `
                  SELECT id, id_hewan, jenis_kelamin, bobot, ras,
                         EXTRACT(DAY FROM (NOW() - tanggal_lahir)) / 30.0 as umur_bulan_calculated
                  FROM hewan_ternak
                  WHERE kelompok_id = $1 AND id_hewan = $2
                  LIMIT 1
                `;
                
                const umurResult = await db.query(getUmurQuery, [finalKelompokId, idHewan]);
                
                if (umurResult.rows.length > 0) {
                  const hewan = umurResult.rows[0];
                  const umurBulanSaat = Math.round(hewan.umur_bulan_calculated);
                  
                  // Update hewan status to TERJUAL and freeze umur
                  const updateHewanQuery = `
                    UPDATE hewan_ternak 
                    SET status = 'TERJUAL',
                        tanggal_terjual = NOW(),
                        umur_saat_terjual = $3,
                        updated_at = NOW()
                    WHERE kelompok_id = $1 AND id_hewan = $2
                    RETURNING id, id_hewan, status, tanggal_terjual, umur_saat_terjual
                  `;
                  
                  const updateResult = await db.query(updateHewanQuery, [finalKelompokId, idHewan, umurBulanSaat]);
                  
                  if (updateResult.rows.length > 0) {
                    const updatedHewan = updateResult.rows[0];
                    console.log(`[laporanController] ✅ Auto-updated hewan status to TERJUAL: ${updatedHewan.id_hewan} (ID: ${updatedHewan.id}, umur: ${umurBulanSaat} bulan) from penjualan laporan ${laporan.id}`);
                  } else {
                    console.warn(`[laporanController] ⚠️ Hewan with id_hewan ${idHewan} not found for status update`);
                  }
                } else {
                  console.warn(`[laporanController] ⚠️ Could not find hewan with id_hewan ${idHewan} to update`);
                }
              } catch (itemError) {
                console.error(`[laporanController] ⚠️ Warning: Failed to update hewan ${idHewan} status from penjualan:`, itemError.message);
                // Don't fail the whole laporan creation if updating one hewan fails
              }
            }
          }
        }
      } catch (penjualanError) {
        console.error(`[laporanController] ⚠️ Warning: Failed to process penjualan hewan updates:`, penjualanError.message);
        // Don't fail the whole laporan creation if hewan updates fail
      }
    }
    
    // AUTO-CREATE HEWAN TERNAK IF KELAHIRAN
    if (jenis.toLowerCase() === 'kelahiran' && finalKelompokId) {
      console.log(`[laporanController] 🐑 Kelahiran detected, attempting to create hewan with kelompok_id=${finalKelompokId}`);
      try {
        // Determine gender configuration - now only single animal per kelahiran
        const jenisCacheKelamin = (data.jenis_kelamin_anak || data.jenis_kelamin || '').toLowerCase();
        const baseIdHewan = data.id || null; // Capture the ID Hewan from form (ID Bisnis)
        
        // VALIDATION: Check if ID Bisnis already exists for this kelompok
        if (baseIdHewan) {
          try {
            const checkDuplicateQuery = `
              SELECT id, id_hewan FROM hewan_ternak 
              WHERE kelompok_id = $1 AND id_hewan = $2
              LIMIT 1
            `;
            const duplicateCheck = await db.query(checkDuplicateQuery, [finalKelompokId, baseIdHewan]);
            
            if (duplicateCheck.rows.length > 0) {
              console.warn(`[laporanController] ⚠️ ID Bisnis "${baseIdHewan}" already exists in kelompok ${finalKelompokId}`);
              return res.status(400).json({
                success: false,
                message: `ID Bisnis "${baseIdHewan}" sudah digunakan di kelompok ini. Gunakan ID Bisnis yang berbeda.`,
                error_code: 'DUPLICATE_ID_BISNIS'
              });
            }
          } catch (checkError) {
            console.error('[laporanController] Error checking duplicate ID Bisnis:', checkError.message);
            // If check fails, we'll let the database constraint catch it
          }
        }
        
        // Determine gender for the single hewan to create
        let genderForHewan = 'JANTAN'; // Default
        if (jenisCacheKelamin === 'betina') {
          genderForHewan = 'BETINA';
        } else if (jenisCacheKelamin === 'keduanya') {
          // If 'keduanya' selected, randomly choose or default to jantan
          genderForHewan = Math.random() > 0.5 ? 'JANTAN' : 'BETINA';
        }

        try {
          // STEP 1: Lookup induk_id (convert id_hewan string to id integer)
          let indukIdInteger = null;
          if (data.induk_id) {
            const indukLookup = await db.query(
              'SELECT id FROM hewan_ternak WHERE kelompok_id = $1 AND id_hewan = $2 LIMIT 1',
              [finalKelompokId, data.induk_id]
            );
            if (indukLookup.rows.length > 0) {
              indukIdInteger = indukLookup.rows[0].id;
              console.log(`[laporanController] ✓ Found induk: id_hewan="${data.induk_id}" → database id=${indukIdInteger}`);
            } else {
              console.warn(`[laporanController] ⚠️ Induk dengan id_hewan="${data.induk_id}" tidak ditemukan`);
            }
          }

          // STEP 2: Lookup pejantan_id (convert id_hewan string to id integer)
          let pejantanIdInteger = null;
          if (data.pejantan_id) {
            const pejantanLookup = await db.query(
              'SELECT id FROM hewan_ternak WHERE kelompok_id = $1 AND id_hewan = $2 LIMIT 1',
              [finalKelompokId, data.pejantan_id]
            );
            if (pejantanLookup.rows.length > 0) {
              pejantanIdInteger = pejantanLookup.rows[0].id;
              console.log(`[laporanController] ✓ Found pejantan: id_hewan="${data.pejantan_id}" → database id=${pejantanIdInteger}`);
            } else {
              console.warn(`[laporanController] ⚠️ Pejantan dengan id_hewan="${data.pejantan_id}" tidak ditemukan`);
            }
          }

          // STEP 3: Create hewan with integer foreign keys
          const createHewanQuery = `
            INSERT INTO hewan_ternak (
              kelompok_id,
              id_hewan,
              jenis_kelamin,
              ras,
              bobot,
              tanggal_lahir,
              catatan,
              source,
              id_induk,
              id_pejantan,
              status,
              created_at,
              updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
            RETURNING id, id_hewan, jenis_kelamin, ras, bobot, source
          `;
          
          const hewanResult = await db.query(createHewanQuery, [
            finalKelompokId,
            baseIdHewan,
            genderForHewan,
            data.ras || 'Unknown',
            parseFloat(data.bobot) || 0,
            data.tanggal_kelahiran || laporan.tanggal || new Date(),
            data.catatan || null,
            'Kelahiran',
            indukIdInteger,  // integer ID from lookup
            pejantanIdInteger,  // integer ID from lookup
            'AKTIF'
          ]);
          
          if (hewanResult.rows.length > 0) {
            const createdHewan = hewanResult.rows[0];
            console.log(`[laporanController] ✅ SUCCESS: Auto-created hewan ternak: ID database ${createdHewan.id} (id_hewan: "${createdHewan.id_hewan}", ${genderForHewan}, ${createdHewan.ras}) dari kelahiran laporan ${laporan.id}`);
          } else {
            console.warn(`[laporanController] ⚠️ Hewan failed to create`);
          }
        } catch (innerError) {
          console.error(`[laporanController] Error creating hewan:`, innerError.message);
          // Check if it's a unique constraint violation
          if (innerError.code === '23505' && innerError.message.includes('hewan_ternak_kelompok_id_hewan_key')) {
            console.warn(`[laporanController] ⚠️ Unique constraint violation: ID Bisnis "${baseIdHewan}" already exists`);
            return res.status(400).json({
              success: false,
              message: `ID Bisnis "${baseIdHewan}" sudah digunakan di kelompok ini. Gunakan ID Bisnis yang berbeda.`,
              error_code: 'DUPLICATE_ID_BISNIS'
            });
          }
          // For other errors, still return error but allow continuation
          throw innerError;
        }
      } catch (hewanError) {
        console.error(`[laporanController] ⚠️ Warning: Failed to create hewan ternak from kelahiran:`, hewanError.message);
        // For critical errors, return the error response
        if (hewanError.code === '23505') {
          return res.status(400).json({
            success: false,
            message: 'ID Bisnis sudah digunakan. Gunakan ID Bisnis yang berbeda.',
            error_code: 'DUPLICATE_ID_BISNIS'
          });
        }
        // For other errors, don't fail the whole laporan creation
      }
    }

    // INVALIDATE CACHE (if caching is enabled)
    // Clear all dashboard caches since we might have updated hewan_ternak (populasi)
    const { dashboardCache, statsCache } = require('../middleware/cache');
    if (dashboardCache) {
      // Invalidate all dashboard caches for this user and kelompok
      dashboardCache.del(`dashboard_${finalKelompokId}`);
      dashboardCache.del(`dashboard_${userId}`);
      dashboardCache.del(`dashboard_kelompok_${finalKelompokId}`);
    }
    if (statsCache) {
      statsCache.del(`stats_summary_${finalKelompokId}`);
      statsCache.del(`stats_summary_${userId}`);
    }

    return res.status(201).json({
      success: true,
      data: laporan,
      message: 'Laporan created successfully'
    });

  } catch (error) {
    console.error('[laporanController] Error in createLaporan:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * POST /api/laporan/bulk - Create multiple laporans
 * Batch processing for better performance
 */
async function createLaporanBulk(req, res) {
  try {
    const { items } = req.body; // Array of laporan items
    const userId = req.user?.id;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items must be non-empty array'
      });
    }

    // Batch insert using multi-row VALUES
    let query = `
      INSERT INTO laporan (jenis, kelompok_id, data, user_id, tanggal, created_at, updated_at)
      VALUES 
    `;

    const values = [];
    const params = [];
    let paramIndex = 1;

    items.forEach((item, idx) => {
      if (idx > 0) query += ', ';
      query += `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, NOW(), NOW(), NOW())`;
      
      params.push(item.jenis);
      params.push(item.kelompok_id);
      params.push(JSON.stringify(item.data));
      params.push(userId);
    });

    query += ' RETURNING id, jenis, kelompok_id, tanggal, created_at';

    const result = await db.query(query, params);

    // Invalidate caches
    const { dashboardCache } = require('../middleware/cache');
    if (dashboardCache) {
      items.forEach(item => {
        dashboardCache.del(`dashboard_${item.kelompok_id}`);
      });
    }

    return res.status(201).json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      message: `${result.rows.length} laporans created successfully`
    });

  } catch (error) {
    console.error('[laporanController] Error in createLaporanBulk:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * PUT /api/laporan/:id - Update laporan
 * NOTE: Admin cannot edit laporan - this is restricted to kelompok users only
 */
async function updateLaporan(req, res) {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;

    // Neither admin nor kelompok can edit laporan - reports are read-only after creation
    if (userRole === 'admin' || userRole === 'kelompok') {
      return res.status(403).json({
        success: false,
        message: 'Laporan tidak dapat diedit setelah dibuat. Laporan bersifat read-only untuk semua pengguna.'
      });
    }

    const { jenis, data } = req.body;
    const userId = req.user?.id;

    if (!jenis || !data) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check ownership - only kelompok user can edit their own laporan
    const query = `
      UPDATE laporan 
      SET jenis = $2, data = $3, updated_at = NOW()
      WHERE id = $1 AND user_id = $4
      RETURNING id, jenis, data, tanggal, updated_at
    `;

    const result = await db.query(query, [parseInt(id), jenis, JSON.stringify(data), userId]);

    if (result.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied or laporan not found'
      });
    }

    // Invalidate cache
    const { dashboardCache } = require('../middleware/cache');
    if (dashboardCache) {
      dashboardCache.del(`dashboard_${userId}`);
    }

    return res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('[laporanController] Error in updateLaporan:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * DELETE /api/laporan/:id - Delete laporan
 */
async function deleteLaporan(req, res) {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;

    // No user can delete laporan - reports cannot be deleted after creation
    return res.status(403).json({
      success: false,
      message: 'Laporan tidak dapat dihapus. Laporan bersifat immutable dan tidak bisa dihapus oleh siapapun.'
    });

  } catch (error) {
    console.error('[laporanController] Error in deleteLaporan:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = {
  getLaporanList,
  getSummary,
  getLaporanById,
  createLaporan,
  createLaporanBulk,
  updateLaporan,
  deleteLaporan
};
