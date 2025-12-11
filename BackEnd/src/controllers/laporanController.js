const db = require('../db');

async function getLaporan(req, res) {
  try {
    if (req.user.role === 'admin') {
      const { rows } = await db.query('SELECT * FROM laporan ORDER BY tanggal DESC');
      return res.json({ success: true, data: rows });
    }
    const { rows } = await db.query('SELECT * FROM laporan WHERE kelompok=$1 ORDER BY tanggal DESC', [req.user.kelompok]);
    return res.json({ success: true, data: rows });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function createLaporan(req, res) {
  try {
    const { jenis, kelompok, data } = req.body || {};
    const ownerKelompok = req.user.role === 'admin' ? (kelompok || null) : req.user.kelompok;
    const result = await db.query('INSERT INTO laporan (jenis, kelompok, data, tanggal) VALUES ($1, $2, $3, NOW()) RETURNING *', [jenis || 'unknown', ownerKelompok, data || {}]);
    return res.json({ success: true, data: result.rows[0] });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function updateLaporan(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const { jenis, data } = req.body || {};
    const { rows } = await db.query('SELECT * FROM laporan WHERE id=$1', [id]);
    const existing = rows[0];
    if (!existing) return res.status(404).json({ success: false, message: 'Not found' });
    if (req.user.role !== 'admin' && existing.kelompok !== req.user.kelompok) return res.status(403).json({ success: false, message: 'Forbidden' });
    const updatedRes = await db.query('UPDATE laporan SET jenis=$1, data=$2 WHERE id=$3 RETURNING *', [jenis ?? existing.jenis, data ?? existing.data, id]);
    return res.json({ success: true, data: updatedRes.rows[0] });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function deleteLaporan(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const { rows } = await db.query('SELECT * FROM laporan WHERE id=$1', [id]);
    const existing = rows[0];
    if (!existing) return res.status(404).json({ success: false, message: 'Not found' });
    if (req.user.role !== 'admin' && existing.kelompok !== req.user.kelompok) return res.status(403).json({ success: false, message: 'Forbidden' });
    await db.query('DELETE FROM laporan WHERE id=$1', [id]);
    return res.json({ success: true, data: { id } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { getLaporan, createLaporan, updateLaporan, deleteLaporan };
