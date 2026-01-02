const db = require('./src/db');
const bcrypt = require('bcrypt');

async function resetAdminPassword() {
  try {
    // New password untuk admin
    const newPassword = 'admin123';
    console.log('\n=== RESETTING ADMIN PASSWORD ===');
    console.log(`New password: "${newPassword}"`);

    // Hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log(`Password hash: ${hashedPassword}`);

    // Update database
    const { rows } = await db.query(
      'UPDATE users SET password = $1 WHERE username = $2 RETURNING id, username, role',
      [hashedPassword, 'admin']
    );

    if (rows.length === 0) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }

    console.log(`\n✓ Admin password updated successfully!`);
    console.log(`Username: admin`);
    console.log(`New password: ${newPassword}`);
    console.log(`\nNow try login with these credentials.`);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

resetAdminPassword();
