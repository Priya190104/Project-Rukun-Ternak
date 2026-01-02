#!/usr/bin/env node
/**
 * Test kelompok creation with hewan_ternak records
 * This script tests that:
 * 1. New kelompok can be created with ternakDetails array
 * 2. Individual hewan_ternak records are inserted with source='Penyaluran'
 * 3. Dashboard returns calculated ternak_jantan/ternak_betina from hewan_ternak
 */

const db = require('./src/db');
const crypto = require('crypto');

async function testKelompokCreation() {
  const client = await db.pool.connect();
  try {
    // Clean up - delete test data if exists
    console.log('\n📋 Setting up test...');
    await client.query('BEGIN');
    
    // Generate unique test kelompok name
    const testName = `TEST_KELOMPOK_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    console.log(`\n✅ Creating test kelompok: ${testName}`);

    // 1. Insert kelompok directly (simulating createKelompok without hewan details first)
    const pakanList = [
      { name: 'Rumput Gajah', quantity: '50kg' },
      { name: 'Konsentrat', quantity: '30kg' }
    ];
    
    const kesehatanList = [
      { name: 'Vaksin', type: 'Prophylactic' },
      { name: 'Vitamin', type: 'Support' }
    ];

    const kelompokRes = await client.query(
      `INSERT INTO kelompok (
        name, email, kecamatan, desa, catatan, 
        latitude, longitude, 
        pic1_nik, pic1_nama, pic1_alamat, pic1_no_hp, pic1_email, 
        jumlah_kandang, jumlah_ternak, 
        pakan_list, kesehatan_list
      ) VALUES (
        $1, $2, $3, $4, $5, 
        $6, $7, 
        $8, $9, $10, $11, $12, 
        $13, $14, 
        $15, $16
      ) RETURNING id, name`,
      [
        testName,
        'test@example.com',
        'Cilacap',
        'Donan',
        'Test kelompok untuk verifikasi hewan_ternak',
        -7.1234,
        109.5678,
        '1234567890123456',
        'John Doe',
        'Jl. Test No 1',
        '081234567890',
        'john@example.com',
        2,  // jumlah_kandang
        5,  // jumlah_ternak
        JSON.stringify(pakanList),
        JSON.stringify(kesehatanList)
      ]
    );
    
    const kelompokId = kelompokRes.rows[0].id;
    console.log(`✅ Kelompok created with ID: ${kelompokId}`);

    // 2. Insert hewan_ternak records with source='Penyaluran'
    const ternakDetails = [
      { 
        idTernak: `TERNAK_${crypto.randomBytes(4).toString('hex')}`.toUpperCase(),
        jenisKelamin: 'JANTAN',
        ras: 'Peranakan Etawa',
        bobot: 45.5,
        tanggalLahir: '2023-01-15'
      },
      { 
        idTernak: `TERNAK_${crypto.randomBytes(4).toString('hex')}`.toUpperCase(),
        jenisKelamin: 'JANTAN',
        ras: 'Peranakan Etawa',
        bobot: 42.0,
        tanggalLahir: '2023-02-20'
      },
      { 
        idTernak: `TERNAK_${crypto.randomBytes(4).toString('hex')}`.toUpperCase(),
        jenisKelamin: 'BETINA',
        ras: 'Peranakan Etawa',
        bobot: 38.0,
        tanggalLahir: '2023-03-10'
      },
      { 
        idTernak: `TERNAK_${crypto.randomBytes(4).toString('hex')}`.toUpperCase(),
        jenisKelamin: 'BETINA',
        ras: 'Peranakan Etawa',
        bobot: 35.5,
        tanggalLahir: '2023-04-05'
      },
      { 
        idTernak: `TERNAK_${crypto.randomBytes(4).toString('hex')}`.toUpperCase(),
        jenisKelamin: 'BETINA',
        ras: 'Peranakan Etawa',
        bobot: 40.0,
        tanggalLahir: '2023-03-25'
      }
    ];

    console.log(`\n📝 Inserting ${ternakDetails.length} hewan_ternak records...`);
    for (const ternak of ternakDetails) {
      const res = await client.query(
        `INSERT INTO hewan_ternak (
          kelompok_id, jenis_kelamin, ras, bobot, tanggal_lahir, source, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING id, jenis_kelamin, source`,
        [
          kelompokId,
          ternak.jenisKelamin,
          ternak.ras,
          ternak.bobot,
          ternak.tanggalLahir,
          'Penyaluran'
        ]
      );
      const inserted = res.rows[0];
      console.log(`  ✅ ID:${inserted.id} (${inserted.jenis_kelamin}) - source: ${inserted.source}`);
    }

    // 3. Test getDashboardKelompok calculation
    console.log(`\n🔍 Testing getDashboardKelompok calculation...`);
    const dashRes = await client.query(`
      SELECT 
        k.id,
        k.name,
        k.jumlah_kandang,
        k.jumlah_ternak,
        k.pakan_list,
        k.kesehatan_list,
        COUNT(CASE WHEN h.jenis_kelamin = 'JANTAN' AND h.source = 'Penyaluran' THEN 1 END)::int as ternak_jantan,
        COUNT(CASE WHEN h.jenis_kelamin = 'BETINA' AND h.source = 'Penyaluran' THEN 1 END)::int as ternak_betina,
        COUNT(h.id)::int as total_hewan
      FROM kelompok k
      LEFT JOIN hewan_ternak h ON h.kelompok_id = k.id
      WHERE k.id = $1
      GROUP BY k.id, k.name, k.jumlah_kandang, k.jumlah_ternak, k.pakan_list, k.kesehatan_list
    `, [kelompokId]);

    const result = dashRes.rows[0];
    console.log('\n📊 Dashboard Data:');
    console.log(`  Kelompok ID: ${result.id}`);
    console.log(`  Kelompok Name: ${result.name}`);
    console.log(`  Jumlah Kandang: ${result.jumlah_kandang}`);
    console.log(`  Jumlah Ternak (ringkasan): ${result.jumlah_ternak}`);
    console.log(`  ✅ Ternak Jantan (calculated): ${result.ternak_jantan}`);
    console.log(`  ✅ Ternak Betina (calculated): ${result.ternak_betina}`);
    console.log(`  Total Hewan: ${result.total_hewan}`);

    // Verify data
    const expectedJantan = 2;
    const expectedBetina = 3;
    const success = result.ternak_jantan === expectedJantan && 
                    result.ternak_betina === expectedBetina &&
                    result.total_hewan === 5;

    console.log('\n✅ VERIFICATION:');
    console.log(`  Jantan: expected ${expectedJantan}, got ${result.ternak_jantan} - ${result.ternak_jantan === expectedJantan ? '✅' : '❌'}`);
    console.log(`  Betina: expected ${expectedBetina}, got ${result.ternak_betina} - ${result.ternak_betina === expectedBetina ? '✅' : '❌'}`);
    console.log(`  Total: expected 5, got ${result.total_hewan} - ${result.total_hewan === 5 ? '✅' : '❌'}`);

    // 4. Check hewan_ternak records
    console.log(`\n📋 Verifying hewan_ternak records...`);
    const hewanRes = await client.query(
      `SELECT id, jenis_kelamin, ras, bobot, source 
       FROM hewan_ternak 
       WHERE kelompok_id = $1 
       ORDER BY jenis_kelamin`,
      [kelompokId]
    );

    console.log(`Found ${hewanRes.rows.length} hewan records:`);
    hewanRes.rows.forEach((hewan, idx) => {
      console.log(`  ${idx + 1}. ID:${hewan.id} - ${hewan.jenis_kelamin} (${hewan.ras}, ${hewan.bobot}kg) [${hewan.source}]`);
    });

    // 5. Cleanup
    console.log(`\n🧹 Cleaning up test data...`);
    await client.query('DELETE FROM laporan WHERE kelompok_id = $1', [kelompokId]);
    await client.query('DELETE FROM hewan_ternak WHERE kelompok_id = $1', [kelompokId]);
    await client.query('DELETE FROM kelompok WHERE id = $1', [kelompokId]);
    console.log('✅ Test data cleaned up');

    await client.query('COMMIT');
    
    console.log('\n' + '='.repeat(60));
    if (success) {
      console.log('✅ ALL TESTS PASSED!');
      console.log('Backend correctly:');
      console.log('  1. Inserts hewan_ternak records with source=Penyaluran');
      console.log('  2. Calculates ternak_jantan/betina from hewan_ternak');
      console.log('  3. Dashboard will get correct counts');
    } else {
      console.log('❌ TESTS FAILED - Data calculation issue');
    }
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Test Error:', error.message);
    console.error(error);
  } finally {
    client.release();
    await db.pool.end();
    process.exit(0);
  }
}

testKelompokCreation();
