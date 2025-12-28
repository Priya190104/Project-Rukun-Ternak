/**
 * Seed script untuk data hewan ternak
 * Run dengan: node seed_hewan.js
 */

const db = require('./src/db');

const seedHewanTernak = async () => {
  try {
    console.log('🌱 Starting seed hewan ternak...');

    // Clear existing data
    await db.query('DELETE FROM riwayat_bobot');
    await db.query('DELETE FROM hewan_ternak');
    console.log('✓ Cleared existing hewan ternak data');

    // Sample data
    const hewanData = [
      {
        kelompok_id: 1,
        jenis_kelamin: 'BETINA',
        ras: 'Domba Ekor Putih',
        tanggal_lahir: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 tahun lalu
        bobot: 45.5,
        status: 'AKTIF',
        id_induk: null,
        id_pejantan: null
      },
      {
        kelompok_id: 1,
        jenis_kelamin: 'JANTAN',
        ras: 'Domba Ekor Putih',
        tanggal_lahir: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 tahun lalu
        bobot: 65.2,
        status: 'AKTIF',
        id_induk: null,
        id_pejantan: null
      },
      {
        kelompok_id: 1,
        jenis_kelamin: 'BETINA',
        ras: 'Domba Ekor Putih',
        tanggal_lahir: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 150 hari lalu (5 bulan)
        bobot: 32.0,
        status: 'AKTIF',
        id_induk: 1,
        id_pejantan: 2
      },
      {
        kelompok_id: 1,
        jenis_kelamin: 'JANTAN',
        ras: 'Domba Ekor Putih',
        tanggal_lahir: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 45 hari lalu (1.5 bulan)
        bobot: 18.5,
        status: 'AKTIF',
        id_induk: 1,
        id_pejantan: 2
      },
      {
        kelompok_id: 1,
        jenis_kelamin: 'BETINA',
        ras: 'Domba Ekor Hitam',
        tanggal_lahir: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 200 hari lalu
        bobot: 28.0,
        status: 'TERJUAL',
        id_induk: null,
        id_pejantan: null
      },
    ];

    // Insert hewan
    for (const hewan of hewanData) {
      await db.query(
        `INSERT INTO hewan_ternak (kelompok_id, jenis_kelamin, ras, tanggal_lahir, bobot, status, id_induk, id_pejantan)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [hewan.kelompok_id, hewan.jenis_kelamin, hewan.ras, hewan.tanggal_lahir, hewan.bobot, hewan.status, hewan.id_induk, hewan.id_pejantan]
      );
    }

    console.log('✓ Inserted 5 sample hewan ternak');

    // Add sample bobot history for first hewan
    const riwayatBobot = [
      { hewan_id: 1, bobot: 40.0, tanggal_update: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], keterangan: 'Update rutin bulanan' },
      { hewan_id: 1, bobot: 42.5, tanggal_update: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], keterangan: 'Update rutin bulanan' },
      { hewan_id: 1, bobot: 45.5, tanggal_update: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], keterangan: 'Pertumbuhan normal' },
      { hewan_id: 2, bobot: 60.0, tanggal_update: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], keterangan: 'Update rutin bulanan' },
      { hewan_id: 2, bobot: 65.2, tanggal_update: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], keterangan: 'Kondisi sehat' },
    ];

    for (const riwayat of riwayatBobot) {
      await db.query(
        `INSERT INTO riwayat_bobot (hewan_id, bobot, tanggal_update, keterangan)
         VALUES ($1, $2, $3, $4)`,
        [riwayat.hewan_id, riwayat.bobot, riwayat.tanggal_update, riwayat.keterangan]
      );
    }

    console.log('✓ Inserted 5 sample riwayat bobot');

    console.log('✅ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedHewanTernak();
