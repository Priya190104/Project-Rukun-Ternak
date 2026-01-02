const db = require('./src/db');

async function verifySchema() {
  try {
    console.log('📋 SCHEMA VERIFICATION\n');
    
    // Check unique constraint on hewan_ternak
    const constraintCheck = await db.query(`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints 
      WHERE table_name = 'hewan_ternak'
      ORDER BY constraint_name
    `);
    
    console.log('Constraints on hewan_ternak table:');
    constraintCheck.rows.forEach(c => {
      console.log(`  - ${c.constraint_name} (${c.constraint_type})`);
    });
    
    // Check the specific unique constraint
    const uniqueConstraint = await db.query(`
      SELECT constraint_name, column_name
      FROM information_schema.key_column_usage
      WHERE table_name = 'hewan_ternak' 
      AND constraint_name LIKE '%unique%'
      ORDER BY column_name
    `);
    
    console.log('\n✓ Unique Constraints Details:');
    uniqueConstraint.rows.forEach(uc => {
      console.log(`  - ${uc.constraint_name}: ${uc.column_name}`);
    });
    
    // Test data - check for any duplicates
    const duplicateCheck = await db.query(`
      SELECT kelompok_id, id_hewan, COUNT(*) as count
      FROM hewan_ternak
      WHERE id_hewan IS NOT NULL
      GROUP BY kelompok_id, id_hewan
      HAVING COUNT(*) > 1
    `);
    
    console.log('\n📊 Duplicate Check:');
    if (duplicateCheck.rows.length === 0) {
      console.log('  ✅ No duplicates found');
    } else {
      console.log('  ❌ Found duplicates:');
      duplicateCheck.rows.forEach(dup => {
        console.log(`     Kelompok ${dup.kelompok_id}: ${dup.id_hewan} (${dup.count} times)`);
      });
    }
    
    // Check hewan_ternak structure
    const columns = await db.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'hewan_ternak'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📐 hewan_ternak columns:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    
    // Verify pic2 fields in kelompok
    const pic2Check = await db.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'kelompok'
      AND column_name LIKE 'pic2%'
      ORDER BY column_name
    `);
    
    console.log('\n📋 pic2 fields in kelompok:');
    if (pic2Check.rows.length === 0) {
      console.log('  ⚠️  No pic2 fields found');
    } else {
      pic2Check.rows.forEach(pic => {
        console.log(`  ✓ ${pic.column_name}`);
      });
    }
    
    console.log('\n✅ Schema verification complete\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

verifySchema();
