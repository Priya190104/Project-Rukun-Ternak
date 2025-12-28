const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

async function attachUser(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    console.warn('[Auth] No valid Authorization header');
    return next();
  }
  const token = auth.split(' ')[1];
  console.log('[Auth] Verifying token:', token.substring(0, 20) + '...');
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    console.log('[Auth] Token verified, userId:', payload.userId);
    
    // Add timeout to prevent hanging connections
    const userQueryPromise = db.query('SELECT id, username, full_name, role, kelompok_id FROM users WHERE id=$1', [payload.userId]);
    const userQueryTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('User query timeout after 5s')), 5000)
    );
    
    const { rows } = await Promise.race([userQueryPromise, userQueryTimeout]);
    const user = rows[0];
    
    if (user) {
      console.log('[Auth] User found:', user.username, 'role:', user.role);
      // if user has kelompok_id, fetch kelompok name with timeout
      if (user.kelompok_id) {
        try {
          const kelompokQueryPromise = db.query('SELECT id, name FROM kelompok WHERE id=$1', [user.kelompok_id]);
          const kelompokQueryTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Kelompok query timeout after 3s')), 3000)
          );
          const k = await Promise.race([kelompokQueryPromise, kelompokQueryTimeout]);
          user.kelompok = k.rows[0] ? k.rows[0].name : null;
        } catch (err) {
          console.warn('[Auth] Kelompok fetch error:', err.message);
          user.kelompok = null;
        }
      } else {
        user.kelompok = null;
      }
      req.user = user; // attach id, username, full_name, role, kelompok_id, kelompok
      console.log('[Auth] User attached to request');
    } else {
      console.warn('[Auth] User not found in database');
    }
  } catch (e) {
    console.error('[Auth] Token verification failed:', e.message);
  }
  return next();
}

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  return next();
}

function RoleGuard(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied. Insufficient permissions.' });
    }
    return next();
  };
}

module.exports = { attachUser, requireAuth, RoleGuard, JWT_SECRET };
