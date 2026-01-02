#!/usr/bin/env node

const db = require('./src/db');

async function verify() {
  try {
    const result = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'hewan_ternak' 
      AND column_name IN ('id', 'id_hewan', 'id_induk')
      ORDER BY ordinal_position;
    `);
    
    console.log('✅ Columns in hewan_ternak:\n');
    result.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verify();
