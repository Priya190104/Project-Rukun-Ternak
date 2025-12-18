const http = require('http');

function testEndpoint(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: data
          });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(5000);
    req.end();
  });
}

async function runTests() {
  try {
    console.log('=== BACKEND API HEALTH TEST ===\n');

    // Test health
    console.log('1. Testing /api/health...');
    let res = await testEndpoint('/api/health');
    console.log(`   Status: ${res.status}`);
    console.log(`   Response:`, res.body);

    // Test get all berita
    console.log('\n2. Testing GET /api/berita...');
    res = await testEndpoint('/api/berita');
    console.log(`   Status: ${res.status}`);
    if (res.body.data) {
      console.log(`   Berita count: ${res.body.data.length}`);
      if (res.body.data.length > 0) {
        console.log(`   First berita:`, {
          id: res.body.data[0].id,
          caption: res.body.data[0].caption?.substring(0, 50),
          publishedAt: res.body.data[0].publishedAt,
          createdAt: res.body.data[0].createdAt
        });
      }
    } else {
      console.log(`   Response:`, res.body);
    }

    console.log('\n✓ BACKEND IS OPERATIONAL');

  } catch (error) {
    console.error('\n✗ ERROR:', error.message);
    process.exit(1);
  }
}

runTests();
