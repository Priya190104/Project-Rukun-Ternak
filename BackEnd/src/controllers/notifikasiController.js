const db = require('../db');

async function getNotifikasi(req, res) {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' });
    const { rows } = await db.query('SELECT * FROM notifikasi ORDER BY created_at DESC');
    return res.json({ success: true, data: rows });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { getNotifikasi };
