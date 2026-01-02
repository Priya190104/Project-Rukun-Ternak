#!/usr/bin/env node

const db = require('./src/db');

async function checkSchema() {
  try {
    const result = await db.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'hewan_ternak' 
      ORDER BY ordinal_position;
    `);
    
    console.log('=== HEWAN_TERNAK TABLE STRUCTURE ===\n');
    result.rows.forEach(col => {
      console.log(`${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default || 'none'})`);
    });
    
    // Also check constraints
    console.log('\n=== CONSTRAINTS ===\n');
    const constraintsResult = await db.query(`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_name = 'hewan_ternak';
    `);
    
    constraintsResult.rows.forEach(c => {
      console.log(`${c.constraint_name}: ${c.constraint_type}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkSchema();
