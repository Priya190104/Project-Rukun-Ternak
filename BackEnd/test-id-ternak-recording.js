#!/usr/bin/env node

require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:4000';
const api = axios.create({ baseURL: BASE_URL });

async function test() {
  console.log('\n=== Testing ID Ternak Recording ===\n');

  try {
    // 1. Login
    console.log('1. Logging in as admin...');
    const loginRes = await api.post('/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });

    if (!loginRes.data.data?.token) {
      console.log('   ✗ Login failed');
      process.exit(1);
    }

    const token = loginRes.data.data.token;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('   ✓ Login successful\n');

    // 2. Create kelompok with ID ternak
    console.log('2. Creating kelompok with ID Ternak...');
    const createRes = await api.post('/api/kelompok', {
      name: `Test ID Ternak ${Date.now()}`,
      email: `test${Date.now()}@test.com`,
      kecamatan: 'Cilacap Selatan',
      desa: 'Sidakaya',
      latitude: -7.7,
      longitude: 108.8,
      pic1_nik: '1234567890123456',
      pic1_nama: 'Test User',
      pic1_alamat: 'Test Address',
      pic1_noHp: '081234567890',
      pic1_email: `admin${Date.now()}@test.com`,
      jumlahKandang: 1,
      jumlahTernak: 3,
      ternakDetails: [
        {
          idTernak: 'T-2024-001',  // ← User input ID
          jenisKelamin: 'JANTAN',
          ras: 'Limousin',
          bobot: 150,
          umur: 18,
          catatan: 'Hewan pertama dengan ID T-2024-001'
        },
        {
          idTernak: 'T-2024-002',  // ← User input ID
          jenisKelamin: 'BETINA',
          ras: 'Brahman',
          bobot: 120,
          umur: 16,
          catatan: 'Hewan kedua dengan ID T-2024-002'
        },
        {
          idTernak: '',  // ← Kosong, harus diterima sebagai null
          jenisKelamin: 'JANTAN',
          ras: 'Simmental',
          bobot: 140,
          umur: 15,
          catatan: 'Hewan ketiga tanpa ID'
        }
      ],
      pakanList: [],
      kesehatanList: []
    });

    if (!createRes.data.success) {
      console.log('   ✗ Create kelompok failed:', createRes.data);
      process.exit(1);
    }

    console.log('   ✓ Kelompok created\n');

    // 3. Get hewan list
    console.log('3. Getting hewan list...');
    const hewanRes = await api.get('/api/admin/hewan?page=1&limit=50');

    if (!hewanRes.data.data || hewanRes.data.data.length === 0) {
      console.log('   ✗ No hewan found');
      process.exit(1);
    }

    const hewan = hewanRes.data.data.slice(0, 3);
    console.log(`   ✓ Found ${hewan.length} hewan\n`);

    // 4. Check each hewan's ID
    console.log('4. Checking ID Ternak storage:\n');
    let passCount = 0;

    for (let i = 0; i < hewan.length; i++) {
      const h = hewan[i];
      console.log(`   Hewan ${i + 1}:`);
      console.log(`     DB ID (PK): ${h.id}`);
      console.log(`     ID Ternak (Business): ${h.id_hewan || '(null)'}`);
      console.log(`     Ras: ${h.ras}`);
      console.log(`     Catatan: ${h.catatan ? h.catatan.substring(0, 40) + '...' : '(kosong)'}`);

      // Get detail untuk verifikasi
      const detailRes = await api.get(`/api/admin/hewan/${h.id}`);
      const detail = detailRes.data.data;

      if (i === 0 && detail.id_hewan === 'T-2024-001') {
        console.log(`     ✓ ID Ternak correctly stored as "T-2024-001"`);
        passCount++;
      } else if (i === 1 && detail.id_hewan === 'T-2024-002') {
        console.log(`     ✓ ID Ternak correctly stored as "T-2024-002"`);
        passCount++;
      } else if (i === 2 && !detail.id_hewan) {
        console.log(`     ✓ Empty ID Ternak correctly stored as null`);
        passCount++;
      } else {
        console.log(`     ✗ ID Ternak mismatch!`);
      }
      console.log();
    }

    // 5. Summary
    console.log(`5. Result Summary:`);
    if (passCount === 3) {
      console.log(`\n✓✓✓ TEST PASSED: All ID Ternak correctly recorded! ✓✓✓\n`);
      process.exit(0);
    } else {
      console.log(`\n✗ TEST FAILED: ${passCount}/3 ID Ternak verified\n`);
      process.exit(1);
    }

  } catch (error) {
    console.error('✗ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

test();
