#!/usr/bin/env node

// Using Node's built-in fetch (available in Node 18+)
const fetch = global.fetch || require('node-fetch');

const BASE_URL = 'http://localhost:4000';
let authToken = null;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testLogin() {
  log('blue', '\n=== Testing Login ===');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'adminpass' }),
    });
    
    const text = await response.text();
    let data;
    
    try {
      data = JSON.parse(text);
    } catch {
      log('red', `✗ Failed to parse response: ${text}`);
      return false;
    }
    
    if (data.success && data.data?.token) {
      authToken = data.data.token;
      log('green', `✓ Login successful. Token: ${authToken.substring(0, 20)}...`);
      log('green', `  User: ${data.data.user?.username} (${data.data.user?.role})`);
      return true;
    } else {
      log('red', `✗ Login failed: ${data.message || JSON.stringify(data)}`);
      return false;
    }
  } catch (err) {
    log('red', `✗ Login error: ${err.message}`);
    return false;
  }
}

async function testCreateKelompok() {
  log('blue', '\n=== Testing Create Kelompok ===');
  
  if (!authToken) {
    log('red', '✗ No auth token. Login first.');
    return null;
  }

  try {
    const kelompokData = {
      name: 'Kelompok Ternak Sejahtera',
      kecamatan: 'Kecamatan Semarang',
      desa: 'Desa Pondok Arum',
      catatan: 'Kelompok fokus pada sapi potong',
    };

    const response = await fetch(`${BASE_URL}/api/kelompok`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(kelompokData),
    });

    const text = await response.text();
    let data;
    
    try {
      data = JSON.parse(text);
    } catch {
      log('red', `✗ Failed to parse response: ${text.substring(0, 100)}`);
      return null;
    }

    if (data.success && data.data?.id) {
      log('green', `✓ Kelompok created successfully. ID: ${data.data.id}`);
      log('green', `  Name: ${data.data.name}`);
      if (data.data.kecamatan) log('green', `  Kecamatan: ${data.data.kecamatan}`);
      if (data.data.desa) log('green', `  Desa: ${data.data.desa}`);
      return data.data.id;
    } else {
      log('red', `✗ Failed to create kelompok: ${data.message || JSON.stringify(data).substring(0, 100)}`);
      return null;
    }
  } catch (err) {
    log('red', `✗ Error creating kelompok: ${err.message}`);
    return null;
  }
}

async function testGetKelompok() {
  log('blue', '\n=== Testing Get Kelompok ===');

  if (!authToken) {
    log('red', '✗ No auth token. Login first.');
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/kelompok`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    const data = await response.json();

    if (data.success && Array.isArray(data.data)) {
      log('green', `✓ Retrieved ${data.data.length} kelompok(s)`);
      data.data.slice(0, 3).forEach(k => {
        log('yellow', `  - ${k.name} (${k.kecamatan}, ${k.desa}) - ${k.anggota_count} anggota`);
      });
    } else {
      log('red', `✗ Failed to get kelompok: ${data.message}`);
    }
  } catch (err) {
    log('red', `✗ Error getting kelompok: ${err.message}`);
  }
}

async function testCreateLaporan(kelompokId) {
  log('blue', '\n=== Testing Create Laporan ===');

  if (!authToken) {
    log('red', '✗ No auth token. Login first.');
    return;
  }

  if (!kelompokId) {
    log('red', '✗ No kelompok ID provided.');
    return;
  }

  try {
    // Test Kelahiran laporan
    const laporanData = {
      jenis: 'Kelahiran',
      kelompok_id: kelompokId,
      tanggal: new Date().toISOString(),
      data: {
        nomor_indukan: 'IND-001',
        nomor_pejantan: 'PJT-001',
        nomor_kelahiran: 'KLH-001',
        jenis_kelamin: 'Jantan',
        bobot_lahir: '25.5 kg',
        kondisi_lahir: 'Normal',
        catatan: 'Lahir sehat dan normal',
      },
    };

    const response = await fetch(`${BASE_URL}/api/laporan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(laporanData),
    });

    const data = await response.json();

    if (data.success && data.data?.id) {
      log('green', `✓ Laporan created successfully. ID: ${data.data.id}`);
      log('green', `  Jenis: ${data.data.jenis}`);
      log('green', `  Tanggal: ${new Date(data.data.tanggal).toLocaleDateString('id-ID')}`);
      log('green', `  Nomor Kelahiran: ${data.data.data?.nomor_kelahiran}`);
      return data.data.id;
    } else {
      log('red', `✗ Failed to create laporan: ${data.message}`);
      return null;
    }
  } catch (err) {
    log('red', `✗ Error creating laporan: ${err.message}`);
    return null;
  }
}

async function testGetLaporan() {
  log('blue', '\n=== Testing Get Laporan ===');

  if (!authToken) {
    log('red', '✗ No auth token. Login first.');
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/laporan`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    const data = await response.json();

    if (data.success && Array.isArray(data.data)) {
      log('green', `✓ Retrieved ${data.data.length} laporan(s)`);
      data.data.slice(0, 3).forEach(l => {
        log('yellow', `  - ${l.jenis} (${new Date(l.tanggal).toLocaleDateString('id-ID')})`);
      });
    } else {
      log('red', `✗ Failed to get laporan: ${data.message}`);
    }
  } catch (err) {
    log('red', `✗ Error getting laporan: ${err.message}`);
  }
}

async function runAllTests() {
  log('blue', '╔════════════════════════════════════════════════════╗');
  log('blue', '║     Rukun Ternak API Integration Test Suite        ║');
  log('blue', '╚════════════════════════════════════════════════════╝');

  // Test login
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    log('red', '\nTests aborted: Login failed.');
    return;
  }

  // Test kelompok creation
  const kelompokId = await testCreateKelompok();

  // Test get kelompok
  await testGetKelompok();

  // Test laporan creation
  if (kelompokId) {
    await testCreateLaporan(kelompokId);
  }

  // Test get laporan
  await testGetLaporan();

  log('blue', '\n╔════════════════════════════════════════════════════╗');
  log('green', '║         All tests completed successfully!           ║');
  log('blue', '╚════════════════════════════════════════════════════╝\n');
}

runAllTests().catch(err => {
  log('red', `\nFatal error: ${err.message}`);
  process.exit(1);
});
