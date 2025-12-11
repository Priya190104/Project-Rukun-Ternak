require('dotenv').config();
const db = require('./src/db');
const bcrypt = require('bcrypt');

async function run() {
  try {
    // Create tables if not exist (fallback if migrations not applied)
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT,
        role TEXT NOT NULL,
        kelompok TEXT
      );

      CREATE TABLE IF NOT EXISTS kelompok (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS laporan (
        id SERIAL PRIMARY KEY,
        jenis TEXT,
        kelompok TEXT,
        data JSONB,
        tanggal TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS notifikasi (
        id SERIAL PRIMARY KEY,
        message TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Seed kelompok
    await db.query(`INSERT INTO kelompok (name) VALUES ($1) ON CONFLICT DO NOTHING`, ['KLP1']);

    // Seed users (admin and kelompok)
    const adminPass = await bcrypt.hash('adminpass', 10);
    const klpPass = await bcrypt.hash('clientpass', 10);

    await db.query(
      `INSERT INTO users (username, password, full_name, role, kelompok) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
      ['admin', adminPass, 'Admin Demo', 'admin', null]
    );

    await db.query(
      `INSERT INTO users (username, password, full_name, role, kelompok) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
      ['client1', klpPass, 'Client Demo', 'kelompok', 'KLP1']
    );

    // Seed a sample laporan
    await db.query(
      `INSERT INTO laporan (jenis, kelompok, data) VALUES ($1,$2,$3)`,
      ['kelahiran', 'KLP1', JSON.stringify({ nomor_kelahiran: 'KB-001', bobot: 12 })]
    );

    // Seed a notification
    await db.query(`INSERT INTO notifikasi (message) VALUES ($1)`, ['Sistem siap berjalan.']);

    console.log('Seed complete');
    process.exit(0);
  } catch (e) {
    console.error('Seed error', e);
    process.exit(1);
  }
}

run();
