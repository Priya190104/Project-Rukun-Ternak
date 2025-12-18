require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function testConnection() {
  try {
    console.log('Testing PostgreSQL connection...');
    const result = await pool.query('SELECT version()');
    console.log('✓ Connected to:', result.rows[0].version.split(',')[0]);
    
    console.log('\nChecking users table...');
    const users = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`✓ Users count: ${users.rows[0].count}`);
    
    const usersList = await pool.query('SELECT id, username, role FROM users');
    console.log('Users:');
    usersList.rows.forEach(u => console.log(`  - ${u.username} (${u.role})`));
    
    console.log('\nChecking berita table...');
    const berita = await pool.query('SELECT COUNT(*) as count FROM berita');
    console.log(`✓ Berita count: ${berita.rows[0].count}`);
    
    console.log('\n✓ DATABASE CONNECTION OK');
    process.exit(0);
  } catch (error) {
    console.error('✗ ERROR:', error.message);
    process.exit(1);
  }
}

testConnection();
