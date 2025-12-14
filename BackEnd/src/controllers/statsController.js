const db = require('../db');

async function getSummary(req, res) {
  try {
    const role = req.user.role;
    const userId = req.user.id;
    const kelompokId = req.user.kelompok_id;

    let totalLaporanRes, latestRes, perMonthRes;
    
    if (role === 'admin') {
      // Admin: stats global semua data
      totalLaporanRes = await db.query('SELECT COUNT(*)::int AS count FROM laporan');
      const totalUsersRes = await db.query('SELECT COUNT(*)::int AS count FROM users');
      const totalKelompokRes = await db.query('SELECT COUNT(*)::int AS count FROM kelompok');
      
      latestRes = await db.query(`
        SELECT l.id, l.jenis, l.kelompok, l.data, l.tanggal, l.user_id, 
               u.username, u.full_name, k.name as kelompok_name 
        FROM laporan l 
        LEFT JOIN users u ON l.user_id = u.id 
        LEFT JOIN kelompok k ON l.kelompok_id = k.id 
        ORDER BY l.tanggal DESC LIMIT 5
      `);
      
      perMonthRes = await db.query(`
        SELECT to_char(tanggal, 'YYYY-MM') AS month, COUNT(*)::int AS count 
        FROM laporan 
        GROUP BY month 
        ORDER BY month DESC
      `);
      
      // Stats per kelompok
      const statsPerKelompok = await db.query(`
        SELECT k.id, k.name, COUNT(l.id)::int as laporan_count 
        FROM kelompok k 
        LEFT JOIN laporan l ON l.kelompok_id = k.id 
        GROUP BY k.id, k.name 
        ORDER BY k.name
      `);

      return res.json({
        success: true,
        data: {
          totals: {
            laporan: totalLaporanRes.rows[0].count,
            users: totalUsersRes.rows[0].count,
            kelompok: totalKelompokRes.rows[0].count,
          },
          latest: latestRes.rows,
          perMonth: perMonthRes.rows,
          perKelompok: statsPerKelompok.rows,
        },
      });
      
    } else if (role === 'kelompok' && kelompokId) {
      // Kelompok: stats hanya untuk kelompok tersebut
      totalLaporanRes = await db.query('SELECT COUNT(*)::int AS count FROM laporan WHERE kelompok_id=$1', [kelompokId]);
      const totalUsersInKelompok = await db.query('SELECT COUNT(*)::int AS count FROM users WHERE kelompok_id=$1', [kelompokId]);
      
      latestRes = await db.query(`
        SELECT l.id, l.jenis, l.kelompok, l.data, l.tanggal, l.user_id, 
               u.username, u.full_name 
        FROM laporan l 
        LEFT JOIN users u ON l.user_id = u.id 
        WHERE l.kelompok_id=$1 
        ORDER BY l.tanggal DESC LIMIT 5
      `, [kelompokId]);
      
      perMonthRes = await db.query(`
        SELECT to_char(tanggal, 'YYYY-MM') AS month, COUNT(*)::int AS count 
        FROM laporan 
        WHERE kelompok_id=$1 
        GROUP BY month 
        ORDER BY month DESC
      `, [kelompokId]);

      return res.json({
        success: true,
        data: {
          totals: {
            laporan: totalLaporanRes.rows[0].count,
            users: totalUsersInKelompok.rows[0].count,
            kelompok: 1,
          },
          latest: latestRes.rows,
          perMonth: perMonthRes.rows,
        },
      });
      
    } else if (role === 'client') {
      // Client: stats hanya laporan milik sendiri
      totalLaporanRes = await db.query('SELECT COUNT(*)::int AS count FROM laporan WHERE user_id=$1', [userId]);
      
      latestRes = await db.query(`
        SELECT l.id, l.jenis, l.kelompok, l.data, l.tanggal, l.user_id 
        FROM laporan l 
        WHERE l.user_id=$1 
        ORDER BY l.tanggal DESC LIMIT 5
      `, [userId]);
      
      perMonthRes = await db.query(`
        SELECT to_char(tanggal, 'YYYY-MM') AS month, COUNT(*)::int AS count 
        FROM laporan 
        WHERE user_id=$1 
        GROUP BY month 
        ORDER BY month DESC
      `, [userId]);

      return res.json({
        success: true,
        data: {
          totals: {
            laporan: totalLaporanRes.rows[0].count,
            users: 1,
            kelompok: 0,
          },
          latest: latestRes.rows,
          perMonth: perMonthRes.rows,
        },
      });
    }

    return res.json({ success: true, data: { totals: {}, latest: [], perMonth: [] } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { getSummary };
