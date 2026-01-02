#!/usr/bin/env node

require('dotenv').config();
const db = require('./src/db');
const bcrypt = require('bcrypt');

async function createAdminUser() {
  try {
    const username = 'admin';
    const password = 'admin123';
    const fullName = 'Administrator';

    console.log(`Creating admin user: ${username}`);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const res = await db.query(
      `INSERT INTO users (username, password, full_name, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, username, role`,
      [username, hashedPassword, fullName, 'admin']
    );

    if (res.rows.length > 0) {
      const user = res.rows[0];
      console.log(`\n✓ Admin user created successfully:`);
      console.log(`  Username: ${user.username}`);
      console.log(`  Role: ${user.role}`);
      console.log(`\nYou can now login with:`);
      console.log(`  Username: ${username}`);
      console.log(`  Password: ${password}\n`);
    } else {
      console.log('Failed to create admin user');
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (error.message.includes('unique')) {
      console.log('Admin user already exists');
    }
  } finally {
    db.end();
  }
}

createAdminUser();
