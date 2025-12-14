const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

async function attachUser(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return next();
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const { rows } = await db.query('SELECT id, username, full_name, role, kelompok_id FROM users WHERE id=$1', [payload.userId]);
    const user = rows[0];
    if (user) {
      // if user has kelompok_id, fetch kelompok name
      if (user.kelompok_id) {
        try {
          const k = await db.query('SELECT id, name FROM kelompok WHERE id=$1', [user.kelompok_id]);
          user.kelompok = k.rows[0] ? k.rows[0].name : null;
        } catch (err) {
          user.kelompok = null;
        }
      } else {
        user.kelompok = null;
      }
      req.user = user; // attach id, username, full_name, role, kelompok_id, kelompok
    }
  } catch (e) {
    console.warn('Invalid token', e.message);
  }
  return next();
}

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  return next();
}

module.exports = { attachUser, requireAuth, JWT_SECRET };
