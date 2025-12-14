const db = require('../db');

async function getLaporan(req, res) {
  try {
    // Admin: lihat semua laporan
    if (req.user.role === 'admin') {
      const { rows } = await db.query(`
        SELECT l.*, u.username, u.full_name, k.name as kelompok_name 
        FROM laporan l 
        LEFT JOIN users u ON l.user_id = u.id 
        LEFT JOIN kelompok k ON l.kelompok_id = k.id 
        ORDER BY l.tanggal DESC
      `);
      return res.json({ success: true, data: rows });
    }

    // Client: hanya lihat laporan milik sendiri (by user_id)
    if (req.user.role === 'client') {
      const { rows } = await db.query(`
        SELECT l.*, u.username, u.full_name 
        FROM laporan l 
        LEFT JOIN users u ON l.user_id = u.id 
        WHERE l.user_id=$1 
        ORDER BY l.tanggal DESC
      `, [req.user.id]);
      return res.json({ success: true, data: rows });
    }

    // Kelompok: lihat laporan kelompok tersebut (by kelompok_id)
    if (req.user.role === 'kelompok' && req.user.kelompok_id) {
      const { rows } = await db.query(`
        SELECT l.*, u.username, u.full_name, k.name as kelompok_name 
        FROM laporan l 
        LEFT JOIN users u ON l.user_id = u.id 
        LEFT JOIN kelompok k ON l.kelompok_id = k.id 
        WHERE l.kelompok_id=$1 
        ORDER BY l.tanggal DESC
      `, [req.user.kelompok_id]);
      return res.json({ success: true, data: rows });
    }

    return res.json({ success: true, data: [] });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function getLaporanById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: 'ID laporan tidak valid' });
    }

    // Ambil laporan dengan join user dan kelompok
    const { rows } = await db.query(
      `SELECT l.*, u.username, u.full_name, k.name as kelompok_name, l.kelompok as kelompok
       FROM laporan l
       LEFT JOIN users u ON l.user_id = u.id
       LEFT JOIN kelompok k ON l.kelompok_id = k.id
       WHERE l.id = $1`,
      [id]
    );

    const laporan = rows[0];
    if (!laporan) {
      return res.status(404).json({ success: false, message: 'Laporan tidak ditemukan' });
    }

    // Role-based access control
    if (req.user.role === 'admin') {
      // admin bebas
    } else if (req.user.role === 'kelompok') {
      if (laporan.kelompok_id !== req.user.kelompok_id) {
        return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke laporan ini' });
      }
    } else {
      // client / user biasa hanya boleh lihat laporan milik sendiri
      if (laporan.user_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke laporan ini' });
      }
    }

    return res.json({ success: true, data: laporan });
  } catch (e) {
    console.error('Error fetching laporan by id:', e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function createLaporan(req, res) {
  try {
    const { jenis, kelompok_id, data, tanggal } = req.body || {};
    
    // Validasi input
    if (!jenis) {
      return res.status(400).json({ success: false, message: 'Field jenis wajib diisi' });
    }
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ success: false, message: 'Field data wajib berupa objek' });
    }
    
    // Validasi tanggal tidak melampaui hari ini
    if (tanggal) {
      const selectedDate = new Date(tanggal);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate > today) {
        return res.status(400).json({ success: false, message: 'Tanggal tidak boleh melampaui hari ini' });
      }
    }
    
    // Tentukan kelompok_id berdasarkan role
    let finalKelompokId = null;
    let kelompokName = null;
    
    if (req.user.role === 'admin') {
      // Admin bisa pilih kelompok atau tidak
      finalKelompokId = kelompok_id ? parseInt(kelompok_id, 10) : null;
    } else if (req.user.role === 'kelompok') {
      // Kelompok hanya bisa create untuk kelompoknya sendiri
      finalKelompokId = req.user.kelompok_id;
    } else if (req.user.role === 'client') {
      // Client tidak ada kelompok_id
      finalKelompokId = null;
    }
    
    // Get kelompok name if kelompok_id exists
    if (finalKelompokId) {
      const kres = await db.query('SELECT name FROM kelompok WHERE id=$1', [finalKelompokId]);
      kelompokName = kres.rows[0] ? kres.rows[0].name : null;
    }
    
    const userId = req.user.id;
    const finalTanggal = tanggal || new Date().toISOString();
    
    const result = await db.query(
      `INSERT INTO laporan (jenis, kelompok, data, tanggal, user_id, kelompok_id) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [jenis || 'unknown', kelompokName, data || {}, finalTanggal, userId, finalKelompokId]
    );
    
    return res.json({ success: true, data: result.rows[0] });
  } catch (e) {
    console.error('Error creating laporan:', e);
    return res.status(500).json({ success: false, message: e.message || 'Server error' });
  }
}

async function updateLaporan(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const { jenis, data } = req.body || {};
    const { rows } = await db.query('SELECT * FROM laporan WHERE id=$1', [id]);
    const existing = rows[0];
    if (!existing) return res.status(404).json({ success: false, message: 'Not found' });
    
    // Check authorization
    if (req.user.role !== 'admin') {
      if (req.user.role === 'kelompok' && existing.kelompok_id !== req.user.kelompok_id) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
      if (req.user.role === 'client' && existing.user_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
    }
    
    const updatedRes = await db.query(
      'UPDATE laporan SET jenis=$1, data=$2 WHERE id=$3 RETURNING *',
      [jenis ?? existing.jenis, data ?? existing.data, id]
    );
    return res.json({ success: true, data: updatedRes.rows[0] });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function deleteLaporan(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const { rows } = await db.query('SELECT * FROM laporan WHERE id=$1', [id]);
    const existing = rows[0];
    if (!existing) return res.status(404).json({ success: false, message: 'Not found' });
    
    // Check authorization
    if (req.user.role !== 'admin') {
      if (req.user.role === 'kelompok' && existing.kelompok_id !== req.user.kelompok_id) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
      if (req.user.role === 'client' && existing.user_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
    }
    
    await db.query('DELETE FROM laporan WHERE id=$1', [id]);
    return res.json({ success: true, data: { id } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { getLaporan, getLaporanById, createLaporan, updateLaporan, deleteLaporan };
