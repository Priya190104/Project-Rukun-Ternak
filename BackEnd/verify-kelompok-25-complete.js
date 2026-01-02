/**
 * VERIFICATION: Test dengan Kelompok 25 (data lengkap)
 */

const { Pool } = require('pg');
const http = require('http');

async function verify() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'rukunternak',
    user: 'postgres',
    password: 'admin123'
  });

  try {
    const kelompokId = 25;

    // Get hewan counts dari database directly
    const hewanResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN jenis_kelamin = 'JANTAN' THEN 1 END) as jantan,
        COUNT(CASE WHEN jenis_kelamin = 'BETINA' THEN 1 END) as betina
      FROM hewan_ternak
      WHERE kelompok_id = $1
    `, [kelompokId]);

    const dbHewan = hewanResult.rows[0];

    // Get kandang dari kelompok table
    const kandangResult = await pool.query(
      `SELECT jumlah_kandang FROM kelompok WHERE id = $1`,
      [kelompokId]
    );
    const dbKandang = kandangResult.rows[0]?.jumlah_kandang || 0;

    console.log('\n' + '='.repeat(80));
    console.log('VERIFICATION: Kelompok 25 - Complete Data Alignment');
    console.log('='.repeat(80) + '\n');

    console.log('📊 Database Data:');
    console.log(`   Kandang Penyaluran: ${dbKandang}`);
    console.log(`   Hewan Total: ${dbHewan.total}, Jantan: ${dbHewan.jantan}, Betina: ${dbHewan.betina}\n`);

    // Get API response
    console.log('📤 Calling API...\n');

    const apiData = await new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: 4000,
        path: '/api/stats/dashboard/kelompok',
        method: 'GET',
        headers: {
          'X-Test-User': Buffer.from(JSON.stringify({
            id: 1,
            username: 'kelompok_test',
            full_name: 'Test',
            role: 'kelompok',
            kelompok_id: kelompokId,
            kelompok: null
          })).toString('base64')
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            resolve(response.data);
          } catch (e) {
            resolve(null);
          }
        });
      });

      req.on('error', () => resolve(null));
      req.end();
    });

    if (!apiData) {
      console.log('❌ Failed to get API response');
      return;
    }

    console.log('📋 API Response:\n');
    console.log('1. KANDANG (Card Kandang):');
    const apiKandang = apiData.penyaluran?.jumlahKandang || 0;
    console.log(`   Kandang Kelompok (Penyaluran): ${apiKandang}`);
    console.log(`   Expected (DB): ${dbKandang}`);
    console.log(`   Match: ${apiKandang === dbKandang ? '✅' : '❌'}\n`);

    console.log('2. POPULASI HEWAN (Card Populasi):');
    const apiHewan = apiData.populasiHewan;
    const apiTotal = parseInt(apiHewan?.total) || 0;
    const apiJantan = parseInt(apiHewan?.jantan) || 0;
    const apiBetina = parseInt(apiHewan?.betina) || 0;
    
    console.log(`   Total: ${apiTotal} (expected: ${dbHewan.total}) - ${apiTotal == dbHewan.total ? '✅' : '❌'}`);
    console.log(`   Jantan: ${apiJantan} (expected: ${dbHewan.jantan}) - ${apiJantan == dbHewan.jantan ? '✅' : '❌'}`);
    console.log(`   Betina: ${apiBetina} (expected: ${dbHewan.betina}) - ${apiBetina == dbHewan.betina ? '✅' : '❌'}\n`);

    const kandangOk = apiKandang === dbKandang;
    const totalOk = apiTotal == dbHewan.total;
    const jantanOk = apiJantan == dbHewan.jantan;
    const betinaOk = apiBetina == dbHewan.betina;

    console.log('='.repeat(80));
    if (kandangOk && totalOk && jantanOk && betinaOk) {
      console.log('✅✅✅ ALL DATA ALIGNED CORRECTLY!');
      console.log('\nSUMMARY:');
      console.log(`- Populasi Hewan = hewan_ternak table (COUNT all)`);
      console.log(`- Kandang Kelompok = penyaluran.jumlahKandang`);
      console.log(`- Kandang Anggota = total kandang - kandang penyaluran`);
    } else {
      console.log('❌ Data mismatch detected');
    }
    console.log('='.repeat(80) + '\n');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

verify();
