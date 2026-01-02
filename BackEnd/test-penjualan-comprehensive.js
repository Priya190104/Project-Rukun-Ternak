const http = require('http');
const https = require('https');

const API_BASE = 'http://localhost:5000/api';

// Helper untuk API calls
function apiCall(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJwcml5YSIsInJvbGUiOiJrZWxvbXBvayIsImtlbG9tcG9rX2lkIjoxMSwiaWF0IjoxNzM2MzE2Mjk2fQ.YfGjsY7CRJXDVVNtOL79VhJTL1zfDrIvbFvFLSJ7KJI'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('PENJUALAN FEATURE - COMPREHENSIVE TEST SUITE');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // TEST 1: Check hewan ternak candidates available
    console.log('TEST 1: Verify Hewan Ternak Candidates Available');
    console.log('-'.repeat(50));
    const hewanRes = await apiCall('GET', '/hewan');
    console.log(`✓ GET /api/hewan - Status: ${hewanRes.status}`);
    console.log(`  Total hewan available: ${hewanRes.data.data?.length || 0}`);
    
    if (hewanRes.data.data?.length > 0) {
      console.log(`  Sample hewan:`, hewanRes.data.data.slice(0, 2).map(h => ({
        id_hewan: h.id_hewan,
        jenis_kelamin: h.jenis_kelamin,
        umur_bulan: h.umur_bulan,
        status: h.status
      })));
    }
    console.log('');

    // TEST 2: Get current penjualan laporan count
    console.log('TEST 2: Get Current Penjualan Laporan Count');
    console.log('-'.repeat(50));
    const laporanRes = await apiCall('GET', '/laporan?jenis=penjualan');
    const existingCount = laporanRes.data.data?.length || 0;
    console.log(`✓ GET /api/laporan?jenis=penjualan - Status: ${laporanRes.status}`);
    console.log(`  Current penjualan laporan count: ${existingCount}`);
    if (existingCount > 0) {
      const latestLaporan = laporanRes.data.data[0];
      console.log(`  Latest laporan structure:`, {
        jenis: latestLaporan.jenis,
        tanggal: latestLaporan.tanggal,
        data_keys: Object.keys(latestLaporan.data || {})
      });
    }
    console.log('');

    // TEST 3: Create test penjualan laporan with dynamic fields
    console.log('TEST 3: Create Penjualan Laporan with Dynamic Fields (2 items)');
    console.log('-'.repeat(50));
    
    const testPenjualan = {
      jenis: 'penjualan',
      tanggal: new Date().toISOString().split('T')[0],
      data: {
        jumlah_hewan: 2,
        penjualan_list: [
          {
            jenis_penjualan: 'Retail',
            jenis_hewan: 'Pejantan',
            id_hewan: hewanRes.data.data?.[0]?.id_hewan || 'TEST-001',
            catatan: 'Dijual ke pembeli lokal'
          },
          {
            jenis_penjualan: 'Aqiqah',
            jenis_hewan: 'Betina',
            id_hewan: hewanRes.data.data?.[1]?.id_hewan || 'TEST-002',
            catatan: 'Untuk acara aqiqah keluarga'
          }
        ],
        catatan_umum: 'Test submission untuk verify dynamic fields'
      }
    };

    console.log('Request payload:');
    console.log(JSON.stringify(testPenjualan, null, 2));
    
    const submitRes = await apiCall('POST', '/laporan', testPenjualan);
    console.log(`\n✓ POST /api/laporan - Status: ${submitRes.status}`);
    
    if (submitRes.status === 201 || submitRes.status === 200) {
      const createdId = submitRes.data.data?.id;
      console.log(`✓ SUCCESS - Laporan created with ID: ${createdId}`);
      console.log('  Response data:', submitRes.data.data);
      
      // TEST 4: Verify data was saved correctly
      console.log('\nTEST 4: Verify Data Persisted Correctly');
      console.log('-'.repeat(50));
      const getRes = await apiCall('GET', `/laporan/${createdId}`);
      if (getRes.status === 200) {
        const savedData = getRes.data.data?.data;
        console.log(`✓ Retrieved laporan data:`);
        console.log(JSON.stringify(savedData, null, 2));
        
        // Verify structure
        const hasJumlah = savedData?.jumlah_hewan === 2;
        const hasList = Array.isArray(savedData?.penjualan_list);
        const listLength = savedData?.penjualan_list?.length === 2;
        const hasItem1 = savedData?.penjualan_list?.[0]?.jenis_penjualan === 'Retail';
        const hasItem2 = savedData?.penjualan_list?.[1]?.jenis_penjualan === 'Aqiqah';
        
        console.log('\n✓ Data structure verification:');
        console.log(`  - jumlah_hewan field present: ${hasJumlah ? '✓' : '✗'}`);
        console.log(`  - penjualan_list is array: ${hasList ? '✓' : '✗'}`);
        console.log(`  - penjualan_list has 2 items: ${listLength ? '✓' : '✗'}`);
        console.log(`  - Item 1 jenis_penjualan correct: ${hasItem1 ? '✓' : '✗'}`);
        console.log(`  - Item 2 jenis_penjualan correct: ${hasItem2 ? '✓' : '✗'}`);
      } else {
        console.log(`✗ Failed to retrieve laporan: ${getRes.status}`);
      }
    } else {
      console.log(`✗ FAILED - Status: ${submitRes.status}`);
      console.log(`  Error: ${JSON.stringify(submitRes.data)}`);
    }
    console.log('');

    // TEST 5: Check dashboard stats
    console.log('TEST 5: Verify Dashboard Penjualan Stats Calculation');
    console.log('-'.repeat(50));
    const statsRes = await apiCall('GET', '/stats/dashboard/kelompok');
    console.log(`✓ GET /api/stats/dashboard/kelompok - Status: ${statsRes.status}`);
    if (statsRes.status === 200) {
      const penjualanStats = statsRes.data.data?.penjualan;
      console.log('  Penjualan stats:', penjualanStats);
      console.log(`  Total terjual: ${penjualanStats?.totalTerjual || 0}`);
      console.log(`  Pejantan terjual: ${penjualanStats?.pejantanTerjual || 0}`);
      console.log(`  Betina terjual: ${penjualanStats?.betinaTerjual || 0}`);
    }
    console.log('');

    // TEST 6: Verify query efficiency
    console.log('TEST 6: Query Performance Check');
    console.log('-'.repeat(50));
    const startTime = Date.now();
    const perfRes = await apiCall('GET', '/laporan?jenis=penjualan&limit=100');
    const elapsed = Date.now() - startTime;
    console.log(`✓ Query completed in ${elapsed}ms`);
    console.log(`  Response contains ${perfRes.data.data?.length || 0} items`);
    console.log('');

    console.log('═══════════════════════════════════════════════════════');
    console.log('TEST SUITE COMPLETED');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('ERROR:', error.message);
  }
}

runTests();
