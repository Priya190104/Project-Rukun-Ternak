const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

async function login(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ success: false, message: 'username and password required' });
  try {
    const { rows } = await db.query(`
      SELECT u.id, u.username, u.password, u.full_name, u.role, u.kelompok_id, k.name as kelompok 
      FROM users u 
      LEFT JOIN kelompok k ON u.kelompok_id = k.id 
      WHERE u.username=$1
    `, [username]);
    const user = rows[0];
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

    const safeUser = {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      kelompok_id: user.kelompok_id,
      kelompok: user.kelompok,
    };

    return res.json({ success: true, data: { token, user: safeUser } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function me(req, res) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  return res.json({ success: true, data: req.user });
}

module.exports = { login, me };
