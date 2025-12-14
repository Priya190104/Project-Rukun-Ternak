const db = require('../db');

async function getLandingStats(req, res) {
  try {
    const initialPopulation = parseInt(process.env.INITIAL_SHEEP_TOTAL || '0', 10) || 0;

    const kelahiranRes = await db.query(
      "SELECT COUNT(*)::int AS count FROM laporan WHERE LOWER(jenis) = 'kelahiran'"
    );
    const kematianRes = await db.query(
      "SELECT COUNT(*)::int AS count FROM laporan WHERE LOWER(jenis) = 'kematian'"
    );
    const lastUpdatedRes = await db.query('SELECT COALESCE(MAX(tanggal), NOW()) AS last_updated FROM laporan');

    const births = Math.max(0, kelahiranRes.rows[0]?.count || 0);
    const deaths = Math.max(0, kematianRes.rows[0]?.count || 0);
    const currentPopulation = Math.max(initialPopulation + births - deaths, 0);

    // Safe percentage calculation: avoid NaN and Infinity
    let birthsPercent = 0;
    let deathsPercent = 0;
    
    if (currentPopulation > 0) {
      birthsPercent = Number(((births / currentPopulation) * 100).toFixed(2));
      deathsPercent = Number(((deaths / currentPopulation) * 100).toFixed(2));
    }

    // Validate numbers are finite
    if (!isFinite(birthsPercent)) birthsPercent = 0;
    if (!isFinite(deathsPercent)) deathsPercent = 0;

    return res.json({
      success: true,
      data: {
        births: { count: births, percent: birthsPercent },
        deaths: { count: deaths, percent: deathsPercent },
        population: { current: currentPopulation, initial: initialPopulation },
        lastUpdated: lastUpdatedRes.rows[0]?.last_updated || new Date().toISOString(),
      },
    });
  } catch (e) {
    console.error('Landing stats error:', e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { getLandingStats };
