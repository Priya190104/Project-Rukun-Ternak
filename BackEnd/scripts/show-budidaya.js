require('dotenv').config();
const db = require('./src/db');

async function showBudidayaStructure() {
  try {
    const res = await db.query('SELECT data FROM laporan WHERE jenis = $1 LIMIT 10', ['Budidaya']);
    console.log('All Budidaya records:');
    res.rows.forEach((row, i) => {
      console.log(`\n${i+1}. ${JSON.stringify(row.data)}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

showBudidayaStructure();
