const db = require('../db');

// Hitung umur hewan berdasarkan tanggal lahir
const hitungUmur = (tanggalLahir) => {
  const today = new Date();
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
    const query = `
      SELECT 
        id,
        jenis_kelamin,
        ras,
        tanggal_lahir,
        status,
        bobot,
        FLOOR(EXTRACT(DAY FROM (NOW() - tanggal_lahir))) as umur_hari,
        FLOOR(EXTRACT(DAY FROM (NOW() - tanggal_lahir)) / 30) as umur_bulan,
        CASE 
          WHEN EXTRACT(DAY FROM (NOW() - tanggal_lahir)) < 30 
          THEN FLOOR(EXTRACT(DAY FROM (NOW() - tanggal_lahir))) || ' hari'
          ELSE FLOOR(EXTRACT(DAY FROM (NOW() - tanggal_lahir)) / 30) || ' bulan'
        END as umur_display
      FROM hewan_ternak
      WHERE kelompok_id = $1
      AND status != 'TERJUAL'
      ORDER BY tanggal_lahir DESC
      LIMIT $2 OFFSET $3
    `;

    const [result, countRes] = await Promise.all([
      db.query(query, [kelompok_id, limit, offset]),
      db.query(`SELECT COUNT(*)::int as total FROM hewan_ternak WHERE kelompok_id = $1 AND status != 'TERJUAL'`, [kelompok_id])
    ]);

    const total = countRes.rows[0].total;

    res.json({
      success: true,
      data: result.rows,
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
    const hewanQuery = `
      SELECT 
        h.id, h.kelompok_id, h.jenis_kelamin, h.ras, h.tanggal_lahir, 
        h.bobot, h.status, h.id_induk, h.id_pejantan,
        induk.id as induk_id, induk.ras as induk_ras, 
        induk.jenis_kelamin as induk_jenis, induk.bobot as induk_bobot,
        pejantan.id as pejantan_id, pejantan.ras as pejantan_ras, 
        pejantan.jenis_kelamin as pejantan_jenis, pejantan.bobot as pejantan_bobot,
        FLOOR(EXTRACT(DAY FROM (NOW() - h.tanggal_lahir))) as umur_hari,
        FLOOR(EXTRACT(DAY FROM (NOW() - h.tanggal_lahir)) / 30) as umur_bulan,
        CASE 
          WHEN EXTRACT(DAY FROM (NOW() - h.tanggal_lahir)) < 30 
          THEN FLOOR(EXTRACT(DAY FROM (NOW() - h.tanggal_lahir))) || ' hari'
          ELSE FLOOR(EXTRACT(DAY FROM (NOW() - h.tanggal_lahir)) / 30) || ' bulan'
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
      ras: row.ras,
      jenis_kelamin: row.jenis_kelamin,
      tanggal_lahir: row.tanggal_lahir,
      bobot: row.bobot,
      status: row.status,
      id_induk: row.id_induk,
      id_pejantan: row.id_pejantan,
      umur: {
        hari: row.umur_hari,
        bulan: row.umur_bulan,
        display: row.umur_display
      },
      induk: row.induk_id ? {
        id: row.induk_id,
        ras: row.induk_ras,
        jenis_kelamin: row.induk_jenis,
        bobot: row.induk_bobot
      } : null,
      pejantan: row.pejantan_id ? {
        id: row.pejantan_id,
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
    const query = `
      SELECT 
        h.id,
        h.jenis_kelamin,
        h.ras,
        h.tanggal_lahir,
        h.status,
        h.bobot,
        h.kelompok_id,
        k.name as nama_kelompok
      FROM hewan_ternak h
      JOIN kelompok k ON h.kelompok_id = k.id
      WHERE h.status != 'TERJUAL'
      ORDER BY h.tanggal_lahir DESC
    `;

    const result = await db.query(query);
    
    // Tambahkan umur untuk setiap hewan
    const hewanDenganUmur = result.rows.map(hewan => ({
      ...hewan,
      umur: hitungUmur(hewan.tanggal_lahir)
    }));

    res.json({
      success: true,
      data: hewanDenganUmur,
      total: hewanDenganUmur.length
    });
  } catch (error) {
    console.error('Error getAllHewanAdmin:', error);
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
      JOIN kelompok k ON h.kelompok_id = k.id
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

module.exports = {
  getHewanTernak,
  getDetailHewan,
  getHewanAktif,
  getAllHewanAdmin,
  getDetailHewanAdmin,
  hitungUmur
};
