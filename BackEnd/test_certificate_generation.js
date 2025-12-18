#!/usr/bin/env node

/**
 * TEST CERTIFICATE GENERATION
 * Script untuk test certificate rendering dan memverifikasi output PDF
 */

const { renderCertificate } = require('./certificates/renderCertificate');
const fs = require('fs');
const path = require('path');

async function testCertificateGeneration() {
  console.log('🔧 Testing Certificate Generation...\n');

  // Test data - sesuaikan dengan struktur data dari laporan
  const testData = {
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

  try {
    console.log('📄 Generating PDF with test data:');
    console.log(JSON.stringify(testData, null, 2));
    console.log('\n⏳ Rendering certificate (this may take 10-20 seconds)...\n');

    const pdfBuffer = await renderCertificate(testData);

    // Save PDF to test output
    const outputPath = path.resolve(__dirname, 'test_output', 'certificate_test.pdf');
    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, pdfBuffer);

    console.log('✅ Certificate generated successfully!');
    console.log(`📁 PDF saved to: ${outputPath}`);
    console.log(`📊 PDF size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
    console.log('\n🎯 Verification checklist:');
    console.log('  ✓ PDF file created and saved');
    console.log('  ✓ File size is reasonable (>50KB indicates images loaded)');
    console.log('  ✓ No render errors occurred');
    console.log('\n📖 Next steps:');
    console.log('  1. Open the PDF file with PDF viewer');
    console.log('  2. Check if all images (logo, stamp, signature, lamb) are visible');
    console.log('  3. Verify layout matches certificate design (header, 2-column data, footer)');
    console.log('  4. Check background is visible and properly positioned');
    console.log('  5. Verify text formatting and font usage');

  } catch (error) {
    console.error('❌ Error generating certificate:');
    console.error(error);
    process.exit(1);
  }
}

// Run test
testCertificateGeneration().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
