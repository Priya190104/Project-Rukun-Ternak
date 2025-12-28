const db = require('../db');

// Submit laporan Update Ternak
const submitUpdateTernak = async (req, res) => {
  try {
    const { kelompok_id, user_id } = req.user;
    const { hewan_id, bobot, keterangan, tanggal_update } = req.body;

    // Validasi input
    if (!hewan_id || !bobot) {
      return res.status(400).json({
        success: false,
        message: 'ID Hewan dan Bobot harus diisi'
      });
    }

    if (bobot <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Bobot harus lebih dari 0'
      });
    }

    // Cek hewan milik kelompok dan status AKTIF
    const hewanCheck = `
      SELECT id, status, ras FROM hewan_ternak
      WHERE id = $1 AND kelompok_id = $2
    `;
    const hewanResult = await db.query(hewanCheck, [hewan_id, kelompok_id]);
    
    if (hewanResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Hewan tidak ditemukan'
      });
    }

    const hewan = hewanResult.rows[0];

    if (hewan.status !== 'AKTIF') {
      return res.status(400).json({
        success: false,
        message: `Hewan dengan status ${hewan.status} tidak dapat diupdate`
      });
    }

    // Validasi 1 kali per bulan per hewan
    const lastUpdateCheck = `
      SELECT tanggal_update FROM riwayat_bobot
      WHERE hewan_id = $1
      AND tanggal_update >= CURRENT_DATE - INTERVAL '30 days'
      ORDER BY tanggal_update DESC
      LIMIT 1
    `;
    const lastUpdateResult = await db.query(lastUpdateCheck, [hewan_id]);
    
    if (lastUpdateResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Hewan ini sudah diupdate dalam 30 hari terakhir'
      });
    }

    // Use transaction to ensure all three operations succeed together
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      
      // Simpan ke update_ternak (sebagai catatan laporan)
      const updateTernakInsert = `
        INSERT INTO update_ternak (hewan_id, kelompok_id, bobot, keterangan, tanggal_update)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `;
      const updateTernakResult = await client.query(updateTernakInsert, [
        hewan_id,
        kelompok_id,
        bobot,
        keterangan || null,
        tanggal_update || new Date()
      ]);

      // Simpan riwayat bobot
      const riwayatInsert = `
        INSERT INTO riwayat_bobot (hewan_id, bobot, tanggal_update, keterangan)
        VALUES ($1, $2, $3, $4)
      `;
      await client.query(riwayatInsert, [
        hewan_id,
        bobot,
        tanggal_update || new Date(),
        keterangan || null
      ]);

      // Update bobot terakhir di hewan_ternak
      const updateBobot = `
        UPDATE hewan_ternak
        SET bobot = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `;
      await client.query(updateBobot, [bobot, hewan_id]);

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Update ternak berhasil disimpan',
        data: {
          id: updateTernakResult.rows[0].id
        }
      });
    } catch (txError) {
      await client.query('ROLLBACK');
      throw txError;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error submitUpdateTernak:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menyimpan update ternak',
      error: error.message
    });
  }
};

// Get riwayat update ternak
const getRiwayatUpdateTernak = async (req, res) => {
  try {
    const { kelompok_id } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid pagination parameters' 
      });
    }

    const [dataResult, countResult] = await Promise.all([
      db.query(`
        SELECT 
          ut.id,
          ut.hewan_id,
          ht.ras,
          ut.bobot,
          ut.tanggal_update,
          ut.keterangan,
          ut.status,
          ut.created_at
        FROM update_ternak ut
        JOIN hewan_ternak ht ON ut.hewan_id = ht.id
        WHERE ut.kelompok_id = $1
        ORDER BY ut.created_at DESC
        LIMIT $2 OFFSET $3
      `, [kelompok_id, limit, offset]),
      
      db.query(`
        SELECT COUNT(*)::int as total
        FROM update_ternak ut
        WHERE ut.kelompok_id = $1
      `, [kelompok_id])
    ]);

    const total = countResult.rows[0].total;

    res.json({
      success: true,
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getRiwayatUpdateTernak:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil riwayat update',
      error: error.message
    });
  }
};

module.exports = {
  submitUpdateTernak,
  getRiwayatUpdateTernak
};
