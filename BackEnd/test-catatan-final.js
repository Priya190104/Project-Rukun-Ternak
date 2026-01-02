#!/usr/bin/env node

require('dotenv').config();

const BASE_URL = 'http://localhost:4000';

async function request(method, path, data = null, token = null) {
  const url = `${BASE_URL}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    body: data ? JSON.stringify(data) : undefined
  });

  const json = await response.json();
  return { status: response.status, data: json };
}

async function test() {
  console.log('\n=== Testing Catatan Field Integration ===\n');

  try {
    // 1. Login
    console.log('1. Logging in as admin...');
    const loginRes = await request('POST', '/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });

    if (!loginRes.data.token) {
      console.log('   ✗ Login failed');
      process.exit(1);
    }

    const token = loginRes.data.token;
    console.log('   ✓ Login successful\n');

    // 2. Create kelompok
    console.log('2. Creating kelompok with hewan catatan...');
    const createRes = await request('POST', '/api/kelompok', {
      name: `Test Catatan ${Date.now()}`,
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
      jumlahTernak: 2,
      ternakDetails: [
        {
          idTernak: `TEST-001-${Date.now()}`,
          jenisKelamin: 'JANTAN',
          ras: 'Limousin',
          bobot: 150,
          umur: 18,
          catatan: 'Hewan sehat dan kuat'
        },
        {
          idTernak: `TEST-002-${Date.now()}`,
          jenisKelamin: 'BETINA',
          ras: 'Brahman',
          bobot: 120,
          umur: 16,
          catatan: 'Siap untuk kawin'
        }
      ],
      pakanList: [],
      kesehatanList: []
    }, token);

    if (!createRes.data.success) {
      console.log('   ✗ Create kelompok failed:', createRes.data);
      process.exit(1);
    }

    console.log('   ✓ Kelompok created\n');

    // 3. Get hewan list
    console.log('3. Getting hewan list...');
    const hewanRes = await request('GET', '/api/hewan?page=1&limit=50', null, token);

    if (!hewanRes.data.data || hewanRes.data.data.length === 0) {
      console.log('   ✗ No hewan found');
      process.exit(1);
    }

    const hewan = hewanRes.data.data[0];
    console.log(`   ✓ Found hewan ID: ${hewan.id}`);
    console.log(`     ID Hewan: ${hewan.id_hewan}`);
    console.log(`     Catatan in list: ${hewan.catatan || '(empty)'}\n`);

    // 4. Get hewan detail
    console.log('4. Getting hewan detail...');
    const detailRes = await request('GET', `/api/hewan/${hewan.id}`, null, token);

    if (!detailRes.data.data) {
      console.log('   ✗ Detail not found');
      process.exit(1);
    }

    const detail = detailRes.data.data;
    console.log('   ✓ Detail retrieved:');
    console.log(`     ID: ${detail.id}`);
    console.log(`     ID Hewan: ${detail.id_hewan}`);
    console.log(`     Ras: ${detail.ras}`);
    console.log(`     Catatan: "${detail.catatan || '(empty)'}"\n`);

    // 5. Check results
    if (detail.catatan) {
      console.log('✓✓✓ TEST PASSED: Catatan field is working end-to-end! ✓✓✓\n');
      process.exit(0);
    } else {
      console.log('✗ TEST FAILED: Catatan not found in detail\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

test();
