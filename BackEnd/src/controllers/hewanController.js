const db = require('../db');

// Hitung umur hewan berdasarkan tanggal lahir
// Jika tanggalBerakhir diberikan, hitung umur sampai tanggal tersebut (untuk freeze age)
const hitungUmur = (tanggalLahir, tanggalBerakhir = null) => {
  const today = tanggalBerakhir ? new Date(tanggalBerakhir) : new Date();
  const lahir = new Date(tanggalLahir);
  
  // Hitung umur dalam hari
  const umurHari = Math.floor((today - lahir) / (1000 * 60 * 60 * 24));
  
  // Format umur
  if (umurHari < 30) {
    return { 
      hari: umurHari,
      bulan: 0,
      display: `${umurHari} hari`
    };
  } else {
    const umurBulan = Math.floor(umurHari / 30);
    return {
      hari: umurHari,
      bulan: umurBulan,
      display: `${umurBulan} bulan`
    };
  }
};

// Get list hewan ternak milik kelompok
const getHewanTernak = async (req, res) => {
  try {
    const { kelompok_id } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    if (!kelompok_id) {
      return res.status(403).json({
        success: false,
        message: 'User tidak terikat dengan kelompok'
      });
    }

    // Calculate umur at SQL level (not in JavaScript loop)
    // Freeze age calculation if status = TIDAK_AKTIF or TERJUAL
    const query = `
      SELECT 
        id,
        id_hewan,
        jenis_kelamin,
        ras,
        tanggal_lahir,
        status,
        bobot,
        catatan,
        source,
        id_induk,
        id_pejantan,
        tanggal_status_tidak_aktif,
        tanggal_terjual,
        umur_saat_terjual,
        FLOOR(EXTRACT(DAY FROM (
          CASE 
            WHEN status = 'TIDAK_AKTIF' AND tanggal_status_tidak_aktif IS NOT NULL
            THEN tanggal_status_tidak_aktif - tanggal_lahir
            WHEN status = 'TERJUAL' AND tanggal_terjual IS NOT NULL
            THEN tanggal_terjual - tanggal_lahir
            ELSE NOW() - tanggal_lahir
          END
        ))) as umur_hari,
        FLOOR(EXTRACT(DAY FROM (
          CASE 
            WHEN status = 'TIDAK_AKTIF' AND tanggal_status_tidak_aktif IS NOT NULL
            THEN tanggal_status_tidak_aktif - tanggal_lahir
            WHEN status = 'TERJUAL' AND tanggal_terjual IS NOT NULL
            THEN tanggal_terjual - tanggal_lahir
            ELSE NOW() - tanggal_lahir
          END
        )) / 30) as umur_bulan,
        CASE 
          WHEN EXTRACT(DAY FROM (
            CASE 
              WHEN status = 'TIDAK_AKTIF' AND tanggal_status_tidak_aktif IS NOT NULL
              THEN tanggal_status_tidak_aktif - tanggal_lahir
              WHEN status = 'TERJUAL' AND tanggal_terjual IS NOT NULL
              THEN tanggal_terjual - tanggal_lahir
              ELSE NOW() - tanggal_lahir
            END
          )) < 30 
          THEN FLOOR(EXTRACT(DAY FROM (
            CASE 
              WHEN status = 'TIDAK_AKTIF' AND tanggal_status_tidak_aktif IS NOT NULL
              THEN tanggal_status_tidak_aktif - tanggal_lahir
              WHEN status = 'TERJUAL' AND tanggal_terjual IS NOT NULL
              THEN tanggal_terjual - tanggal_lahir
              ELSE NOW() - tanggal_lahir
            END
          ))) || ' hari'
          ELSE FLOOR(EXTRACT(DAY FROM (
            CASE 
              WHEN status = 'TIDAK_AKTIF' AND tanggal_status_tidak_aktif IS NOT NULL
              THEN tanggal_status_tidak_aktif - tanggal_lahir
              WHEN status = 'TERJUAL' AND tanggal_terjual IS NOT NULL
              THEN tanggal_terjual - tanggal_lahir
              ELSE NOW() - tanggal_lahir
            END
          )) / 30) || ' bulan'
        END as umur_display
      FROM hewan_ternak
      WHERE kelompok_id = $1
      ORDER BY tanggal_lahir DESC
      LIMIT $2 OFFSET $3
    `;

    const [result, countRes] = await Promise.all([
      db.query(query, [kelompok_id, limit, offset]),
      db.query(`SELECT COUNT(*)::int as total FROM hewan_ternak WHERE kelompok_id = $1 AND status != 'TERJUAL'`, [kelompok_id])
    ]);

    const total = countRes.rows[0].total;

    // Log summary for debugging
    console.log(`[hewanController] getHewanTernak for kelompok ${kelompok_id}: ${result.rows.length} records (total: ${total})`);
    const sourceCount = {};
    result.rows.forEach(h => {
      sourceCount[h.source || 'unknown'] = (sourceCount[h.source || 'unknown'] || 0) + 1;
    });
    console.log(`[hewanController] Source breakdown:`, sourceCount);
    
    // Debug: Show sample hewan with id and id_hewan
    if (result.rows.length > 0) {
      const sampleHewan = result.rows.slice(0, 3).map(h => ({
        id: h.id,
        id_hewan: h.id_hewan,
        jenis_kelamin: h.jenis_kelamin
      }));
      console.log(`[hewanController] Sample hewan (first 3):`, sampleHewan);
    }

    res.json({
      success: true,
      data: result.rows.map(hewan => ({
        ...hewan,
        umur: {
          hari: hewan.umur_hari,
          bulan: hewan.umur_bulan,
          display: hewan.umur_display
        }
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error getHewanTernak:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data hewan',
      error: error.message
    });
  }
};

// Get detail hewan ternak
const getDetailHewan = async (req, res) => {
  try {
    const { id } = req.params;
    const { kelompok_id } = req.user;

    // Single query dengan LEFT JOIN untuk induk dan pejantan (fix N+1)
    // Freeze age calculation if status = TIDAK_AKTIF
    const hewanQuery = `
      SELECT 
        h.id, h.id_hewan, h.kelompok_id, h.jenis_kelamin, h.ras, h.tanggal_lahir, 
        h.bobot, h.catatan, h.status, h.source, h.id_induk, h.id_pejantan,
        h.tanggal_status_tidak_aktif,
        induk.id as induk_id, induk.id_hewan as induk_id_hewan, induk.ras as induk_ras, 
        induk.jenis_kelamin as induk_jenis, induk.bobot as induk_bobot,
        pejantan.id as pejantan_id, pejantan.id_hewan as pejantan_id_hewan, pejantan.ras as pejantan_ras, 
        pejantan.jenis_kelamin as pejantan_jenis, pejantan.bobot as pejantan_bobot,
        FLOOR(EXTRACT(DAY FROM (
          CASE 
            WHEN h.status = 'TIDAK_AKTIF' AND h.tanggal_status_tidak_aktif IS NOT NULL
            THEN h.tanggal_status_tidak_aktif - h.tanggal_lahir
            ELSE NOW() - h.tanggal_lahir
          END
        ))) as umur_hari,
        FLOOR(EXTRACT(DAY FROM (
          CASE 
            WHEN h.status = 'TIDAK_AKTIF' AND h.tanggal_status_tidak_aktif IS NOT NULL
            THEN h.tanggal_status_tidak_aktif - h.tanggal_lahir
            ELSE NOW() - h.tanggal_lahir
          END
        )) / 30) as umur_bulan,
        CASE 
          WHEN EXTRACT(DAY FROM (
            CASE 
              WHEN h.status = 'TIDAK_AKTIF' AND h.tanggal_status_tidak_aktif IS NOT NULL
              THEN h.tanggal_status_tidak_aktif - h.tanggal_lahir
              ELSE NOW() - h.tanggal_lahir
            END
          )) < 30 
          THEN FLOOR(EXTRACT(DAY FROM (
            CASE 
              WHEN h.status = 'TIDAK_AKTIF' AND h.tanggal_status_tidak_aktif IS NOT NULL
              THEN h.tanggal_status_tidak_aktif - h.tanggal_lahir
              ELSE NOW() - h.tanggal_lahir
            END
          ))) || ' hari'
          ELSE FLOOR(EXTRACT(DAY FROM (
            CASE 
              WHEN h.status = 'TIDAK_AKTIF' AND h.tanggal_status_tidak_aktif IS NOT NULL
              THEN h.tanggal_status_tidak_aktif - h.tanggal_lahir
              ELSE NOW() - h.tanggal_lahir
            END
          )) / 30) || ' bulan'
        END as umur_display
      FROM hewan_ternak h
      LEFT JOIN hewan_ternak induk ON h.id_induk = induk.id
      LEFT JOIN hewan_ternak pejantan ON h.id_pejantan = pejantan.id
      WHERE h.id = $1 AND h.kelompok_id = $2
    `;
    
    const hewanResult = await db.query(hewanQuery, [id, kelompok_id]);
    
    if (hewanResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Hewan tidak ditemukan'
      });
    }

    const row = hewanResult.rows[0];

    // Get riwayat bobot
    const riwayatQuery = `
      SELECT bobot, tanggal_update, keterangan
      FROM riwayat_bobot
      WHERE hewan_id = $1
      ORDER BY tanggal_update DESC
      LIMIT 12
    `;
    const riwayatResult = await db.query(riwayatQuery, [id]);

    // Format response
    const response = {
      id: row.id,
      id_hewan: row.id_hewan,
      ras: row.ras,
      jenis_kelamin: row.jenis_kelamin,
      tanggal_lahir: row.tanggal_lahir,
      bobot: row.bobot,
      catatan: row.catatan,
      status: row.status,
      source: row.source,
      id_induk: row.id_induk,
      id_pejantan: row.id_pejantan,
      umur: {
        hari: row.umur_hari,
        bulan: row.umur_bulan,
        display: row.umur_display
      },
      induk: row.induk_id ? {
        id: row.induk_id,
        id_hewan: row.induk_id_hewan,
        ras: row.induk_ras,
        jenis_kelamin: row.induk_jenis,
        bobot: row.induk_bobot
      } : null,
      pejantan: row.pejantan_id ? {
        id: row.pejantan_id,
        id_hewan: row.pejantan_id_hewan,
        ras: row.pejantan_ras,
        jenis_kelamin: row.pejantan_jenis,
        bobot: row.pejantan_bobot
      } : null,
      riwayatBobot: riwayatResult.rows
    };

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error getDetailHewan:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail hewan',
      error: error.message
    });
  }
};

// Get dropdown list hewan AKTIF untuk form update
const getHewanAktif = async (req, res) => {
  try {
    const { kelompok_id } = req.user;

    const query = `
      SELECT 
        id,
        id_hewan,
        jenis_kelamin,
        ras,
        tanggal_lahir
      FROM hewan_ternak
      WHERE kelompok_id = $1
      AND status = 'AKTIF'
      ORDER BY ras, tanggal_lahir DESC
    `;

    const result = await db.query(query, [kelompok_id]);
    
    const hewanDenganUmur = result.rows.map(hewan => ({
      ...hewan,
      umur: hitungUmur(hewan.tanggal_lahir)
    }));

    res.json({
      success: true,
      data: hewanDenganUmur
    });
  } catch (error) {
    console.error('Error getHewanAktif:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data hewan aktif',
      error: error.message
    });
  }
};

// Get list semua hewan ternak (ADMIN) - dari semua kelompok
const getAllHewanAdmin = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    // Filter parameters
    const { status, kelompok_id, source } = req.query;

    // Build WHERE clause for filters
    let whereConditions = [];
    let params = [];
    let paramCount = 1;

    if (status) {
      whereConditions.push(`h.status = $${paramCount++}`);
      params.push(status);
    }

    if (kelompok_id) {
      whereConditions.push(`h.kelompok_id = $${paramCount++}`);
      params.push(parseInt(kelompok_id));
    }

    if (source) {
      whereConditions.push(`h.source = $${paramCount++}`);
      params.push(source);
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ') 
      : '';

    // Query with pagination and calculate age at SQL level
    const query = `
      SELECT 
        h.id,
        h.id_hewan,
        h.jenis_kelamin,
        h.ras,
        h.tanggal_lahir,
        h.status,
        h.bobot,
        h.source,
        h.kelompok_id,
        h.tanggal_status_tidak_aktif,
        h.tanggal_terjual,
        h.umur_saat_terjual,
        k.name as nama_kelompok,
        FLOOR(EXTRACT(DAY FROM (
          CASE 
            WHEN h.status = 'TIDAK_AKTIF' AND h.tanggal_status_tidak_aktif IS NOT NULL
            THEN h.tanggal_status_tidak_aktif - h.tanggal_lahir
            WHEN h.status = 'TERJUAL' AND h.tanggal_terjual IS NOT NULL
            THEN h.tanggal_terjual - h.tanggal_lahir
            ELSE NOW() - h.tanggal_lahir
          END
        ))) as umur_hari,
        FLOOR(EXTRACT(DAY FROM (
          CASE 
            WHEN h.status = 'TIDAK_AKTIF' AND h.tanggal_status_tidak_aktif IS NOT NULL
            THEN h.tanggal_status_tidak_aktif - h.tanggal_lahir
            WHEN h.status = 'TERJUAL' AND h.tanggal_terjual IS NOT NULL
            THEN h.tanggal_terjual - h.tanggal_lahir
            ELSE NOW() - h.tanggal_lahir
          END
        )) / 30) as umur_bulan,
        CASE 
          WHEN EXTRACT(DAY FROM (
            CASE 
              WHEN h.status = 'TIDAK_AKTIF' AND h.tanggal_status_tidak_aktif IS NOT NULL
              THEN h.tanggal_status_tidak_aktif - h.tanggal_lahir
              WHEN h.status = 'TERJUAL' AND h.tanggal_terjual IS NOT NULL
              THEN h.tanggal_terjual - h.tanggal_lahir
              ELSE NOW() - h.tanggal_lahir
            END
          )) < 30 
          THEN FLOOR(EXTRACT(DAY FROM (
            CASE 
              WHEN h.status = 'TIDAK_AKTIF' AND h.tanggal_status_tidak_aktif IS NOT NULL
              THEN h.tanggal_status_tidak_aktif - h.tanggal_lahir
              WHEN h.status = 'TERJUAL' AND h.tanggal_terjual IS NOT NULL
              THEN h.tanggal_terjual - h.tanggal_lahir
              ELSE NOW() - h.tanggal_lahir
            END
          ))) || ' hari'
          ELSE FLOOR(EXTRACT(DAY FROM (
            CASE 
              WHEN h.status = 'TIDAK_AKTIF' AND h.tanggal_status_tidak_aktif IS NOT NULL
              THEN h.tanggal_status_tidak_aktif - h.tanggal_lahir
              WHEN h.status = 'TERJUAL' AND h.tanggal_terjual IS NOT NULL
              THEN h.tanggal_terjual - h.tanggal_lahir
              ELSE NOW() - h.tanggal_lahir
            END
          )) / 30) || ' bulan'
        END as umur_display
      FROM hewan_ternak h
      LEFT JOIN kelompok k ON h.kelompok_id = k.id
      ${whereClause}
      ORDER BY h.tanggal_lahir DESC
      LIMIT $${paramCount++} OFFSET $${paramCount++}
    `;

    params.push(limit, offset);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*)::int as total
      FROM hewan_ternak h
      ${whereClause}
    `;

    const [result, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, params.slice(0, -2)) // Remove limit and offset
    ]);

    const total = countResult.rows[0].total;
    
    console.log(`[getAllHewanAdmin] Page ${page}, retrieved: ${result.rows.length} of ${total} total`);
    
    // Format response with umur data
    const hewanDenganUmur = result.rows.map(hewan => ({
      ...hewan,
      umur: {
        hari: hewan.umur_hari,
        bulan: hewan.umur_bulan,
        display: hewan.umur_display
      }
    }));

    res.json({
      success: true,
      data: hewanDenganUmur,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('[getAllHewanAdmin] Error:', error.message);
    console.error('[getAllHewanAdmin] Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data hewan',
      error: error.message
    });
  }
};

// Get detail hewan ternak (ADMIN) - bisa akses dari semua kelompok
const getDetailHewanAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Get hewan detail
    const hewanQuery = `
      SELECT h.*, k.name as nama_kelompok FROM hewan_ternak h
      LEFT JOIN kelompok k ON h.kelompok_id = k.id
      WHERE h.id = $1
    `;
    const hewanResult = await db.query(hewanQuery, [id]);
    
    if (hewanResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Hewan tidak ditemukan'
      });
    }

    const hewan = hewanResult.rows[0];

    // Get induk
    let induk = null;
    if (hewan.id_induk) {
      const indukQuery = `SELECT id, ras, jenis_kelamin FROM hewan_ternak WHERE id = $1`;
      const indukResult = await db.query(indukQuery, [hewan.id_induk]);
      if (indukResult.rows.length > 0) {
        induk = indukResult.rows[0];
      }
    }

    // Get pejantan
    let pejantan = null;
    if (hewan.id_pejantan) {
      const pejantanQuery = `SELECT id, ras, jenis_kelamin FROM hewan_ternak WHERE id = $1`;
      const pejantanResult = await db.query(pejantanQuery, [hewan.id_pejantan]);
      if (pejantanResult.rows.length > 0) {
        pejantan = pejantanResult.rows[0];
      }
    }

    // Get riwayat bobot
    const riwayatQuery = `
      SELECT bobot, tanggal_update, keterangan
      FROM riwayat_bobot
      WHERE hewan_id = $1
      ORDER BY tanggal_update DESC
      LIMIT 12
    `;
    const riwayatResult = await db.query(riwayatQuery, [id]);

    res.json({
      success: true,
      data: {
        ...hewan,
        umur: hitungUmur(hewan.tanggal_lahir),
        induk: induk || null,
        pejantan: pejantan || null,
        riwayatBobot: riwayatResult.rows
      }
    });
  } catch (error) {
    console.error('Error getDetailHewanAdmin:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail hewan',
      error: error.message
    });
  }
};

// Create hewan ternak (KELOMPOK - manual input)
const createHewan = async (req, res) => {
  try {
    const { kelompok_id, user_id } = req.user;
    const {
      id_hewan,                // User input: unique identifier
      jenis_kelamin,           // JANTAN or BETINA - required
      ras,                     // Breed/type - required
      bobot,                   // Weight in kg - required
      tanggal_lahir,           // Birth date (if provided, take priority)
      umur,                    // Age string if tanggal_lahir not provided
      catatan,                 // Optional notes
      source = 'Penyaluran',   // Default to Penyaluran for new kelompok
      id_induk,                // Optional: mother ID
      id_pejantan              // Optional: father ID
    } = req.body;

    // ===== VALIDASI WAJIB =====
    // 1. Check kelompok exists and belongs to user
    const kelompokCheck = `
      SELECT id FROM kelompok WHERE id = $1
    `;
    const kelompokResult = await db.query(kelompokCheck, [kelompok_id]);
    if (kelompokResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kelompok tidak ditemukan'
      });
    }

    // 2. Validate required fields
    if (!id_hewan || !jenis_kelamin || !ras || bobot === null || bobot === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Field wajib: id_hewan, jenis_kelamin, ras, bobot',
        received: {
          id_hewan,
          jenis_kelamin,
          ras,
          bobot,
          tanggal_lahir,
          umur
        }
      });
    }

    // 3. Validate jenis_kelamin
    if (!['JANTAN', 'BETINA'].includes(jenis_kelamin.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Jenis kelamin harus JANTAN atau BETINA'
      });
    }

    // 4. Validate bobot > 0
    if (bobot <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Bobot harus lebih dari 0'
      });
    }

    // 5. Determine tanggal_lahir
    let birthDate;
    if (tanggal_lahir) {
      birthDate = new Date(tanggal_lahir);
      if (isNaN(birthDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Format tanggal_lahir tidak valid (gunakan YYYY-MM-DD)'
        });
      }
    } else if (umur !== null && umur !== undefined && umur !== '') {
      // umur diberikan sebagai INT (jumlah bulan)
      // Hitung tanggal lahir berdasarkan umur
      const umurBulan = parseInt(umur, 10);
      if (isNaN(umurBulan) || umurBulan < 0) {
        return res.status(400).json({
          success: false,
          message: 'Umur harus berupa angka positif (dalam bulan)'
        });
      }
      
      // Hitung tanggal lahir: hari ini - (umur * 30 hari)
      birthDate = new Date();
      birthDate.setDate(birthDate.getDate() - (umurBulan * 30));
    } else {
      return res.status(400).json({
        success: false,
        message: 'Harus menyediakan tanggal_lahir atau umur'
      });
    }

    // 6. Check birth date not in future
    if (birthDate > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal lahir tidak boleh di masa depan'
      });
    }

    // 7. Check id_hewan unique (per kelompok)
    const uniqueCheck = `
      SELECT id FROM hewan_ternak 
      WHERE kelompok_id = $1 AND id_hewan = $2
    `;
    const uniqueResult = await db.query(uniqueCheck, [kelompok_id, id_hewan]);
    if (uniqueResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: `ID hewan "${id_hewan}" sudah terdaftar di kelompok ini`
      });
    }

    // 8. If id_induk or id_pejantan provided, validate they exist and belong to kelompok
    // NOTE: id_induk and id_pejantan are now database IDs (integers), not id_hewan strings
    if (id_induk) {
      const indukCheck = `SELECT id FROM hewan_ternak WHERE id = $1 AND kelompok_id = $2`;
      const indukResult = await db.query(indukCheck, [id_induk, kelompok_id]);
      if (indukResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Hewan induk dengan ID database "${id_induk}" tidak ditemukan di kelompok ini`
        });
      }
    }

    if (id_pejantan) {
      const pejantanCheck = `SELECT id FROM hewan_ternak WHERE id = $1 AND kelompok_id = $2`;
      const pejantanResult = await db.query(pejantanCheck, [id_pejantan, kelompok_id]);
      if (pejantanResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Hewan pejantan dengan ID database "${id_pejantan}" tidak ditemukan di kelompok ini`
        });
      }
    }

    // ===== CREATE HEWAN =====
    const insertQuery = `
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
      RETURNING id, id_hewan, jenis_kelamin, ras, bobot, tanggal_lahir, catatan, source, status
    `;

    const result = await db.query(insertQuery, [
      kelompok_id,
      id_hewan,
      jenis_kelamin.toUpperCase(),
      ras,
      bobot,
      birthDate,
      catatan || null,
      source,
      id_induk || null,
      id_pejantan || null,
      'AKTIF'
    ]);

    const createdHewan = result.rows[0];

    // Calculate age for response
    const umurInfo = hitungUmur(createdHewan.tanggal_lahir);

    // ===== AUTO-CREATE LAPORAN "PENAMBAHAN" =====
    try {
      const laporanData = {
        id_hewan: createdHewan.id_hewan,
        jenis_kelamin: createdHewan.jenis_kelamin,
        ras: createdHewan.ras,
        bobot: createdHewan.bobot,
        umur: umur || umurInfo.display,
        catatan: createdHewan.catatan
      };

      const laporanQuery = `
        INSERT INTO laporan (
          jenis,
          kelompok_id,
          data,
          user_id,
          tanggal,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, NOW(), NOW(), NOW())
        RETURNING id
      `;

      await db.query(laporanQuery, [
        'Penambahan',
        kelompok_id,
        JSON.stringify(laporanData),
        user_id
      ]);

      console.log(`[LAPORAN] Auto-created "Penambahan" for hewan ${id_hewan}`);
    } catch (laporanError) {
      console.warn(`[LAPORAN] Warning: Failed to create "Penambahan" laporan:`, laporanError.message);
      // Don't fail the hewan creation if laporan creation fails
    }

    res.json({
      success: true,
      message: `Hewan ternak "${id_hewan}" (ID database: ${createdHewan.id}) berhasil ditambahkan dan laporan penambahan otomatis dibuat`,
      data: {
        id: createdHewan.id,
        id_hewan: createdHewan.id_hewan,
        jenis_kelamin: createdHewan.jenis_kelamin,
        ras: createdHewan.ras,
        bobot: createdHewan.bobot,
        tanggal_lahir: createdHewan.tanggal_lahir,
        catatan: createdHewan.catatan,
        source: createdHewan.source,
        status: createdHewan.status,
        umur: umurInfo
      }
    });

    console.log(`[HEWAN] Created: ${id_hewan} untuk kelompok ${kelompok_id} dengan source="${source}"`);

  } catch (error) {
    console.error('Error createHewan:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan hewan ternak',
      error: error.message
    });
  }
};

/**
 * GET /api/hewan/candidates/pejantan - Get male animals for breeding
 * Filter: gender=JANTAN, age > 8 months, kelompok_id match, status=AKTIF
 */
const getPejantanCandidates = async (req, res) => {
  try {
    const { kelompok_id } = req.user;

    if (!kelompok_id) {
      return res.status(403).json({
        success: false,
        message: 'User tidak terikat dengan kelompok'
      });
    }

    // Query untuk hewan jantan usia > 8 bulan (240 hari) yang AKTIF
    const query = `
      SELECT 
        id,
        id_hewan,
        ras,
        jenis_kelamin,
        tanggal_lahir,
        FLOOR(EXTRACT(DAY FROM (
          CASE 
            WHEN status = 'TIDAK_AKTIF' AND tanggal_status_tidak_aktif IS NOT NULL
            THEN tanggal_status_tidak_aktif - tanggal_lahir
            ELSE NOW() - tanggal_lahir
          END
        ))) as umur_hari,
        FLOOR(EXTRACT(DAY FROM (
          CASE 
            WHEN status = 'TIDAK_AKTIF' AND tanggal_status_tidak_aktif IS NOT NULL
            THEN tanggal_status_tidak_aktif - tanggal_lahir
            ELSE NOW() - tanggal_lahir
          END
        )) / 30) as umur_bulan,
        CASE 
          WHEN EXTRACT(DAY FROM (
            CASE 
              WHEN status = 'TIDAK_AKTIF' AND tanggal_status_tidak_aktif IS NOT NULL
              THEN tanggal_status_tidak_aktif - tanggal_lahir
              ELSE NOW() - tanggal_lahir
            END
          )) < 30 
          THEN FLOOR(EXTRACT(DAY FROM (
            CASE 
              WHEN status = 'TIDAK_AKTIF' AND tanggal_status_tidak_aktif IS NOT NULL
              THEN tanggal_status_tidak_aktif - tanggal_lahir
              ELSE NOW() - tanggal_lahir
            END
          ))) || ' hari'
          ELSE FLOOR(EXTRACT(DAY FROM (
            CASE 
              WHEN status = 'TIDAK_AKTIF' AND tanggal_status_tidak_aktif IS NOT NULL
              THEN tanggal_status_tidak_aktif - tanggal_lahir
              ELSE NOW() - tanggal_lahir
            END
          )) / 30) || ' bulan'
        END as umur_display
      FROM hewan_ternak
      WHERE 
        kelompok_id = $1
        AND jenis_kelamin = 'JANTAN'
        AND status = 'AKTIF'
        AND EXTRACT(DAY FROM (NOW() - tanggal_lahir)) > 240
      ORDER BY id_hewan ASC
    `;

    const result = await db.query(query, [kelompok_id]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error getPejantanCandidates:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data pejantan',
      error: error.message
    });
  }
};

/**
 * GET /api/hewan/candidates/induk - Get female animals for breeding
 * Filter: gender=BETINA, age > 8 months, kelompok_id match, status=AKTIF
 */
const getIndukCandidates = async (req, res) => {
  try {
    const { kelompok_id } = req.user;

    if (!kelompok_id) {
      return res.status(403).json({
        success: false,
        message: 'User tidak terikat dengan kelompok'
      });
    }

    // Query untuk hewan betina usia > 8 bulan (240 hari) yang AKTIF
    const query = `
      SELECT 
        id,
        id_hewan,
        ras,
        jenis_kelamin,
        tanggal_lahir,
        FLOOR(EXTRACT(DAY FROM (
          CASE 
            WHEN status = 'TIDAK_AKTIF' AND tanggal_status_tidak_aktif IS NOT NULL
            THEN tanggal_status_tidak_aktif - tanggal_lahir
            ELSE NOW() - tanggal_lahir
          END
        ))) as umur_hari,
        FLOOR(EXTRACT(DAY FROM (
          CASE 
            WHEN status = 'TIDAK_AKTIF' AND tanggal_status_tidak_aktif IS NOT NULL
            THEN tanggal_status_tidak_aktif - tanggal_lahir
            ELSE NOW() - tanggal_lahir
          END
        )) / 30) as umur_bulan,
        CASE 
          WHEN EXTRACT(DAY FROM (
            CASE 
              WHEN status = 'TIDAK_AKTIF' AND tanggal_status_tidak_aktif IS NOT NULL
              THEN tanggal_status_tidak_aktif - tanggal_lahir
              ELSE NOW() - tanggal_lahir
            END
          )) < 30 
          THEN FLOOR(EXTRACT(DAY FROM (
            CASE 
              WHEN status = 'TIDAK_AKTIF' AND tanggal_status_tidak_aktif IS NOT NULL
              THEN tanggal_status_tidak_aktif - tanggal_lahir
              ELSE NOW() - tanggal_lahir
            END
          ))) || ' hari'
          ELSE FLOOR(EXTRACT(DAY FROM (
            CASE 
              WHEN status = 'TIDAK_AKTIF' AND tanggal_status_tidak_aktif IS NOT NULL
              THEN tanggal_status_tidak_aktif - tanggal_lahir
              ELSE NOW() - tanggal_lahir
            END
          )) / 30) || ' bulan'
        END as umur_display
      FROM hewan_ternak
      WHERE 
        kelompok_id = $1
        AND jenis_kelamin = 'BETINA'
        AND status = 'AKTIF'
        AND EXTRACT(DAY FROM (NOW() - tanggal_lahir)) > 240
      ORDER BY id_hewan ASC
    `;

    const result = await db.query(query, [kelompok_id]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error getIndukCandidates:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data induk',
      error: error.message
    });
  }
};

module.exports = {
  getHewanTernak,
  getDetailHewan,
  getHewanAktif,
  getAllHewanAdmin,
  getDetailHewanAdmin,
  createHewan,
  getPejantanCandidates,
  getIndukCandidates,
  hitungUmur
};
