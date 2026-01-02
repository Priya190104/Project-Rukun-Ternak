#!/usr/bin/env node
/**
 * CLEAR LAPORAN DATA
 * Script to delete all data from laporan table while preserving table structure
 * 
 * SAFETY CHECKS:
 * - Only deletes from laporan table
 * - Preserves table schema and constraints
 * - Verifies deletion with row count check
 * - No other tables affected
 */

require('dotenv').config();
const db = require('./src/db');

async function clearLaporanData() {
  try {
    console.log('\n========== CLEARING LAPORAN DATA ==========');
    console.log('Starting cleanup process...\n');

    // Check current row count
    console.log('[1/3] Checking current laporan table...');
    const countBefore = await db.query('SELECT COUNT(*) FROM laporan');
    const rowsBefore = parseInt(countBefore.rows[0].count, 10);
    console.log(`✓ Found ${rowsBefore} records in laporan table`);

    if (rowsBefore === 0) {
      console.log('\n✓ Laporan table is already empty. No action needed.');
      return;
    }

    // Delete all data from laporan
    console.log('\n[2/3] Deleting all records from laporan...');
    const deleteResult = await db.query('DELETE FROM laporan');
    const deletedCount = deleteResult.rowCount;
    console.log(`✓ Deleted ${deletedCount} records`);

    // Verify deletion
    console.log('\n[3/3] Verifying deletion...');
    const countAfter = await db.query('SELECT COUNT(*) FROM laporan');
    const rowsAfter = parseInt(countAfter.rows[0].count, 10);
    console.log(`✓ Laporan table now contains ${rowsAfter} records`);

    if (rowsAfter === 0) {
      console.log('\n========== ✅ SUCCESS ==========');
      console.log(`Deleted: ${deletedCount} records`);
      console.log('Table structure: INTACT');
      console.log('Foreign keys: INTACT');
      console.log('Ready for new data\n');
    } else {
      console.log('\n⚠️  WARNING: Table still contains records');
      console.log(`Remaining: ${rowsAfter} records\n`);
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await db.pool.end();
  }
}

// Run cleanup
clearLaporanData();
