const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'admin123',
  host: 'localhost',
  port: 5432,
  database: 'rukunternak'
});

async function debugHewan() {
  try {
    console.log('\n=== DEBUG HEWAN DATA ===\n');

    // Check semua hewan untuk kelompok 1
    const allHewan = await pool.query(`
      SELECT 
        id,
        id_hewan,
        jenis_kelamin,
        status,
        tanggal_lahir,
        tanggal_status_tidak_aktif,
        kelompok_id,
        FLOOR(EXTRACT(DAY FROM (NOW() - tanggal_lahir))) as umur_hari_now,
        CASE 
          WHEN status = 'TIDAK_AKTIF' AND tanggal_status_tidak_aktif IS NOT NULL
          THEN FLOOR(EXTRACT(DAY FROM (tanggal_status_tidak_aktif - tanggal_lahir)))
          ELSE FLOOR(EXTRACT(DAY FROM (NOW() - tanggal_lahir)))
        END as umur_hari_case
      FROM hewan_ternak
      WHERE kelompok_id = 1
      ORDER BY tanggal_lahir DESC
      LIMIT 20
    `);

    console.log('Semua Hewan Kelompok 1:');
    console.table(allHewan.rows);

    // Check hewan JANTAN
    console.log('\n\n=== HEWAN JANTAN YANG MEMENUHI KRITERIA ===\n');
    const pejantan = await pool.query(`
      SELECT 
        id,
        id_hewan,
        jenis_kelamin,
        status,
        tanggal_lahir,
        FLOOR(EXTRACT(DAY FROM (NOW() - tanggal_lahir))) as umur_hari
      FROM hewan_ternak
      WHERE 
        kelompok_id = 1
        AND jenis_kelamin = 'JANTAN'
        AND status = 'AKTIF'
        AND EXTRACT(DAY FROM (NOW() - tanggal_lahir)) > 240
      ORDER BY id_hewan ASC
    `);

    console.log(`Total Pejantan yang memenuhi kriteria: ${pejantan.rows.length}`);
    console.table(pejantan.rows);

    // Check hewan JANTAN AKTIF (tanpa filter umur)
    console.log('\n\n=== HEWAN JANTAN AKTIF (TANPA FILTER UMUR) ===\n');
    const pejantanNoAge = await pool.query(`
      SELECT 
        id,
        id_hewan,
        jenis_kelamin,
        status,
        tanggal_lahir,
        FLOOR(EXTRACT(DAY FROM (NOW() - tanggal_lahir))) as umur_hari
      FROM hewan_ternak
      WHERE 
        kelompok_id = 1
        AND jenis_kelamin = 'JANTAN'
        AND status = 'AKTIF'
      ORDER BY id_hewan ASC
    `);

    console.log(`Total Pejantan AKTIF: ${pejantanNoAge.rows.length}`);
    console.table(pejantanNoAge.rows);

    // Check hewan BETINA
    console.log('\n\n=== HEWAN BETINA YANG MEMENUHI KRITERIA ===\n');
    const induk = await pool.query(`
      SELECT 
        id,
        id_hewan,
        jenis_kelamin,
        status,
        tanggal_lahir,
        FLOOR(EXTRACT(DAY FROM (NOW() - tanggal_lahir))) as umur_hari
      FROM hewan_ternak
      WHERE 
        kelompok_id = 1
        AND jenis_kelamin = 'BETINA'
        AND status = 'AKTIF'
        AND EXTRACT(DAY FROM (NOW() - tanggal_lahir)) > 240
      ORDER BY id_hewan ASC
    `);

    console.log(`Total Induk yang memenuhi kriteria: ${induk.rows.length}`);
    console.table(induk.rows);

    // Check hewan BETINA AKTIF (tanpa filter umur)
    console.log('\n\n=== HEWAN BETINA AKTIF (TANPA FILTER UMUR) ===\n');
    const indukNoAge = await pool.query(`
      SELECT 
        id,
        id_hewan,
        jenis_kelamin,
        status,
        tanggal_lahir,
        FLOOR(EXTRACT(DAY FROM (NOW() - tanggal_lahir))) as umur_hari
      FROM hewan_ternak
      WHERE 
        kelompok_id = 1
        AND jenis_kelamin = 'BETINA'
        AND status = 'AKTIF'
      ORDER BY id_hewan ASC
    `);

    console.log(`Total Induk AKTIF: ${indukNoAge.rows.length}`);
    console.table(indukNoAge.rows);

    // Check tanggal hari ini untuk referensi
    console.log('\n\n=== TANGGAL REFERENSI ===\n');
    const now = await pool.query('SELECT NOW() as tanggal_sekarang');
    console.log('Tanggal sekarang:', now.rows[0].tanggal_sekarang);
    console.log('Umur 8 bulan = 240 hari');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

debugHewan();
