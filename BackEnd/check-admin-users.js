const db = require('./src/db');

async function checkAdmin() {
  try {
    const { rows } = await db.query('SELECT id, username, full_name, role FROM users WHERE role = $1 ORDER BY id', ['admin']);
    console.log('\n=== ADMIN USERS IN DATABASE ===');
    if (rows.length === 0) {
      console.log('❌ NO ADMIN USERS FOUND!');
    } else {
      rows.forEach(user => {
        console.log(`✓ ID: ${user.id}, Username: ${user.username}, Name: ${user.full_name}, Role: ${user.role}`);
      });
    }
    console.log(`\nTotal Admin Users: ${rows.length}`);
  } catch (err) {
    console.error('Database Error:', err.message);
  } finally {
    process.exit(0);
  }
}

checkAdmin();
