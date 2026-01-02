const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'rukunternak',
  user: 'postgres',
  password: 'admin123'
});

async function check() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT id, username, password, full_name, role
      FROM users
      WHERE username = 'priya'
    `);
    
    if (result.rows.length === 0) {
      console.log('User priya not found');
      return;
    }

    const user = result.rows[0];
    console.log('User found:');
    console.log(`Username: ${user.username}`);
    console.log(`Full Name: ${user.full_name}`);
    console.log(`Role: ${user.role}`);
    console.log(`Password Hash (first 50 chars): ${user.password.substring(0, 50)}...`);

    // Try common passwords
    const commonPasswords = ['password', 'priya', 'priya123', '123456', 'Priya123!', 'Test123!', 'Admin123!'];
    
    console.log('\nTrying common passwords:');
    for (const pwd of commonPasswords) {
      try {
        const match = await bcrypt.compare(pwd, user.password);
        if (match) {
          console.log(`✅ MATCH FOUND: "${pwd}"`);
        }
      } catch (e) {
        // password doesn't match, continue
      }
    }

  } finally {
    await client.end();
  }
}

check();
