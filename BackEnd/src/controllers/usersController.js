const db = require('../db');

async function getUsers(req, res) {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' });
    const { rows } = await db.query('SELECT u.id, u.username, u.full_name, u.role, u.kelompok_id, k.name AS kelompok FROM users u LEFT JOIN kelompok k ON u.kelompok_id = k.id ORDER BY u.id');
    return res.json({ success: true, data: rows });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function updateUserRole(req, res) {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' });
    const id = parseInt(req.params.id, 10);
    const { role } = req.body || {};
    if (!role) return res.status(400).json({ success: false, message: 'Missing role' });
    
    // Fixed N+1: Use CTE to join kelompok in single query
    const { rows } = await db.query(`
      WITH updated AS (
        UPDATE users 
        SET role=$1 
        WHERE id=$2 
        RETURNING id, username, full_name, role, kelompok_id
      )
      SELECT u.*, k.name as kelompok
      FROM updated u
      LEFT JOIN kelompok k ON u.kelompok_id = k.id
    `, [role, id]);
    
    if (!rows[0]) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, data: rows[0] });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function updateUserKelompok(req, res) {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' });
    const id = parseInt(req.params.id, 10);
    const { kelompok } = req.body || {};
    // Expect 'kelompok' to be kelompok id (number) or null
    const kelompokId = kelompok ? parseInt(kelompok, 10) : null;
    
    // Fixed N+1: Use CTE to join kelompok in single query
    const { rows } = await db.query(`
      WITH updated AS (
        UPDATE users 
        SET kelompok_id=$1 
        WHERE id=$2 
        RETURNING id, username, full_name, role, kelompok_id
      )
      SELECT u.*, k.name as kelompok
      FROM updated u
      LEFT JOIN kelompok k ON u.kelompok_id = k.id
    `, [kelompokId, id]);
    
    if (!rows[0]) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, data: rows[0] });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function deleteUser(req, res) {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' });
    const id = parseInt(req.params.id, 10);
    const { rows } = await db.query('DELETE FROM users WHERE id=$1 RETURNING id', [id]);
    if (!rows[0]) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, data: { id } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function createUser(req, res) {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' });
    const { username, password, full_name, role, kelompok_id } = req.body || {};
    
    // Validasi
    if (!username || !password || !full_name || !role) {
      return res.status(400).json({ success: false, message: 'Username, password, full_name, dan role wajib diisi' });
    }
    
    // Hash password
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const { rows } = await db.query(
      'INSERT INTO users (username, password, full_name, role, kelompok_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, full_name, role, kelompok_id',
      [username, hashedPassword, full_name, role, kelompok_id || null]
    );
    
    if (rows[0] && rows[0].kelompok_id) {
      const k = await db.query('SELECT name FROM kelompok WHERE id=$1', [rows[0].kelompok_id]);
      rows[0].kelompok = k.rows[0] ? k.rows[0].name : null;
    }
    
    return res.json({ success: true, data: rows[0] });
  } catch (e) {
    console.error('Error creating user:', e);
    if (e.code === '23505') { // unique violation
      return res.status(400).json({ success: false, message: 'Username sudah digunakan' });
    }
    return res.status(500).json({ success: false, message: e.message || 'Server error' });
  }
}

module.exports = { getUsers, updateUserRole, updateUserKelompok, deleteUser, createUser };
