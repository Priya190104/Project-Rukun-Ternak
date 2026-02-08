const db = require('../db');

async function getUsers(req, res) {
  try {
    // Allow admin and viewer (viewer in read-only mode)
    if (req.user.role !== 'admin' && req.user.role !== 'viewer') return res.status(403).json({ success: false, message: 'Forbidden' });
    
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    
    // Get paginated users with count
    const { rows } = await db.query(
      `SELECT u.id, u.username, u.full_name, u.role, u.kelompok_id, k.name AS kelompok,
              COUNT(*) OVER () as total
       FROM users u 
       LEFT JOIN kelompok k ON u.kelompok_id = k.id 
       ORDER BY u.id
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    const total = rows.length > 0 ? rows[0].total : 0;
    const data = rows.map(row => {
      const { total, ...userData } = row;
      return userData;
    });
    
    return res.json({ 
      success: true, 
      data: data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
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
    
    // Validasi: role=kelompok HARUS memiliki kelompok_id
    if (role === 'kelompok' && !kelompok_id) {
      return res.status(400).json({ success: false, message: 'Kelompok wajib dipilih untuk role Kelompok' });
    }
    
    // Validasi: role admin/viewer TIDAK BOLEH memiliki kelompok_id
    if ((role === 'admin' || role === 'viewer') && kelompok_id) {
      return res.status(400).json({ success: false, message: `Role ${role} tidak boleh terikat dengan kelompok` });
    }
    
    // Hash password
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const { rows } = await db.query(
      'INSERT INTO users (username, password, full_name, role, kelompok_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, full_name, role, kelompok_id',
      [username, hashedPassword, full_name, role, role === 'kelompok' ? kelompok_id : null]
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
