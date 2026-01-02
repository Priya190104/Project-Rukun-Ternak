const axios = require('axios');

async function check() {
  try {
    const res = await axios.get('http://localhost:4000/api/health');
    console.log('Server responding:', res.status);
    console.log('Data:', res.data);
  } catch (e) {
    console.error('Server error:', e.message);
  }
}

check();
