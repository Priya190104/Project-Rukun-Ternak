const db = require('../db');

async function getKelompok(req, res) {
  try {
    const { rows } = await db.query('SELECT id, name FROM kelompok ORDER BY id');
    return res.json({ success: true, data: rows });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { getKelompok };
