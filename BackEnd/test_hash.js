const bcrypt = require('bcrypt');

async function test() {
  const password = 'adminpass';
  const hash = await bcrypt.hash(password, 10);
  console.log('Hash:', hash);
  
  const match = await bcrypt.compare(password, hash);
  console.log('Match:', match);
  
  // Test with hash from database
  const db = require('./src/db');
  const { rows } = await db.query(`SELECT password FROM users WHERE username='admin'`);
  if (rows[0]) {
    const dbMatch = await bcrypt.compare(password, rows[0].password);
    console.log('DB Match:', dbMatch);
  }
  process.exit(0);
}

test().catch(e => {
  console.error(e);
  process.exit(1);
});
