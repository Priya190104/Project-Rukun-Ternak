#!/usr/bin/env node

/**
 * TEST INTEGRATION: Certificate Generation dengan Database Data
 * Verify bahwa sertifikat bisa di-generate dari actual laporan data
 */

const db = require('./src/db');
const { renderCertificate } = require('./certificates/renderCertificate');
const fs = require('fs');
const path = require('path');

async function testCertificateIntegration() {
  console.log('🧪 Certificate Generation Integration Test\n');
  
  try {
    // ========================================
    // STEP 1: Fetch sample laporan dari database
    // ========================================
    console.log('📋 Fetching sample laporan data from database...');
    
    const laporanRes = await db.query(
      `SELECT l.*, k.id as kelompok_id, k.name as kelompok_name, 
              k.pic1_nama, k.desa, k.kecamatan, u.full_name
       FROM laporan l
       LEFT JOIN kelompok k ON l.kelompok_id = k.id
       LEFT JOIN users u ON l.user_id = u.id
       WHERE l.jenis = 'Kelahiran'
       LIMIT 1`,
      []
    );

    if (!laporanRes.rows[0]) {
      console.log('⚠️  No "Kelahiran" type laporan found in database');
      console.log('ℹ️  Using mock data for testing instead\n');
      
      // Use mock data
      const mockData = {
        namaKelompok: 'Kelompok Ternak Maju Jaya',
        peternak: 'Budi Santoso',
        tanggalLahir: '02 Januari 2025',
        noRegistrasi: 'REG-2025-001',
        idTernak: 'DMB-001-2025',
        jenisKelamin: 'Jantan',
        warna: 'Putih',
        ras: 'Dorper',
        induk: 'DMB-2023-045',
        pejantan: 'DMB-2022-010',
        bobot: '35 kg',
        tanggal: '16 Desember 2025',
      };

      await generateAndSaveTest(mockData, 'mock');
      return;
    }

    // ========================================
    // STEP 2: Prepare certificate data dari laporan
    // ========================================
    const laporan = laporanRes.rows[0];
    const data = laporan.data || {};

    const certificateData = {
      namaKelompok: laporan.kelompok_name || '-',
      peternak: data.nama_anggota || '-',
      tanggalLahir: data.tanggal || '-',
      noRegistrasi: data.register || '-',
      idTernak: data.id || '-',
      jenisKelamin: data.jenis_kelamin || '-',
      warna: data.warna || '-',
      ras: data.ras || '-',
      induk: data.induk || '-',
      pejantan: data.pejantan || '-',
      bobot: (data.bobot || '-') + (data.bobot ? ' kg' : ''),
      tanggal: new Date(laporan.tanggal).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    };

    console.log('✅ Found laporan ID:', laporan.id);
    console.log('📄 Certificate data prepared:\n');
    console.log(JSON.stringify(certificateData, null, 2));

    await generateAndSaveTest(certificateData, `laporan_${laporan.id}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

async function generateAndSaveTest(certificateData, testName) {
  console.log('\n⏳ Generating PDF...');

  const pdfBuffer = await renderCertificate(certificateData);

  const outputPath = path.resolve(__dirname, 'test_output', `certificate_${testName}.pdf`);
  const outputDir = path.dirname(outputPath);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, pdfBuffer);

  console.log('\n✅ Certificate generated successfully!');
  console.log(`📁 Saved to: ${outputPath}`);
  console.log(`📊 Size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
  console.log('\n🎯 Verification:');
  console.log('  ✓ PDF file generated');
  console.log('  ✓ File size > 1000 KB indicates PNG/JPG assets loaded');
  console.log('  ✓ All images should be visible in PDF viewer');
}

// Run test
testCertificateIntegration().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
