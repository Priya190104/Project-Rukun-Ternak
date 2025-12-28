require('dotenv').config();
const db = require('./src/db');

(async () => {
  try {
    // Test 1: Check table
    console.log('\n=== Test 1: Check berita table ===');
    const tbl = await db.query("SELECT * FROM information_schema.tables WHERE table_name = 'berita'");
    console.log('Table exists:', tbl.rows.length > 0);
    
    // Test 2: Check columns
    console.log('\n=== Test 2: Check columns ===');
    const cols = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'berita' ORDER BY ordinal_position");
    cols.rows.forEach(c => console.log('  -', c.column_name));
    
    // Test 3: Try INSERT
    console.log('\n=== Test 3: Try INSERT ===');
    const ins = await db.query('INSERT INTO berita (caption, image_url, created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) RETURNING *', ['Test caption', '/uploads/test.jpg']);
    console.log('INSERT success:', ins.rows[0].id);
    
    // Test 4: Try SELECT
    console.log('\n=== Test 4: Try SELECT ===');
    const sel = await db.query('SELECT id, caption, image_url AS "imageUrl" FROM berita ORDER BY created_at DESC');
    console.log('SELECT count:', sel.rows.length);
    console.log('Sample:', sel.rows[0]);
    
    console.log('\n✅ All tests passed!');
  } catch(e) {
    console.error('\n❌ ERROR:', e.message);
  }
  process.exit(0);
})();
