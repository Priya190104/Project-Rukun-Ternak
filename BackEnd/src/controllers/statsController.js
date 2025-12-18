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

      // Get latest by jenis for dashboard summary
      const perJenisRes = await db.query(`
        SELECT DISTINCT ON (jenis) jenis, data, tanggal
        FROM laporan
        WHERE kelompok_id=$1
        ORDER BY jenis, tanggal DESC
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
          perJenis: perJenisRes.rows, // Latest laporan untuk setiap jenis
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

/**
 * getDashboardSummary - Agregasi data untuk dashboard ringkasan
 * Mengembalikan: ringkasan populasi, pakan, kandang, kesehatan, kelahiran, penjualan terbaru
 */
async function getDashboardSummary(req, res) {
  try {
    const kelompokId = req.user.kelompok_id;
    
    if (!kelompokId) {
      return res.status(403).json({ success: false, message: 'Akses hanya untuk kelompok' });
    }

    // Get latest laporan by type
    const latestByTypeRes = await db.query(`
      SELECT DISTINCT ON (jenis) id, jenis, data, tanggal
      FROM laporan
      WHERE kelompok_id = $1
      ORDER BY jenis, tanggal DESC
    `, [kelompokId]);

    const summary = {
      populasi: null,
      pakan: null,
      kandang: null,
      kesehatan: null,
      kelahiran: null,
      penjualan: null,
      pengembangan: null,
    };

    // Parse each latest laporan
    latestByTypeRes.rows.forEach(lap => {
      const jenis = lap.jenis ? lap.jenis.toLowerCase() : null;
      summary[jenis] = {
        id: lap.id,
        data: lap.data,
        tanggal: lap.tanggal,
      };
    });

    return res.json({ success: true, data: summary });
  } catch (e) {
    console.error('getDashboardSummary error:', e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { getSummary, getDashboardSummary };
