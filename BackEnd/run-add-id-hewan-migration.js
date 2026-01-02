#!/usr/bin/env node

const db = require('./src/db');
const fs = require('fs');

async function runMigration() {
  const client = await db.pool.connect();
  try {
    const sql = fs.readFileSync('./prisma/migrations/add_id_hewan_column.sql', 'utf8');
    
    // Split SQL into individual statements
    const statements = sql.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        await client.query(statement);
        console.log('✅ Done');
      }
    }
    
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.release();
  }
}

runMigration();
