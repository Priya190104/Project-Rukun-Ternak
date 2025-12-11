const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

async function attachUser(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return next();
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const { rows } = await db.query('SELECT id, username, full_name, role, kelompok FROM users WHERE id=$1', [payload.userId]);
    const user = rows[0];
    if (user) {
      req.user = user; // fields already match frontend shape
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
