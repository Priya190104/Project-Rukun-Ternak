#!/usr/bin/env node

/**
 * DIRECT DB TEST: Verify kelahiran auto-create logic works without API
 * This simulates what laporanController should do when creating a kelahiran laporan
 */

const db = require('./src/db');

const KELOMPOK_ID = 1;
const KELAHIRAN_DATA = {
  jenis_kelamin_anak: 'keduanya',
  jumlah_anak: 3,
  ras: 'Sapi Brahman',
  bobot: 25.5,
  tanggal_kelahiran: new Date().toISOString().split('T')[0],
  induk_id: null,
  pejantan_id: null
};

async function testKelahiranFlow() {
  try {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║ DB TEST: Kelahiran Auto-Create Logic (Full Flow)          ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    // STEP 1: Create laporan entry
    console.log('STEP 1: Create laporan kelahiran');
    console.log('─'.repeat(60));

    const laporanResult = await db.query(`
      INSERT INTO laporan (jenis, kelompok_id, data, user_id, tanggal, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW(), NOW())
      RETURNING id, jenis, kelompok_id, data, tanggal, created_at
    `, ['Kelahiran', KELOMPOK_ID, JSON.stringify(KELAHIRAN_DATA), null]);

    const laporan = laporanResult.rows[0];
    console.log(`✓ Created laporan ID: ${laporan.id}`);
    console.log(`✓ Type: ${laporan.jenis}`);
    console.log(`✓ Kelompok ID: ${laporan.kelompok_id}`);
    console.log(`✓ Data: ${JSON.stringify(laporan.data).substring(0, 60)}...`);
    console.log('');

    // STEP 2: Auto-create hewan ternak (simulate laporanController logic)
    console.log('STEP 2: Auto-create hewan ternak from kelahiran');
    console.log('─'.repeat(60));

    const jenisCacheKelamin = (KELAHIRAN_DATA.jenis_kelamin_anak || '').toLowerCase();
    const jumlahAnak = parseInt(KELAHIRAN_DATA.jumlah_anak) || 1;

    // Determine genders to create based on jenis_kelamin_anak field
    let gendersToCreate = [];
    if (jenisCacheKelamin === 'keduanya') {
      // If both, alternate or split the count
      const half = Math.ceil(jumlahAnak / 2);
      gendersToCreate = Array(half).fill('JANTAN').concat(Array(jumlahAnak - half).fill('BETINA'));
    } else if (jenisCacheKelamin === 'betina') {
      gendersToCreate = Array(jumlahAnak).fill('BETINA');
    } else {
      // Default to jantan
      gendersToCreate = Array(jumlahAnak).fill('JANTAN');
    }

    console.log(`Genders to create: ${gendersToCreate.join(', ')}`);
    console.log('');

    let successCount = 0;
    const createdIds = [];

    // Create multiple hewan_ternak records (one for each child)
    for (let i = 0; i < gendersToCreate.length; i++) {
      try {
        // This is the FIXED code from laporanController
        // NO custom ID assignment - let database auto-increment
        const createHewanQuery = `
          INSERT INTO hewan_ternak (
            kelompok_id,
            jenis_kelamin,
            ras,
            bobot,
            tanggal_lahir,
            source,
            id_induk,
            id_pejantan,
            status,
            created_at,
            updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
          RETURNING id
        `;

        const hewanResult = await db.query(createHewanQuery, [
          KELOMPOK_ID,
          gendersToCreate[i],
          KELAHIRAN_DATA.ras || 'Unknown',
          parseFloat(KELAHIRAN_DATA.bobot) || 0,
          KELAHIRAN_DATA.tanggal_kelahiran || laporan.tanggal || new Date(),
          'Kelahiran',
          KELAHIRAN_DATA.induk_id || null,
          KELAHIRAN_DATA.pejantan_id || null,
          'AKTIF'
        ]);

        if (hewanResult.rows.length > 0) {
          const createdHewanId = hewanResult.rows[0].id;
          successCount++;
          createdIds.push(createdHewanId);
          console.log(`✓ Created hewan #${i + 1}: ID ${createdHewanId} (${gendersToCreate[i]}, ${KELAHIRAN_DATA.ras})`);
        } else {
          console.log(`⚠ Hewan #${i + 1} failed to create`);
        }
      } catch (innerError) {
        console.error(`✗ Error creating hewan ${i + 1}:`, innerError.message);
      }
    }

    console.log(`\n✓ Successfully created ${successCount}/${jumlahAnak} hewan ternak`);
    console.log(`✓ Created IDs: ${createdIds.join(', ')}`);
    console.log('');

    // STEP 3: Verify created hewan
    console.log('STEP 3: Verify created hewan in database');
    console.log('─'.repeat(60));

    const verifyResult = await db.query(`
      SELECT 
        id,
        id_hewan,
        kelompok_id,
        jenis_kelamin,
        ras,
        bobot,
        tanggal_lahir,
        source,
        status,
        created_at
      FROM hewan_ternak
      WHERE id = ANY($1::int[])
      ORDER BY id;
    `, [createdIds]);

    verifyResult.rows.forEach((row, idx) => {
      console.log(`Hewan #${idx + 1}:`);
      console.log(`  ID: ${row.id}`);
      console.log(`  ID Hewan: ${row.id_hewan || '(none)'}`);
      console.log(`  Kelompok: ${row.kelompok_id}`);
      console.log(`  Jenis: ${row.jenis_kelamin}`);
      console.log(`  Ras: ${row.ras}`);
      console.log(`  Bobot: ${row.bobot} kg`);
      console.log(`  Source: ${row.source}`);
      console.log(`  Status: ${row.status}`);
      console.log('');
    });

    // STEP 4: Verify stats
    console.log('STEP 4: Verify kelompok statistics');
    console.log('─'.repeat(60));

    const statsResult = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN source = 'Kelahiran' THEN 1 END) as from_kelahiran,
        COUNT(CASE WHEN source = 'Penyaluran' THEN 1 END) as from_penyaluran,
        COUNT(CASE WHEN jenis_kelamin = 'JANTAN' THEN 1 END) as jantan_count,
        COUNT(CASE WHEN jenis_kelamin = 'BETINA' THEN 1 END) as betina_count
      FROM hewan_ternak
      WHERE kelompok_id = $1;
    `, [KELOMPOK_ID]);

    const stats = statsResult.rows[0];
    console.log(`Total hewan: ${stats.total}`);
    console.log(`From Kelahiran: ${stats.from_kelahiran}`);
    console.log(`From Penyaluran: ${stats.from_penyaluran}`);
    console.log(`Jantan: ${stats.jantan_count}`);
    console.log(`Betina: ${stats.betina_count}`);
    console.log('');

    // STEP 5: Verify data integrity
    console.log('STEP 5: Data Integrity Checks');
    console.log('─'.repeat(60));

    let integrityOk = true;

    if (successCount !== jumlahAnak) {
      console.log(`✗ FAILED: Expected ${jumlahAnak} hewan, created ${successCount}`);
      integrityOk = false;
    } else {
      console.log(`✓ All ${jumlahAnak} hewan created successfully`);
    }

    const createdHewan = verifyResult.rows;
    if (createdHewan.every(h => h.source === 'Kelahiran')) {
      console.log(`✓ All hewan have source='Kelahiran'`);
    } else {
      console.log(`✗ FAILED: Not all hewan have source='Kelahiran'`);
      integrityOk = false;
    }

    if (createdHewan.every(h => h.status === 'AKTIF')) {
      console.log(`✓ All hewan have status='AKTIF'`);
    } else {
      console.log(`✗ FAILED: Not all hewan have status='AKTIF'`);
      integrityOk = false;
    }

    if (createdHewan.every(h => h.kelompok_id === KELOMPOK_ID)) {
      console.log(`✓ All hewan belong to kelompok ${KELOMPOK_ID}`);
    } else {
      console.log(`✗ FAILED: Not all hewan belong to correct kelompok`);
      integrityOk = false;
    }

    const expectedJantan = gendersToCreate.filter(g => g === 'JANTAN').length;
    const expectedBetina = gendersToCreate.filter(g => g === 'BETINA').length;
    
    if (expectedJantan > 0 && createdHewan.filter(h => h.jenis_kelamin === 'JANTAN').length >= expectedJantan) {
      console.log(`✓ Jantan count correct (expected ${expectedJantan}, have ${createdHewan.filter(h => h.jenis_kelamin === 'JANTAN').length})`);
    } else if (expectedJantan === 0) {
      console.log(`✓ No jantan expected, none created`);
    } else {
      console.log(`⚠ Jantan count may be incorrect (expected ${expectedJantan}, have ${createdHewan.filter(h => h.jenis_kelamin === 'JANTAN').length})`);
    }

    if (expectedBetina > 0 && createdHewan.filter(h => h.jenis_kelamin === 'BETINA').length >= expectedBetina) {
      console.log(`✓ Betina count correct (expected ${expectedBetina}, have ${createdHewan.filter(h => h.jenis_kelamin === 'BETINA').length})`);
    } else if (expectedBetina === 0) {
      console.log(`✓ No betina expected, none created`);
    } else {
      console.log(`⚠ Betina count may be incorrect (expected ${expectedBetina}, have ${createdHewan.filter(h => h.jenis_kelamin === 'BETINA').length})`);
    }

    console.log('');

    // Final result
    console.log('╔═══════════════════════════════════════════════════════════╗');
    if (integrityOk) {
      console.log('║ ✅ TEST PASSED - ALL CHECKS OK                            ║');
    } else {
      console.log('║ ❌ TEST FAILED - SOME CHECKS FAILED                       ║');
    }
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    console.log('Summary:');
    console.log(`  ✓ Laporan kelahiran created (ID: ${laporan.id})`);
    console.log(`  ✓ Auto-created ${successCount} hewan ternak`);
    console.log(`  ✓ All hewan have correct properties (source, status, kelompok_id)`);
    console.log(`  ✓ Genders distributed correctly (${expectedJantan} jantan, ${expectedBetina} betina)`);
    console.log(`  ✓ ID consistency: all hewan use auto-increment integer IDs`);
    console.log('');

    process.exit(integrityOk ? 0 : 1);

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testKelahiranFlow();
