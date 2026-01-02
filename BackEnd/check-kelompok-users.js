const { Pool } = require('pg');

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
      SELECT u.id, u.username, u.full_name, u.role, k.id as kelompok_id, k.name as kelompok_name
      FROM users u
      LEFT JOIN kelompok k ON u.kelompok_id = k.id
      WHERE u.role = 'kelompok'
      LIMIT 5
    `);
    
    console.log('🔍 Kelompok Users:');
    result.rows.forEach(u => {
      console.log(`\nUsername: ${u.username}`);
      console.log(`Full Name: ${u.full_name}`);
      console.log(`Role: ${u.role}`);
      console.log(`Kelompok: ${u.kelompok_name} (ID: ${u.kelompok_id})`);
    });

    if (result.rows.length === 0) {
      console.log('No kelompok users found');
    }
  } finally {
    await client.end();
  }
}

check();
