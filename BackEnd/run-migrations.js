#!/usr/bin/env node

/**
 * Migration Runner: Apply pending migrations
 * Usage: node run-migrations.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('./src/db');

async function runMigrations() {
  console.log('Starting migration runner...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', '20251229_add_penyaluran_bantuan_fields.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error('Migration file not found:', migrationPath);
      process.exit(1);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    
    console.log('Executing migration: 20251229_add_penyaluran_bantuan_fields.sql\n');
    console.log('SQL:');
    console.log('---');
    console.log(migrationSQL);
    console.log('---\n');

    // Execute migration
    const result = await db.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    console.log('\nChanges applied:');
    console.log('  1. Added "source" field to hewan_ternak table');
    console.log('  2. Added "laporan_type" field to laporan table');
    console.log('  3. Created indexes for performance');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

runMigrations();
