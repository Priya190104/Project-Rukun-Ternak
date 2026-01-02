/**
 * TEST: Create Kelompok dengan role='kelompok' 
 * (Sebelumnya di-reject karena role harus admin)
 * SEKARANG: Harus di-allow!
 */

const { Pool } = require('pg');

// Test data untuk kelompok baru
const testPayload = {
  name: 'Kelompok Test Hewan Create - ' + Date.now(),
  email: 'test' + Date.now() + '@kelompok.com',
  kecamatan: 'CIPARI',
  desa: 'MULYASARI',
  latitude: -7.753644,
  longitude: 109.258652,
  pic1_nik: '3304091111111111',
  pic1_nama: 'Budi Hartono',
  pic1_alamat: 'Jl. Cipari No. 45',
  pic1_noHp: '0812999999',
  pic1_email: 'budi@test.com',
  jumlahKandang: 2,
  jumlahTernak: 3,
  ternakDetails: [
    {
      jenisKelamin: 'Jantan',
      ras: 'Peranakan Etawa',
      bobot: '45.5',
      umur: '24'
    },
    {
      jenisKelamin: 'Betina',
      ras: 'Peranakan Etawa',
      bobot: '38',
      umur: '18'
    },
    {
      jenisKelamin: 'Betina',
      ras: 'Boer',
      bobot: '40',
      umur: '20'
    }
  ],
  pakanList: [],
  kesehatanList: []
};

async function testCreateWithRole(role) {
  // Simulate yang akan dikirim dari frontend
  console.log(`\n${'='.repeat(70)}`);
  console.log(`TEST: POST /api/kelompok dengan role='${role}'`);
  console.log('='.repeat(70));

  try {
    // Simulate HTTP POST request dengan curl
    const https = require('https');
    const http = require('http');

    const options = {
      hostname: 'localhost',
      port: 4000,
      path: '/api/kelompok',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': '999',
        'X-User-Email': 'test@test.com',
        'X-User-Role': role,
        'X-Kelompok-Id': '999'
      }
    };

    return new Promise((resolve) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          console.log(`\nStatus: ${res.statusCode}`);
          try {
            const parsed = JSON.parse(data);
            if (parsed.success) {
              console.log('✅ SUCCESS! Kelompok created dengan ID:', parsed.data?.data?.kelompok?.id);
              console.log('   Hewan stats:', parsed.data?.data?.hewanTernak);
              resolve({ success: true, id: parsed.data?.data?.kelompok?.id });
            } else {
              console.log('❌ FAILED:', parsed.message);
              resolve({ success: false });
            }
          } catch (e) {
            console.log('Response:', data);
            resolve({ success: false });
          }
        });
      });

      req.on('error', (err) => {
        console.error('Request error:', err.message);
        resolve({ success: false });
      });

      req.write(JSON.stringify(testPayload));
      req.end();
    });
  } catch (err) {
    console.error('Test error:', err.message);
    return { success: false };
  }
}

async function verifyDatabase(kelompokId) {
  if (!kelompokId) return;

  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'rukunternak',
    user: 'postgres',
    password: 'admin123'
  });

  try {
    // Get kelompok
    const kelResult = await pool.query(
      'SELECT id, name, jumlah_ternak FROM kelompok WHERE id = $1',
      [kelompokId]
    );

    if (kelResult.rows.length === 0) {
      console.log('❌ Kelompok tidak ditemukan di database!');
      return;
    }

    const k = kelResult.rows[0];
    console.log(`\n🔍 VERIFIKASI DATABASE:`);
    console.log(`   Kelompok: ${k.name} (ID: ${k.id})`);
    console.log(`   Jumlah Ternak (metadata): ${k.jumlah_ternak}`);

    // Get hewan
    const hewanResult = await pool.query(
      `SELECT COUNT(*) as total, 
              COUNT(CASE WHEN jenis_kelamin = 'JANTAN' THEN 1 END) as jantan,
              COUNT(CASE WHEN jenis_kelamin = 'BETINA' THEN 1 END) as betina
       FROM hewan_ternak 
       WHERE kelompok_id = $1`,
      [kelompokId]
    );

    const h = hewanResult.rows[0];
    console.log(`   Hewan di DB: Total=${h.total}, Jantan=${h.jantan}, Betina=${h.betina}`);

    if (h.total > 0) {
      console.log('\n✅ HEWAN BERHASIL DI-INSERT!');
      
      // List detail
      const detailResult = await pool.query(
        `SELECT id, jenis_kelamin, ras, bobot, source 
         FROM hewan_ternak 
         WHERE kelompok_id = $1 
         ORDER BY id`,
        [kelompokId]
      );

      console.log('\n   Detail hewan:');
      detailResult.rows.forEach((row, idx) => {
        console.log(`   ${idx + 1}. ${row.jenis_kelamin} | ${row.ras} | ${row.bobot}kg | source=${row.source}`);
      });
    } else {
      console.log('\n❌ TIDAK ADA HEWAN DI DATABASE!');
      console.log('   INSERT GAGAL!');
    }
  } finally {
    await pool.end();
  }
}

async function main() {
  // Test dengan role='kelompok'
  const result = await testCreateWithRole('kelompok');
  
  // Tunggu sebentar untuk database commit
  await new Promise(r => setTimeout(r, 1000));
  
  // Verify
  await verifyDatabase(result.id);

  console.log(`\n${'='.repeat(70)}\n`);
}

main();
