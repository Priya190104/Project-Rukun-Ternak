const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function test() {
  try {
    // Step 1: Login to get token
    console.log('🔹 Logging in...');
    const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'priya',
      password: '123456'
    });
    const token = loginRes.data.data.token;
    console.log(`✅ Got token: ${token.substring(0, 30)}...`);

    // Step 2: Create laporan
    const payload = {
      tanggal: new Date().toISOString().split('T')[0],
      jenis: 'Kelahiran',
      data: {
        id: 'KELAHIRAN-TEST-001',
        jenis_kelamin: 'JANTAN',
        jenis_kelamin_anak: 'jantan',
        warna: 'Putih',
        ras: 'Domba Test',
        induk: 'INDUK-001',
        induk_id: 'INDUK-001',
        pejantan: 'PEJ-001',
        pejantan_id: 'PEJ-001',
        bobot: 2.5,
        jumlah_anak: 1,
        tanggal_kelahiran: new Date().toISOString().split('T')[0]
      }
    };

    console.log('\n🔹 Creating laporan kelahiran...');
    const res = await axios.post(`${BASE_URL}/api/laporan`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const laporanId = res.data.data.id;
    console.log(`✅ Laporan created: ID ${laporanId}`);

    // Step 3: Check hewan ternak
    console.log('\n🔹 Fetching hewan ternak...');
    const hewanRes = await axios.get(`${BASE_URL}/api/hewan`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const newHewan = hewanRes.data.data.find(h => h.id_hewan === 'KELAHIRAN-TEST-001');
    
    if (newHewan) {
      console.log(`✅ FOUND HEWAN:`);
      console.log(`   ID Database: ${newHewan.id}`);
      console.log(`   ID Hewan: ${newHewan.id_hewan}`);
      console.log(`   Ras: ${newHewan.ras}`);
      console.log(`   Source: ${newHewan.source}`);
    } else {
      console.log('❌ HEWAN NOT FOUND');
      console.log('\nAll hewan dari Kelahiran:');
      hewanRes.data.data
        .filter(h => h.source === 'Kelahiran')
        .slice(0, 3)
        .forEach(h => {
          console.log(`   - ID DB: ${h.id}, ID Hewan: ${h.id_hewan || '(NULL)'}, Ras: ${h.ras}`);
        });
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.log('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

test();
