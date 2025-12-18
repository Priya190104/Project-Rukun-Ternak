const http = require('http');

function testLogin(username, password) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      username: username,
      password: password
    });

    const options = {
      hostname: 'localhost',
      port: 4000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
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
    req.write(postData);
    req.end();
  });
}

async function testAllCredentials() {
  const credentials = [
    { username: 'admin', password: 'adminpass' },
    { username: 'kelompok1', password: 'kelompok1pass' },
    { username: 'kelompok2', password: 'kelompok2pass' }
  ];

  console.log('=== LOGIN TEST ===\n');

  for (const cred of credentials) {
    try {
      console.log(`Testing login: ${cred.username}...`);
      const res = await testLogin(cred.username, cred.password);
      
      if (res.status === 200 && res.body.success) {
        console.log(`✓ Login SUCCESS`);
        console.log(`  - Token: ${res.body.data?.token?.substring(0, 30)}...`);
        console.log(`  - User: ${res.body.data?.user?.username} (${res.body.data?.user?.role})`);
      } else {
        console.log(`✗ Login FAILED`);
        console.log(`  Status: ${res.status}`);
        console.log(`  Response:`, res.body);
      }
    } catch (error) {
      console.log(`✗ ERROR: ${error.message}`);
    }
    console.log();
  }
}

testAllCredentials().catch(console.error);
