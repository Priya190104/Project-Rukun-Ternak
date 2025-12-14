require('dotenv').config();
const db = require('./src/db');

async function fixAdminRole() {
  try {
    console.log('Fixing admin user role from "pending" to "admin"...');
    
    // First, check current admin user
    const checkResult = await db.query('SELECT id, username, role FROM users WHERE username=$1', ['admin']);
    if (checkResult.rows.length === 0) {
      console.error('ERROR: Admin user not found!');
      process.exit(1);
    }
    
    const adminUser = checkResult.rows[0];
    console.log(`Current admin user: id=${adminUser.id}, username=${adminUser.username}, role="${adminUser.role}"`);
    
    // Update role to 'admin'
    const updateResult = await db.query(
      'UPDATE users SET role=$1 WHERE id=$2 RETURNING id, username, role',
      ['admin', adminUser.id]
    );
    
    if (updateResult.rows.length === 0) {
      console.error('ERROR: Failed to update admin role');
      process.exit(1);
    }
    
    const updatedUser = updateResult.rows[0];
    console.log(`✓ Admin role fixed: id=${updatedUser.id}, username=${updatedUser.username}, role="${updatedUser.role}"`);
    console.log('Admin can now log in successfully!');
    
    process.exit(0);
  } catch (err) {
    console.error('Error fixing admin role:', err.message);
    process.exit(1);
  }
}

fixAdminRole();
