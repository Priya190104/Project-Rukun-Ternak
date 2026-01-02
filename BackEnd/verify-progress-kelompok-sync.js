/**
 * VERIFICATION: Progress Kelompok - Hewan Ternak Synchronization
 * Memastikan data di Progress Kelompok sinkron dengan Menu Hewan Ternak
 */

const { Pool } = require('pg');
const http = require('http');

async function verify() {
  console.log('\n' + '='.repeat(80));
  console.log('VERIFICATION: Progress Kelompok Data Alignment');
  console.log('='.repeat(80) + '\n');

  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'rukunternak',
    user: 'postgres',
    password: 'admin123'
  });

  try {
    // Get latest kelompok dengan hewan
    const kelResult = await pool.query(`
      SELECT k.id, k.name, k.jumlah_kandang
      FROM kelompok k
      LEFT JOIN hewan_ternak h ON h.kelompok_id = k.id
      WHERE h.id IS NOT NULL
      GROUP BY k.id, k.name, k.jumlah_kandang
      LIMIT 1
    `);

    if (kelResult.rows.length === 0) {
      console.log('❌ No kelompok dengan hewan ternak ditemukan');
      return;
    }

    const kelompok = kelResult.rows[0];
    console.log(`✅ Kelompok: ${kelompok.name} (ID: ${kelompok.id})`);
    console.log(`   Kandang Penyaluran: ${kelompok.jumlah_kandang}\n`);

    // Get hewan counts dari database directly
    const hewanResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN jenis_kelamin = 'JANTAN' THEN 1 END) as jantan,
        COUNT(CASE WHEN jenis_kelamin = 'BETINA' THEN 1 END) as betina
      FROM hewan_ternak
      WHERE kelompok_id = $1
    `, [kelompok.id]);

    const dbHewan = hewanResult.rows[0];
    console.log('📊 Database Hewan Ternak:');
    console.log(`   Total: ${dbHewan.total}`);
    console.log(`   Jantan: ${dbHewan.jantan}`);
    console.log(`   Betina: ${dbHewan.betina}\n`);

    // Get API response
    console.log('📤 Calling API /api/stats/dashboard/kelompok...\n');

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
            kelompok_id: kelompok.id,
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

    console.log('📋 API Response Data:\n');

    // Kandang
    console.log('1️⃣  KANDANG:');
    const kandangKelompok = apiData.penyaluran?.jumlahKandang || 0;
    console.log(`   Kandang Kelompok (Penyaluran): ${kandangKelompok}`);
    console.log(`   Kandang Anggota: ${apiData.kandang?.anggota || 0}\n`);

    // Populasi Hewan
    console.log('2️⃣  POPULASI HEWAN TERNAK:');
    const apiHewan = apiData.populasiHewan;
    console.log(`   Total: ${apiHewan?.total || 0}`);
    console.log(`   Jantan: ${apiHewan?.jantan || 0}`);
    console.log(`   Betina: ${apiHewan?.betina || 0}\n`);

    // Verification
    console.log('✅ VERIFICATION RESULTS:\n');

    const totalMatch = apiHewan?.total == dbHewan.total;
    const jantanMatch = apiHewan?.jantan == dbHewan.jantan;
    const betinaMatch = apiHewan?.betina == dbHewan.betina;
    const kandangMatch = kandangKelompok == kelompok.jumlah_kandang;

    console.log(`Populasi Total: ${totalMatch ? '✅' : '❌'} (API: ${apiHewan?.total}, DB: ${dbHewan.total})`);
    console.log(`Populasi Jantan: ${jantanMatch ? '✅' : '❌'} (API: ${apiHewan?.jantan}, DB: ${dbHewan.jantan})`);
    console.log(`Populasi Betina: ${betinaMatch ? '✅' : '❌'} (API: ${apiHewan?.betina}, DB: ${dbHewan.betina})`);
    console.log(`Kandang Kelompok: ${kandangMatch ? '✅' : '❌'} (API: ${kandangKelompok}, DB: ${kelompok.jumlah_kandang})`);

    const allPass = totalMatch && jantanMatch && betinaMatch && kandangMatch;

    console.log('\n' + '='.repeat(80));
    if (allPass) {
      console.log('✅✅✅ ALL CHECKS PASSED - DATA SYNCHRONIZED!');
    } else {
      console.log('❌ Some checks failed - Data mismatch detected!');
    }
    console.log('='.repeat(80) + '\n');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

verify();
