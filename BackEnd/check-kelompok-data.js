const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'rukunternak',
  user: 'postgres',
  password: 'admin123'
});

pool.query(`
  SELECT k.id, k.name, k.jumlah_kandang, COUNT(h.id)::int as hewan_count
  FROM kelompok k
  LEFT JOIN hewan_ternak h ON h.kelompok_id = k.id
  GROUP BY k.id
  ORDER BY k.id DESC
  LIMIT 5
`).then(r => {
  console.log('\nTop 5 Kelompok terbaru:');
  r.rows.forEach(row => {
    console.log(`${row.id}. ${row.name} - Kandang: ${row.jumlah_kandang}, Hewan: ${row.hewan_count}`);
  });
  pool.end();
});
