#!/usr/bin/env node
/**
 * DIRECT DATABASE AUDIT
 * Cek apakah tabel hewan_ternak ada data atau kosong
 */

const db = require('./src/db');

async function auditDatabase() {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('DATABASE AUDIT: HEWAN_TERNAK TABLE');
    console.log('='.repeat(70));

    // 1. Check table structure
    console.log('\n📋 STEP 1: Cek struktur tabel hewan_ternak');
    const structRes = await db.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'hewan_ternak'
      ORDER BY ordinal_position
    `);
    console.log('✅ Kolom yang ada:');
    structRes.rows.forEach((col, i) => {
      console.log(`  ${i+1}. ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? '[nullable]' : '[NOT NULL]'}`);
    });

    // 2. Count all hewan_ternak
    console.log('\n📊 STEP 2: Total records di tabel hewan_ternak');
    const countRes = await db.query('SELECT COUNT(*) as total FROM hewan_ternak');
    const totalHewan = countRes.rows[0].total;
    console.log(`✅ Total hewan_ternak: ${totalHewan}`);

    // 3. Count by source
    console.log('\n🔍 STEP 3: Breakdown by source');
    const sourceRes = await db.query(`
      SELECT source, COUNT(*) as total
      FROM hewan_ternak
      GROUP BY source
      ORDER BY total DESC
    `);
    sourceRes.rows.forEach(row => {
      console.log(`  ${row.source || 'NULL'}: ${row.total}`);
    });

    // 4. Count by kelompok
    console.log('\n🏠 STEP 4: Breakdown by kelompok');
    const kelompokRes = await db.query(`
      SELECT 
        h.kelompok_id,
        k.name as kelompok_name,
        COUNT(*) as hewan_count,
        COUNT(CASE WHEN h.jenis_kelamin = 'JANTAN' THEN 1 END) as jantan,
        COUNT(CASE WHEN h.jenis_kelamin = 'BETINA' THEN 1 END) as betina
      FROM hewan_ternak h
      LEFT JOIN kelompok k ON k.id = h.kelompok_id
      GROUP BY h.kelompok_id, k.name
      ORDER BY hewan_count DESC
      LIMIT 20
    `);
    
    if (kelompokRes.rows.length === 0) {
      console.log('  ❌ KOSONG! Tidak ada hewan_ternak sama sekali');
    } else {
      console.log('✅ Hewan per kelompok:');
      kelompokRes.rows.forEach((row, i) => {
        console.log(`  ${i+1}. Kelompok ${row.kelompok_id} (${row.kelompok_name}): ${row.hewan_count} (${row.jantan}J + ${row.betina}B)`);
      });
    }

    // 5. Recent kelompok yang dibuat
    console.log('\n📅 STEP 5: 5 Kelompok TERBARU');
    const recentKelompok = await db.query(`
      SELECT id, name, jumlah_ternak
      FROM kelompok
      ORDER BY id DESC
      LIMIT 5
    `);
    
    console.log('Kelompok:');
    recentKelompok.rows.forEach((row, i) => {
      console.log(`  ${i+1}. ID=${row.id}, name=${row.name}, jumlah_ternak=${row.jumlah_ternak}`);
    });

    // 6. Untuk kelompok terbaru, cek hewan yang ada
    if (recentKelompok.rows.length > 0) {
      const latestKelompok = recentKelompok.rows[0];
      console.log(`\n🔎 STEP 6: Detail hewan untuk kelompok terbaru (ID=${latestKelompok.id}, name=${latestKelompok.name})`);
      
      const detailRes = await db.query(`
        SELECT id, jenis_kelamin, ras, bobot, tanggal_lahir, source
        FROM hewan_ternak
        WHERE kelompok_id = $1
        ORDER BY id
      `, [latestKelompok.id]);

      if (detailRes.rows.length === 0) {
        console.log(`  ❌ PERHATIAN: Kelompok ID ${latestKelompok.id} TIDAK PUNYA HEWAN!`);
        console.log(`  - jumlah_ternak di kelompok: ${latestKelompok.jumlah_ternak}`);
        console.log(`  - hewan_ternak records: 0`);
        console.log(`  => MISMATCH! Ada bug di createKelompok`);
      } else {
        console.log(`✅ Ada ${detailRes.rows.length} hewan:`);
        detailRes.rows.forEach((hewan, i) => {
          console.log(`  ${i+1}. ID=${hewan.id}, ${hewan.jenis_kelamin}, ${hewan.ras}, ${hewan.bobot}kg, [${hewan.source}]`);
        });
      }
    }

    // 7. Cek apakah ada error di INSERT
    console.log('\n⚠️ STEP 7: Cek recent errors di server logs');
    console.log('  (Check console output saat POST /api/kelompok)');

    console.log('\n' + '='.repeat(70));
    if (totalHewan === 0) {
      console.log('❌ KESIMPULAN: TABEL HEWAN_TERNAK KOSONG!');
      console.log('   INSERT ke hewan_ternak TIDAK PERNAH TERJADI');
      console.log('\n   MUNGKIN PENYEBAB:');
      console.log('   1. Payload tidak berisi ternakDetails');
      console.log('   2. Filter validasi terlalu ketat');
      console.log('   3. Exception saat INSERT (catch error)');
      console.log('   4. Transaction ROLLBACK');
    } else {
      console.log(`✅ Tabel ada ${totalHewan} hewan`);
    }
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error);
  } finally {
    await db.pool.end();
    process.exit(0);
  }
}

auditDatabase();
