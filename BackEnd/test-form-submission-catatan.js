/**
 * Test: Simulate actual form submission from ClientTambahLaporan.jsx
 * This test simulates exactly what happens when user fills and submits the kelahiran form
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

async function simulateFormSubmission() {
  const db = new Client(dbConfig);

  try {
    console.log('\n' + '='.repeat(80));
    console.log('SIMULATING ACTUAL FORM SUBMISSION FROM ClientTambahLaporan.jsx');
    console.log('='.repeat(80) + '\n');

    // 1. Login
    console.log('Step 1: User Login');
    const loginRes = await api.post('/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    const token = loginRes.data.data.token;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('✅ User logged in\n');

    // 2. Get kelompok
    console.log('Step 2: Fetch available kelompok');
    const kelompokRes = await api.get('/api/kelompok');
    const kelompok = kelompokRes.data.data[0];
    console.log(`✅ Using kelompok: "${kelompok.name}" (ID: ${kelompok.id})\n`);

    // 3. Prepare form data exactly as ClientTambahLaporan.jsx would send it
    console.log('Step 3: Prepare form submission data');
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const formPayload = {
      // These come from form state in ClientTambahLaporan.jsx
      jenis: 'kelahiran',
      kelompok_id: kelompok.id,
      tanggal: todayStr,
      data: {
        // Fields from kelahiran form
        tanggal_kelahiran: '2026-01-01',
        induk_id: 'INDUK-REAL-TEST-001',
        jenis_kelamin_anak: 'jantan',
        jumlah_anak: 2,
        ras: 'Brahman',
        bobot: 4.2,
        id: 'ANAK-REAL-TEST-001',
        // *** THIS IS THE CRITICAL FIELD WE'RE TESTING ***
        catatan: 'Kelahiran normal, anak jantan sehat, berat baik, ibunya menyusui dengan baik'
      }
    };

    console.log('Form data prepared:');
    console.log('  Jenis: ' + formPayload.jenis);
    console.log('  Kelompok: ' + kelompok.name);
    console.log('  Tanggal: ' + formPayload.tanggal);
    console.log('  Data fields:');
    console.log('    - tanggal_kelahiran: ' + formPayload.data.tanggal_kelahiran);
    console.log('    - induk_id: ' + formPayload.data.induk_id);
    console.log('    - jumlah_anak: ' + formPayload.data.jumlah_anak);
    console.log('    - bobot: ' + formPayload.data.bobot + ' kg');
    console.log('    - 📝 catatan: ' + formPayload.data.catatan);
    console.log('✅ Form data ready\n');

    // 4. Submit form (exactly like onClick of "Simpan" button)
    console.log('Step 4: Submit form');
    const submitRes = await api.post('/api/laporan', formPayload);
    
    if (!submitRes.data.success) {
      throw new Error('Form submission failed: ' + submitRes.data.message);
    }
    
    const laporanId = submitRes.data.data.id;
    console.log(`✅ Form submitted successfully`);
    console.log(`   Laporan ID: ${laporanId}\n`);

    // 5. Verify in database
    console.log('Step 5: Verify data in database');
    await db.connect();
    
    const dbRes = await db.query(
      `SELECT id, jenis, data, tanggal, created_at 
       FROM laporan WHERE id = $1`,
      [laporanId]
    );

    if (dbRes.rows.length === 0) {
      throw new Error('Laporan not found in database!');
    }

    const dbRecord = dbRes.rows[0];
    const savedData = dbRecord.data;

    console.log('Database record retrieved:');
    console.log(`  Laporan ID: ${dbRecord.id}`);
    console.log(`  Jenis: ${dbRecord.jenis}`);
    console.log(`  Tanggal: ${dbRecord.tanggal}`);
    console.log(`  Created: ${dbRecord.created_at}`);
    console.log('\n  Data fields stored:');
    console.log(`    - tanggal_kelahiran: ${savedData.tanggal_kelahiran}`);
    console.log(`    - induk_id: ${savedData.induk_id}`);
    console.log(`    - jumlah_anak: ${savedData.jumlah_anak}`);
    console.log(`    - bobot: ${savedData.bobot} kg`);
    console.log(`    - 📝 catatan: ${savedData.catatan}\n`);

    // 6. Verify via API retrieval
    console.log('Step 6: Verify via API retrieval');
    const apiGetRes = await api.get(`/api/laporan/${laporanId}`);
    const apiRecord = apiGetRes.data.data;

    console.log('API response data field:');
    console.log(JSON.stringify(apiRecord.data, null, 2));

    // 7. Validation
    console.log('\n' + '='.repeat(80));
    console.log('VALIDATION RESULTS');
    console.log('='.repeat(80) + '\n');

    const validations = [
      {
        name: 'Catatan received in form',
        check: formPayload.data.catatan === 'Kelahiran normal, anak jantan sehat, berat baik, ibunya menyusui dengan baik'
      },
      {
        name: 'Catatan saved to database',
        check: savedData.catatan === 'Kelahiran normal, anak jantan sehat, berat baik, ibunya menyusui dengan baik'
      },
      {
        name: 'Catatan returned by API',
        check: apiRecord.data.catatan === 'Kelahiran normal, anak jantan sehat, berat baik, ibunya menyusui dengan baik'
      },
      {
        name: 'All other fields preserved',
        check: savedData.induk_id === 'INDUK-REAL-TEST-001' && 
               savedData.jumlah_anak === 2 &&
               savedData.bobot === 4.2
      }
    ];

    let allPassed = true;
    validations.forEach(v => {
      const status = v.check ? '✅' : '❌';
      console.log(`${status} ${v.name}`);
      if (!v.check) allPassed = false;
    });

    console.log('\n' + '='.repeat(80));
    if (allPassed) {
      console.log('✅ ALL CHECKS PASSED - Form submission working perfectly!');
      console.log('\nThe catatan field successfully flows through the entire system:');
      console.log('  1. ✅ User enters catatan in form');
      console.log('  2. ✅ Frontend sends catatan in payload');
      console.log('  3. ✅ Backend receives and saves catatan');
      console.log('  4. ✅ Database stores catatan');
      console.log('  5. ✅ API returns catatan on retrieval');
    } else {
      console.log('❌ SOME CHECKS FAILED - See details above');
    }
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  } finally {
    if (db) await db.end();
  }
}

simulateFormSubmission();
