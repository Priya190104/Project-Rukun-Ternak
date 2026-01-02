#!/usr/bin/env node

/**
 * Setup admin user for testing
 */

require('dotenv').config();
const db = require('./src/db');
const bcrypt = require('bcrypt');

async function setupAdmin() {
  try {
    const password = 'testpass123';
    const hash = await bcrypt.hash(password, 10);
    
    console.log('Updating admin password...');
    const result = await db.query(
      'UPDATE users SET password = $1 WHERE username = $2 RETURNING id, username',
      [hash, 'admin']
    );
    
    if (result.rows[0]) {
      console.log('✅ Admin password updated successfully');
      console.log('   Username: admin');
      console.log('   Password: testpass123');
      process.exit(0);
    } else {
      console.log('❌ Admin user not found');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupAdmin();
