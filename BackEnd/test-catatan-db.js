#!/usr/bin/env node

require('dotenv').config();
const db = require('./src/db');

async function testCatatan() {
  try {
    console.log('Testing catatan field in hewan_ternak...\n');

    // 1. Create test kelompok
    console.log('1. Creating test kelompok...');
    const kelompokRes = await db.query(
      `INSERT INTO kelompok (name, email, kecamatan, desa) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name`,
      [`Test Kelompok ${Date.now()}`, `test-${Date.now()}@example.com`, 'Cilacap Selatan', 'Sidakaya']
    );

    const kelompokId = kelompokRes.rows[0].id;
    console.log(`   ✓ Kelompok created: ${kelompokRes.rows[0].name} (ID: ${kelompokId})\n`);

    // 2. Create hewan with catatan
    console.log('2. Creating hewan with catatan...');
    const hewan1Res = await db.query(
      `INSERT INTO hewan_ternak (
         kelompok_id, id_hewan, jenis_kelamin, ras, tanggal_lahir, bobot, catatan, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING id, id_hewan, catatan`,
      [kelompokId, `HW-TEST-001`, 'JANTAN', 'Limousin', '2024-01-01', 150, 'Hewan ini sangat sehat dan aktif']
    );

    console.log(`   ✓ Hewan 1 created:`);
    console.log(`     ID: ${hewan1Res.rows[0].id}`);
    console.log(`     ID Hewan: ${hewan1Res.rows[0].id_hewan}`);
    console.log(`     Catatan: ${hewan1Res.rows[0].catatan}\n`);

    // 3. Create hewan without catatan
    console.log('3. Creating hewan without catatan...');
    const hewan2Res = await db.query(
      `INSERT INTO hewan_ternak (
         kelompok_id, id_hewan, jenis_kelamin, ras, tanggal_lahir, bobot, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING id, id_hewan, catatan`,
      [kelompokId, `HW-TEST-002`, 'BETINA', 'Brahman', '2023-06-01', 120]
    );

    console.log(`   ✓ Hewan 2 created:`);
    console.log(`     ID: ${hewan2Res.rows[0].id}`);
    console.log(`     ID Hewan: ${hewan2Res.rows[0].id_hewan}`);
    console.log(`     Catatan: ${hewan2Res.rows[0].catatan || 'NULL'}\n`);

    // 4. Verify by reading
    console.log('4. Verifying catatan field by reading...');
    const readRes = await db.query(
      `SELECT id, id_hewan, ras, catatan FROM hewan_ternak 
       WHERE kelompok_id = $1 
       ORDER BY id DESC
       LIMIT 2`,
      [kelompokId]
    );

    console.log(`   Found ${readRes.rows.length} hewan:`);
    readRes.rows.forEach((row, idx) => {
      console.log(`     ${idx + 1}. ID ${row.id} (${row.id_hewan}): Catatan = ${row.catatan || 'NULL'}`);
    });

    // 5. Check if catatan column exists and is properly used
    console.log('\n5. Checking database schema...');
    const schemaRes = await db.query(
      `SELECT column_name, data_type, is_nullable 
       FROM information_schema.columns 
       WHERE table_name = 'hewan_ternak' AND column_name = 'catatan'`
    );

    if (schemaRes.rows.length > 0) {
      const col = schemaRes.rows[0];
      console.log(`   ✓ Column 'catatan' found:`);
      console.log(`     Data Type: ${col.data_type}`);
      console.log(`     Nullable: ${col.is_nullable}`);
    } else {
      console.log(`   ✗ Column 'catatan' NOT found`);
    }

    // 6. Final check
    console.log('\n6. Final verification...');
    if (hewan1Res.rows[0].catatan === 'Hewan ini sangat sehat dan aktif' && !hewan2Res.rows[0].catatan) {
      console.log(`   ✓ Test PASSED: Catatan field works correctly\n`);
      process.exit(0);
    } else {
      console.log(`   ✗ Test FAILED: Catatan field not working as expected\n`);
      process.exit(1);
    }

  } catch (error) {
    console.error('\n✗ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    db.end();
  }
}

testCatatan();
