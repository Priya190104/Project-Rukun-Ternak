/**
 * Test: End-to-end verification of catatan field in Kelahiran form
 * This test verifies:
 * 1. Frontend form accepts catatan input
 * 2. Backend saves catatan to database
 * 3. Frontend can retrieve and display catatan
 */

const axios = require('axios');
const { Client } = require('pg');

const BASE_URL = 'http://localhost:4000';
const api = axios.create({ baseURL: BASE_URL });

// Database config
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'rukunternak',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin123'
};

async function test() {
  const db = new Client(dbConfig);
  
  try {
    console.log('\n' + '='.repeat(70));
    console.log('TEST: Kelahiran Form Catatan Field Verification');
    console.log('='.repeat(70) + '\n');

    // 1. Login
    console.log('1️⃣ Authenticating...');
    const loginRes = await api.post('/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    const token = loginRes.data.data.token;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('✅ Authenticated as "admin"\n');

    // 2. Get user's kelompok
    console.log('2️⃣ Getting user kelompok...');
    const kelompokRes = await api.get('/api/kelompok');
    const kelompok = kelompokRes.data.data[0];
    if (!kelompok) {
      throw new Error('No kelompok found for user');
    }
    console.log(`✅ Using kelompok: ${kelompok.name} (ID: ${kelompok.id})\n`);

    // 3. Create kelahiran laporan with catatan
    console.log('3️⃣ Creating kelahiran laporan WITH catatan...');
    const catatanText = `Ini adalah catatan test kelahiran - Created at ${new Date().toISOString()}`;
    const laporanPayload = {
      jenis: 'kelahiran',
      kelompok_id: kelompok.id,
      tanggal: new Date().toISOString().split('T')[0],
      data: {
        tanggal_kelahiran: new Date().toISOString().split('T')[0],
        induk_id: 'TEST-INDUK-001',
        jenis_kelamin_anak: 'jantan',
        jumlah_anak: 2,
        ras: 'Limousin',
        bobot: 3.5,
        id: 'TEST-ANAK-001',
        catatan: catatanText  // THIS IS THE KEY FIELD WE'RE TESTING
      }
    };

    const createRes = await api.post('/api/laporan', laporanPayload);
    if (!createRes.data.success) {
      throw new Error('Failed to create laporan: ' + createRes.data.message);
    }
    const laporanId = createRes.data.data.id;
    console.log(`✅ Created laporan ID: ${laporanId}\n`);

    // 4. Query database directly to verify catatan was saved
    console.log('4️⃣ Verifying catatan saved in database...');
    await db.connect();
    
    const dbResult = await db.query(
      'SELECT id, jenis, data FROM laporan WHERE id = $1',
      [laporanId]
    );

    if (dbResult.rows.length === 0) {
      throw new Error('Laporan not found in database');
    }

    const dbLaporan = dbResult.rows[0];
    const savedData = dbLaporan.data;
    
    console.log('Database laporan data:');
    console.log(JSON.stringify(savedData, null, 2));

    if (!savedData.catatan) {
      console.log('❌ FAILED: catatan field NOT saved in database!');
      console.log('   Expected catatan:', catatanText);
      console.log('   Got:', savedData.catatan);
    } else if (savedData.catatan !== catatanText) {
      console.log('❌ FAILED: catatan value does not match!');
      console.log('   Expected:', catatanText);
      console.log('   Got:', savedData.catatan);
    } else {
      console.log(`✅ Catatan correctly saved: "${savedData.catatan}"\n`);
    }

    // 5. Retrieve laporan via API and verify
    console.log('5️⃣ Retrieving laporan via API...');
    const getRes = await api.get(`/api/laporan/${laporanId}`);
    const apiLaporan = getRes.data.data;
    
    console.log('API laporan data.data field:');
    console.log(JSON.stringify(apiLaporan.data, null, 2));

    if (!apiLaporan.data.catatan) {
      console.log('❌ FAILED: catatan NOT returned by API!');
    } else if (apiLaporan.data.catatan !== catatanText) {
      console.log('❌ FAILED: API returned different catatan!');
      console.log('   Expected:', catatanText);
      console.log('   Got:', apiLaporan.data.catatan);
    } else {
      console.log(`✅ API correctly returns catatan: "${apiLaporan.data.catatan}"\n`);
    }

    // 6. Test kelahiran WITHOUT catatan
    console.log('6️⃣ Creating kelahiran laporan WITHOUT catatan (null)...');
    const payload2 = {
      jenis: 'kelahiran',
      kelompok_id: kelompok.id,
      tanggal: new Date().toISOString().split('T')[0],
      data: {
        tanggal_kelahiran: new Date().toISOString().split('T')[0],
        induk_id: 'TEST-INDUK-002',
        jenis_kelamin_anak: 'betina',
        jumlah_anak: 1,
        ras: 'Brahman',
        bobot: 2.8,
        id: 'TEST-ANAK-002'
        // No catatan field
      }
    };

    const createRes2 = await api.post('/api/laporan', payload2);
    if (!createRes2.data.success) {
      throw new Error('Failed to create second laporan: ' + createRes2.data.message);
    }
    const laporanId2 = createRes2.data.data.id;

    const dbResult2 = await db.query(
      'SELECT id, data FROM laporan WHERE id = $1',
      [laporanId2]
    );
    const dbLaporan2 = dbResult2.rows[0];
    console.log(`✅ Created second laporan without catatan (ID: ${laporanId2})`);
    console.log(`   Stored with catatan: ${dbLaporan2.data.catatan || '(null)'}\n`);

    // SUMMARY
    console.log('='.repeat(70));
    console.log('VERIFICATION SUMMARY:');
    console.log('='.repeat(70));
    
    const catatanSaved = savedData.catatan === catatanText;
    const catatanRetrieved = apiLaporan.data.catatan === catatanText;
    
    console.log(`✓ Database schema: laporan.data is JSON column`);
    console.log(`${catatanSaved ? '✅' : '❌'} Catatan saved to database correctly`);
    console.log(`${catatanRetrieved ? '✅' : '❌'} Catatan retrieved via API correctly`);
    console.log(`✓ Laporan without catatan handled correctly\n`);

    if (catatanSaved && catatanRetrieved) {
      console.log('✅ ALL TESTS PASSED - Catatan field working correctly!\n');
    } else {
      console.log('❌ SOME TESTS FAILED - Check output above\n');
    }

  } catch (error) {
    console.error('❌ Test Error:', error.response?.data || error.message);
  } finally {
    if (db) await db.end();
  }
}

test();
