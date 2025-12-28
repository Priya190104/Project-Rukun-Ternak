async function testFlow() {
  try {
    console.log('\n========== TEST BACKEND API FLOW ==========\n');

    // Step 1: Login
    console.log('1️⃣  LOGIN TEST');
    const loginRes = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'kelompok1', password: 'kelompok1pass' })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw { response: { status: loginRes.status, data: loginData } };
    
    console.log('✓ Login Success');
    const { token, user } = loginData.data;
    console.log('Token:', token.substring(0, 20) + '...');
    console.log('User:', JSON.stringify(user, null, 2));

    // Step 2: Call API Hewan Ternak
    console.log('\n2️⃣  API HEWAN TERNAK TEST');
    const hewanRes = await fetch('http://localhost:4000/api/hewan', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const hewanData = await hewanRes.json();
    if (!hewanRes.ok) throw { response: { status: hewanRes.status, data: hewanData } };
    
    console.log('✓ API Success');
    console.log('Response:', JSON.stringify(hewanData, null, 2));

    console.log('\n✅ ALL TESTS PASSED');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ ERROR:');
    console.error('Status:', err.response?.status);
    console.error('Message:', err.response?.data?.message || err.message);
    if (err.response?.data) {
      console.error('Response:', JSON.stringify(err.response.data, null, 2));
    }
    process.exit(1);
  }
}

testFlow();
