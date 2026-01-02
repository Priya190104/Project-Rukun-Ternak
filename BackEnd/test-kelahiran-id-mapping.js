/**
 * Test: Kelahiran ID Mapping
 * Purpose: Verify that ID Hewan from form is saved to id_hewan field in database
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

// Test user credentials
const TEST_USER = {
  username: 'priya',
  password: '123456'
};

// Test data
const TEST_KELAHIRAN = {
  tanggal: new Date().toISOString().split('T')[0],
  jenis: 'Kelahiran',
  data: {
    id: 'LMN-010',  // ID Bisnis untuk hewan baru dari kelahiran
    jenis_kelamin: 'JANTAN',
    jenis_kelamin_anak: 'jantan',
    warna: 'Putih',
    ras: 'Domba Lokal',
    induk: 'IND-001',
    induk_id: 'IND-001',
    pejantan: 'PEJ-001',
    pejantan_id: 'PEJ-001',
    bobot: 2.5,
    jumlah_anak: 1,
    tanggal_kelahiran: new Date().toISOString().split('T')[0]
  }
};

async function test() {
  try {
    console.log('🔹 TEST: Kelahiran ID Mapping');
    console.log('================================\n');

    // Step 1: Login
    console.log('1️⃣  Logging in...');
    console.log(`   URL: ${BASE_URL}/api/auth/login`);
    console.log(`   Username: ${TEST_USER.username}`);
    const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: TEST_USER.username,
      password: TEST_USER.password
    });
    const token = loginRes.data.data.token;
    const userId = loginRes.data.data.user.id;
    const kelompokId = loginRes.data.data.user.kelompok_id;
    console.log(`   ✅ Logged in: User ${userId}, Kelompok ${kelompokId}`);
    console.log(`   🔑 Token: ${token.substring(0, 20)}...`);

    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // Step 2: Create laporan kelahiran
    console.log('\n2️⃣  Creating Kelahiran laporan with ID Hewan...');
    console.log(`   📝 Data: ID=${TEST_KELAHIRAN.data.id}, Ras=${TEST_KELAHIRAN.data.ras}, Bobot=${TEST_KELAHIRAN.data.bobot}kg`);
    const laporanRes = await axios.post(`${BASE_URL}/api/laporan`, TEST_KELAHIRAN, config);
    const laporanId = laporanRes.data.data.id;
    console.log(`   ✅ Laporan created: ID ${laporanId}`);

    // Step 3: Get hewan ternak list
    console.log('\n3️⃣  Fetching hewan ternak list...');
    const hewanRes = await axios.get(`${BASE_URL}/api/hewan`, config);
    const hewanList = hewanRes.data.data;
    console.log(`   ✅ Found ${hewanList.length} hewan ternak records`);

    // Step 4: Find the hewan we just created
    console.log('\n4️⃣  Searching for newly created hewan...');
    const newHewan = hewanList.find(h => 
      h.source === 'Kelahiran' && 
      (h.id_hewan === TEST_KELAHIRAN.data.id || 
       h.id_hewan?.startsWith(TEST_KELAHIRAN.data.id))
    );

    if (newHewan) {
      console.log(`   ✅ FOUND HEWAN:`);
      console.log(`      ID Database: ${newHewan.id}`);
      console.log(`      ID Hewan: ${newHewan.id_hewan || '(NULL)'}`);
      console.log(`      Jenis Kelamin: ${newHewan.jenis_kelamin}`);
      console.log(`      Ras: ${newHewan.ras}`);
      console.log(`      Bobot: ${newHewan.bobot} kg`);
      console.log(`      Source: ${newHewan.source}`);
      console.log(`      Status: ${newHewan.status}`);

      // Verify ID Hewan is correct
      if (newHewan.id_hewan === TEST_KELAHIRAN.data.id) {
        console.log(`   ✅ ✅ ID MAPPING CORRECT: id_hewan = ${TEST_KELAHIRAN.data.id}`);
      } else if (newHewan.id_hewan?.startsWith(TEST_KELAHIRAN.data.id)) {
        console.log(`   ✅ ✅ ID MAPPING CORRECT (with suffix): id_hewan = ${newHewan.id_hewan}`);
      } else {
        console.log(`   ❌ ID MAPPING FAILED: Expected "${TEST_KELAHIRAN.data.id}", got "${newHewan.id_hewan || '(NULL)'}"`);
      }
    } else {
      console.log(`   ❌ HEWAN NOT FOUND`);
      console.log(`   All hewan from Kelahiran:`);
      hewanList.filter(h => h.source === 'Kelahiran').forEach(h => {
        console.log(`      - ID Database: ${h.id}, ID Hewan: ${h.id_hewan || '(NULL)'}, Ras: ${h.ras}`);
      });
    }

    console.log('\n================================');
    console.log('✅ Test Complete');

  } catch (error) {
    console.error('❌ Error:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data?.message || error.message}`);
      console.error(`   Data:`, error.response.data);
    } else if (error.request) {
      console.error(`   No response received`);
      console.error(`   Request: ${error.request}`);
    } else {
      console.error(`   ${error.message}`);
      console.error(`   Stack:`, error.stack);
    }
    process.exit(1);
  }
}

test();
