const db = require('./src/db');

async function checkColumns() {
  try {
    const result = await db.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'kelompok' 
      ORDER BY column_name
    `);
    console.log('Columns in kelompok table:');
    result.rows.forEach(r => console.log('  -', r.column_name));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    process.exit(0);
  }
}

checkColumns();
