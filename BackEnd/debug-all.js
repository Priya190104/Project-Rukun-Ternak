const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:admin123@localhost:5432/rukunternak'
});

async function debugAll() {
  try {
    console.log('\n=== SEMUA KELOMPOK ===\n');
    const kelompok = await pool.query('SELECT id, name FROM kelompok');
    console.table(kelompok.rows);

    console.log('\n\n=== SEMUA USER DENGAN KELOMPOK ===\n');
    const users = await pool.query(`
      SELECT id, username, role, kelompok_id 
      FROM "users" 
      ORDER BY id
    `);
    console.table(users.rows);

    console.log('\n\n=== TOTAL HEWAN PER KELOMPOK ===\n');
    const hewanPerKelompok = await pool.query(`
      SELECT 
        kelompok_id,
        COUNT(*) as total,
        COUNT(CASE WHEN jenis_kelamin = 'JANTAN' THEN 1 END) as jantan,
        COUNT(CASE WHEN jenis_kelamin = 'BETINA' THEN 1 END) as betina,
        COUNT(CASE WHEN status = 'AKTIF' THEN 1 END) as aktif,
        COUNT(CASE WHEN status = 'TIDAK_AKTIF' THEN 1 END) as tidak_aktif
      FROM hewan_ternak
      GROUP BY kelompok_id
      ORDER BY kelompok_id
    `);
    console.table(hewanPerKelompok.rows);

    console.log('\n\n=== SAMPLE HEWAN DARI SETIAP KELOMPOK ===\n');
    const sampleHewan = await pool.query(`
      SELECT 
        id,
        id_hewan,
        kelompok_id,
        jenis_kelamin,
        status,
        tanggal_lahir,
        FLOOR(EXTRACT(DAY FROM (NOW() - tanggal_lahir))) as umur_hari,
        ras
      FROM hewan_ternak
      ORDER BY kelompok_id, id
      LIMIT 30
    `);
    console.table(sampleHewan.rows);

    console.log('\n\n=== HEWAN YANG UMURNYA > 8 BULAN (SEMUA KELOMPOK) ===\n');
    const hewan8bulan = await pool.query(`
      SELECT 
        id,
        id_hewan,
        kelompok_id,
        jenis_kelamin,
        status,
        tanggal_lahir,
        FLOOR(EXTRACT(DAY FROM (NOW() - tanggal_lahir))) as umur_hari,
        FLOOR(EXTRACT(DAY FROM (NOW() - tanggal_lahir)) / 30) as umur_bulan
      FROM hewan_ternak
      WHERE EXTRACT(DAY FROM (NOW() - tanggal_lahir)) > 240
      ORDER BY kelompok_id, jenis_kelamin
    `);
    console.log(`Total hewan > 8 bulan: ${hewan8bulan.rows.length}`);
    console.table(hewan8bulan.rows);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

debugAll();
