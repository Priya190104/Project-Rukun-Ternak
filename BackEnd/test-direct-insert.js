/**
 * TEST LANGSUNG: Insert hewan ke kelompok yang sudah ada (ID=19)
 * GOAL: Verifikasi apakah INSERT ke hewan_ternak berfungsi
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'rukunternak',
  user: 'postgres',
  password: 'admin123'
});

async function test() {
  const client = await pool.connect();

  try {
    console.log('\n' + '='.repeat(70));
    console.log('TEST: INSERT Hewan Ternak ke Kelompok ID=19');
    console.log('='.repeat(70) + '\n');

    const kelompokId = 19;

    // Check kelompok exists
    const checkResult = await client.query(
      'SELECT id, name, jumlah_ternak FROM kelompok WHERE id = $1',
      [kelompokId]
    );

    if (checkResult.rows.length === 0) {
      console.log(`❌ Kelompok ${kelompokId} tidak ada!`);
      return;
    }

    const k = checkResult.rows[0];
    console.log(`✅ Kelompok ditemukan:`);
    console.log(`   ID: ${k.id}`);
    console.log(`   Nama: ${k.name}`);
    console.log(`   Jumlah Ternak (metadata): ${k.jumlah_ternak}\n`);

    // Check current hewan
    const currentResult = await client.query(
      `SELECT COUNT(*) as total FROM hewan_ternak WHERE kelompok_id = $1`,
      [kelompokId]
    );
    console.log(`📊 Hewan saat ini di database: ${currentResult.rows[0].total}\n`);

    // Try transaction like in controller
    console.log('🔄 ATTEMPTING INSERT dalam TRANSACTION:\n');
    await client.query('BEGIN');

    const ternakDetails = [
      { jenisKelamin: 'JANTAN', ras: 'Peranakan Etawa', bobot: 45.5, umur: 24 },
      { jenisKelamin: 'BETINA', ras: 'Peranakan Etawa', bobot: 38, umur: 18 },
      { jenisKelamin: 'BETINA', ras: 'Boer', bobot: 40, umur: 20 }
    ];

    const insertedHewan = [];
    for (const ternak of ternakDetails) {
      // Calculate tanggal lahir
      const today = new Date();
      const birthDate = new Date(today.getFullYear(), today.getMonth() - parseInt(ternak.umur), today.getDate());
      const tglLahir = birthDate.toISOString().split('T')[0];

      console.log(`   Inserting: ${ternak.jenisKelamin} | ${ternak.ras} | ${ternak.bobot}kg | umur=${ternak.umur}m -> tglLahir=${tglLahir}`);

      const insertResult = await client.query(
        `INSERT INTO hewan_ternak (
          kelompok_id, jenis_kelamin, ras, bobot, tanggal_lahir, source, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING id, jenis_kelamin, ras, bobot, source`,
        [
          kelompokId,
          (ternak.jenisKelamin || '').toUpperCase(),
          ternak.ras || '',
          parseFloat(ternak.bobot) || 0,
          tglLahir,
          'Penyaluran'
        ]
      );

      const inserted = insertResult.rows[0];
      insertedHewan.push(inserted);
      console.log(`      ✅ Inserted ID ${inserted.id}: ${inserted.jenis_kelamin} (${inserted.ras})`);
    }

    console.log(`\n   ✅ Total inserted: ${insertedHewan.length}`);

    // Commit transaction
    await client.query('COMMIT');
    console.log(`\n✅ TRANSACTION COMMITTED\n`);

    // Verify
    const verifyResult = await client.query(
      `SELECT COUNT(*) as total, 
              COUNT(CASE WHEN jenis_kelamin = 'JANTAN' THEN 1 END) as jantan,
              COUNT(CASE WHEN jenis_kelamin = 'BETINA' THEN 1 END) as betina
       FROM hewan_ternak 
       WHERE kelompok_id = $1`,
      [kelompokId]
    );

    const v = verifyResult.rows[0];
    console.log(`✅ VERIFIKASI SETELAH INSERT:`);
    console.log(`   Total hewan: ${v.total}`);
    console.log(`   Jantan: ${v.jantan}`);
    console.log(`   Betina: ${v.betina}\n`);

    if (v.total > 0) {
      console.log('✅ INSERT BERHASIL! Hewan terlihat di database!');
    } else {
      console.log('❌ INSERT GAGAL! Hewan tidak terlihat!');
    }

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ ERROR:', err.message);
    console.error('Stack:', err.stack);
  } finally {
    client.release();
    await pool.end();
  }

  console.log('\n' + '='.repeat(70) + '\n');
}

test();
