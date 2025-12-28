const db = require('./src/db');

async function insertSampleHewan() {
  try {
    console.log('Inserting sample hewan...');
    
    // Insert for kelompok_id 1
    const result1 = await db.query(
      'INSERT INTO hewan_ternak (kelompok_id, jenis_kelamin, ras, tanggal_lahir, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id',
      [1, 'JANTAN', 'Boer', '2024-01-15', 'AKTIF']
    );
    console.log('✓ Hewan 1 terinsert dengan ID:', result1.rows[0].id);
    
    // Insert for kelompok_id 1
    const result2 = await db.query(
      'INSERT INTO hewan_ternak (kelompok_id, jenis_kelamin, ras, tanggal_lahir, status, bobot, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING id',
      [1, 'BETINA', 'Peranakan', '2024-02-20', 'AKTIF', 42.5]
    );
    console.log('✓ Hewan 2 terinsert dengan ID:', result2.rows[0].id);
    
    // Insert for kelompok_id 2
    const result3 = await db.query(
      'INSERT INTO hewan_ternak (kelompok_id, jenis_kelamin, ras, tanggal_lahir, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id',
      [2, 'BETINA', 'Etawa', '2024-03-10', 'AKTIF']
    );
    console.log('✓ Hewan 3 terinsert dengan ID:', result3.rows[0].id);
    
    console.log('\nSample data berhasil ditambahkan!');
    process.exit(0);
  } catch (e) {
    console.error('Error inserting hewan:', e.message);
    process.exit(1);
  }
}

insertSampleHewan();
