/**
 * TEST: Buat kelompok BARU dengan hewan via API
 * Menggunakan mock middleware (bypass auth untuk test)
 */

const http = require('http');

const testPayload = {
  name: 'Kelompok Test New - ' + Date.now(),
  email: 'test' + Date.now() + '@kelompok.com',
  kecamatan: 'CIPARI',
  desa: 'MULYASARI',
  latitude: -7.753644,
  longitude: 109.258652,
  pic1_nik: '3304091234567890',
  pic1_nama: 'Test User',
  pic1_alamat: 'Jl. Test',
  pic1_noHp: '081234567890',
  pic1_email: 'pic@test.com',
  jumlahKandang: 2,
  jumlahTernak: 3,
  ternakDetails: [
    { jenisKelamin: 'Jantan', ras: 'Peranakan Etawa', bobot: '45.5', umur: '24' },
    { jenisKelamin: 'Betina', ras: 'Peranakan Etawa', bobot: '38', umur: '18' },
    { jenisKelamin: 'Betina', ras: 'Boer', bobot: '40', umur: '20' }
  ],
  pakanList: [],
  kesehatanList: []
};

console.log('\n' + '='.repeat(70));
console.log('TEST: Create Kelompok dengan Hewan via API');
console.log('='.repeat(70) + '\n');

console.log('📦 Payload yang dikirim:');
console.log(`   Name: ${testPayload.name}`);
console.log(`   Hewan: ${testPayload.ternakDetails.length} ternak\n`);

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/kelompok',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // Use X-Test-User header for development testing
    'X-Test-User': Buffer.from(JSON.stringify({
      id: 1,
      username: 'admin',
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
    console.log(`\n📨 Response Status: ${res.statusCode}`);
    
    try {
      const response = JSON.parse(data);
      
      console.log('\n📋 Full Response:');
      console.log(JSON.stringify(response, null, 2));
      
      if (response.success && response.data?.hewanTernak) {
        const kelompokId = response.data.kelompok.id;
        const hewanStats = response.data.hewanTernak;
        
        console.log(`\n✅ KELOMPOK BERHASIL DIBUAT!`);
        console.log(`   ID: ${kelompokId}`);
        console.log(`   Nama: ${response.data.kelompok.name}`);
        console.log(`\n   Hewan yang di-insert:`);
        console.log(`      Total: ${hewanStats.total}`);
        console.log(`      Jantan: ${hewanStats.jantan}`);
        console.log(`      Betina: ${hewanStats.betina}`);
        
        if (parseInt(hewanStats.total) > 0) {
          console.log(`\n✅ SUCCESS! Hewan berhasil di-insert!`);
        } else {
          console.log(`\n❌ PERHATIAN: No hewan in response!`);
        }
      } else {
        console.log(`\n❌ FAILED:`);
        console.log(`   Success: ${response.success}`);
        console.log(`   Message: ${response.message}`);
      }
    } catch (e) {
      console.log('❌ Error parsing response:');
      console.log(data);
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Request error:', err.message);
});

const payload = JSON.stringify(testPayload);
console.log(`📤 Sending POST /api/kelompok (${payload.length} bytes)...`);

req.write(payload);
req.end();
