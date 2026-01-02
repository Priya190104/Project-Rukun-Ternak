const axios = require('axios');

// Simulating authenticated request untuk test API
async function testAPIs() {
  try {
    console.log('\n=== TEST API ENDPOINTS ===\n');

    // Test 1: GET pejantan candidates dengan auth header simulasi
    console.log('Testing: GET /api/hewan/candidates/pejantan');
    console.log('(Note: akan fail tanpa token, tapi kita lihat error apa)');
    
    try {
      const pejantanRes = await axios.get('http://localhost:4000/api/hewan/candidates/pejantan', {
        headers: {
          'Authorization': 'Bearer fake-token-for-test'
        }
      });
      console.log('✓ Response:', pejantanRes.data);
    } catch (err) {
      console.log('✗ Error Status:', err.response?.status);
      console.log('✗ Error Message:', err.response?.data?.message);
      console.log('✗ Full Error:', err.message);
    }

    console.log('\n---\n');

    // Test 2: GET induk candidates
    console.log('Testing: GET /api/hewan/candidates/induk');
    
    try {
      const indukRes = await axios.get('http://localhost:4000/api/hewan/candidates/induk', {
        headers: {
          'Authorization': 'Bearer fake-token-for-test'
        }
      });
      console.log('✓ Response:', indukRes.data);
    } catch (err) {
      console.log('✗ Error Status:', err.response?.status);
      console.log('✗ Error Message:', err.response?.data?.message);
      console.log('✗ Full Error:', err.message);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAPIs();
