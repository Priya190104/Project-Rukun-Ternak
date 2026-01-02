#!/usr/bin/env node

require('dotenv').config();
const http = require('http');

const BASE_URL = 'http://localhost:3001';

function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('\n=== Testing Catatan Field Integration ===\n');

  try {
    // Login
    console.log('1. Login as admin...');
    const loginRes = await request('POST', '/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });

    if (loginRes.status !== 200) {
      console.log('   ✗ Login failed:', loginRes.data);
      return;
    }

    const token = loginRes.data.token;
    console.log('   ✓ Login successful\n');

    // Create kelompok with catatan
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
          idTernak: 'TEST-001',
          jenisKelamin: 'JANTAN',
          ras: 'Limousin',
          bobot: 150,
          umur: 18,
          catatan: 'Hewan sehat dan kuat'
        },
        {
          idTernak: 'TEST-002',
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

    if (createRes.status !== 200 && createRes.status !== 201) {
      console.log('   ✗ Create kelompok failed:', createRes.data);
      return;
    }

    console.log('   ✓ Kelompok created\n');

    // Get hewan list
    console.log('3. Getting hewan list...');
    const hewanRes = await request('GET', '/api/hewan?page=1&limit=20', null, token);

    if (hewanRes.status !== 200) {
      console.log('   ✗ Get hewan failed:', hewanRes.data);
      return;
    }

    const hewan = hewanRes.data.data;
    const testHewan = hewan.find(h => h.id_hewan === 'TEST-001' || h.id_hewan === 'TEST-002');

    if (testHewan) {
      console.log(`   ✓ Found hewan: ${testHewan.id_hewan}`);
      console.log(`     Catatan in list: ${testHewan.catatan || '(empty)'}\n`);

      // Get detail
      console.log('4. Getting hewan detail...');
      const detailRes = await request('GET', `/api/hewan/${testHewan.id}`, null, token);

      if (detailRes.status === 200) {
        const detail = detailRes.data.data;
        console.log(`   ✓ Detail retrieved`);
        console.log(`     ID: ${detail.id}`);
        console.log(`     ID Hewan: ${detail.id_hewan}`);
        console.log(`     Ras: ${detail.ras}`);
        console.log(`     Catatan: "${detail.catatan || '(empty)'}"\n`);

        if (detail.catatan) {
          console.log('✓ TEST PASSED: Catatan field working end-to-end!\n');
        } else {
          console.log('✗ TEST FAILED: Catatan not found in detail\n');
        }
      } else {
        console.log('   ✗ Get detail failed:', detailRes.data);
      }
    } else {
      console.log('   ✗ Test hewan not found in list');
    }

  } catch (error) {
    console.error('\n✗ Error:', error.message);
  }

  process.exit(0);
}

// Wait for server to start
setTimeout(runTests, 1000);
