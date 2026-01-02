const db = require('./src/db');
const bcrypt = require('bcrypt');

async function verifyAdminPassword() {
  try {
    const { rows } = await db.query('SELECT password FROM users WHERE username = $1', ['admin']);
    
    if (rows.length === 0) {
      console.log('❌ Admin not found');
      process.exit(1);
    }

    const passwordHash = rows[0].password;
    const testPassword = 'admin123';

    console.log('\n=== VERIFYING ADMIN PASSWORD ===');
    console.log(`Testing password: "${testPassword}"`);

    const isMatch = await bcrypt.compare(testPassword, passwordHash);
    
    if (isMatch) {
      console.log('✓ PASSWORD VERIFIED - LOGIN SHOULD WORK NOW!');
      console.log('\nCredentials:');
      console.log('Username: admin');
      console.log('Password: admin123');
    } else {
      console.log('❌ Password still not matching');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}

verifyAdminPassword();
