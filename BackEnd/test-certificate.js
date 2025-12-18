const { renderCertificate } = require('./certificates/renderCertificate');
const fs = require('fs');
const path = require('path');

async function testCertificateGeneration() {
  const testData = {
    namaKelompok: 'Kelompok Makmur Jaya',
    peternak: 'Budi Santoso',
    tanggalLahir: '15 Desember 2025',
    noRegistrasi: 'REG-2025-001',
    idTernak: 'TRK-001-KLH',
    jenisKelamin: 'Jantan',
    warna: 'Putih',
    ras: 'Domba Lokal',
    induk: 'Muli (REG-2024-005)',
    pejantan: 'Arifin (REG-2024-012)',
    bobot: '2.5 kg',
    tanggal: '15 Desember 2025',
  };

  console.log('🔄 Generating certificate PDF...');
  console.log('Data:', testData);

  try {
    const pdf = await renderCertificate(testData);
    
    const outputPath = path.join(__dirname, 'test-sertifikat.pdf');
    fs.writeFileSync(outputPath, pdf);
    
    console.log('✅ PDF generated successfully!');
    console.log(`📄 File saved to: ${outputPath}`);
    console.log(`📊 File size: ${(pdf.length / 1024).toFixed(2)} KB`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating certificate:', error);
    process.exit(1);
  }
}

testCertificateGeneration();
