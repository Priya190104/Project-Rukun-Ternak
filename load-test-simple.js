#!/usr/bin/env node

const http = require('http');

const BASE_URL = 'http://localhost:4000';

const results = {
  totalRequests: 0,
  successRequests: 0,
  failedRequests: 0,
  responseTimes: [],
  endpoints: {},
  testToken: null,
};

function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve) => {
    const url = new URL(BASE_URL + path);
    const startTime = Date.now();
    
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const duration = Date.now() - startTime;
        results.responseTimes.push(duration);
        results.totalRequests++;
        
        if (res.statusCode >= 200 && res.statusCode < 400) {
          results.successRequests++;
        } else {
          results.failedRequests++;
        }

        // Track endpoint performance
        if (!results.endpoints[path]) {
          results.endpoints[path] = { count: 0, totalTime: 0, errors: 0 };
        }
        results.endpoints[path].count++;
        results.endpoints[path].totalTime += duration;
        if (res.statusCode >= 400) {
          results.endpoints[path].errors++;
        }

        resolve({ status: res.statusCode, body: body, duration: duration });
      });
    });

    req.on('error', (err) => {
      const duration = Date.now() - startTime;
      results.responseTimes.push(duration);
      results.totalRequests++;
      results.failedRequests++;
      
      if (!results.endpoints[path]) {
        results.endpoints[path] = { count: 0, totalTime: 0, errors: 0 };
      }
      results.endpoints[path].count++;
      results.endpoints[path].totalTime += duration;
      results.endpoints[path].errors++;
      
      resolve({ status: 0, body: '', duration: duration, error: err.message });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function login(username, password) {
  const res = await makeRequest('POST', '/api/auth/login', {
    username: username,
    password: password,
  });
  
  if (res.status === 200) {
    try {
      const body = JSON.parse(res.body);
      if (body.success && body.data.token) {
        return body.data.token;
      }
    } catch (e) {}
  }
  return null;
}

async function scenarioLoginDashboard(token) {
  // Get user info
  await makeRequest('GET', '/api/auth/me', null, token);
  
  // Get dashboard stats
  await makeRequest('GET', '/api/stats/dashboard/kelompok', null, token);
}

async function scenarioReadLaporan(token) {
  // Get laporan list
  await makeRequest('GET', '/api/laporan', null, token);
  
  // Get detail laporan
  const randomId = Math.floor(Math.random() * 10) + 1;
  await makeRequest('GET', `/api/laporan/${randomId}`, null, token);
}

async function scenarioSubmitLaporan(token) {
  const laporanData = {
    jenis: 'Kelahiran',
    tanggal: new Date().toISOString().split('T')[0],
    indukan: 'Betina-001',
    pejantan: 'Jantan-001',
    anak: 1,
    keterangan: 'Kelahiran normal',
  };
  
  await makeRequest('POST', '/api/laporan', laporanData, token);
}

async function runScenario(token) {
  const rand = Math.random();
  
  if (rand < 0.4) {
    await scenarioLoginDashboard(token);
  } else if (rand < 0.8) {
    await scenarioReadLaporan(token);
  } else {
    await scenarioSubmitLaporan(token);
  }
}

async function runLoadTest() {
  console.log('🚀 Starting Load Test - Rukun Ternak API');
  console.log('=====================================\n');
  
  // Get initial token
  console.log('⏳ Initializing authentication...');
  results.testToken = await login('admin', 'admin');
  
  if (!results.testToken) {
    console.error('❌ Failed to authenticate - check credentials');
    process.exit(1);
  }
  
  console.log('✅ Authentication successful\n');
  
  // Run simple sequential test
  await runTestSequence();
  
  printResults();
}

async function runTestSequence() {
  console.log('⏱️ Running 50 requests...');
  
  for (let i = 0; i < 50; i++) {
    await runScenario(results.testToken);
    if ((i + 1) % 10 === 0) {
      process.stdout.write(`${i + 1}. `);
    }
  }
  console.log('\n✓ Completed\n');
}

function printResults() {
  console.log('\n');
  console.log('📊 LOAD TEST RESULTS');
  console.log('=====================\n');
  
  const avgResponseTime = results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length;
  const sortedTimes = [...results.responseTimes].sort((a, b) => a - b);
  const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
  const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];
  const maxResponseTime = Math.max(...results.responseTimes);
  const minResponseTime = Math.min(...results.responseTimes);
  
  const errorRate = (results.failedRequests / results.totalRequests * 100).toFixed(2);
  const successRate = (results.successRequests / results.totalRequests * 100).toFixed(2);
  
  console.log(`Total Requests:        ${results.totalRequests}`);
  console.log(`Success:               ${results.successRequests} (${successRate}%)`);
  console.log(`Failed:                ${results.failedRequests} (${errorRate}%)`);
  console.log(`\nResponse Time:`);
  console.log(`  Min:                 ${minResponseTime}ms`);
  console.log(`  Max:                 ${maxResponseTime}ms`);
  console.log(`  Avg:                 ${avgResponseTime.toFixed(2)}ms`);
  console.log(`  P95:                 ${p95}ms`);
  console.log(`  P99:                 ${p99}ms`);
  
  console.log(`\nThroughput:`);
  console.log(`  Total Tests:         ${results.totalRequests} requests`);
  
  console.log(`\n\nEndpoint Performance:`);
  console.log('---------------------');
  
  Object.entries(results.endpoints)
    .sort((a, b) => b[1].totalTime - a[1].totalTime)
    .forEach(([path, data]) => {
      const avgTime = (data.totalTime / data.count).toFixed(2);
      console.log(`${path.padEnd(30)} | Avg: ${avgTime}ms | Count: ${data.count} | Errors: ${data.errors}`);
    });
  
  console.log('\n\n🎯 THRESHOLD VALIDATION:');
  console.log('------------------------');
  console.log(`Avg Response Time < 1500ms: ${avgResponseTime < 1500 ? '✅ PASS' : '❌ FAIL'} (${avgResponseTime.toFixed(2)}ms)`);
  console.log(`Error Rate < 1%:            ${errorRate < 1 ? '✅ PASS' : '❌ FAIL'} (${errorRate}%)`);
  const failRate = (results.failedRequests / results.totalRequests * 100).toFixed(2);
  console.log(`Request Failed < 2%:        ${failRate < 2 ? '✅ PASS' : '❌ FAIL'} (${failRate}%)`);
  
  console.log('\n\n📈 BOTTLENECK ANALYSIS:');
  console.log('----------------------');
  
  const slowestEndpoint = Object.entries(results.endpoints)
    .sort((a, b) => (b[1].totalTime / b[1].count) - (a[1].totalTime / a[1].count))[0];
  
  if (slowestEndpoint) {
    const slowestAvg = (slowestEndpoint[1].totalTime / slowestEndpoint[1].count).toFixed(2);
    console.log(`Slowest Endpoint: ${slowestEndpoint[0]} (${slowestAvg}ms avg)`);
  }
  
  if (avgResponseTime > 1500) {
    if (errorRate > 1) {
      console.log('⚠️ Bottleneck: HIGH ERROR RATE - Backend/Database issue');
    } else if (p99 > 3000) {
      console.log('⚠️ Bottleneck: HIGH P99 LATENCY - Database query performance');
    } else {
      console.log('⚠️ Bottleneck: Backend processing time or resource constraint');
    }
  } else {
    console.log('✅ No significant bottlenecks detected');
  }
}

runLoadTest().catch(console.error);
