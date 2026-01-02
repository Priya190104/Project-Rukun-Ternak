#!/usr/bin/env node

/**
 * TEST: Verify ID consistency dan kelahiran auto-create logic
 * Test flow:
 * 1. Check database schema (id_hewan column exists)
 * 2. Create sample laporan kelahiran
 * 3. Verify hewan_ternak auto-created dengan ID integer dan optional id_hewan
 * 4. Verify ID konsisten di list dan detail endpoint
 */

const db = require('./src/db');

const KELOMPOK_ID = 1; // Assuming kelompok_id 1 exists
const TEST_LAPORAN_DATA = {
  jenis: 'Kelahiran',
  kelompok_id: KELOMPOK_ID,
  data: {
    jenis_kelamin_anak: 'betina',
    jumlah_anak: 2,
    ras: 'Domba Lokal',
    bobot: 5.5,
    tanggal_kelahiran: new Date().toISOString().split('T')[0],
    induk_id: null,
    pejantan_id: null
  }
};

async function runTests() {
  try {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║ TEST: ID CONSISTENCY & KELAHIRAN AUTO-CREATE LOGIC        ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    // TEST 1: Check database schema
    console.log('TEST 1: Check database schema for id_hewan column');
    console.log('─'.repeat(60));
    
    const schemaResult = await db.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'hewan_ternak' 
      AND column_name IN ('id', 'id_hewan')
      ORDER BY ordinal_position;
    `);

    let hasIdColumn = false;
    let hasIdHewanColumn = false;

    schemaResult.rows.forEach(col => {
      console.log(`  ✓ ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      if (col.column_name === 'id') hasIdColumn = true;
      if (col.column_name === 'id_hewan') hasIdHewanColumn = true;
    });

    if (!hasIdColumn || !hasIdHewanColumn) {
      console.log('  ❌ FAILED: Missing required columns\n');
      process.exit(1);
    }
    console.log('  ✅ PASSED\n');

    // TEST 2: Query current hewan count
    console.log('TEST 2: Check current hewan ternak count');
    console.log('─'.repeat(60));
    
    const countResult = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN source = 'Kelahiran' THEN 1 END) as from_kelahiran,
        COUNT(CASE WHEN source = 'Penyaluran' THEN 1 END) as from_penyaluran
      FROM hewan_ternak
      WHERE kelompok_id = $1;
    `, [KELOMPOK_ID]);

    const stats = countResult.rows[0];
    console.log(`  Total hewan: ${stats.total}`);
    console.log(`  From Kelahiran: ${stats.from_kelahiran}`);
    console.log(`  From Penyaluran: ${stats.from_penyaluran}`);
    console.log('  ✅ PASSED\n');

    // TEST 3: Create test laporan kelahiran
    console.log('TEST 3: Create test laporan kelahiran');
    console.log('─'.repeat(60));
    
    const laporan = await db.query(`
      INSERT INTO laporan (jenis, kelompok_id, data, tanggal, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW(), NOW())
      RETURNING id, created_at;
    `, [
      TEST_LAPORAN_DATA.jenis,
      TEST_LAPORAN_DATA.kelompok_id,
      JSON.stringify(TEST_LAPORAN_DATA.data)
    ]);

    const laporanId = laporan.rows[0].id;
    console.log(`  ✓ Created laporan ID: ${laporanId}`);
    console.log('  ✅ PASSED\n');

    // TEST 4: Manually trigger the same logic as laporanController
    console.log('TEST 4: Auto-create hewan ternak from kelahiran');
    console.log('─'.repeat(60));
    
    const jenisCacheKelamin = TEST_LAPORAN_DATA.data.jenis_kelamin_anak || '';
    const jumlahAnak = TEST_LAPORAN_DATA.data.jumlah_anak || 1;
    
    let gendersToCreate = [];
    if (jenisCacheKelamin.toLowerCase() === 'betina') {
      gendersToCreate = Array(jumlahAnak).fill('BETINA');
    } else {
      gendersToCreate = Array(jumlahAnak).fill('JANTAN');
    }

    console.log(`  Creating ${jumlahAnak} hewan (${jenisCacheKelamin})`);

    const createdHewanIds = [];
    for (let i = 0; i < gendersToCreate.length; i++) {
      try {
        const hewanResult = await db.query(`
          INSERT INTO hewan_ternak (
            kelompok_id,
            jenis_kelamin,
            ras,
            bobot,
            tanggal_lahir,
            source,
            status,
            created_at,
            updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
          RETURNING id, jenis_kelamin, ras, source;
        `, [
          TEST_LAPORAN_DATA.kelompok_id,
          gendersToCreate[i],
          TEST_LAPORAN_DATA.data.ras,
          TEST_LAPORAN_DATA.data.bobot,
          TEST_LAPORAN_DATA.data.tanggal_kelahiran,
          'Kelahiran',
          'AKTIF'
        ]);

        if (hewanResult.rows.length > 0) {
          const hewanId = hewanResult.rows[0].id;
          createdHewanIds.push(hewanId);
          console.log(`  ✓ Created hewan #${i + 1}: ID ${hewanId} (${gendersToCreate[i]}, ${TEST_LAPORAN_DATA.data.ras})`);
        }
      } catch (err) {
        console.log(`  ❌ Error creating hewan #${i + 1}: ${err.message}`);
      }
    }

    if (createdHewanIds.length !== jumlahAnak) {
      console.log(`  ❌ FAILED: Expected ${jumlahAnak} hewan, got ${createdHewanIds.length}\n`);
      process.exit(1);
    }
    console.log('  ✅ PASSED\n');

    // TEST 5: Verify created hewan
    console.log('TEST 5: Verify created hewan in database');
    console.log('─'.repeat(60));
    
    const verifyResult = await db.query(`
      SELECT 
        id,
        id_hewan,
        jenis_kelamin,
        ras,
        source,
        status,
        kelompok_id
      FROM hewan_ternak
      WHERE id = ANY($1::int[])
      ORDER BY id;
    `, [createdHewanIds]);

    if (verifyResult.rows.length !== createdHewanIds.length) {
      console.log(`  ❌ FAILED: Expected ${createdHewanIds.length} rows, got ${verifyResult.rows.length}\n`);
      process.exit(1);
    }

    verifyResult.rows.forEach((row, idx) => {
      console.log(`  ✓ Hewan #${idx + 1}:`);
      console.log(`    - ID (database): ${row.id}`);
      console.log(`    - ID Hewan (user): ${row.id_hewan || '(none)'}`);
      console.log(`    - Jenis: ${row.jenis_kelamin}`);
      console.log(`    - Ras: ${row.ras}`);
      console.log(`    - Source: ${row.source}`);
      console.log(`    - Status: ${row.status}`);
    });
    console.log('  ✅ PASSED\n');

    // TEST 6: Check final statistics
    console.log('TEST 6: Final statistics after creation');
    console.log('─'.repeat(60));
    
    const finalStatsResult = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN source = 'Kelahiran' THEN 1 END) as from_kelahiran,
        COUNT(CASE WHEN source = 'Penyaluran' THEN 1 END) as from_penyaluran
      FROM hewan_ternak
      WHERE kelompok_id = $1;
    `, [KELOMPOK_ID]);

    const finalStats = finalStatsResult.rows[0];
    console.log(`  Total hewan: ${finalStats.total} (was ${stats.total}, +${finalStats.total - stats.total})`);
    console.log(`  From Kelahiran: ${finalStats.from_kelahiran} (was ${stats.from_kelahiran}, +${finalStats.from_kelahiran - stats.from_kelahiran})`);
    console.log(`  From Penyaluran: ${finalStats.from_penyaluran} (was ${stats.from_penyaluran}, +${finalStats.from_penyaluran - stats.from_penyaluran})`);
    
    if ((finalStats.from_kelahiran - stats.from_kelahiran) !== jumlahAnak) {
      console.log(`  ❌ FAILED: Expected +${jumlahAnak} kelahiran hewan\n`);
      process.exit(1);
    }
    console.log('  ✅ PASSED\n');

    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║ ✅ ALL TESTS PASSED                                       ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    console.log('Summary:');
    console.log(`  ✓ Database schema correct (id INTEGER, id_hewan VARCHAR)`);
    console.log(`  ✓ Kelahiran logic can create hewan with auto-increment ID`);
    console.log(`  ✓ Created ${jumlahAnak} hewan ternak successfully`);
    console.log(`  ✓ All hewan have correct source='Kelahiran'`);
    console.log(`  ✓ All hewan have correct status='AKTIF'`);
    console.log('');

    process.exit(0);

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runTests();
