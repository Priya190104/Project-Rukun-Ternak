require('dotenv').config();
const db = require('./src/db');

async function checkDataStructure() {
  try {
    console.log('Checking Laporan data structure...\n');

    // Get all jenis
    const jenisRes = await db.query('SELECT DISTINCT jenis FROM laporan ORDER BY jenis');
    console.log('✅ Available Jenis:');
    jenisRes.rows.forEach(r => console.log(`   - ${r.jenis}`));

    // Sample each jenis
    const jenisList = jenisRes.rows.map(r => r.jenis);
    
    for (const jenis of jenisList) {
      console.log(`\n📋 Sample data for jenis: ${jenis}`);
      const sampleRes = await db.query(
        'SELECT data FROM laporan WHERE jenis = $1 LIMIT 1',
        [jenis]
      );
      if (sampleRes.rows[0]) {
        console.log(JSON.stringify(sampleRes.rows[0].data, null, 2));
      }
    }

    console.log('\n✅ Structure check complete');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkDataStructure();
