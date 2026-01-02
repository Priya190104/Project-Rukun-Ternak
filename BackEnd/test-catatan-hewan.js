#!/usr/bin/env node

/**
 * Test Script untuk Field "Catatan" di Hewan Ternak
 * Test 1: Pembuatan Kelompok dengan Catatan Hewan
 * Test 2: Kelahiran dengan Catatan
 * Test 3: Tampilan Detail Hewan dengan Catatan
 */

const http = require('http');
const https = require('https');

const BASE_URL = 'http://localhost:3001';

// Color codes untuk output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Helper untuk membuat request
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', chunk => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: parsed,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Helper untuk log
function log(title, message, type = 'info') {
  const prefix = `[${new Date().toLocaleTimeString()}]`;
  switch (type) {
    case 'success':
      console.log(`${colors.green}✓${colors.reset} ${prefix} ${colors.green}${title}${colors.reset}: ${message}`);
      break;
    case 'error':
      console.log(`${colors.red}✗${colors.reset} ${prefix} ${colors.red}${title}${colors.reset}: ${message}`);
      break;
    case 'warning':
      console.log(`${colors.yellow}⚠${colors.reset} ${prefix} ${colors.yellow}${title}${colors.reset}: ${message}`);
      break;
    case 'info':
      console.log(`${colors.blue}ℹ${colors.reset} ${prefix} ${colors.blue}${title}${colors.reset}: ${message}`);
      break;
    default:
      console.log(`${colors.cyan}→${colors.reset} ${prefix} ${title}: ${message}`);
  }
}

async function runTests() {
  console.log(`\n${colors.cyan}=== Testing Field "Catatan" untuk Hewan Ternak ===${colors.reset}\n`);

  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // Test 1: Login Admin
    log('TEST 1', 'Login Admin', 'info');
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      username: 'admin',
      password: 'admin'
    });

    if (loginRes.status !== 200 || !loginRes.data.token) {
      log('TEST 1', 'Gagal login', 'error');
      testsFailed++;
      return;
    }

    const adminToken = loginRes.data.token;
    log('TEST 1', `Login berhasil, token: ${adminToken.substring(0, 20)}...`, 'success');
    testsPassed++;

    // Test 2: Buat Kelompok dengan Catatan Hewan
    log('TEST 2', 'Membuat Kelompok dengan Hewan yang punya Catatan', 'info');
    const createKelompokRes = await makeRequest('POST', '/api/kelompok', {
      name: 'Kelompok Test Catatan ' + Date.now(),
      email: `test-${Date.now()}@example.com`,
      kecamatan: 'Cilacap Selatan',
      desa: 'Sidakaya',
      latitude: -7.7,
      longitude: 108.8,
      pic1_nik: '1234567890123456',
      pic1_nama: 'Pengurus Test',
      pic1_alamat: 'Jalan Test',
      pic1_noHp: '081234567890',
      pic1_email: `contact-${Date.now()}@example.com`,
      jumlahKandang: 2,
      jumlahTernak: 2,
      ternakDetails: [
        {
          idTernak: 'HW-001',
          jenisKelamin: 'JANTAN',
          ras: 'Limousin',
          bobot: 150,
          umur: 18,
          catatan: 'Hewan ini sangat sehat dan aktif'
        },
        {
          idTernak: 'HW-002',
          jenisKelamin: 'BETINA',
          ras: 'Brahman',
          bobot: 120,
          umur: 16,
          catatan: 'Hewan siap untuk kawin'
        }
      ],
      pakanList: [],
      kesehatanList: []
    }, adminToken);

    if (createKelompokRes.status !== 201 && createKelompokRes.status !== 200) {
      log('TEST 2', `Gagal membuat kelompok: ${JSON.stringify(createKelompokRes.data)}`, 'error');
      testsFailed++;
    } else {
      const kelompokId = createKelompokRes.data.data?.id;
      log('TEST 2', `Kelompok berhasil dibuat dengan ID: ${kelompokId}`, 'success');
      testsPassed++;

      // Test 3: Verifikasi Hewan punya Catatan
      log('TEST 3', 'Verifikasi Hewan memiliki Catatan di Database', 'info');
      const hewanListRes = await makeRequest('GET', '/api/hewan?page=1&limit=20', null, adminToken);
      
      if (hewanListRes.status !== 200) {
        log('TEST 3', 'Gagal mengambil daftar hewan', 'error');
        testsFailed++;
      } else {
        const hewan = hewanListRes.data.data?.find(h => h.id_hewan === 'HW-001' || h.id_hewan === 'HW-002');
        if (hewan && hewan.catatan) {
          log('TEST 3', `Catatan ditemukan: "${hewan.catatan}"`, 'success');
          testsPassed++;
        } else {
          log('TEST 3', 'Catatan tidak ditemukan di list hewan', 'error');
          testsFailed++;
        }

        // Test 4: Detail Hewan menampilkan Catatan
        if (hewan) {
          log('TEST 4', `Mengambil Detail Hewan ID ${hewan.id}`, 'info');
          const detailRes = await makeRequest('GET', `/api/hewan/${hewan.id}`, null, adminToken);
          
          if (detailRes.status === 200 && detailRes.data.data?.catatan) {
            log('TEST 4', `Catatan pada detail hewan: "${detailRes.data.data.catatan}"`, 'success');
            testsPassed++;
          } else {
            log('TEST 4', 'Catatan tidak ditemukan pada detail hewan', 'error');
            testsFailed++;
          }
        }
      }
    }

    // Test 5: Kelahiran dengan Catatan
    log('TEST 5', 'Membuat Laporan Kelahiran dengan Catatan', 'info');
    
    // Ambil data kelompok user yang login
    const kelompokUserRes = await makeRequest('GET', '/api/kelompok', null, adminToken);
    if (kelompokUserRes.status === 200 && kelompokUserRes.data.data?.length > 0) {
      const userKelompokId = kelompokUserRes.data.data[0].id;
      
      const createLaporanRes = await makeRequest('POST', '/api/laporan', {
        jenis: 'kelahiran',
        tanggal: new Date().toISOString().split('T')[0],
        data: {
          tanggal_kelahiran: new Date().toISOString().split('T')[0],
          induk_id: 'IND-001',
          jenis_kelamin_anak: 'jantan',
          jumlah_anak: 1,
          ras: 'Limousin',
          bobot: 2.5,
          id: 'LAHIR-TEST-001',
          catatan: 'Kelahiran normal tanpa komplikasi'
        }
      }, adminToken);

      if (createLaporanRes.status !== 201 && createLaporanRes.status !== 200) {
        log('TEST 5', `Gagal membuat laporan: ${JSON.stringify(createLaporanRes.data)}`, 'warning');
        testsFailed++;
      } else {
        log('TEST 5', 'Laporan kelahiran berhasil dibuat', 'success');
        testsPassed++;

        // Verifikasi Hewan dari Kelahiran
        log('TEST 6', 'Verifikasi Hewan dari Kelahiran memiliki Catatan', 'info');
        const hewanBaruRes = await makeRequest('GET', '/api/hewan?page=1&limit=20', null, adminToken);
        
        if (hewanBaruRes.status === 200) {
          const hewanBaru = hewanBaruRes.data.data?.find(h => h.id_hewan === 'LAHIR-TEST-001' || h.source === 'Kelahiran');
          if (hewanBaru && hewanBaru.catatan) {
            log('TEST 6', `Catatan dari kelahiran ditemukan: "${hewanBaru.catatan}"`, 'success');
            testsPassed++;
          } else {
            log('TEST 6', 'Catatan dari kelahiran tidak ditemukan', 'warning');
            testsFailed++;
          }
        }
      }
    }

  } catch (error) {
    log('FATAL', `Error: ${error.message}`, 'error');
    testsFailed++;
  }

  // Summary
  console.log(`\n${colors.cyan}=== Test Summary ===${colors.reset}`);
  console.log(`${colors.green}Passed: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testsFailed}${colors.reset}`);
  console.log(`Total: ${testsPassed + testsFailed}\n`);

  if (testsFailed === 0) {
    console.log(`${colors.green}✓ Semua test berhasil!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}✗ Ada test yang gagal${colors.reset}\n`);
    process.exit(1);
  }
}

runTests();
