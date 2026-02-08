#!/usr/bin/env node

/**
 * TEST SCRIPT: Cache Implementation Verification
 * Tests all cache-related functionality
 */

const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:4000';
const ADMIN_TOKEN = 'test-token'; // Will test with dummy token

/**
 * Make HTTP request
 */
function makeRequest(method, path, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data ? JSON.parse(data) : null
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * Run tests
 */
async function runTests() {
  console.log('═══════════════════════════════════════════════════');
  console.log('🧪 CACHE IMPLEMENTATION TESTS');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    // Test 1: Cache status endpoint (no auth - should fail)
    console.log('Test 1: Cache Status (without auth)');
    const test1 = await makeRequest('GET', '/api/cache/status');
    console.log(`  Status: ${test1.status}`);
    console.log(`  Message: ${test1.body?.message || 'No response'}\n`);

    // Test 2: Cache status endpoint (with invalid token - should fail)
    console.log('Test 2: Cache Status (with invalid token)');
    const test2 = await makeRequest('GET', '/api/cache/status', 'invalid-token');
    console.log(`  Status: ${test2.status}`);
    console.log(`  Message: ${test2.body?.message || 'No response'}\n`);

    // Test 3: Cache queries endpoint
    console.log('Test 3: Cache Queries (without auth)');
    const test3 = await makeRequest('GET', '/api/cache/queries');
    console.log(`  Status: ${test3.status}`);
    console.log(`  Message: ${test3.body?.message || 'No response'}\n`);

    // Test 4: Users list with pagination
    console.log('Test 4: Users List with Pagination');
    const test4 = await makeRequest('GET', '/api/users?page=1&limit=10');
    console.log(`  Status: ${test4.status}`);
    if (test4.body?.success) {
      console.log(`  ✓ Found ${test4.body.data?.length || 0} users`);
      console.log(`  ✓ Pagination: page=${test4.body.pagination?.page}, total=${test4.body.pagination?.total}`);
    } else {
      console.log(`  Message: ${test4.body?.message}`);
    }
    console.log();

    // Test 5: Health check
    console.log('Test 5: Health Check');
    const test5 = await makeRequest('GET', '/api/health');
    console.log(`  Status: ${test5.status}`);
    console.log(`  Message: ${test5.body?.message || test5.body?.data || 'No response'}\n`);

    console.log('═══════════════════════════════════════════════════');
    console.log('✅ Tests completed');
    console.log('═══════════════════════════════════════════════════');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

// Run tests
runTests();
