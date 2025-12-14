require('dotenv').config();
const db = require('./src/db');

(async () => {
  try {
    const r = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'berita'");
    if(r.rows.length === 0) {
      console.log('❌ Berita table does not exist!');
    } else {
      console.log('✅ Berita table exists with columns:');
      r.rows.forEach(c => console.log(`  - ${c.column_name}: ${c.data_type}`));
    }
    
    const cnt = await db.query("SELECT COUNT(*) as cnt FROM berita");
    console.log(`\nBerita records: ${cnt.rows[0].cnt}`);
  } catch(e) {
    console.error('ERROR:', e.message);
  }
  process.exit(0);
})();
