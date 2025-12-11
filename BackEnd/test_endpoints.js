require('dotenv').config();
const http = require('http');

const port = 4000;
const baseUrl = `http://localhost:${port}`;

async function testHealth() {
  return new Promise((resolve, reject) => {
    const url = `${baseUrl}/api/health`;
    console.log(`\n[TEST] GET ${url}`);
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        console.log(`[RESULT] Status: ${res.statusCode}`);
        console.log(`[RESULT] Body: ${data}`);
        resolve();
      });
    }).on('error', (e) => {
      console.error(`[ERROR] ${e.message}`);
      reject(e);
    });
  });
}

async function testLogin() {
  return new Promise((resolve, reject) => {
    const url = `${baseUrl}/api/auth/login`;
    console.log(`\n[TEST] POST ${url}`);
    
    const payload = JSON.stringify({ username: 'admin', password: 'adminpass' });
    const req = http.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        console.log(`[RESULT] Status: ${res.statusCode}`);
        console.log(`[RESULT] Body: ${data.substring(0, 200)}...`);
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error(`[ERROR] ${e.message}`);
      reject(e);
    });

    req.write(payload);
    req.end();
  });
}

async function runTests() {
  try {
    await testHealth();
    await testLogin();
    console.log('\n[SUMMARY] All tests passed');
    process.exit(0);
  } catch (e) {
    console.error('\n[SUMMARY] Tests failed');
    process.exit(1);
  }
}

// Wait for server to start
setTimeout(runTests, 1000);
