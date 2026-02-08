#!/usr/bin/env node

/**
 * QUICK DATABASE MIGRATION
 * Adds composite indexes for performance
 */

const { Pool } = require('pg');
require('dotenv').config();

async function migrate() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  const client = await pool.connect();

  try {
    console.log('\n📊 Adding Composite Indexes...\n');

    const indexes = [
      {
        name: 'idx_hewan_ternak_status_tanggal_lahir',
        sql: `CREATE INDEX IF NOT EXISTS idx_hewan_ternak_status_tanggal_lahir 
               ON hewan_ternak(status, tanggal_lahir DESC)
               WHERE status != 'TERJUAL'`
      },
      {
        name: 'idx_hewan_ternak_kelompok_status_tanggal',
        sql: `CREATE INDEX IF NOT EXISTS idx_hewan_ternak_kelompok_status_tanggal 
               ON hewan_ternak(kelompok_id, status, tanggal_lahir DESC)
               WHERE status IN ('AKTIF', 'TIDAK_AKTIF')`
      },
      {
        name: 'idx_update_ternak_kelompok_status_tanggal',
        sql: `CREATE INDEX IF NOT EXISTS idx_update_ternak_kelompok_status_tanggal 
               ON update_ternak(kelompok_id, status, tanggal_update DESC)`
      },
      {
        name: 'idx_hewan_ternak_source',
        sql: `CREATE INDEX IF NOT EXISTS idx_hewan_ternak_source 
               ON hewan_ternak(source, tanggal_lahir DESC)`
      }
    ];

    for (const idx of indexes) {
      try {
        await client.query(idx.sql);
        console.log(`✓ Created: ${idx.name}`);
      } catch (err) {
        if (err.message.includes('already exists')) {
          console.log(`ℹ  Already exists: ${idx.name}`);
        } else {
          console.error(`✗ Error on ${idx.name}: ${err.message}`);
        }
      }
    }

    // Verify
    console.log('\n📋 Verification:\n');
    const result = await client.query(`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE schemaname = 'public'
      AND tablename IN ('hewan_ternak', 'update_ternak')
      AND indexname LIKE 'idx_%'
      ORDER BY tablename, indexname
    `);

    if (result.rows.length > 0) {
      result.rows.forEach((row, i) => {
        console.log(`  ${i + 1}. [${row.tablename}] ${row.indexname}`);
      });
      console.log(`\n✅ Total indexes: ${result.rows.length}\n`);
    } else {
      console.log('No indexes found');
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await client.release();
    await pool.end();
    process.exit(0);
  }
}

migrate();
