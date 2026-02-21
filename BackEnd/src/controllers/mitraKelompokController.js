const db = require('../db');

// Helper: Verify that the requesting user (role=kelompok) owns the given parentKelompokId
function isOwnerOrAdmin(user, parentKelompokId) {
  if (user.role === 'admin') return true;
  if (user.role === 'kelompok' && user.kelompok_id === parentKelompokId) return true;
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/mitra-kelompok?parent_id=:parentId
// Admin: all mitra kelompok for given parent
// Kelompok: only their own mitra kelompok (parent = their kelompok_id)
// ─────────────────────────────────────────────────────────────────────────────
async function getMitraKelompok(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    let parentId;

    if (req.user && req.user.role === 'admin') {
      // Admin may specify parent_id to filter, or omit to get all mitra kelompok
      parentId = req.query.parent_id ? parseInt(req.query.parent_id) : null;
    } else if (req.user && req.user.role === 'kelompok') {
      // Kelompok can only see their own mitra
      parentId = req.user.kelompok_id;
    } else {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const whereClause = parentId
      ? 'WHERE k.parent_kelompok_id = $3'
      : 'WHERE k.parent_kelompok_id IS NOT NULL';

    const queryParams = parentId ? [limit, offset, parentId] : [limit, offset];
    const countParams = parentId ? [parentId] : [];

    const { rows } = await db.query(`
      SELECT k.id, k.kode_kelompok, k.name, k.email, k.kecamatan, k.desa, k.catatan,
             k.latitude, k.longitude,
             k.pic1_nik, k.pic1_nama, k.pic1_alamat, k.pic1_no_hp, k.pic1_email,
             k.jumlah_kandang, k.jumlah_ternak, k.pakan_list, k.kesehatan_list,
             k.parent_kelompok_id,
             pk.name AS parent_kelompok_name,
             COUNT(u.id)::int as anggota_count
      FROM kelompok k
      LEFT JOIN kelompok pk ON pk.id = k.parent_kelompok_id
      LEFT JOIN users u ON u.kelompok_id = k.id
      ${whereClause}
      GROUP BY k.id, k.kode_kelompok, k.name, k.email, k.kecamatan, k.desa, k.catatan,
               k.latitude, k.longitude,
               k.pic1_nik, k.pic1_nama, k.pic1_alamat, k.pic1_no_hp, k.pic1_email,
               k.jumlah_kandang, k.jumlah_ternak, k.pakan_list, k.kesehatan_list,
               k.parent_kelompok_id, pk.name
      ORDER BY k.id
      LIMIT $1 OFFSET $2
    `, queryParams);

    const countWhereClause = parentId
      ? 'WHERE parent_kelompok_id = $1'
      : 'WHERE parent_kelompok_id IS NOT NULL';
    const { rows: countResult } = await db.query(
      `SELECT COUNT(*)::int as total FROM kelompok ${countWhereClause}`,
      countParams
    );

    return res.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (e) {
    console.error('[mitraKelompokController] getMitraKelompok error:', e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/mitra-kelompok/:id
// ─────────────────────────────────────────────────────────────────────────────
async function getMitraKelompokById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: 'ID tidak valid' });
    }

    const { rows } = await db.query(`
      SELECT k.id, k.kode_kelompok, k.name, k.email, k.kecamatan, k.desa, k.catatan,
             k.latitude, k.longitude,
             k.pic1_nik, k.pic1_nama, k.pic1_alamat, k.pic1_no_hp, k.pic1_email,
             k.jumlah_kandang, k.jumlah_ternak, k.pakan_list, k.kesehatan_list,
             k.parent_kelompok_id,
             pk.name AS parent_kelompok_name,
             COUNT(u.id)::int as anggota_count
      FROM kelompok k
      LEFT JOIN kelompok pk ON pk.id = k.parent_kelompok_id
      LEFT JOIN users u ON u.kelompok_id = k.id
      WHERE k.id = $1 AND k.parent_kelompok_id IS NOT NULL
      GROUP BY k.id, k.kode_kelompok, k.name, k.email, k.kecamatan, k.desa, k.catatan,
               k.latitude, k.longitude,
               k.pic1_nik, k.pic1_nama, k.pic1_alamat, k.pic1_no_hp, k.pic1_email,
               k.jumlah_kandang, k.jumlah_ternak, k.pakan_list, k.kesehatan_list,
               k.parent_kelompok_id, pk.name
    `, [id]);

    if (!rows[0]) {
      return res.status(404).json({ success: false, message: 'Mitra Kelompok tidak ditemukan' });
    }

    const mitra = rows[0];

    // Authorization: kelompok dapat hanya melihat mitra miliknya
    if (req.user && req.user.role === 'kelompok' && mitra.parent_kelompok_id !== req.user.kelompok_id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    return res.json({ success: true, data: mitra });
  } catch (e) {
    console.error('[mitraKelompokController] getMitraKelompokById error:', e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/mitra-kelompok
// Admin: can create mitra for any kelompok (provide parent_kelompok_id in body)
// Kelompok: creates mitra for their own kelompok_id
// ─────────────────────────────────────────────────────────────────────────────
async function createMitraKelompok(req, res) {
  try {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'kelompok')) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const {
      parent_kelompok_id,
      name, kode_kelompok, email, kecamatan, desa, catatan,
      latitude, longitude,
      pic1_nik, pic1_nama, pic1_alamat, pic1_noHp, pic1_email,
      jumlahKandang, jumlahTernak, ternakDetails, pakanList, kesehatanList
    } = req.body || {};

    if (!name) return res.status(400).json({ success: false, message: 'Nama mitra kelompok wajib diisi' });

    // Determine parent
    let parentId;
    if (req.user.role === 'admin') {
      if (!parent_kelompok_id) {
        return res.status(400).json({ success: false, message: 'parent_kelompok_id wajib diisi oleh admin' });
      }
      parentId = parseInt(parent_kelompok_id, 10);
    } else {
      // kelompok role: use their own kelompok_id
      parentId = req.user.kelompok_id;
    }

    // Verify parent exists and is a top-level kelompok (not a mitra itself)
    const parentCheck = await db.query(
      'SELECT id, name, parent_kelompok_id FROM kelompok WHERE id=$1',
      [parentId]
    );
    if (!parentCheck.rows[0]) {
      return res.status(404).json({ success: false, message: 'Kelompok induk tidak ditemukan' });
    }
    if (parentCheck.rows[0].parent_kelompok_id !== null) {
      return res.status(400).json({ success: false, message: 'Mitra kelompok tidak bisa memiliki mitra kelompok lagi (maksimal 2 level)' });
    }

    // Validate kode_kelompok uniqueness
    if (kode_kelompok && kode_kelompok.trim()) {
      const existingKode = await db.query(
        `SELECT id FROM kelompok WHERE kode_kelompok = $1`,
        [kode_kelompok.trim().toUpperCase()]
      );
      if (existingKode.rows.length > 0) {
        return res.status(400).json({ success: false, message: `Kode kelompok "${kode_kelompok}" sudah digunakan` });
      }
    }

    // Validate NIK and NoHp
    if (pic1_nik && typeof pic1_nik === 'string' && !/^\d+$/.test(pic1_nik.trim())) {
      return res.status(400).json({ success: false, message: 'NIK harus berisi angka saja' });
    }
    if (pic1_noHp && typeof pic1_noHp === 'string' && !/^\d+$/.test(pic1_noHp.trim())) {
      return res.status(400).json({ success: false, message: 'No HP harus berisi angka saja' });
    }

    const nikValue = pic1_nik && /^\d+$/.test(pic1_nik.toString().trim()) ? BigInt(pic1_nik.toString().trim()) : null;
    const noHpValue = pic1_noHp && /^\d+$/.test(pic1_noHp.toString().trim()) ? BigInt(pic1_noHp.toString().trim()) : null;

    const latToUseRaw = latitude === undefined || latitude === null || latitude === '' ? null : Number(latitude);
    const lonToUseRaw = longitude === undefined || longitude === null || longitude === '' ? null : Number(longitude);
    const latToUse = Number.isFinite(latToUseRaw) ? latToUseRaw : null;
    const lonToUse = Number.isFinite(lonToUseRaw) ? lonToUseRaw : null;

    const pakanListJson = pakanList ? JSON.stringify(pakanList) : null;
    const kesehatanListJson = kesehatanList ? JSON.stringify(kesehatanList) : null;
    const kodeKelompokValue = kode_kelompok && kode_kelompok.trim() ? kode_kelompok.trim().toUpperCase() : null;

    const dbClient = await db.pool.connect();
    try {
      await dbClient.query('BEGIN');

      // Create the mitra kelompok (with parent_kelompok_id)
      const mitraResult = await dbClient.query(
        `INSERT INTO kelompok (
          kode_kelompok, name, email, kecamatan, desa, catatan,
          latitude, longitude,
          pic1_nik, pic1_nama, pic1_alamat, pic1_no_hp, pic1_email,
          jumlah_kandang, jumlah_ternak, pakan_list, kesehatan_list,
          parent_kelompok_id
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
        RETURNING *`,
        [
          kodeKelompokValue, name, email || null, kecamatan || null, desa || null,
          catatan || null, latToUse, lonToUse,
          nikValue, pic1_nama || null, pic1_alamat || null, noHpValue, pic1_email || null,
          jumlahKandang || null, jumlahTernak || null, pakanListJson, kesehatanListJson,
          parentId
        ]
      );

      const mitraId = mitraResult.rows[0].id;
      const mitraData = mitraResult.rows[0];

      // Handle ternakDetails (same logic as kelompokController)
      const validTernakDetails = Array.isArray(ternakDetails)
        ? ternakDetails.filter(t => t.jenisKelamin && t.ras && (t.bobot !== undefined && t.bobot !== ''))
        : [];

      if (validTernakDetails.length > 0) {
        const idHewanList = validTernakDetails
          .map(t => t.idHewan || t.id_hewan)
          .filter(id => id !== null && id !== undefined);

        if (idHewanList.length > 0) {
          const placeholders = idHewanList.map((_, i) => `$${i + 2}`).join(',');
          const duplicateCheck = await dbClient.query(
            `SELECT id_hewan FROM hewan_ternak WHERE kelompok_id = $1 AND id_hewan IN (${placeholders})`,
            [mitraId, ...idHewanList]
          );
          if (duplicateCheck.rows.length > 0) {
            const duplicateIds = duplicateCheck.rows.map(r => r.id_hewan).join(', ');
            await dbClient.query('ROLLBACK');
            return res.status(400).json({
              success: false,
              message: `ID Bisnis sudah terdaftar: ${duplicateIds}. Gunakan ID Bisnis yang berbeda.`
            });
          }
        }

        for (const ternak of validTernakDetails) {
          let tglLahir;
          if (ternak.tanggalLahir || ternak.tanggal_lahir) {
            tglLahir = ternak.tanggalLahir || ternak.tanggal_lahir;
          } else if (ternak.umur && !isNaN(ternak.umur)) {
            const today = new Date();
            const birthDate = new Date(today.getFullYear(), today.getMonth() - parseInt(ternak.umur), today.getDate());
            tglLahir = birthDate.toISOString().split('T')[0];
          } else {
            tglLahir = new Date().toISOString().split('T')[0];
          }

          await dbClient.query(
            `INSERT INTO hewan_ternak (
              kelompok_id, id_hewan, jenis_kelamin, ras, bobot, tanggal_lahir, catatan, source, created_at, updated_at
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW())`,
            [
              mitraId,
              ternak.idHewan || ternak.id_hewan || null,
              (ternak.jenisKelamin || '').toUpperCase(),
              ternak.ras || '',
              parseFloat(ternak.bobot) || 0,
              tglLahir,
              ternak.catatan || null,
              'Penyaluran'
            ]
          );
        }
      }

      // Create initial laporan for mitra
      const laporanData = {
        jumlahKandang: jumlahKandang || 0,
        jumlahTernak: jumlahTernak || 0,
        pakanList: pakanList || [],
        kesehatanList: kesehatanList || [],
        catatan: `Laporan awal penyaluran mitra kelompok ${name} (di bawah ${parentCheck.rows[0].name}).`
      };

      await dbClient.query(
        `INSERT INTO laporan (jenis, kelompok_id, data, tanggal, kelompok, created_at, updated_at)
         VALUES ($1,$2,$3,NOW(),$4,NOW(),NOW())`,
        ['Penyaluran', mitraId, JSON.stringify(laporanData), name]
      );

      await dbClient.query('COMMIT');

      console.log(`[mitraKelompokController] ✅ Created mitra kelompok "${name}" (ID: ${mitraId}) under parent ID ${parentId}`);

      return res.json({
        success: true,
        data: { kelompok: mitraData },
        message: `✅ Mitra Kelompok "${name}" berhasil dibuat di bawah ${parentCheck.rows[0].name}.`
      });
    } catch (innerError) {
      await dbClient.query('ROLLBACK');
      throw innerError;
    } finally {
      dbClient.release();
    }
  } catch (e) {
    console.error('[mitraKelompokController] createMitraKelompok error:', e);
    return res.status(500).json({ success: false, message: 'Server error: ' + e.message });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/mitra-kelompok/:id
// ─────────────────────────────────────────────────────────────────────────────
async function updateMitraKelompok(req, res) {
  try {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'kelompok')) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ success: false, message: 'ID tidak valid' });

    // Verify ownership
    const existing = await db.query('SELECT id, parent_kelompok_id FROM kelompok WHERE id=$1 AND parent_kelompok_id IS NOT NULL', [id]);
    if (!existing.rows[0]) return res.status(404).json({ success: false, message: 'Mitra Kelompok tidak ditemukan' });

    const mitra = existing.rows[0];
    if (!isOwnerOrAdmin(req.user, mitra.parent_kelompok_id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: bukan mitra kelompok Anda' });
    }

    const {
      name, kode_kelompok, email, kecamatan, desa, catatan,
      latitude, longitude,
      pic1_nik, pic1_nama, pic1_alamat, pic1_noHp, pic1_email,
      jumlahKandang, jumlahTernak, pakanList, kesehatanList
    } = req.body || {};

    if (!name) return res.status(400).json({ success: false, message: 'Nama mitra kelompok wajib diisi' });

    if (kode_kelompok && kode_kelompok.trim()) {
      const existingKode = await db.query(
        `SELECT id FROM kelompok WHERE kode_kelompok = $1 AND id != $2`,
        [kode_kelompok.trim().toUpperCase(), id]
      );
      if (existingKode.rows.length > 0) {
        return res.status(400).json({ success: false, message: `Kode kelompok "${kode_kelompok}" sudah digunakan` });
      }
    }

    if (pic1_nik && typeof pic1_nik === 'string' && !/^\d+$/.test(pic1_nik.trim())) {
      return res.status(400).json({ success: false, message: 'NIK harus berisi angka saja' });
    }
    if (pic1_noHp && typeof pic1_noHp === 'string' && !/^\d+$/.test(pic1_noHp.trim())) {
      return res.status(400).json({ success: false, message: 'No HP harus berisi angka saja' });
    }

    const nikValue = pic1_nik && /^\d+$/.test(pic1_nik.toString().trim()) ? BigInt(pic1_nik.toString().trim()) : null;
    const noHpValue = pic1_noHp && /^\d+$/.test(pic1_noHp.toString().trim()) ? BigInt(pic1_noHp.toString().trim()) : null;

    const latToUseRaw = latitude === undefined || latitude === null || latitude === '' ? null : Number(latitude);
    const lonToUseRaw = longitude === undefined || longitude === null || longitude === '' ? null : Number(longitude);
    const latToUse = Number.isFinite(latToUseRaw) ? latToUseRaw : null;
    const lonToUse = Number.isFinite(lonToUseRaw) ? lonToUseRaw : null;

    const pakanListJson = pakanList ? JSON.stringify(pakanList) : null;
    const kesehatanListJson = kesehatanList ? JSON.stringify(kesehatanList) : null;
    const kodeKelompokValue = kode_kelompok !== undefined
      ? (kode_kelompok && kode_kelompok.trim() ? kode_kelompok.trim().toUpperCase() : null)
      : undefined;

    let updateQuery, updateParams;
    if (kodeKelompokValue !== undefined) {
      updateQuery = `UPDATE kelompok SET kode_kelompok=$1, name=$2, email=$3, kecamatan=$4, desa=$5, catatan=$6,
       latitude=$7, longitude=$8,
       pic1_nik=$9, pic1_nama=$10, pic1_alamat=$11, pic1_no_hp=$12, pic1_email=$13,
       jumlah_kandang=$14, jumlah_ternak=$15, pakan_list=$16, kesehatan_list=$17
       WHERE id=$18 RETURNING *`;
      updateParams = [kodeKelompokValue, name, email || null, kecamatan || null, desa || null, catatan || null,
       latToUse, lonToUse, nikValue, pic1_nama || null, pic1_alamat || null, noHpValue, pic1_email || null,
       jumlahKandang || null, jumlahTernak || null, pakanListJson, kesehatanListJson, id];
    } else {
      updateQuery = `UPDATE kelompok SET name=$1, email=$2, kecamatan=$3, desa=$4, catatan=$5,
       latitude=$6, longitude=$7,
       pic1_nik=$8, pic1_nama=$9, pic1_alamat=$10, pic1_no_hp=$11, pic1_email=$12,
       jumlah_kandang=$13, jumlah_ternak=$14, pakan_list=$15, kesehatan_list=$16
       WHERE id=$17 RETURNING *`;
      updateParams = [name, email || null, kecamatan || null, desa || null, catatan || null,
       latToUse, lonToUse, nikValue, pic1_nama || null, pic1_alamat || null, noHpValue, pic1_email || null,
       jumlahKandang || null, jumlahTernak || null, pakanListJson, kesehatanListJson, id];
    }

    const { rows } = await db.query(updateQuery, updateParams);
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Tidak ditemukan' });
    return res.json({ success: true, data: rows[0] });
  } catch (e) {
    console.error('[mitraKelompokController] updateMitraKelompok error:', e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/mitra-kelompok/:id/kode
// ─────────────────────────────────────────────────────────────────────────────
async function updateMitraKelompokKode(req, res) {
  try {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'kelompok')) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ success: false, message: 'ID tidak valid' });

    const existing = await db.query('SELECT id, parent_kelompok_id FROM kelompok WHERE id=$1 AND parent_kelompok_id IS NOT NULL', [id]);
    if (!existing.rows[0]) return res.status(404).json({ success: false, message: 'Mitra Kelompok tidak ditemukan' });

    if (!isOwnerOrAdmin(req.user, existing.rows[0].parent_kelompok_id)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const { kode_kelompok } = req.body || {};
    if (kode_kelompok === undefined || kode_kelompok === null) {
      return res.status(400).json({ success: false, message: 'kode_kelompok wajib diisi' });
    }

    const kodeValue = kode_kelompok.trim() ? kode_kelompok.trim().toUpperCase() : null;
    if (kodeValue) {
      const check = await db.query('SELECT id FROM kelompok WHERE kode_kelompok=$1 AND id!=$2', [kodeValue, id]);
      if (check.rows.length > 0) {
        return res.status(400).json({ success: false, message: `Kode kelompok "${kodeValue}" sudah digunakan` });
      }
    }

    const { rows } = await db.query(
      'UPDATE kelompok SET kode_kelompok=$1 WHERE id=$2 RETURNING id, kode_kelompok, name',
      [kodeValue, id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Tidak ditemukan' });
    return res.json({ success: true, data: rows[0] });
  } catch (e) {
    console.error('[mitraKelompokController] updateMitraKelompokKode error:', e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/mitra-kelompok/:id
// Admin: can delete any. Kelompok: can delete their own mitra
// ─────────────────────────────────────────────────────────────────────────────
async function deleteMitraKelompok(req, res) {
  try {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'kelompok')) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ success: false, message: 'ID tidak valid' });

    const existing = await db.query('SELECT id, name, parent_kelompok_id FROM kelompok WHERE id=$1 AND parent_kelompok_id IS NOT NULL', [id]);
    if (!existing.rows[0]) return res.status(404).json({ success: false, message: 'Mitra Kelompok tidak ditemukan' });

    const mitra = existing.rows[0];
    if (!isOwnerOrAdmin(req.user, mitra.parent_kelompok_id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: bukan mitra kelompok Anda' });
    }

    const dbClient = await db.pool.connect();
    try {
      await dbClient.query('BEGIN');

      await dbClient.query('DELETE FROM update_ternak WHERE kelompok_id=$1', [id]);
      await dbClient.query(
        'DELETE FROM riwayat_bobot WHERE hewan_id IN (SELECT id FROM hewan_ternak WHERE kelompok_id=$1)',
        [id]
      );
      await dbClient.query('UPDATE hewan_ternak SET id_induk=NULL, id_pejantan=NULL WHERE kelompok_id=$1', [id]);
      await dbClient.query('DELETE FROM hewan_ternak WHERE kelompok_id=$1', [id]);
      await dbClient.query('DELETE FROM laporan WHERE kelompok_id=$1', [id]);
      await dbClient.query('DELETE FROM users WHERE kelompok_id=$1', [id]);
      await dbClient.query('DELETE FROM kelompok WHERE id=$1', [id]);

      await dbClient.query('COMMIT');

      console.log(`[mitraKelompokController] ✅ Deleted mitra kelompok "${mitra.name}" (ID: ${id})`);
      return res.json({
        success: true,
        data: { id, message: `Mitra Kelompok "${mitra.name}" dan semua data terkait telah dihapus` }
      });
    } catch (innerError) {
      await dbClient.query('ROLLBACK');
      throw innerError;
    } finally {
      dbClient.release();
    }
  } catch (e) {
    console.error('[mitraKelompokController] deleteMitraKelompok error:', e);
    return res.status(500).json({ success: false, message: 'Server error: ' + e.message });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/mitra-kelompok/:id/users  — List users of a mitra kelompok
// ─────────────────────────────────────────────────────────────────────────────
async function getMitraUsers(req, res) {
  try {
    if (!req.user || req.user.role !== 'kelompok') {
      return res.status(403).json({ success: false, message: 'Forbidden: hanya kelompok yang dapat mengelola pengguna mitra' });
    }

    const mitraId = parseInt(req.params.id, 10);
    if (Number.isNaN(mitraId)) return res.status(400).json({ success: false, message: 'ID tidak valid' });

    // Verify ownership
    const mitraCheck = await db.query('SELECT id, parent_kelompok_id FROM kelompok WHERE id=$1 AND parent_kelompok_id IS NOT NULL', [mitraId]);
    if (!mitraCheck.rows[0]) return res.status(404).json({ success: false, message: 'Mitra Kelompok tidak ditemukan' });

    if (!isOwnerOrAdmin(req.user, mitraCheck.rows[0].parent_kelompok_id)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const { rows } = await db.query(
      `SELECT u.id, u.username, u.email, u.full_name, u.role, u.kelompok_id, k.name AS kelompok
       FROM users u
       LEFT JOIN kelompok k ON u.kelompok_id = k.id
       WHERE u.kelompok_id = $1
       ORDER BY u.id`,
      [mitraId]
    );

    return res.json({ success: true, data: rows });
  } catch (e) {
    console.error('[mitraKelompokController] getMitraUsers error:', e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/mitra-kelompok/:id/users  — Add user to mitra kelompok
// ─────────────────────────────────────────────────────────────────────────────
async function createMitraUser(req, res) {
  try {
    if (!req.user || req.user.role !== 'kelompok') {
      return res.status(403).json({ success: false, message: 'Forbidden: hanya kelompok yang dapat mengelola pengguna mitra' });
    }

    const mitraId = parseInt(req.params.id, 10);
    if (Number.isNaN(mitraId)) return res.status(400).json({ success: false, message: 'ID tidak valid' });

    const mitraCheck = await db.query('SELECT id, name, parent_kelompok_id FROM kelompok WHERE id=$1 AND parent_kelompok_id IS NOT NULL', [mitraId]);
    if (!mitraCheck.rows[0]) return res.status(404).json({ success: false, message: 'Mitra Kelompok tidak ditemukan' });

    if (!isOwnerOrAdmin(req.user, mitraCheck.rows[0].parent_kelompok_id)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const { username, password, email, full_name, role } = req.body || {};
    if (!username || !password || !full_name) {
      return res.status(400).json({ success: false, message: 'Username, password, dan nama lengkap wajib diisi' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email wajib diisi' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Format email tidak valid' });
    }

    const userRole = role || 'mitra_kelompok';

    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    const { rows } = await db.query(
      'INSERT INTO users (username, password, email, full_name, role, kelompok_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, username, email, full_name, role, kelompok_id',
      [username, hashedPassword, email.trim(), full_name, userRole, mitraId]
    );

    rows[0].kelompok = mitraCheck.rows[0].name;

    return res.json({ success: true, data: rows[0] });
  } catch (e) {
    console.error('[mitraKelompokController] createMitraUser error:', e);
    if (e.code === '23505') {
      if (e.constraint === 'users_username_key') return res.status(400).json({ success: false, message: 'Username sudah digunakan' });
      if (e.constraint === 'users_email_key') return res.status(400).json({ success: false, message: 'Email sudah digunakan' });
      return res.status(400).json({ success: false, message: 'Username atau email sudah digunakan' });
    }
    return res.status(500).json({ success: false, message: e.message || 'Server error' });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/mitra-kelompok/:id/users/:userId/role
// ─────────────────────────────────────────────────────────────────────────────
async function updateMitraUserRole(req, res) {
  try {
    if (!req.user || req.user.role !== 'kelompok') {
      return res.status(403).json({ success: false, message: 'Forbidden: hanya kelompok yang dapat mengelola pengguna mitra' });
    }

    const mitraId = parseInt(req.params.id, 10);
    const userId = parseInt(req.params.userId, 10);

    const mitraCheck = await db.query('SELECT id, parent_kelompok_id FROM kelompok WHERE id=$1 AND parent_kelompok_id IS NOT NULL', [mitraId]);
    if (!mitraCheck.rows[0]) return res.status(404).json({ success: false, message: 'Mitra Kelompok tidak ditemukan' });
    if (!isOwnerOrAdmin(req.user, mitraCheck.rows[0].parent_kelompok_id)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // Ensure user belongs to this mitra
    const userCheck = await db.query('SELECT id FROM users WHERE id=$1 AND kelompok_id=$2', [userId, mitraId]);
    if (!userCheck.rows[0]) return res.status(404).json({ success: false, message: 'User tidak ditemukan di mitra ini' });

    const { role } = req.body || {};
    if (!role) return res.status(400).json({ success: false, message: 'Role wajib diisi' });

    const { rows } = await db.query(
      `WITH updated AS (
        UPDATE users SET role=$1 WHERE id=$2 RETURNING id, username, full_name, role, kelompok_id
      )
      SELECT u.*, k.name as kelompok FROM updated u LEFT JOIN kelompok k ON u.kelompok_id = k.id`,
      [role, userId]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    return res.json({ success: true, data: rows[0] });
  } catch (e) {
    console.error('[mitraKelompokController] updateMitraUserRole error:', e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/mitra-kelompok/:id/users/:userId
// ─────────────────────────────────────────────────────────────────────────────
async function deleteMitraUser(req, res) {
  try {
    if (!req.user || req.user.role !== 'kelompok') {
      return res.status(403).json({ success: false, message: 'Forbidden: hanya kelompok yang dapat mengelola pengguna mitra' });
    }

    const mitraId = parseInt(req.params.id, 10);
    const userId = parseInt(req.params.userId, 10);

    const mitraCheck = await db.query('SELECT id, parent_kelompok_id FROM kelompok WHERE id=$1 AND parent_kelompok_id IS NOT NULL', [mitraId]);
    if (!mitraCheck.rows[0]) return res.status(404).json({ success: false, message: 'Mitra Kelompok tidak ditemukan' });
    if (!isOwnerOrAdmin(req.user, mitraCheck.rows[0].parent_kelompok_id)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const userCheck = await db.query('SELECT id FROM users WHERE id=$1 AND kelompok_id=$2', [userId, mitraId]);
    if (!userCheck.rows[0]) return res.status(404).json({ success: false, message: 'User tidak ditemukan di mitra ini' });

    await db.query('DELETE FROM users WHERE id=$1', [userId]);
    return res.json({ success: true, data: { id: userId } });
  } catch (e) {
    console.error('[mitraKelompokController] deleteMitraUser error:', e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = {
  getMitraKelompok,
  getMitraKelompokById,
  createMitraKelompok,
  updateMitraKelompok,
  updateMitraKelompokKode,
  deleteMitraKelompok,
  getMitraUsers,
  createMitraUser,
  updateMitraUserRole,
  deleteMitraUser
};
