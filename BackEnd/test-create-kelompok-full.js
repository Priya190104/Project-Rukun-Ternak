/**
 * TEST: Create Kelompok dengan REAL ternakDetails payload
 * GOAL: Verifikasi hewan_ternak records benar-benar di-INSERT
 * 
 * RUN: node test-create-kelompok-full.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Mock user dengan role kelompok
const testUser = {
  id: 999,
  name: 'Kelompok Test',
  email: 'kelompok.test@example.com',
  role: 'kelompok',
  kelompok_id: 999
};

const testPayload = {
  name: 'Kelompok Test Create Hewan - ' + Date.now(),
  email: 'kelompok.test' + Date.now() + '@example.com',
  kecamatan: 'CIPARI',
  desa: 'MULYASARI',
  latitude: -7.753644,
  longitude: 109.258652,
  pic1_nik: '3304091234567890',
  pic1_nama: 'Test User',
  pic1_alamat: 'Jl. Test No. 123',
  pic1_noHp: '081234567890',
  pic1_email: 'pic1@test.com',
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

async function test() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('🧪 TEST: Create Kelompok dengan 3 Hewan Ternak');
    console.log('='.repeat(80) + '\n');

    // 1. Log payload yang akan dikirim
    console.log('📦 PAYLOAD YANG DIKIRIM KE BACKEND:');
    console.log(JSON.stringify(testPayload, null, 2));
    console.log('\n');

    // 2. Kirim request POST ke /api/kelompok
    console.log('📤 Mengirim POST /api/kelompok...\n');
    const response = await axios.post(
      `${BASE_URL}/api/kelompok`,
      testPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer test-token-${testUser.id}`,
          'X-User-Id': testUser.id,
          'X-User-Role': testUser.role,
          'X-Kelompok-Id': testUser.kelompok_id
        },
        withCredentials: true
      }
    );

    if (response.data?.success && response.data?.data?.kelompok?.id) {
      const kelompokId = response.data.data.kelompok.id;
      const hewanStats = response.data.data.hewanTernak;

      console.log('✅ KELOMPOK BERHASIL DIBUAT!');
      console.log(`   ID Kelompok: ${kelompokId}`);
      console.log(`   Nama: ${response.data.data.kelompok.name}`);
      console.log(`\n📊 HEWAN TERNAK STATS (dari response):
   Total: ${hewanStats.total}
   Jantan: ${hewanStats.jantan}
   Betina: ${hewanStats.betina}\n`);

      if (hewanStats.total === 0) {
        console.log('❌ MASALAH: Response mengatakan total hewan = 0!');
        console.log('   INI BERARTI INSERT TIDAK TERJADI!\n');
      } else {
        console.log('✅ Response menunjukkan hewan berhasil di-insert!\n');
      }

      // 3. Verifikasi di database dengan query langsung
      console.log('🔍 Verifikasi ke database...\n');
      const verifyResponse = await axios.get(
        `${BASE_URL}/hewan?kelompok=${kelompokId}`,
        {
          headers: {
            'Authorization': `Bearer test-token-${testUser.id}`,
            'X-User-Id': testUser.id,
            'X-User-Role': testUser.role,
            'X-Kelompok-Id': testUser.kelompok_id
          },
          withCredentials: true
        }
      );

      const hewanList = verifyResponse.data?.data || [];
      console.log(`📋 HEWAN TERNAK DI DATABASE untuk Kelompok ${kelompokId}:`);
      console.log(`   Total records: ${hewanList.length}\n`);

      if (hewanList.length === 0) {
        console.log('❌ DATABASE KOSONG! Tidak ada records di hewan_ternak untuk kelompok ini!');
        console.log('   KESIMPULAN: INSERT gagal/tidak terjadi!\n');
      } else {
        console.log('   Detail:');
        hewanList.forEach((h, i) => {
          console.log(`   ${i + 1}. ${h.jenis_kelamin} | ${h.ras} | ${h.bobot}kg | Umur: ${h.tanggal_lahir || 'N/A'}`);
        });
        console.log('\n✅ DATA BERHASIL DI-INSERT KE DATABASE!\n');
      }

      console.log('='.repeat(80));
      console.log(`RESULT: Kelompok ${kelompokId} untuk testing`);
      console.log('='.repeat(80) + '\n');

    } else {
      console.log('❌ Response tidak valid:');
      console.log(JSON.stringify(response.data, null, 2));
    }

  } catch (err) {
    console.error('❌ ERROR:');
    console.error('   Message:', err.message);
    console.error('   Code:', err.code);
    if (err.response?.data) {
      console.error('   Response:', JSON.stringify(err.response.data, null, 2));
    }
    if (err.response?.status) {
      console.error('   Status:', err.response.status);
    }
    console.error('   Full Error:', err);
  }
}

test();
