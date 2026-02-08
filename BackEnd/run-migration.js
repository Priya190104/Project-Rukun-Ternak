#!/usr/bin/env node

/**
 * DATABASE MIGRATION HELPER
 * Runs the performance optimization migrations
 * 
 * Usage: node run-migration.js
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 5000
});

async function runMigration() {
  let client;
  try {
    client = await Promise.race([
      pool.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 15000))
    ]);
  
  try {
    console.log('═══════════════════════════════════════════════════');
    console.log('📊 DATABASE MIGRATION: Performance Indexes');
    console.log('═══════════════════════════════════════════════════\n');

    // Read migration file
    const migrationFile = path.join(__dirname, 'migrations/20260205_add_composite_indexes.sql');
    
    if (!fs.existsSync(migrationFile)) {
      console.error('❌ Migration file not found:', migrationFile);
      process.exit(1);
    }

    const sql = fs.readFileSync(migrationFile, 'utf-8');
    console.log('📝 Running migration: 20260205_add_composite_indexes.sql\n');

    // Parse and execute CREATE INDEX statements
    const indexRegex = /CREATE\s+INDEX\s+IF\s+NOT\s+EXISTS\s+(\w+)\s+ON\s+(\w+)[^;]+;/gi;
    const matches = sql.matchAll(indexRegex);
    
    let executed = 0;
    for (const match of matches) {
      const fullStatement = match[0];
      const indexName = match[1];
      const tableName = match[2];
      
      try {
        console.log(`   Creating index [${tableName}] ${indexName}...`);
        await client.query(fullStatement);
        executed++;
        console.log(`   ✓ OK\n`);
      } catch (err) {
        if (err.message.includes('already exists')) {
          console.log(`   ℹ️  Already exists (skipped)\n`);
        } else {
          console.error(`   ❌ Error: ${err.message}\n`);
          throw err;
        }
      }
    }

    // Verify indexes were created
    console.log('📋 Verifying indexes...\n');
    const result = await client.query(`
      SELECT schemaname, tablename, indexname 
      FROM pg_indexes 
      WHERE tablename IN ('hewan_ternak', 'update_ternak')
      AND indexname LIKE 'idx_%'
      ORDER BY tablename, indexname;
    `);

    console.log('Indexes found:');
    result.rows.forEach((row, idx) => {
      console.log(`  ${idx + 1}. [${row.tablename}] ${row.indexname}`);
    });

    console.log('\n═══════════════════════════════════════════════════');
    console.log('✅ Migration completed successfully!');
    console.log(`   ${executed} SQL statements executed`);
    console.log(`   ${result.rows.length} indexes verified`);
    console.log('═══════════════════════════════════════════════════\n');

  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
runMigration();
