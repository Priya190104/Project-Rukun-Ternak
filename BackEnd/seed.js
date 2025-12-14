require('dotenv').config();
const db = require('./src/db');
const bcrypt = require('bcrypt');

async function run() {
  try {
    // Create tables if not exist (fallback if migrations not applied)
    await db.query(`
      CREATE TABLE IF NOT EXISTS kelompok (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        kecamatan TEXT,
        desa TEXT,
        catatan TEXT,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        pic1_nik TEXT,
        pic1_nama TEXT,
        pic1_alamat TEXT,
        pic1_no_hp TEXT,
        pic1_email TEXT,
        pic2_nik TEXT,
        pic2_nama TEXT,
        pic2_alamat TEXT,
        pic2_no_hp TEXT,
        pic2_email TEXT
      );

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT,
        role TEXT NOT NULL,
        kelompok_id INTEGER REFERENCES kelompok(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS laporan (
        id SERIAL PRIMARY KEY,
        jenis TEXT,
        kelompok TEXT,
        data JSONB,
        tanggal TIMESTAMPTZ DEFAULT NOW(),
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        kelompok_id INTEGER REFERENCES kelompok(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS notifikasi (
        id SERIAL PRIMARY KEY,
        message TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Ensure new columns exist when tables were created earlier with minimal schema
      ALTER TABLE kelompok
        ADD COLUMN IF NOT EXISTS email TEXT,
        ADD COLUMN IF NOT EXISTS kecamatan TEXT,
        ADD COLUMN IF NOT EXISTS desa TEXT,
        ADD COLUMN IF NOT EXISTS catatan TEXT,
        ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS pic1_nik TEXT,
        ADD COLUMN IF NOT EXISTS pic1_nama TEXT,
        ADD COLUMN IF NOT EXISTS pic1_alamat TEXT,
        ADD COLUMN IF NOT EXISTS pic1_no_hp TEXT,
        ADD COLUMN IF NOT EXISTS pic1_email TEXT,
        ADD COLUMN IF NOT EXISTS pic2_nik TEXT,
        ADD COLUMN IF NOT EXISTS pic2_nama TEXT,
        ADD COLUMN IF NOT EXISTS pic2_alamat TEXT,
        ADD COLUMN IF NOT EXISTS pic2_no_hp TEXT,
        ADD COLUMN IF NOT EXISTS pic2_email TEXT;

      ALTER TABLE laporan
        ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        ADD COLUMN IF NOT EXISTS kelompok_id INTEGER REFERENCES kelompok(id) ON DELETE SET NULL;
    `);

    // Create sample kelompok
    const kelompokRes = await db.query(`
      INSERT INTO kelompok (name) VALUES 
      ('Kelompok Makmur'), 
      ('Kelompok Sejahtera'),
      ('Kelompok Berkah')
      ON CONFLICT DO NOTHING
      RETURNING id, name
    `);
    console.log('Sample kelompok created:', kelompokRes.rows.length);

    // Create initial admin
    const adminPass = await bcrypt.hash('adminpass', 10);
    await db.query(
      `INSERT INTO users (username, password, full_name, role, kelompok_id) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (username) DO NOTHING`,
      ['admin', adminPass, 'Administrator', 'admin', null]
    );
    console.log('Initial admin created: username=admin, password=adminpass');

    // Create sample kelompok users (for testing)
    const kelompok1Pass = await bcrypt.hash('kelompok1pass', 10);
    const kelompok2Pass = await bcrypt.hash('kelompok2pass', 10);
    const kelompok3Pass = await bcrypt.hash('kelompok3pass', 10);
    
    // Get kelompok IDs
    const k1 = await db.query(`SELECT id FROM kelompok WHERE name='Kelompok Makmur' LIMIT 1`);
    const k2 = await db.query(`SELECT id FROM kelompok WHERE name='Kelompok Sejahtera' LIMIT 1`);
    const k3 = await db.query(`SELECT id FROM kelompok WHERE name='Kelompok Berkah' LIMIT 1`);

    await db.query(
      `UPDATE kelompok AS k SET latitude = COALESCE(k.latitude, geo.lat), longitude = COALESCE(k.longitude, geo.lng),
                               kecamatan = COALESCE(k.kecamatan, geo.kec), desa = COALESCE(k.desa, geo.des)
       FROM (VALUES
         ('Kelompok Makmur', -7.7275, 109.0068, 'Cilacap', 'Sidareja'),
         ('Kelompok Sejahtera', -7.7061, 109.0320, 'Cilacap', 'Kedungreja'),
         ('Kelompok Berkah', -7.6902, 108.9800, 'Cilacap', 'Sebatakan')
       ) AS geo(name, lat, lng, kec, des)
       WHERE k.name = geo.name`
    );
    
    if (k1.rows[0]) {
      await db.query(
        `INSERT INTO users (username, password, full_name, role, kelompok_id) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (username) DO NOTHING`,
        ['kelompok1', kelompok1Pass, 'Anggota Kelompok Makmur', 'kelompok', k1.rows[0].id]
      );
      console.log('Kelompok user created: username=kelompok1, password=kelompok1pass');
    }
    
    if (k2.rows[0]) {
      await db.query(
        `INSERT INTO users (username, password, full_name, role, kelompok_id) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (username) DO NOTHING`,
        ['kelompok2', kelompok2Pass, 'Anggota Kelompok Sejahtera', 'kelompok', k2.rows[0].id]
      );
      console.log('Kelompok user created: username=kelompok2, password=kelompok2pass');
    }

    if (k3.rows[0]) {
      await db.query(
        `INSERT INTO users (username, password, full_name, role, kelompok_id) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (username) DO NOTHING`,
        ['kelompok3', kelompok3Pass, 'Anggota Kelompok Berkah', 'kelompok', k3.rows[0].id]
      );
      console.log('Kelompok user created: username=kelompok3, password=kelompok3pass');
    }

    console.log('Seed complete - Real data created');
    process.exit(0);
  } catch (e) {
    console.error('Seed error', e);
    process.exit(1);
  }
}

run();
