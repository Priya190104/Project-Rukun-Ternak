const { renderCertificate } = require('./certificates/renderCertificate');
const db = require('./src/db');
const fs = require('fs');
const path = require('path');

async function testEndpointIntegration() {
  console.log('🧪 Testing certificate endpoint integration...\n');

  try {
    // 1. Create test laporan if not exists
    console.log('1️⃣  Checking/Creating test Kelahiran laporan...');
    
    // Get first kelompok
    const kelompokRes = await db.query('SELECT id, name FROM kelompok LIMIT 1');
    if (!kelompokRes.rows.length) {
      console.error('❌ No kelompok found in database');
      process.exit(1);
    }

    const kelompok = kelompokRes.rows[0];
    console.log(`   ✅ Using kelompok: ${kelompok.name} (ID: ${kelompok.id})`);

    // Get first user from this kelompok
    const userRes = await db.query(
      'SELECT id, full_name FROM users WHERE kelompok_id = $1 LIMIT 1',
      [kelompok.id]
    );
    const userId = userRes.rows.length ? userRes.rows[0].id : 1;

    // Create test laporan
    const testData = {
      nama_hewan: 'Anak Domba Baru',
      id: 'TRK-001-KLH',
      jenis_kelamin: 'Jantan',
      warna: 'Putih',
      ras: 'Domba Lokal',
      induk: 'Muli (REG-2024-005)',
      pejantan: 'Arifin (REG-2024-012)',
      bobot: '2.5'
    };

    const laporanRes = await db.query(
      `INSERT INTO laporan (jenis, kelompok_id, user_id, data, tanggal)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, jenis, data, tanggal`,
      ['Kelahiran', kelompok.id, userId, JSON.stringify(testData), new Date().toISOString().split('T')[0]]
    );

    const laporan = laporanRes.rows[0];
    console.log(`   ✅ Test laporan created: ID ${laporan.id}\n`);

    // 2. Test renderCertificate function
    console.log('2️⃣  Testing renderCertificate function...');
    
    const certificateData = {
      namaKelompok: kelompok.name,
      peternak: testData.nama_hewan,
      tanggalLahir: testData.tanggal || new Date().toLocaleDateString('id-ID'),
      noRegistrasi: '-',  // Register field no longer used
      idTernak: testData.id,
      jenisKelamin: testData.jenis_kelamin,
      warna: testData.warna,
      ras: testData.ras,
      induk: testData.induk,
      pejantan: testData.pejantan,
      bobot: testData.bobot + ' kg',
      tanggal: new Date(laporan.tanggal).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    };

    console.log('   Data to render:', certificateData);
    const pdf = await renderCertificate(certificateData);
    
    console.log(`   ✅ PDF rendered successfully`);
    console.log(`   📊 PDF size: ${(pdf.length / 1024).toFixed(2)} KB\n`);

    // 3. Save test PDF
    console.log('3️⃣  Saving test PDF...');
    const testOutputPath = path.join(__dirname, 'test-endpoint-sertifikat.pdf');
    fs.writeFileSync(testOutputPath, pdf);
    console.log(`   ✅ Saved to: ${testOutputPath}\n`);

    // 4. Cleanup
    console.log('4️⃣  Cleaning up test data...');
    await db.query('DELETE FROM laporan WHERE id = $1', [laporan.id]);
    console.log(`   ✅ Test laporan deleted\n`);

    console.log('✅ Integration test PASSED!');
    console.log(`\n📌 Next step: Test endpoint via REST API`);
    console.log(`   GET http://localhost:4000/api/laporan/{id}/sertifikat`);
    
  } catch (error) {
    console.error('❌ Integration test FAILED:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testEndpointIntegration();
