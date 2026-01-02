const db = require('./src/db');
const bcrypt = require('bcrypt');

async function testAdminLogin() {
  try {
    // Get admin user
    const { rows } = await db.query('SELECT id, username, password, full_name, role FROM users WHERE username = $1', ['admin']);
    
    if (rows.length === 0) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }

    const user = rows[0];
    console.log('\n=== TESTING ADMIN LOGIN ===');
    console.log(`Username: ${user.username}`);
    console.log(`Full Name: ${user.full_name}`);
    console.log(`Role: ${user.role}`);
    console.log(`Password Hash Length: ${user.password ? user.password.length : 'NULL'}`);

    // Test password
    const testPassword = 'admin'; // Try default password
    console.log(`\nTesting password: "${testPassword}"`);
    
    if (!user.password) {
      console.log('❌ Password hash is NULL in database!');
      console.log('⚠️  This is the problem - admin password not set!');
      process.exit(1);
    }

    const isMatch = await bcrypt.compare(testPassword, user.password);
    console.log(`Password match: ${isMatch ? '✓ YES' : '✗ NO'}`);

    if (!isMatch) {
      console.log('\n❌ DEFAULT PASSWORD NOT WORKING');
      console.log('Need to reset admin password or check what password was set');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}

testAdminLogin();
