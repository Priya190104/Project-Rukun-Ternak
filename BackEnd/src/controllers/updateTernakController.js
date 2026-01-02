const db = require('../db');

// Submit laporan Update Ternak
const submitUpdateTernak = async (req, res) => {
  try {
    console.log('[updateTernakController] submitUpdateTernak called');
    console.log('  req.user:', req.user);
    console.log('  req.body:', req.body);
    
    const { kelompok_id, user_id, id } = req.user;

    // Validate that kelompok_id exists (required for ownership verification)
    if (!kelompok_id) {
      return res.status(403).json({
        success: false,
        message: 'User must be assigned to a kelompok to submit update ternak'
      });
    }

    const { hewan_id, bobot, keterangan, tanggal_update } = req.body;

    console.log('[updateTernakController] Field validation:');
    console.log('  hewan_id:', hewan_id, 'type:', typeof hewan_id);
    console.log('  bobot:', bobot, 'type:', typeof bobot);
    console.log('  tanggal_update:', tanggal_update, 'type:', typeof tanggal_update);
    console.log('  keterangan:', keterangan, 'type:', typeof keterangan);

    // Validasi input
    if (!hewan_id || hewan_id === '') {
      return res.status(400).json({
        success: false,
        message: 'ID Hewan harus diisi'
      });
    }

    if (!bobot && bobot !== 0) {
      return res.status(400).json({
        success: false,
        message: 'Bobot harus diisi'
      });
    }

    const bobotNum = parseFloat(bobot);
    if (isNaN(bobotNum) || bobotNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Bobot harus berupa angka positif'
      });
    }

    // OWNERSHIP CHECK: Cek hewan milik kelompok dan status AKTIF
    const hewanCheck = `
      SELECT id, status, ras FROM hewan_ternak
      WHERE id = $1 AND kelompok_id = $2
    `;
    const hewanResult = await db.query(hewanCheck, [hewan_id, kelompok_id]);
    
    if (hewanResult.rows.length === 0) {
      // Hewan not found for this kelompok (either doesn't exist or belongs to different kelompok)
      console.warn(`[updateTernakController] Hewan ${hewan_id} not found for kelompok ${kelompok_id}. User ${user_id} attempted unauthorized access.`);
      return res.status(404).json({
        success: false,
        message: 'Hewan tidak ditemukan atau bukan milik kelompok anda'
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
      
      // Parse tanggal_update - handle string date format from frontend
      let updateDate;
      if (tanggal_update) {
        // If it's a string like "2025-12-30", convert to Date
        if (typeof tanggal_update === 'string') {
          updateDate = new Date(tanggal_update + 'T00:00:00Z');
        } else {
          updateDate = new Date(tanggal_update);
        }
      } else {
        updateDate = new Date();
      }

      console.log('[updateTernakController] Date conversion:');
      console.log('  Input tanggal_update:', tanggal_update);
      console.log('  Converted updateDate:', updateDate);
      console.log('  ISO String:', updateDate.toISOString());
      
      // Simpan ke update_ternak (sebagai catatan laporan)
      const updateTernakInsert = `
        INSERT INTO update_ternak (hewan_id, kelompok_id, bobot, keterangan, tanggal_update)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `;
      console.log('[updateTernakController] Executing updateTernakInsert:');
      console.log('  Params: [', hewan_id, ',', kelompok_id, ',', bobotNum, ',', keterangan, ',', updateDate.toISOString(), ']');
      
      const updateTernakResult = await client.query(updateTernakInsert, [
        hewan_id,
        kelompok_id,
        bobotNum,
        keterangan || null,
        updateDate
      ]);

      console.log('[updateTernakController] updateTernakInsert success, result id:', updateTernakResult.rows[0].id);

      // Simpan riwayat bobot
      const riwayatInsert = `
        INSERT INTO riwayat_bobot (hewan_id, bobot, tanggal_update, keterangan)
        VALUES ($1, $2, $3, $4)
      `;
      console.log('[updateTernakController] Executing riwayatInsert:');
      console.log('  Params: [', hewan_id, ',', bobotNum, ',', updateDate.toISOString(), ',', keterangan, ']');
      
      await client.query(riwayatInsert, [
        hewan_id,
        bobotNum,
        updateDate,
        keterangan || null
      ]);

      console.log('[updateTernakController] riwayatInsert success');

      // Update bobot terakhir di hewan_ternak
      const updateBobot = `
        UPDATE hewan_ternak
        SET bobot = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `;
      console.log('[updateTernakController] Executing updateBobot:');
      console.log('  Params: [', bobotNum, ',', hewan_id, ']');
      
      const updateBobotResult = await client.query(updateBobot, [bobotNum, hewan_id]);
      
      console.log('[updateTernakController] updateBobot success, rows affected:', updateBobotResult.rowCount);

      await client.query('COMMIT');

      console.log(`[updateTernakController] ✅ Successfully updated hewan ${hewan_id} bobot to ${bobotNum} for kelompok ${kelompok_id}`);

      res.json({
        success: true,
        message: 'Update ternak berhasil disimpan',
        data: {
          id: updateTernakResult.rows[0].id
        }
      });
    } catch (txError) {
      console.error('[updateTernakController] Transaction error:');
      console.error('  Message:', txError.message);
      console.error('  Code:', txError.code);
      console.error('  Detail:', txError.detail);
      console.error('  Stack:', txError.stack);
      
      try {
        await client.query('ROLLBACK');
      } catch (rollbackErr) {
        console.error('[updateTernakController] Rollback error:', rollbackErr.message);
      }
      throw txError;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('[updateTernakController] ERROR submitUpdateTernak:');
    console.error('  Message:', error.message);
    console.error('  Code:', error.code);
    console.error('  Detail:', error.detail);
    console.error('  Constraint:', error.constraint);
    console.error('  Schema:', error.schema);
    console.error('  Table:', error.table);
    console.error('  Column:', error.column);
    console.error('  Severity:', error.severity);
    console.error('  Full error:', error);
    console.error('  Stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Gagal menyimpan update ternak',
      error: error.message,
      code: error.code,
      detail: error.detail
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
