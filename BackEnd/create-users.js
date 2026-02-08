const db = require('./src/db');
const bcrypt = require('bcrypt');

const createAdminUser = async () => {
  try {
    console.log('Creating admin user...');
    
    const hashedPassword = await bcrypt.hash('adminpass', 10);
    
    const result = await db.query(
      `INSERT INTO users (username, password, full_name, role, kelompok_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (username) DO NOTHING
       RETURNING id, username, role`,
      ['admin', hashedPassword, 'Administrator', 'admin', null]
    );
    
    if (result.rows.length > 0) {
      console.log('✓ Admin user created:', result.rows[0]);
    } else {
      console.log('✓ Admin user already exists');
    }

    // Create kelompok for testing
    console.log('\nCreating kelompok for testing...');
    const kelompokRes = await db.query(
      `INSERT INTO kelompok (name, desa, kecamatan)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING
       RETURNING id, name`,
      ['Kelompok Ternak Makmur', 'Cilacap', 'Cilacap']
    );

    let kelompok_id = null;
    if (kelompokRes.rows.length > 0) {
      kelompok_id = kelompokRes.rows[0].id;
      console.log('✓ Kelompok created:', kelompokRes.rows[0]);
    } else {
      const existingKelompok = await db.query(
        `SELECT id FROM kelompok LIMIT 1`
      );
      if (existingKelompok.rows.length > 0) {
        kelompok_id = existingKelompok.rows[0].id;
        console.log('✓ Using existing kelompok id:', kelompok_id);
      }
    }

    // Create client user
    if (kelompok_id) {
      console.log('\nCreating client user...');
      const clientRes = await db.query(
        `INSERT INTO users (username, password, full_name, role, kelompok_id)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (username) DO NOTHING
         RETURNING id, username, role`,
        ['client1', await bcrypt.hash('clientpass', 10), 'Client 1', 'kelompok', kelompok_id]
      );

      if (clientRes.rows.length > 0) {
        console.log('✓ Client user created:', clientRes.rows[0]);
      }
    }

    // Create viewer user
    console.log('\nCreating viewer user...');
    const viewerRes = await db.query(
      `INSERT INTO users (username, password, full_name, role, kelompok_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (username) DO NOTHING
       RETURNING id, username, role`,
      ['viewer1', await bcrypt.hash('viewerpass', 10), 'Viewer 1', 'viewer', null]
    );

    if (viewerRes.rows.length > 0) {
      console.log('✓ Viewer user created:', viewerRes.rows[0]);
    }

    console.log('\n✓ All users created successfully!');
    console.log('\nLogin credentials:');
    console.log('  Admin: username=admin, password=adminpass');
    console.log('  Client: username=client1, password=clientpass');
    console.log('  Viewer: username=viewer1, password=viewerpass');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createAdminUser();
