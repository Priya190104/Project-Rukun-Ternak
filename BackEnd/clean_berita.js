require('dotenv').config();
const db = require('./src/db');

(async () => {
  try {
    const del = await db.query('DELETE FROM berita');
    console.log('Deleted', del.rowCount, 'berita records');
    
    const cnt = await db.query('SELECT COUNT(*) as cnt FROM berita');
    console.log('Berita count now:', cnt.rows[0].cnt);
  } catch(e) {
    console.error('ERROR:', e.message);
  }
  process.exit(0);
})();
