const db = require('../db');

async function getUsers(req, res) {
  try {
    // Allow admin, viewer, and kelompok (kelompok only sees users in their scope)
    if (req.user.role !== 'admin' && req.user.role !== 'viewer' && req.user.role !== 'kelompok') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    
    let queryText, queryParams;
    
    if (req.user.role === 'kelompok') {
      // Kelompok can only see users in their own kelompok OR
      // users in their mitra kelompok (children)
      queryText = `SELECT u.id, u.username, u.email, u.full_name, u.role, u.kelompok_id,
                          k.name AS kelompok, k.parent_kelompok_id,
                          COUNT(*) OVER () as total
                   FROM users u
                   LEFT JOIN kelompok k ON u.kelompok_id = k.id
                   WHERE u.kelompok_id = $3
                      OR k.parent_kelompok_id = $3
                   ORDER BY u.id
                   LIMIT $1 OFFSET $2`;
      queryParams = [limit, offset, req.user.kelompok_id];
    } else {
      // Admin hanya melihat user yang BUKAN milik mitra kelompok (parent_kelompok_id IS NULL)
      // User milik mitra kelompok dikelola oleh kelompok masing-masing, bukan admin
      queryText = `SELECT u.id, u.username, u.email, u.full_name, u.role, u.kelompok_id,
                          k.name AS kelompok,
                          COUNT(*) OVER () as total
                   FROM users u 
                   LEFT JOIN kelompok k ON u.kelompok_id = k.id 
                   WHERE (k.parent_kelompok_id IS NULL OR u.kelompok_id IS NULL)
                   ORDER BY u.id
                   LIMIT $1 OFFSET $2`;
      queryParams = [limit, offset];
    }
    
    const { rows } = await db.query(queryText, queryParams);
    
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

    // Cegah admin dari memodifikasi user milik mitra kelompok
    const userCheck = await db.query(
      `SELECT u.id FROM users u
       LEFT JOIN kelompok k ON u.kelompok_id = k.id
       WHERE u.id=$1 AND k.parent_kelompok_id IS NOT NULL`,
      [id]
    );
    if (userCheck.rows[0]) {
      return res.status(403).json({ success: false, message: 'Pengguna mitra kelompok hanya dapat dikelola oleh kelompok pemiliknya' });
    }
    
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

    // Cegah admin dari memodifikasi user milik mitra kelompok
    const userCheck = await db.query(
      `SELECT u.id FROM users u
       LEFT JOIN kelompok k ON u.kelompok_id = k.id
       WHERE u.id=$1 AND k.parent_kelompok_id IS NOT NULL`,
      [id]
    );
    if (userCheck.rows[0]) {
      return res.status(403).json({ success: false, message: 'Pengguna mitra kelompok hanya dapat dikelola oleh kelompok pemiliknya' });
    }

    // Cegah admin dari memindahkan user ke mitra kelompok
    if (kelompokId) {
      const targetCheck = await db.query(
        'SELECT id FROM kelompok WHERE id=$1 AND parent_kelompok_id IS NOT NULL',
        [kelompokId]
      );
      if (targetCheck.rows[0]) {
        return res.status(403).json({ success: false, message: 'Tidak dapat memindahkan user ke mitra kelompok melalui halaman ini' });
      }
    }
    
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

    // Cegah admin dari menghapus user milik mitra kelompok
    const userCheck = await db.query(
      `SELECT u.id FROM users u
       LEFT JOIN kelompok k ON u.kelompok_id = k.id
       WHERE u.id=$1 AND k.parent_kelompok_id IS NOT NULL`,
      [id]
    );
    if (userCheck.rows[0]) {
      return res.status(403).json({ success: false, message: 'Pengguna mitra kelompok hanya dapat dikelola oleh kelompok pemiliknya' });
    }

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
    const { username, password, email, full_name, role, kelompok_id } = req.body || {};
    
    // Validasi
    if (!username || !password || !full_name || !role) {
      return res.status(400).json({ success: false, message: 'Username, password, full_name, dan role wajib diisi' });
    }
    
    // Validasi email (strongly recommended untuk password reset)
    if (!email || !email.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email wajib diisi untuk fitur reset password' 
      });
    }
    
    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Format email tidak valid' 
      });
    }
    
    // Validasi: role=kelompok HARUS memiliki kelompok_id
    if (role === 'kelompok' && !kelompok_id) {
      return res.status(400).json({ success: false, message: 'Kelompok wajib dipilih untuk role Kelompok' });
    }
    
    // Validasi: role=mitra_kelompok HARUS memiliki kelompok_id (yang merupakan mitra kelompok)
    if (role === 'mitra_kelompok' && !kelompok_id) {
      return res.status(400).json({ success: false, message: 'Mitra Kelompok wajib dipilih untuk role Mitra Kelompok' });
    }
    
    // Validasi: admin tidak boleh membuat user untuk mitra kelompok (yang punya parent)
    if (kelompok_id) {
      const mitraCheck = await db.query(
        'SELECT id FROM kelompok WHERE id=$1 AND parent_kelompok_id IS NOT NULL',
        [parseInt(kelompok_id, 10)]
      );
      if (mitraCheck.rows[0]) {
        return res.status(403).json({ success: false, message: 'Pengguna mitra kelompok hanya dapat dibuat oleh kelompok pemiliknya' });
      }
    }
    
    // Validasi: role admin/viewer TIDAK BOLEH memiliki kelompok_id
    if ((role === 'admin' || role === 'viewer') && kelompok_id) {
      return res.status(400).json({ success: false, message: `Role ${role} tidak boleh terikat dengan kelompok` });
    }
    
    // Hash password
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const { rows } = await db.query(
      'INSERT INTO users (username, password, email, full_name, role, kelompok_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, email, full_name, role, kelompok_id',
      [username, hashedPassword, email.trim(), full_name, role, (role === 'kelompok' || role === 'mitra_kelompok') ? kelompok_id : null]
    );
    
    if (rows[0] && rows[0].kelompok_id) {
      const k = await db.query('SELECT name FROM kelompok WHERE id=$1', [rows[0].kelompok_id]);
      rows[0].kelompok = k.rows[0] ? k.rows[0].name : null;
    }
    
    return res.json({ success: true, data: rows[0] });
  } catch (e) {
    console.error('Error creating user:', e);
    if (e.code === '23505') { // unique violation
      if (e.constraint === 'users_username_key') {
        return res.status(400).json({ success: false, message: 'Username sudah digunakan' });
      } else if (e.constraint === 'users_email_key') {
        return res.status(400).json({ success: false, message: 'Email sudah digunakan' });
      }
      return res.status(400).json({ success: false, message: 'Username atau email sudah digunakan' });
    }
    return res.status(500).json({ success: false, message: e.message || 'Server error' });
  }
}

module.exports = { getUsers, updateUserRole, updateUserKelompok, deleteUser, createUser };
