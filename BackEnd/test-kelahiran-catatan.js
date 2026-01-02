#!/usr/bin/env node

require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:4000';
const api = axios.create({ baseURL: BASE_URL });

async function test() {
  console.log('\n=== Testing Kelahiran with Catatan ===\n');

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

    // 2. Get an existing hewan to use as parent
    console.log('2. Getting existing hewan for parent...');
    const hewanListRes = await api.get('/api/admin/hewan?page=1&limit=10');
    
    if (!hewanListRes.data.data || hewanListRes.data.data.length === 0) {
      console.log('   ✗ No hewan found');
      process.exit(1);
    }

    const parentHewan = hewanListRes.data.data[0];
    const kelompokId = parentHewan.kelompok_id;
    console.log(`   ✓ Found parent hewan: ID ${parentHewan.id}\n`);

    // 3. Create laporan kelahiran with catatan
    console.log('3. Creating laporan kelahiran with catatan...');
    const laporanRes = await api.post('/api/laporan', {
      jenis: 'kelahiran',
      tanggal: new Date().toISOString().split('T')[0],
      data: {
        tanggal_kelahiran: new Date().toISOString().split('T')[0],
        induk_id: parentHewan.id,
        jenis_kelamin_anak: 'jantan',
        jumlah_anak: 1,
        ras: parentHewan.ras || 'Limousin',
        bobot: 2.5,
        id: `LAHIR-${Date.now()}`,
        catatan: 'Kelahiran normal tanpa komplikasi, anak sehat'
      }
    });

    if (!laporanRes.data.success) {
      console.log('   ✗ Create laporan failed:', laporanRes.data);
      process.exit(1);
    }

    console.log('   ✓ Laporan kelahiran created\n');

    // 4. Get hewan list again to find the new born hewan
    console.log('4. Getting updated hewan list...');
    const hewanRes = await api.get(`/api/admin/hewan?page=1&limit=20`);

    if (!hewanRes.data.data || hewanRes.data.data.length === 0) {
      console.log('   ✗ No hewan found');
      process.exit(1);
    }

    // Find newly born hewan (from Kelahiran source)
    const newbornHewan = hewanRes.data.data.find(h => h.source === 'Kelahiran');
    
    if (!newbornHewan) {
      console.log('   ⚠ No newborn hewan found yet (may take a moment)');
    } else {
      console.log(`   ✓ Found newborn hewan: ID ${newbornHewan.id}`);
      console.log(`     Catatan in list: ${newbornHewan.catatan || '(empty)'}\n`);

      // 5. Get detail of newborn hewan
      console.log('5. Getting detail of newborn hewan...');
      const detailRes = await api.get(`/api/admin/hewan/${newbornHewan.id}`);

      if (!detailRes.data.data) {
        console.log('   ✗ Detail not found');
        process.exit(1);
      }

      const detail = detailRes.data.data;
      console.log('   ✓ Detail retrieved:');
      console.log(`     ID: ${detail.id}`);
      console.log(`     Source: ${detail.source}`);
      console.log(`     Catatan: "${detail.catatan || '(empty)'}"\n`);

      if (detail.catatan === 'Kelahiran normal tanpa komplikasi, anak sehat') {
        console.log('✓✓✓ TEST PASSED: Kelahiran with Catatan working correctly! ✓✓✓\n');
        process.exit(0);
      } else {
        console.log('✗ TEST FAILED: Catatan mismatch in newborn hewan\n');
        process.exit(1);
      }
    }

  } catch (error) {
    console.error('✗ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

test();
