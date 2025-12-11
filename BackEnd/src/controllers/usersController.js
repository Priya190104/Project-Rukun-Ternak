const db = require('../db');

async function getUsers(req, res) {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' });
    const { rows } = await db.query('SELECT id, username, full_name, role, kelompok FROM users ORDER BY id');
    return res.json({ success: true, data: rows });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { getUsers };
