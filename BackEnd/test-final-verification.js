/**
 * FINAL VERIFICATION: Simulate complete frontend flow
 * Creates a kelompok with full form data as sent from AddKelompokModalWithMap
 */

const http = require('http');
const { Pool } = require('pg');

const payload = {
  name: 'Kelompok Final Verification - ' + Date.now(),
  email: 'kelompok.final@test.com',
  kecamatan: 'KEMRANJEN',
  desa: 'TEMBUKU',
  latitude: -7.766,
  longitude: 109.284,
  pic1_nik: '3304095678901234',
  pic1_nama: 'Suwardi',
  pic1_alamat: 'Jl. Kemranjen No. 10',
  pic1_noHp: '082312345678',
  pic1_email: 'suwardi@kelompok.com',
  jumlahKandang: 3,
  jumlahTernak: 5,
  ternakDetails: [
    { jenisKelamin: 'Jantan', ras: 'Peranakan Etawa', bobot: '50', umur: '28' },
    { jenisKelamin: 'Jantan', ras: 'Boer', bobot: '55', umur: '30' },
    { jenisKelamin: 'Betina', ras: 'Peranakan Etawa', bobot: '40', umur: '22' },
    { jenisKelamin: 'Betina', ras: 'Peranakan Etawa', bobot: '38', umur: '20' },
    { jenisKelamin: 'Betina', ras: 'Boer', bobot: '42', umur: '24' }
  ],
  pakanList: [
    { jenisPeralatan: 'Rumput Segar', jumlahPeralatan: '100 kg/hari' },
    { jenisPeralatan: 'Pelet', jumlahPeralatan: '10 kg/hari' }
  ],
  kesehatanList: [
    { jenisKesehatan: 'Vaksin PMK', jumlah: '5' },
    { jenisKesehatan: 'Vitamin Rutin', jumlah: 'Mingguan' }
  ]
};

async function testFullFlow() {
  console.log('\n' + '='.repeat(80));
  console.log('FINAL VERIFICATION: Complete Kelompok Creation Flow');
  console.log('='.repeat(80) + '\n');

  console.log('📋 STEP 1: Create Kelompok via API');
  console.log('─'.repeat(80));
  console.log(`Payload: ${payload.name}`);
  console.log(`Hewan: ${payload.ternakDetails.length} (${payload.ternakDetails.filter(t => t.jenisKelamin === 'Jantan').length} jantan, ${payload.ternakDetails.filter(t => t.jenisKelamin === 'Betina').length} betina)`);
  console.log(`Pakan Items: ${payload.pakanList.length}`);
  console.log(`Kesehatan Items: ${payload.kesehatanList.length}\n`);

  let kelompokId = null;
  let apiResponse = null;

  try {
    await new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: 4000,
        path: '/api/kelompok',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Test-User': Buffer.from(JSON.stringify({
            id: 1,
            username: 'admin_test',
            full_name: 'Admin Test',
            role: 'admin',
            kelompok_id: 0,
            kelompok: null
          })).toString('base64')
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            apiResponse = JSON.parse(data);
            if (apiResponse.success && apiResponse.data?.kelompok?.id) {
              kelompokId = apiResponse.data.kelompok.id;
              console.log(`✅ API Response: Status ${res.statusCode} (Success)\n`);
            } else {
              console.log(`❌ API Response: Status ${res.statusCode} (Error)\n`);
              console.log('Response:', apiResponse.message);
            }
          } catch (e) {
            console.log('❌ Error parsing response:', e.message);
          }
          resolve();
        });
      });

      req.on('error', (err) => {
        console.error('❌ Request error:', err.message);
        resolve();
      });

      req.write(JSON.stringify(payload));
      req.end();
    });

    if (!kelompokId) {
      console.log('❌ Failed to create kelompok');
      return;
    }

    // Wait for database commit
    await new Promise(r => setTimeout(r, 500));

    console.log('📋 STEP 2: Verify in Database');
    console.log('─'.repeat(80) + '\n');

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
        'SELECT id, name, jumlah_kandang, jumlah_ternak FROM kelompok WHERE id = $1',
        [kelompokId]
      );

      const k = kelResult.rows[0];
      console.log(`✅ Kelompok ditemukan:`);
      console.log(`   ID: ${k.id}`);
      console.log(`   Nama: ${k.name}`);
      console.log(`   Jumlah Kandang: ${k.jumlah_kandang}`);
      console.log(`   Jumlah Ternak (metadata): ${k.jumlah_ternak}\n`);

      // Get hewan breakdown
      const hewanResult = await pool.query(
        `SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN jenis_kelamin = 'JANTAN' THEN 1 END) as jantan,
          COUNT(CASE WHEN jenis_kelamin = 'BETINA' THEN 1 END) as betina,
          COUNT(CASE WHEN source = 'Penyaluran' THEN 1 END) as penyaluran
         FROM hewan_ternak 
         WHERE kelompok_id = $1`,
        [kelompokId]
      );

      const h = hewanResult.rows[0];
      console.log(`✅ Hewan Ternak:`);
      console.log(`   Total: ${h.total}`);
      console.log(`   Jantan: ${h.jantan}`);
      console.log(`   Betina: ${h.betina}`);
      console.log(`   Source Penyaluran: ${h.penyaluran}\n`);

      // List detail hewan
      const detailResult = await pool.query(
        `SELECT jenis_kelamin, ras, bobot, source 
         FROM hewan_ternak 
         WHERE kelompok_id = $1 
         ORDER BY id`,
        [kelompokId]
      );

      console.log(`📊 Detail Hewan Ternak:`);
      detailResult.rows.forEach((row, idx) => {
        console.log(`   ${idx + 1}. ${row.jenis_kelamin.padEnd(7)} | ${row.ras.padEnd(18)} | ${row.bobot}kg | ${row.source}`);
      });

      // Verify counts match
      console.log('\n📋 STEP 3: Verification Summary');
      console.log('─'.repeat(80) + '\n');

      const expectedJantan = payload.ternakDetails.filter(t => t.jenisKelamin === 'Jantan').length;
      const expectedBetina = payload.ternakDetails.filter(t => t.jenisKelamin === 'Betina').length;
      const expectedTotal = payload.ternakDetails.length;

      const jantanMatch = h.jantan == expectedJantan;
      const betinaMatch = h.betina == expectedBetina;
      const totalMatch = h.total == expectedTotal;
      const metadataMatch = k.jumlah_ternak == expectedTotal;
      const penyaluranMatch = h.penyaluran == expectedTotal;

      console.log(`Metadata jumlah_ternak (${k.jumlah_ternak}) === Expected (${expectedTotal}): ${metadataMatch ? '✅' : '❌'}`);
      console.log(`Total hewan (${h.total}) === Expected (${expectedTotal}): ${totalMatch ? '✅' : '❌'}`);
      console.log(`Jantan (${h.jantan}) === Expected (${expectedJantan}): ${jantanMatch ? '✅' : '❌'}`);
      console.log(`Betina (${h.betina}) === Expected (${expectedBetina}): ${betinaMatch ? '✅' : '❌'}`);
      console.log(`All from Penyaluran (${h.penyaluran}) === Total (${h.total}): ${penyaluranMatch ? '✅' : '❌'}`);

      const allPassed = jantanMatch && betinaMatch && totalMatch && metadataMatch && penyaluranMatch;

      console.log('\n' + '='.repeat(80));
      if (allPassed) {
        console.log('✅✅✅ ALL CHECKS PASSED! Bug is FIXED!');
        console.log(`    Kelompok ${kelompokId} successfully created with ${expectedTotal} hewan ternak!`);
      } else {
        console.log('❌ Some checks failed!');
      }
      console.log('='.repeat(80) + '\n');

    } finally {
      await pool.end();
    }

  } catch (err) {
    console.error('❌ Test error:', err.message);
  }
}

testFullFlow();
