const db = require('../db');

async function getKelompok(req, res) {
  try {
    const { rows } = await db.query(`
      SELECT k.id, k.name, k.email, k.kecamatan, k.desa, k.catatan,
             k.latitude, k.longitude,
             k.pic1_nik, k.pic1_nama, k.pic1_alamat, k.pic1_no_hp, k.pic1_email,
             k.pic2_nik, k.pic2_nama, k.pic2_alamat, k.pic2_no_hp, k.pic2_email,
             COUNT(u.id)::int as anggota_count 
      FROM kelompok k 
      LEFT JOIN users u ON u.kelompok_id = k.id 
      GROUP BY k.id, k.name, k.email, k.kecamatan, k.desa, k.catatan,
               k.latitude, k.longitude,
               k.pic1_nik, k.pic1_nama, k.pic1_alamat, k.pic1_no_hp, k.pic1_email,
               k.pic2_nik, k.pic2_nama, k.pic2_alamat, k.pic2_no_hp, k.pic2_email
      ORDER BY k.id
    `);
    return res.json({ success: true, data: rows });
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
      SELECT k.id, k.name, k.email, k.kecamatan, k.desa, k.catatan,
             k.latitude, k.longitude,
             k.pic1_nik, k.pic1_nama, k.pic1_alamat, k.pic1_no_hp, k.pic1_email,
             k.pic2_nik, k.pic2_nama, k.pic2_alamat, k.pic2_no_hp, k.pic2_email,
             COUNT(u.id)::int as anggota_count 
      FROM kelompok k 
      LEFT JOIN users u ON u.kelompok_id = k.id 
      WHERE k.id = $1
      GROUP BY k.id, k.name, k.email, k.kecamatan, k.desa, k.catatan,
               k.latitude, k.longitude,
               k.pic1_nik, k.pic1_nama, k.pic1_alamat, k.pic1_no_hp, k.pic1_email,
               k.pic2_nik, k.pic2_nama, k.pic2_alamat, k.pic2_no_hp, k.pic2_email
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
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' });
    const { name, email, kecamatan, desa, catatan, latitude, longitude, pic1_nik, pic1_nama, pic1_alamat, pic1_noHp, pic1_email, pic2_nik, pic2_nama, pic2_alamat, pic2_noHp, pic2_email } = req.body || {};
    if (!name) return res.status(400).json({ success: false, message: 'Missing name' });
    const latToUseRaw = latitude === undefined || latitude === null || latitude === '' ? null : Number(latitude);
    const lonToUseRaw = longitude === undefined || longitude === null || longitude === '' ? null : Number(longitude);
    const latToUse = Number.isFinite(latToUseRaw) ? latToUseRaw : null;
    const lonToUse = Number.isFinite(lonToUseRaw) ? lonToUseRaw : null;
    const { rows } = await db.query(
      `INSERT INTO kelompok (name, email, kecamatan, desa, catatan, latitude, longitude, pic1_nik, pic1_nama, pic1_alamat, pic1_no_hp, pic1_email, pic2_nik, pic2_nama, pic2_alamat, pic2_no_hp, pic2_email) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) 
       RETURNING *`,
      [name, email || null, kecamatan || null, desa || null, catatan || null, latToUse, lonToUse,
       pic1_nik || null, pic1_nama || null, pic1_alamat || null, pic1_noHp || null, pic1_email || null,
       pic2_nik || null, pic2_nama || null, pic2_alamat || null, pic2_noHp || null, pic2_email || null]
    );
    return res.json({ success: true, data: rows[0] });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function updateKelompok(req, res) {
  try {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' });
    const id = parseInt(req.params.id, 10);
    const { name, email, kecamatan, desa, catatan, latitude, longitude, pic1_nik, pic1_nama, pic1_alamat, pic1_noHp, pic1_email, pic2_nik, pic2_nama, pic2_alamat, pic2_noHp, pic2_email } = req.body || {};
    if (!name) return res.status(400).json({ success: false, message: 'Missing name' });
    const latToUseRaw = latitude === undefined || latitude === null || latitude === '' ? null : Number(latitude);
    const lonToUseRaw = longitude === undefined || longitude === null || longitude === '' ? null : Number(longitude);
    const latToUse = Number.isFinite(latToUseRaw) ? latToUseRaw : null;
    const lonToUse = Number.isFinite(lonToUseRaw) ? lonToUseRaw : null;
    const { rows } = await db.query(
      `UPDATE kelompok SET name=$1, email=$2, kecamatan=$3, desa=$4, catatan=$5, 
       latitude=$6, longitude=$7,
       pic1_nik=$8, pic1_nama=$9, pic1_alamat=$10, pic1_no_hp=$11, pic1_email=$12,
       pic2_nik=$13, pic2_nama=$14, pic2_alamat=$15, pic2_no_hp=$16, pic2_email=$17
       WHERE id=$18 RETURNING *`,
      [name, email || null, kecamatan || null, desa || null, catatan || null, latToUse, lonToUse,
       pic1_nik || null, pic1_nama || null, pic1_alamat || null, pic1_noHp || null, pic1_email || null,
       pic2_nik || null, pic2_nama || null, pic2_alamat || null, pic2_noHp || null, pic2_email || null, id]
    );
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
    const { rows } = await db.query('DELETE FROM kelompok WHERE id=$1 RETURNING id', [id]);
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, data: { id } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { getKelompok, getKelompokById, createKelompok, updateKelompok, deleteKelompok };
