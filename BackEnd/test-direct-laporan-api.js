const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

const TEST_PAYLOAD = {
  tanggal: new Date().toISOString().split('T')[0],
  jenis: 'Kelahiran',
  data: {
    id: 'TEST-001',
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

async function test() {
  try {
    console.log('Testing direct API call to create laporan...\n');
    console.log('Payload:', JSON.stringify(TEST_PAYLOAD, null, 2));
    
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTUsImtlbG9tcG9rX2lkIjoyNiwicm9sZSI6ImtlbG9tcG9rIiwiaWF0IjoxNzM1NjA3ODcwLCJleHAiOjE3MzYyMTI2NzB9.1rPTlNpqI8Z0ggE6GvEr0Zm_qT6bZBqrvDj4n5bYBls';
    
    const response = await axios.post(
      `${BASE_URL}/api/laporan`,
      TEST_PAYLOAD,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log('\n✅ Response:');
    console.log(`Status: ${response.status}`);
    console.log(`Message: ${response.data.message}`);
    console.log(`Laporan ID: ${response.data.data.id}`);

  } catch (error) {
    console.error('❌ Error:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Message: ${error.response.data?.message}`);
      console.error(`Full response:`, JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

test();
