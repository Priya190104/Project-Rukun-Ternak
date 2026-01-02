#!/usr/bin/env node

require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:4000';
const api = axios.create({ baseURL: BASE_URL });

async function test() {
  console.log('\n=== Debug: Checking Request Payload ===\n');

  try {
    // 1. Login
    const loginRes = await api.post('/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });

    const token = loginRes.data.data.token;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // 2. Create kelompok and log payload
    console.log('Creating kelompok with ID Ternak input...\n');
    
    const payload = {
      name: `Debug Test ${Date.now()}`,
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
      jumlahTernak: 1,
      ternakDetails: [
        {
          idTernak: 'DEBUG-001',
          jenisKelamin: 'JANTAN',
          ras: 'Limousin',
          bobot: 150,
          umur: 18,
          catatan: 'Debug test'
        }
      ],
      pakanList: [],
      kesehatanList: []
    };

    console.log('Payload sent:');
    console.log(JSON.stringify(payload.ternakDetails, null, 2));
    console.log();

    const createRes = await api.post('/api/kelompok', payload);

    if (createRes.data.success) {
      console.log('✓ Kelompok created\n');
      
      // Check what response returns
      console.log('Create response:');
      console.log(JSON.stringify(createRes.data, null, 2));
      console.log('\n');

      // Get the hewan that was just created using kelompok ID
      const kelompokId = createRes.data.data?.kelompok?.id;
      console.log(`Kelompok ID: ${kelompokId}\n`);
      
      const hewanRes = await api.get(`/api/kelompok/${kelompokId}/hewan`);
      const hewan = hewanRes.data.data?.[0] || hewanRes.data.data?.hewan?.[0];

      if (hewan) {
        console.log('Hewan stored in database:');
        console.log(`  id (PK): ${hewan.id}`);
        console.log(`  id_hewan: ${hewan.id_hewan || '(null)'}`);
        console.log(`  ras: ${hewan.ras}`);
        console.log(`  catatan: ${hewan.catatan || '(null)'}\n`);

        if (hewan.id_hewan === 'DEBUG-001') {
          console.log('✓ ID Ternak was correctly stored!');
        } else {
          console.log('✗ ID Ternak was NOT stored. Expected "DEBUG-001", got:', hewan.id_hewan);
        }
      } else {
        // Fallback to last hewan
        const hewanLastRes = await api.get('/api/admin/hewan?page=1&limit=1');
        const hewanLast = hewanLastRes.data.data[0];

        console.log('Hewan stored in database (last record):');
        console.log(`  id (PK): ${hewanLast.id}`);
        console.log(`  id_hewan: ${hewanLast.id_hewan || '(null)'}`);
        console.log(`  ras: ${hewanLast.ras}`);
        console.log(`  catatan: ${hewanLast.catatan || '(null)'}\n`);

        if (hewanLast.id_hewan === 'DEBUG-001') {
          console.log('✓ ID Ternak was correctly stored!');
        } else {
          console.log('✗ ID Ternak was NOT stored. Expected "DEBUG-001", got:', hewanLast.id_hewan);
        }
      }

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

test();
