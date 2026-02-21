const db = require('../db');

async function getKelompok(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Only return top-level kelompok (parent_kelompok_id IS NULL)
    // Mitra kelompok retrieved via separate /api/mitra-kelompok endpoint
    const { rows } = await db.query(`
      SELECT k.id, k.kode_kelompok, k.name, k.email, k.kecamatan, k.desa, k.catatan,
             k.latitude, k.longitude,
             k.pic1_nik, k.pic1_nama, k.pic1_alamat, k.pic1_no_hp, k.pic1_email,
             k.jumlah_kandang, k.jumlah_ternak, k.pakan_list, k.kesehatan_list,
             k.parent_kelompok_id,
             COUNT(u.id)::int as anggota_count 
      FROM kelompok k 
      LEFT JOIN users u ON u.kelompok_id = k.id 
      WHERE k.parent_kelompok_id IS NULL
      GROUP BY k.id, k.kode_kelompok, k.name, k.email, k.kecamatan, k.desa, k.catatan,
               k.latitude, k.longitude,
               k.pic1_nik, k.pic1_nama, k.pic1_alamat, k.pic1_no_hp, k.pic1_email,
               k.jumlah_kandang, k.jumlah_ternak, k.pakan_list, k.kesehatan_list,
               k.parent_kelompok_id
      ORDER BY k.id
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    // Get total count (top-level only)
    const { rows: countResult } = await db.query(`
      SELECT COUNT(DISTINCT k.id)::int as total FROM kelompok k WHERE k.parent_kelompok_id IS NULL
    `);

    const total = countResult[0].total;

    return res.json({ 
      success: true, 
      data: rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function getKelompokById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: 'ID kelompok tidak valid' });
    }

    const { rows } = await db.query(`
      SELECT k.id, k.kode_kelompok, k.name, k.email, k.kecamatan, k.desa, k.catatan,
             k.latitude, k.longitude,
             k.pic1_nik, k.pic1_nama, k.pic1_alamat, k.pic1_no_hp, k.pic1_email,
             k.jumlah_kandang, k.jumlah_ternak, k.pakan_list, k.kesehatan_list,
             k.parent_kelompok_id,
             COUNT(u.id)::int as anggota_count 
      FROM kelompok k 
      LEFT JOIN users u ON u.kelompok_id = k.id 
      WHERE k.id = $1
      GROUP BY k.id, k.kode_kelompok, k.name, k.email, k.kecamatan, k.desa, k.catatan,
               k.latitude, k.longitude,
               k.pic1_nik, k.pic1_nama, k.pic1_alamat, k.pic1_no_hp, k.pic1_email,
               k.jumlah_kandang, k.jumlah_ternak, k.pakan_list, k.kesehatan_list,
               k.parent_kelompok_id
    `, [id]);

    if (!rows[0]) {
      return res.status(404).json({ success: false, message: 'Kelompok tidak ditemukan' });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function createKelompok(req, res) {
  try {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'kelompok')) return res.status(403).json({ success: false, message: 'Forbidden' });
    const { name, kode_kelompok, email, kecamatan, desa, catatan, latitude, longitude, pic1_nik, pic1_nama, pic1_alamat, pic1_noHp, pic1_email, jumlahKandang, jumlahTernak, ternakDetails, pakanList, kesehatanList } = req.body || {};
    
    // DEBUG: Log received ternakDetails to verify data arrives correctly
    console.log(`[DEBUG createKelompok] Received ternakDetails:`, JSON.stringify(ternakDetails, null, 2));
    
    if (!name) return res.status(400).json({ success: false, message: 'Missing name' });
    
    // Validate kode_kelompok if provided - must be unique
    if (kode_kelompok && kode_kelompok.trim()) {
      const existingKode = await db.query(
        `SELECT id FROM kelompok WHERE kode_kelompok = $1`,
        [kode_kelompok.trim().toUpperCase()]
      );
      if (existingKode.rows.length > 0) {
        return res.status(400).json({ success: false, message: `Kode kelompok "${kode_kelompok}" sudah digunakan` });
      }
    }
    
    // Validate NIK and No HP - must be numeric only
    if (pic1_nik && typeof pic1_nik === 'string' && !/^\d+$/.test(pic1_nik.trim())) {
      return res.status(400).json({ success: false, message: 'NIK harus berisi angka saja' });
    }
    if (pic1_noHp && typeof pic1_noHp === 'string' && !/^\d+$/.test(pic1_noHp.trim())) {
      return res.status(400).json({ success: false, message: 'No HP harus berisi angka saja' });
    }
    
    // Convert NIK and NoHp to BigInt (PostgreSQL BIGINT), or null if empty
    const nikValue = pic1_nik && /^\d+$/.test(pic1_nik.toString().trim()) ? BigInt(pic1_nik.toString().trim()) : null;
    const noHpValue = pic1_noHp && /^\d+$/.test(pic1_noHp.toString().trim()) ? BigInt(pic1_noHp.toString().trim()) : null;
    
    const latToUseRaw = latitude === undefined || latitude === null || latitude === '' ? null : Number(latitude);
    const lonToUseRaw = longitude === undefined || longitude === null || longitude === '' ? null : Number(longitude);
    const latToUse = Number.isFinite(latToUseRaw) ? latToUseRaw : null;
    const lonToUse = Number.isFinite(lonToUseRaw) ? lonToUseRaw : null;
    
    // Convert arrays to JSON strings for JSONB columns
    const pakanListJson = pakanList ? JSON.stringify(pakanList) : null;
    const kesehatanListJson = kesehatanList ? JSON.stringify(kesehatanList) : null;
    
    // Start transaction for atomic operation
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Create kelompok
      const kodeKelompokValue = kode_kelompok && kode_kelompok.trim() ? kode_kelompok.trim().toUpperCase() : null;
      const kelompokResult = await client.query(
        `INSERT INTO kelompok (kode_kelompok, name, email, kecamatan, desa, catatan, latitude, longitude, pic1_nik, pic1_nama, pic1_alamat, pic1_no_hp, pic1_email, jumlah_kandang, jumlah_ternak, pakan_list, kesehatan_list) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) 
         RETURNING *`,
        [kodeKelompokValue, name, email || null, kecamatan || null, desa || null, catatan || null, latToUse, lonToUse,
         nikValue, pic1_nama || null, pic1_alamat || null, noHpValue, pic1_email || null,
         jumlahKandang || null, jumlahTernak || null, pakanListJson, kesehatanListJson]
      );
      
      const kelompokId = kelompokResult.rows[0].id;
      const kelompokData = kelompokResult.rows[0];
      
      console.log(`[kelompokController] Created kelompok ID: ${kelompokId}`);

      // 2. Insert individual hewan ternak records from ternakDetails
      // IMPORTANT: Setiap hewan HARUS divalidasi sebelum insert
      console.log(`[kelompokController] Menerima ternakDetails:`, JSON.stringify(ternakDetails, null, 2));
      // tanggalLahir optional - akan di-generate dari umur atau gunakan hari ini
      const validTernakDetails = Array.isArray(ternakDetails) 
        ? ternakDetails.filter(t => {
            const valid = t.jenisKelamin && t.ras && (t.bobot !== undefined && t.bobot !== '');
            if (!valid) {
              console.log(`[kelompokController] ❌ Hewan ditolak (tidak lengkap):`, t);
            }
            return valid;
          })
        : [];
      
      console.log(`[kelompokController] ✅ Hewan valid: ${validTernakDetails.length}`);
      
      if (validTernakDetails.length > 0) {
        console.log(`[kelompokController] 📝 Processing ${validTernakDetails.length} hewan ternak dari penyaluran...`);
        
        // VALIDATION: Check for duplicate ID Bisnis before inserting
        const idHewanList = validTernakDetails
          .map(t => t.idHewan || t.id_hewan)
          .filter(id => id !== null && id !== undefined);
        
        if (idHewanList.length > 0) {
          // Check if any ID Hewan already exists in this kelompok
          const placeholders = idHewanList.map((_, i) => `$${i + 2}`).join(',');
          const duplicateCheck = await client.query(
            `SELECT id_hewan FROM hewan_ternak WHERE kelompok_id = $1 AND id_hewan IN (${placeholders})`,
            [kelompokId, ...idHewanList]
          );
          
          if (duplicateCheck.rows.length > 0) {
            const duplicateIds = duplicateCheck.rows.map(r => r.id_hewan).join(', ');
            await client.query('ROLLBACK');
            return res.status(400).json({
              success: false,
              message: `ID Bisnis sudah terdaftar: ${duplicateIds}. Gunakan ID Bisnis yang berbeda.`,
              error_code: 'DUPLICATE_ID_BISNIS',
              duplicateIds: duplicateCheck.rows.map(r => r.id_hewan)
            });
          }
        }
        
        const insertedHewan = [];
        for (const ternak of validTernakDetails) {
          // DEBUG: Log ternak object to see what fields are available
          const debugLog = `[DEBUG] Processing ternak: keys=${Object.keys(ternak).join(',')}, idTernak=${ternak.idTernak}, idHewan=${ternak.idHewan}, id_hewan=${ternak.id_hewan}`;
          console.log(debugLog);
          
          // Auto-generate tanggalLahir jika tidak ada
          // Jika ada umur, hitung mundur dari hari ini
          let tglLahir;
          if (ternak.tanggalLahir || ternak.tanggal_lahir) {
            tglLahir = ternak.tanggalLahir || ternak.tanggal_lahir;
          } else if (ternak.umur && !isNaN(ternak.umur)) {
            // Hitung tanggal lahir dari umur (dalam bulan)
            const today = new Date();
            const birthDate = new Date(today.getFullYear(), today.getMonth() - parseInt(ternak.umur), today.getDate());
            tglLahir = birthDate.toISOString().split('T')[0];
          } else {
            // Default: hari ini
            tglLahir = new Date().toISOString().split('T')[0];
          }
          
          console.log(`[DEBUG] Final idHewan value being saved:`, ternak.idHewan || ternak.id_hewan || null);
          
          const insertResult = await client.query(
            `INSERT INTO hewan_ternak (
              kelompok_id, id_hewan, jenis_kelamin, ras, bobot, tanggal_lahir, catatan, source, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
            RETURNING id, id_hewan, jenis_kelamin, ras, bobot, source`,
            [
              kelompokId,
              ternak.idHewan || ternak.id_hewan || null,  // Optional user-provided identifier
              (ternak.jenisKelamin || '').toUpperCase(),
              ternak.ras || '',
              parseFloat(ternak.bobot) || 0,
              tglLahir,
              ternak.catatan || null,
              'Penyaluran'
            ]
          );
          
          insertedHewan.push(insertResult.rows[0]);
          console.log(`[kelompokController] ✅ Hewan ternak ID database: ${insertResult.rows[0].id}${insertResult.rows[0].id_hewan ? ` (id_hewan: ${insertResult.rows[0].id_hewan})` : ''} created: ${insertResult.rows[0].jenis_kelamin} (${insertResult.rows[0].ras})`);
        }
        console.log(`[kelompokController] ✅ Successfully inserted ${insertedHewan.length} hewan ternak`);
      } else {
        console.log(`[kelompokController] ⚠️ PERHATIAN: Tidak ada hewan ternak valid untuk di-insert!`);
      }

      // 3. Create initial "Penyaluran dan Bantuan" laporan (ringkasan saja)
      const laporanData = {
        jumlahKandang: jumlahKandang || 0,
        jumlahTernak: jumlahTernak || 0,
        jumlahTernakJantan: validTernakDetails.filter(t => t.jenisKelamin?.toUpperCase() === 'JANTAN').length || 0,
        jumlahTernakBetina: validTernakDetails.filter(t => t.jenisKelamin?.toUpperCase() === 'BETINA').length || 0,
        pakanList: pakanList || [],
        kesehatanList: kesehatanList || [],
        catatan: `Laporan awal penyaluran dan bantuan untuk kelompok ${name}. ${validTernakDetails.length} hewan ternak telah terdaftar.`
      };

      const laporanResult = await client.query(
        `INSERT INTO laporan (jenis, kelompok_id, data, tanggal, kelompok, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), $4, NOW(), NOW())
         RETURNING id`,
        ['Penyaluran', kelompokId, JSON.stringify(laporanData), name]
      );

      console.log(`[kelompokController] ✅ Created initial laporan ringkasan ID: ${laporanResult.rows[0].id}`);

      // Get count of inserted hewan ternak
      const hewanCountResult = await client.query(
        `SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN jenis_kelamin = 'JANTAN' THEN 1 END) as jantan,
          COUNT(CASE WHEN jenis_kelamin = 'BETINA' THEN 1 END) as betina
         FROM hewan_ternak 
         WHERE kelompok_id = $1 AND source = 'Penyaluran'`,
        [kelompokId]
      );
      
      const hewanStats = hewanCountResult.rows[0];
      console.log(`[kelompokController] ✅ Final hewan stats: Total=${hewanStats.total}, Jantan=${hewanStats.jantan}, Betina=${hewanStats.betina}`);

      await client.query('COMMIT');
      
      return res.json({ 
        success: true, 
        data: {
          kelompok: kelompokData,
          hewanTernak: {
            total: hewanStats.total,
            jantan: hewanStats.jantan,
            betina: hewanStats.betina
          }
        },
        message: `✅ Kelompok "${name}" berhasil dibuat dengan ${hewanStats.total} hewan ternak (${hewanStats.jantan} jantan, ${hewanStats.betina} betina).`
      });
    } catch (innerError) {
      await client.query('ROLLBACK');
      throw innerError;
    } finally {
      client.release();
    }
  } catch (e) {
    console.error('[kelompokController] Error in createKelompok:', e);
    return res.status(500).json({ success: false, message: 'Server error: ' + e.message });
  }
}

async function updateKelompok(req, res) {
  try {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'kelompok')) return res.status(403).json({ success: false, message: 'Forbidden' });
    const id = parseInt(req.params.id, 10);
    const { name, kode_kelompok, email, kecamatan, desa, catatan, latitude, longitude, pic1_nik, pic1_nama, pic1_alamat, pic1_noHp, pic1_email, jumlahKandang, jumlahTernak, pakanList, kesehatanList } = req.body || {};
    if (!name) return res.status(400).json({ success: false, message: 'Missing name' });
    
    // Validate kode_kelompok if provided - must be unique (exclude current record)
    if (kode_kelompok && kode_kelompok.trim()) {
      const existingKode = await db.query(
        `SELECT id FROM kelompok WHERE kode_kelompok = $1 AND id != $2`,
        [kode_kelompok.trim().toUpperCase(), id]
      );
      if (existingKode.rows.length > 0) {
        return res.status(400).json({ success: false, message: `Kode kelompok "${kode_kelompok}" sudah digunakan oleh kelompok lain` });
      }
    }
    
    // Validate NIK and No HP - must be numeric only
    if (pic1_nik && typeof pic1_nik === 'string' && !/^\d+$/.test(pic1_nik.trim())) {
      return res.status(400).json({ success: false, message: 'NIK harus berisi angka saja' });
    }
    if (pic1_noHp && typeof pic1_noHp === 'string' && !/^\d+$/.test(pic1_noHp.trim())) {
      return res.status(400).json({ success: false, message: 'No HP harus berisi angka saja' });
    }
    
    // Convert NIK and NoHp to BigInt, or null if empty
    const nikValue = pic1_nik && /^\d+$/.test(pic1_nik.toString().trim()) ? BigInt(pic1_nik.toString().trim()) : null;
    const noHpValue = pic1_noHp && /^\d+$/.test(pic1_noHp.toString().trim()) ? BigInt(pic1_noHp.toString().trim()) : null;
    
    const latToUseRaw = latitude === undefined || latitude === null || latitude === '' ? null : Number(latitude);
    const lonToUseRaw = longitude === undefined || longitude === null || longitude === '' ? null : Number(longitude);
    const latToUse = Number.isFinite(latToUseRaw) ? latToUseRaw : null;
    const lonToUse = Number.isFinite(lonToUseRaw) ? lonToUseRaw : null;
    
    // Convert arrays to JSON strings for JSONB columns
    const pakanListJson = pakanList ? JSON.stringify(pakanList) : null;
    const kesehatanListJson = kesehatanList ? JSON.stringify(kesehatanList) : null;
    
    const kodeKelompokValue = kode_kelompok !== undefined
      ? (kode_kelompok && kode_kelompok.trim() ? kode_kelompok.trim().toUpperCase() : null)
      : undefined;
    
    // Build query dynamically — only update kode_kelompok if it was sent in body
    let updateQuery, updateParams;
    if (kodeKelompokValue !== undefined) {
      updateQuery = `UPDATE kelompok SET kode_kelompok=$1, name=$2, email=$3, kecamatan=$4, desa=$5, catatan=$6, 
       latitude=$7, longitude=$8,
       pic1_nik=$9, pic1_nama=$10, pic1_alamat=$11, pic1_no_hp=$12, pic1_email=$13,
       jumlah_kandang=$14, jumlah_ternak=$15, pakan_list=$16, kesehatan_list=$17
       WHERE id=$18 RETURNING *`;
      updateParams = [kodeKelompokValue, name, email || null, kecamatan || null, desa || null, catatan || null, latToUse, lonToUse,
       nikValue, pic1_nama || null, pic1_alamat || null, noHpValue, pic1_email || null,
       jumlahKandang || null, jumlahTernak || null, pakanListJson, kesehatanListJson, id];
    } else {
      updateQuery = `UPDATE kelompok SET name=$1, email=$2, kecamatan=$3, desa=$4, catatan=$5, 
       latitude=$6, longitude=$7,
       pic1_nik=$8, pic1_nama=$9, pic1_alamat=$10, pic1_no_hp=$11, pic1_email=$12,
       jumlah_kandang=$13, jumlah_ternak=$14, pakan_list=$15, kesehatan_list=$16
       WHERE id=$17 RETURNING *`;
      updateParams = [name, email || null, kecamatan || null, desa || null, catatan || null, latToUse, lonToUse,
       nikValue, pic1_nama || null, pic1_alamat || null, noHpValue, pic1_email || null,
       jumlahKandang || null, jumlahTernak || null, pakanListJson, kesehatanListJson, id];
    }
    
    const { rows } = await db.query(updateQuery, updateParams);
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, data: rows[0] });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function deleteKelompok(req, res) {
  try {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' });
    const id = parseInt(req.params.id, 10);
    
    // Start transaction for safe deletion
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Get kelompok name for logging
      const kelompokRes = await client.query('SELECT name FROM kelompok WHERE id=$1', [id]);
      if (!kelompokRes.rows[0]) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: 'Kelompok tidak ditemukan' });
      }
      
      const kelompokName = kelompokRes.rows[0].name;
      console.log(`[kelompokController] Deleting kelompok ID ${id} (${kelompokName}) and all related data...`);

      // Delete in order of foreign key dependencies
      // 0. Get all mitra kelompok IDs of this kelompok (children)
      const mitraRes = await client.query(
        'SELECT id FROM kelompok WHERE parent_kelompok_id=$1',
        [id]
      );
      const mitraIds = mitraRes.rows.map(r => r.id);
      
      // Delete each mitra kelompok and their related data
      for (const mitraId of mitraIds) {
        await client.query('DELETE FROM update_ternak WHERE kelompok_id=$1', [mitraId]);
        await client.query(
          'DELETE FROM riwayat_bobot WHERE hewan_id IN (SELECT id FROM hewan_ternak WHERE kelompok_id=$1)',
          [mitraId]
        );
        await client.query('UPDATE hewan_ternak SET id_induk=NULL, id_pejantan=NULL WHERE kelompok_id=$1', [mitraId]);
        await client.query('DELETE FROM hewan_ternak WHERE kelompok_id=$1', [mitraId]);
        await client.query('DELETE FROM laporan WHERE kelompok_id=$1', [mitraId]);
        await client.query('DELETE FROM users WHERE kelompok_id=$1', [mitraId]);
        await client.query('DELETE FROM kelompok WHERE id=$1', [mitraId]);
        console.log(`[kelompokController] Deleted mitra kelompok ID ${mitraId}`);
      }

      // 1. Delete update_ternak (references hewan_ternak)
      const deleteUpdateTernakRes = await client.query(
        'DELETE FROM update_ternak WHERE kelompok_id=$1',
        [id]
      );
      console.log(`[kelompokController] Deleted ${deleteUpdateTernakRes.rowCount} update_ternak records`);

      // 2. Delete riwayat_bobot (references hewan_ternak)
      const deleteRiwayatRes = await client.query(
        'DELETE FROM riwayat_bobot WHERE hewan_id IN (SELECT id FROM hewan_ternak WHERE kelompok_id=$1)',
        [id]
      );
      console.log(`[kelompokController] Deleted ${deleteRiwayatRes.rowCount} riwayat_bobot records`);

      // 3. Delete hewan_ternak (references kelompok and self for induk/pejantan)
      // First break self-references by setting induk/pejantan to NULL
      await client.query(
        'UPDATE hewan_ternak SET id_induk=NULL, id_pejantan=NULL WHERE kelompok_id=$1',
        [id]
      );
      const deleteHewanRes = await client.query(
        'DELETE FROM hewan_ternak WHERE kelompok_id=$1',
        [id]
      );
      console.log(`[kelompokController] Deleted ${deleteHewanRes.rowCount} hewan_ternak records`);

      // 4. Delete laporan (references kelompok)
      const deleteLaporanRes = await client.query(
        'DELETE FROM laporan WHERE kelompok_id=$1',
        [id]
      );
      console.log(`[kelompokController] Deleted ${deleteLaporanRes.rowCount} laporan records`);

      // 5. Delete users (references kelompok)
      const deleteUsersRes = await client.query(
        'DELETE FROM users WHERE kelompok_id=$1',
        [id]
      );
      console.log(`[kelompokController] Deleted ${deleteUsersRes.rowCount} users records`);

      // 6. Finally delete the kelompok itself
      const deleteKelompokRes = await client.query(
        'DELETE FROM kelompok WHERE id=$1 RETURNING id',
        [id]
      );

      await client.query('COMMIT');

      console.log(`[kelompokController] ✅ Successfully deleted kelompok "${kelompokName}" and all related data`);
      return res.json({ 
        success: true, 
        data: { 
          id,
          message: `Kelompok "${kelompokName}" dan semua data terkait telah dihapus`
        }
      });

    } catch (innerError) {
      await client.query('ROLLBACK');
      throw innerError;
    } finally {
      client.release();
    }

  } catch (e) {
    console.error('[kelompokController] Error in deleteKelompok:', e);
    return res.status(500).json({ success: false, message: 'Server error: ' + e.message });
  }
}

async function updateKelompokKode(req, res) {
  try {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'kelompok')) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: 'ID kelompok tidak valid' });
    }

    const { kode_kelompok } = req.body || {};

    // Validate: kode_kelompok must be provided
    if (kode_kelompok === undefined || kode_kelompok === null) {
      return res.status(400).json({ success: false, message: 'kode_kelompok wajib diisi' });
    }

    const kodeValue = kode_kelompok.trim() ? kode_kelompok.trim().toUpperCase() : null;

    // Check uniqueness (exclude current record)
    if (kodeValue) {
      const existing = await db.query(
        `SELECT id FROM kelompok WHERE kode_kelompok = $1 AND id != $2`,
        [kodeValue, id]
      );
      if (existing.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Kode kelompok "${kodeValue}" sudah digunakan oleh kelompok lain`
        });
      }
    }

    const { rows } = await db.query(
      `UPDATE kelompok SET kode_kelompok = $1 WHERE id = $2 RETURNING id, kode_kelompok, name`,
      [kodeValue, id]
    );

    if (!rows[0]) {
      return res.status(404).json({ success: false, message: 'Kelompok tidak ditemukan' });
    }

    return res.json({
      success: true,
      data: rows[0],
      message: kodeValue
        ? `Kode kelompok berhasil diperbarui menjadi "${kodeValue}"`
        : 'Kode kelompok berhasil dihapus'
    });
  } catch (e) {
    console.error('[kelompokController] Error updateKelompokKode:', e);
    return res.status(500).json({ success: false, message: 'Server error: ' + e.message });
  }
}

module.exports = { getKelompok, getKelompokById, createKelompok, updateKelompok, updateKelompokKode, deleteKelompok };
