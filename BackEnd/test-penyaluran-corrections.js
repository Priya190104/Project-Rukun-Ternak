#!/usr/bin/env node

/**
 * Test Script: Verify Penyaluran & Bantuan Corrections
 * Purpose: Test the new createHewan endpoint and validate corrections
 * Date: December 29, 2025
 */

const http = require('http');

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:4000';
const KELOMPOK_TOKEN = process.env.KELOMPOK_TOKEN || 'your-kelompok-token-here';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'your-admin-token-here';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(type, message) {
  const timestamp = new Date().toISOString();
  switch (type) {
    case 'pass':
      console.log(`${colors.green}✅ PASS${colors.reset} [${timestamp}] ${message}`);
      break;
    case 'fail':
      console.log(`${colors.red}❌ FAIL${colors.reset} [${timestamp}] ${message}`);
      break;
    case 'test':
      console.log(`\n${colors.blue}🧪 TEST${colors.reset} ${message}`);
      break;
    case 'info':
      console.log(`${colors.cyan}ℹ️ INFO${colors.reset} [${timestamp}] ${message}`);
      break;
    case 'warning':
      console.log(`${colors.yellow}⚠️ WARNING${colors.reset} [${timestamp}] ${message}`);
      break;
    default:
      console.log(message);
  }
}

function makeRequest(method, path, body = null, token = KELOMPOK_TOKEN) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function runTests() {
  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}  Penyaluran & Bantuan Correction Verification Tests${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}\n`);

  log('info', `Using API URL: ${BASE_URL}`);
  log('info', `Using token: ${KELOMPOK_TOKEN.substring(0, 20)}...`);

  let passed = 0;
  let failed = 0;

  try {
    // ===== TEST 1: Create hewan with all valid fields =====
    log('test', 'Create hewan with all valid fields (should succeed)');
    try {
      const res = await makeRequest('POST', '/api/hewan', {
        id_hewan: `TEST-${Date.now()}`,
        jenis_kelamin: 'JANTAN',
        ras: 'Domba Wool',
        bobot: 25.5,
        tanggal_lahir: '2024-12-01',
        source: 'Penyaluran'
      });

      if (res.status === 200 && res.body.success) {
        log('pass', 'Hewan created successfully');
        log('info', `Response: ${JSON.stringify(res.body.data)}`);
        passed++;
      } else {
        log('fail', `Expected 200/success, got ${res.status}/${res.body.success}`);
        log('info', `Response: ${JSON.stringify(res.body)}`);
        failed++;
      }
    } catch (error) {
      log('fail', `Request failed: ${error.message}`);
      failed++;
    }

    // ===== TEST 2: Missing required field (id_hewan) =====
    log('test', 'Missing required field - id_hewan (should fail)');
    try {
      const res = await makeRequest('POST', '/api/hewan', {
        jenis_kelamin: 'JANTAN',
        ras: 'Domba Wool',
        bobot: 25.5,
        tanggal_lahir: '2024-12-01'
      });

      if (res.status === 400 && !res.body.success) {
        log('pass', 'Validation correctly rejected missing id_hewan');
        log('info', `Error: ${res.body.message}`);
        passed++;
      } else {
        log('fail', `Expected 400 error, got ${res.status}/${res.body.success}`);
        failed++;
      }
    } catch (error) {
      log('fail', `Request failed: ${error.message}`);
      failed++;
    }

    // ===== TEST 3: Invalid jenis_kelamin =====
    log('test', 'Invalid jenis_kelamin value (should fail)');
    try {
      const res = await makeRequest('POST', '/api/hewan', {
        id_hewan: `TEST-${Date.now()}`,
        jenis_kelamin: 'LAINNYA',
        ras: 'Domba Wool',
        bobot: 25.5,
        tanggal_lahir: '2024-12-01'
      });

      if (res.status === 400 && res.body.message.includes('JANTAN')) {
        log('pass', 'Validation correctly rejected invalid jenis_kelamin');
        log('info', `Error: ${res.body.message}`);
        passed++;
      } else {
        log('fail', `Expected validation error for jenis_kelamin, got ${res.status}`);
        failed++;
      }
    } catch (error) {
      log('fail', `Request failed: ${error.message}`);
      failed++;
    }

    // ===== TEST 4: Invalid bobot (negative) =====
    log('test', 'Invalid bobot value - negative (should fail)');
    try {
      const res = await makeRequest('POST', '/api/hewan', {
        id_hewan: `TEST-${Date.now()}`,
        jenis_kelamin: 'JANTAN',
        ras: 'Domba Wool',
        bobot: -10,
        tanggal_lahir: '2024-12-01'
      });

      if (res.status === 400 && res.body.message.includes('lebih dari 0')) {
        log('pass', 'Validation correctly rejected negative bobot');
        log('info', `Error: ${res.body.message}`);
        passed++;
      } else {
        log('fail', `Expected bobot validation error, got ${res.status}`);
        failed++;
      }
    } catch (error) {
      log('fail', `Request failed: ${error.message}`);
      failed++;
    }

    // ===== TEST 5: Future birthdate =====
    log('test', 'Future birthdate (should fail)');
    try {
      const futureDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const res = await makeRequest('POST', '/api/hewan', {
        id_hewan: `TEST-${Date.now()}`,
        jenis_kelamin: 'JANTAN',
        ras: 'Domba Wool',
        bobot: 25.5,
        tanggal_lahir: futureDate
      });

      if (res.status === 400 && res.body.message.includes('masa depan')) {
        log('pass', 'Validation correctly rejected future birthdate');
        log('info', `Error: ${res.body.message}`);
        passed++;
      } else {
        log('fail', `Expected future date validation error, got ${res.status}`);
        failed++;
      }
    } catch (error) {
      log('fail', `Request failed: ${error.message}`);
      failed++;
    }

    // ===== TEST 6: Invalid date format =====
    log('test', 'Invalid date format (should fail)');
    try {
      const res = await makeRequest('POST', '/api/hewan', {
        id_hewan: `TEST-${Date.now()}`,
        jenis_kelamin: 'JANTAN',
        ras: 'Domba Wool',
        bobot: 25.5,
        tanggal_lahir: 'not-a-date'
      });

      if (res.status === 400 && res.body.message.includes('format')) {
        log('pass', 'Validation correctly rejected invalid date format');
        log('info', `Error: ${res.body.message}`);
        passed++;
      } else {
        log('fail', `Expected format validation error, got ${res.status}`);
        failed++;
      }
    } catch (error) {
      log('fail', `Request failed: ${error.message}`);
      failed++;
    }

    // ===== TEST 7: Missing bobot =====
    log('test', 'Missing required field - bobot (should fail)');
    try {
      const res = await makeRequest('POST', '/api/hewan', {
        id_hewan: `TEST-${Date.now()}`,
        jenis_kelamin: 'JANTAN',
        ras: 'Domba Wool',
        tanggal_lahir: '2024-12-01'
      });

      if (res.status === 400 && !res.body.success) {
        log('pass', 'Validation correctly rejected missing bobot');
        log('info', `Error: ${res.body.message}`);
        passed++;
      } else {
        log('fail', `Expected validation error for missing bobot, got ${res.status}`);
        failed++;
      }
    } catch (error) {
      log('fail', `Request failed: ${error.message}`);
      failed++;
    }

    // ===== TEST 8: Zero bobot =====
    log('test', 'Zero bobot value (should fail)');
    try {
      const res = await makeRequest('POST', '/api/hewan', {
        id_hewan: `TEST-${Date.now()}`,
        jenis_kelamin: 'BETINA',
        ras: 'Kambing Boer',
        bobot: 0,
        tanggal_lahir: '2024-11-01'
      });

      if (res.status === 400 && res.body.message.includes('lebih dari 0')) {
        log('pass', 'Validation correctly rejected zero bobot');
        log('info', `Error: ${res.body.message}`);
        passed++;
      } else {
        log('fail', `Expected bobot validation error, got ${res.status}`);
        failed++;
      }
    } catch (error) {
      log('fail', `Request failed: ${error.message}`);
      failed++;
    }

  } catch (error) {
    log('fail', `Unexpected error: ${error.message}`);
    failed++;
  }

  // ===== RESULTS =====
  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}  Test Results${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}\n`);

  console.log(`${colors.green}✅ Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
  console.log(`${colors.cyan}📊 Total:  ${passed + failed}${colors.reset}\n`);

  if (failed === 0) {
    console.log(`${colors.green}🎉 All tests passed!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}⚠️ Some tests failed!${colors.reset}\n`);
    process.exit(1);
  }
}

// ===== INSTRUCTIONS =====
console.log(`
${colors.cyan}SETUP INSTRUCTIONS:${colors.reset}

1. Set your environment variables:
   export API_URL="http://localhost:4000"
   export KELOMPOK_TOKEN="your-actual-token-here"

2. Make sure backend server is running:
   cd BackEnd
   node server.js

3. Run this test script:
   node test-penyaluran-corrections.js

${colors.yellow}NOTE:${colors.reset} Replace token with actual valid token from your system
${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}
`);

// Run tests if tokens provided
if (KELOMPOK_TOKEN !== 'your-kelompok-token-here') {
  runTests();
} else {
  log('warning', 'KELOMPOK_TOKEN not set. Skipping tests.');
  log('info', 'Set environment variable: export KELOMPOK_TOKEN="your-token"');
}
