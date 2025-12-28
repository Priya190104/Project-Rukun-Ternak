const db = require('./src/db');

async function check() {
  try {
    console.log('\n=== CHECKING USERS ===');
    const users = await db.query("SELECT id, username, role, kelompok_id FROM users WHERE role='kelompok'");
    console.log('Kelompok Users:', users.rows);

    console.log('\n=== CHECKING HEWAN TERNAK ===');
    const hewan = await db.query('SELECT id, kelompok_id, ras, status, created_at FROM hewan_ternak');
    console.log('Total hewan:', hewan.rowCount);
    console.log('Hewan data:', hewan.rows);

    console.log('\n=== CHECKING KELOMPOK ===');
    const kelompok = await db.query('SELECT id, name FROM kelompok');
    console.log('Kelompok:', kelompok.rows);

    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

check();
