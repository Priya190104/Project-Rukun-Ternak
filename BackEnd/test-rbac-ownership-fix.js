/**
 * TEST: RBAC & Ownership Fixes for Laporan & Update Ternak
 * 
 * Tests the following fixes:
 * 1. CREATE LAPORAN: Kelompok users can only create laporan for their own kelompok
 * 2. GET LAPORAN: Kelompok users can access their own laporan (403 vs 404)
 * 3. UPDATE TERNAK: Kelompok users can update only their own hewan
 * 
 * Test Scenario:
 * - Login as Kelompok user
 * - Create laporan with ownership check
 * - Fetch laporan detail (should succeed)
 * - Attempt unauthorized access (should 403, not 404)
 * - Update hewan ternak (should succeed)
 * - Verify database reflects changes
 */

const http = require('http');
const { Buffer } = require('buffer');

const API_HOST = 'localhost';
const API_PORT = 4000;
const API_BASE = `http://${API_HOST}:${API_PORT}/api`;

// Test data
let testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// Kelompok user credentials (for testing)
const kelompokUser = {
  id: 1,
  username: 'kelompok1',
  full_name: 'Kelompok Makmur',
  role: 'kelompok',
  kelompok_id: 1
};

// Create X-Test-User header
function getTestUserHeader() {
  const encoded = Buffer.from(JSON.stringify(kelompokUser)).toString('base64');
  return encoded;
}

// HTTP Helper
function httpRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-Test-User': getTestUserHeader(),
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: data ? JSON.parse(data) : null,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Test helpers
function pass(message) {
  testResults.passed++;
  console.log(`✅ PASS: ${message}`);
}

function fail(message, error) {
  testResults.failed++;
  testResults.errors.push({ message, error });
  console.log(`❌ FAIL: ${message}`);
  if (error) console.log(`   Error: ${error}`);
}

async function runTests() {
  console.log('\n==========================================================');
  console.log('TEST: RBAC & Ownership Fixes for Laporan & Update Ternak');
  console.log('==========================================================\n');

  try {
    // ====== TEST 1: Create Laporan ======
    console.log('\n[TEST 1] CREATE LAPORAN - Test Ownership Enforcement');
    console.log('---------------------------------------------------');
    
    const laporanData = {
      jenis: 'kandang',
      data: {
        kandangPerkembangan: 2,
        kandangPenjualan: 0,
        kandangKematian: 0
      }
    };

    const createRes = await httpRequest('POST', '/laporan', laporanData);
    let laporanId = null;

    if (createRes.status === 201 && createRes.body?.success) {
      laporanId = createRes.body.data?.id;
      if (createRes.body.data?.kelompok_id === kelompokUser.kelompok_id) {
        pass(`Laporan created with correct kelompok_id: ${laporanId} (kelompok: ${createRes.body.data.kelompok_id})`);
      } else {
        fail(`Laporan created but kelompok_id mismatch. Expected: ${kelompokUser.kelompok_id}, Got: ${createRes.body.data?.kelompok_id}`);
      }
    } else {
      fail(`Failed to create laporan. Status: ${createRes.status}`, JSON.stringify(createRes.body));
    }

    // ====== TEST 2: Get Laporan Detail - Authorized ======
    if (laporanId) {
      console.log('\n[TEST 2] GET LAPORAN DETAIL - Authorized Access');
      console.log('---------------------------------------------------');
      
      const getRes = await httpRequest('GET', `/laporan/${laporanId}`);
      
      if (getRes.status === 200 && getRes.body?.success) {
        pass(`Kelompok user can access own laporan (ID: ${laporanId})`);
        if (getRes.body.data?.kelompok_id === kelompokUser.kelompok_id) {
          pass(`Laporan kelompok_id matches user's kelompok_id: ${kelompokUser.kelompok_id}`);
        } else {
          fail(`Laporan kelompok_id mismatch in GET response`);
        }
      } else {
        fail(`Failed to get laporan detail. Status: ${getRes.status}`, JSON.stringify(getRes.body));
      }
    }

    // ====== TEST 3: Get Non-Existent Laporan - 404 ======
    console.log('\n[TEST 3] GET LAPORAN - Non-existent returns 404');
    console.log('---------------------------------------------------');
    
    const notFoundRes = await httpRequest('GET', '/laporan/99999');
    
    if (notFoundRes.status === 404 && !notFoundRes.body?.success) {
      pass(`Non-existent laporan returns 404: ${notFoundRes.body?.message}`);
    } else {
      fail(`Non-existent laporan should return 404, got: ${notFoundRes.status}`);
    }

    // ====== TEST 4: Get Laporan from Different Kelompok - 403 ======
    console.log('\n[TEST 4] GET LAPORAN - Unauthorized returns 403');
    console.log('---------------------------------------------------');
    
    const otherKelompokUser = {
      id: 2,
      username: 'kelompok2',
      full_name: 'Kelompok Sejahtera',
      role: 'kelompok',
      kelompok_id: 2  // Different kelompok
    };
    
    const otherUserHeader = Buffer.from(JSON.stringify(otherKelompokUser)).toString('base64');

    if (laporanId) {
      const unauthorizedRes = await httpRequest('GET', `/laporan/${laporanId}`, null, {
        'X-Test-User': otherUserHeader
      });

      if (unauthorizedRes.status === 403 && !unauthorizedRes.body?.success) {
        pass(`User from different kelompok gets 403 (not 404): ${unauthorizedRes.body?.message}`);
      } else if (unauthorizedRes.status === 404) {
        fail(`User from different kelompok should get 403, not 404. Got 404 instead.`);
      } else {
        fail(`Expected 403 for unauthorized access, got: ${unauthorizedRes.status}`);
      }
    }

    // ====== TEST 5: Get Hewan Ternak for Update ======
    console.log('\n[TEST 5] UPDATE TERNAK - Get Hewan for Testing');
    console.log('---------------------------------------------------');

    let hewanId = null;
    const hewanListRes = await httpRequest('GET', '/hewan/hewan-aktif');
    
    if (hewanListRes.status === 200 && hewanListRes.body?.success) {
      const hewanList = hewanListRes.body.data || [];
      if (hewanList.length > 0) {
        hewanId = hewanList[0].id;
        pass(`Found ${hewanList.length} active hewan. Using hewan ID: ${hewanId}`);
      } else {
        console.log('ℹ️  INFO: No active hewan found. Skipping update ternak test.');
        hewanId = null;
      }
    } else {
      console.log(`ℹ️  INFO: Could not fetch hewan list (${hewanListRes.status}). Skipping update ternak test.`);
    }

    // ====== TEST 6: Update Ternak Bobot ======
    if (hewanId) {
      console.log('\n[TEST 6] UPDATE TERNAK - Submit Update');
      console.log('---------------------------------------------------');

      const updatePayload = {
        hewan_id: hewanId,
        bobot: Math.floor(Math.random() * 100) + 20,  // Random bobot 20-120
        keterangan: `Test update on ${new Date().toISOString()}`,
        tanggal_update: new Date().toISOString()
      };

      const updateRes = await httpRequest('POST', '/hewan/update-ternak', updatePayload);

      if (updateRes.status === 200 && updateRes.body?.success) {
        pass(`Successfully updated hewan ${hewanId} with bobot ${updatePayload.bobot}`);
      } else {
        fail(`Failed to update ternak. Status: ${updateRes.status}`, JSON.stringify(updateRes.body));
      }
    }

    // ====== TEST 7: Unauthorized Update - Different Kelompok Hewan ======
    if (hewanId) {
      console.log('\n[TEST 7] UPDATE TERNAK - Unauthorized (Different Kelompok)');
      console.log('---------------------------------------------------');

      const updatePayload = {
        hewan_id: hewanId,
        bobot: 50,
        keterangan: 'Unauthorized attempt'
      };

      const unauthorizedUpdateRes = await httpRequest('POST', '/hewan/update-ternak', updatePayload, {
        'X-Test-User': otherUserHeader
      });

      if (unauthorizedUpdateRes.status === 404 && !unauthorizedUpdateRes.body?.success) {
        pass(`User from different kelompok cannot update: ${unauthorizedUpdateRes.body?.message}`);
      } else if (unauthorizedUpdateRes.status === 403) {
        pass(`User from different kelompok gets 403 (access denied)`);
      } else {
        fail(`Expected 404/403 for unauthorized update, got: ${unauthorizedUpdateRes.status}`);
      }
    }

  } catch (error) {
    fail('Unexpected error during tests', error.message);
  }

  // ====== SUMMARY ======
  console.log('\n==========================================================');
  console.log('TEST SUMMARY');
  console.log('==========================================================');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  
  if (testResults.failed > 0) {
    console.log('\nFailed Tests:');
    testResults.errors.forEach(err => {
      console.log(`  - ${err.message}`);
      if (err.error) console.log(`    ${err.error}`);
    });
  }

  console.log('\n==========================================================\n');
  
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
