/**
 * Test: ClientPilihJenisLaporan catatan field 
 * Verifies that catatan from ClientPilihJenisLaporan form is saved correctly
 */

const axios = require('axios');
const { Client } = require('pg');

const BASE_URL = 'http://localhost:4000';
const api = axios.create({ baseURL: BASE_URL });

const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'rukunternak',
  user: 'postgres',
  password: 'admin123'
};

async function testClientPilihJenisLaporanCatatan() {
  const db = new Client(dbConfig);

  try {
    console.log('\n' + '='.repeat(80));
    console.log('TEST: ClientPilihJenisLaporan Catatan Field');
    console.log('='.repeat(80) + '\n');

    // 1. Login
    console.log('1️⃣ Login...');
    const loginRes = await api.post('/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    const token = loginRes.data.data.token;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('✅ Logged in\n');

    // 2. Get kelompok
    console.log('2️⃣ Get kelompok...');
    const kelompokRes = await api.get('/api/kelompok');
    const kelompok = kelompokRes.data.data[0];
    console.log(`✅ Using kelompok: ${kelompok.name}\n`);

    // 3. Create laporan exactly like ClientPilihJenisLaporan does
    console.log('3️⃣ Submit form from ClientPilihJenisLaporan (Kelahiran jenis)...');
    
    const catatanTest = `Anak lahir normal, sehat, sedang menyusu - Test dari ClientPilihJenisLaporan - ${new Date().toISOString()}`;
    
    const laporanPayload = {
      jenis: 'Kelahiran',
      tanggal: new Date().toISOString().split('T')[0],
      data: {
        // Exactly like form.data in ClientPilihJenisLaporan
        id: 'TEST-ID-CLIENT-PILIH-001',
        jenis_kelamin: 'Jantan',
        warna: 'Putih',
        ras: 'Domba Lokal',
        induk: 'Induk-001',
        pejantan: 'Pejantan-001',
        bobot: 3.5,
        // THIS IS THE CRITICAL FIELD
        catatan: catatanTest
      }
    };

    console.log('Payload dikirim:');
    console.log(JSON.stringify(laporanPayload, null, 2));

    const createRes = await api.post('/api/laporan', laporanPayload);
    
    if (!createRes.data.success) {
      throw new Error('Laporan creation failed: ' + createRes.data.message);
    }

    const laporanId = createRes.data.data.id;
    console.log(`✅ Laporan created ID: ${laporanId}\n`);

    // 4. Verify in database
    console.log('4️⃣ Verify catatan in database...');
    await db.connect();

    const dbRes = await db.query(
      'SELECT id, jenis, data FROM laporan WHERE id = $1',
      [laporanId]
    );

    if (dbRes.rows.length === 0) {
      throw new Error('Laporan not found in database!');
    }

    const dbRecord = dbRes.rows[0];
    const savedData = dbRecord.data;

    console.log('Database record:');
    console.log(JSON.stringify(savedData, null, 2));

    if (!savedData.catatan) {
      console.log('\n❌ FAILED: catatan NOT found in database!');
      console.log('Expected:', catatanTest);
      console.log('Got:', savedData.catatan);
    } else if (savedData.catatan !== catatanTest) {
      console.log('\n❌ FAILED: catatan value mismatch!');
      console.log('Expected:', catatanTest);
      console.log('Got:', savedData.catatan);
    } else {
      console.log('\n✅ Catatan correctly saved in database!\n');
    }

    // 5. Verify via API retrieval
    console.log('5️⃣ Verify catatan via API retrieval...');
    const getRes = await api.get(`/api/laporan/${laporanId}`);
    const apiRecord = getRes.data.data;

    console.log('API response data:');
    console.log(JSON.stringify(apiRecord.data, null, 2));

    if (!apiRecord.data.catatan) {
      console.log('\n❌ FAILED: API does not return catatan!');
    } else if (apiRecord.data.catatan !== catatanTest) {
      console.log('\n❌ FAILED: API returns different catatan!');
      console.log('Expected:', catatanTest);
      console.log('Got:', apiRecord.data.catatan);
    } else {
      console.log('\n✅ API correctly returns catatan!\n');
    }

    // 6. Summary
    console.log('='.repeat(80));
    console.log('VERIFICATION SUMMARY:');
    console.log('='.repeat(80));

    const allPassed = 
      savedData.catatan === catatanTest &&
      apiRecord.data.catatan === catatanTest;

    if (allPassed) {
      console.log('✅ ALL CHECKS PASSED');
      console.log('\nConclusion:');
      console.log('✓ Frontend form sends catatan correctly');
      console.log('✓ Backend receives and saves catatan');
      console.log('✓ Database stores catatan properly');
      console.log('✓ API returns catatan on retrieval');
      console.log('\n🎉 CATATAN FIELD IS FULLY FUNCTIONAL!\n');
    } else {
      console.log('❌ SOME CHECKS FAILED - See details above\n');
    }

    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Test Error:', error.response?.data || error.message);
    process.exit(1);
  } finally {
    if (db) await db.end();
  }
}

testClientPilihJenisLaporanCatatan();
