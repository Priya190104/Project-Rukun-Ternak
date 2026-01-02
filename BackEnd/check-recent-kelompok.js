/**
 * DIRECT TEST: Cek apakah kelompok sudah ada di database
 * dan berapa jumlah hewan_ternak-nya
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'rukunternak',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin123'
});

async function test() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('🔍 DATABASE CHECK: Hewan Ternak Status');
    console.log('='.repeat(80) + '\n');

    // 1. Get latest 3 kelompok
    const kelompokResult = await pool.query(`
      SELECT 
        id, name, jumlah_ternak
      FROM kelompok
      ORDER BY id DESC
      LIMIT 3
    `);

    console.log('📋 3 KELOMPOK TERBARU:\n');
    for (const k of kelompokResult.rows) {
      console.log(`   ${k.id}. ${k.name}`);
      console.log(`      Jumlah Ternak (metadata): ${k.jumlah_ternak}`);
      
      // Check hewan_ternak records
      const hewanResult = await pool.query(`
        SELECT COUNT(*) as total, source
        FROM hewan_ternak
        WHERE kelompok_id = $1
        GROUP BY source
      `, [k.id]);
      
      if (hewanResult.rows.length === 0) {
        console.log(`      Hewan Ternak (database): 0 records ❌`);
      } else {
        const breakdown = hewanResult.rows.map(r => `${r.source}=${r.total}`).join(', ');
        const total = hewanResult.rows.reduce((sum, r) => sum + parseInt(r.total), 0);
        console.log(`      Hewan Ternak (database): ${total} (${breakdown})`);
      }
      console.log('');
    }

    console.log('='.repeat(80));
    
  } catch (err) {
    console.error('❌ ERROR:', err.message);
  } finally {
    await pool.end();
  }
}

test();
