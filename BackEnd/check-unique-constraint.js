const db = require('./src/db');

async function checkUniqueConstraint() {
  try {
    console.log('📋 Checking UNIQUE constraint for ID Bisnis\n');
    
    // Check the specific unique constraint on (kelompok_id, id_hewan)
    const uniqueConstraint = await db.query(`
      SELECT constraint_name, column_name, ordinal_position
      FROM information_schema.key_column_usage
      WHERE table_name = 'hewan_ternak' 
      AND constraint_name = 'hewan_ternak_kelompok_id_hewan_key'
      ORDER BY ordinal_position
    `);
    
    if (uniqueConstraint.rows.length > 0) {
      console.log('✅ UNIQUE Constraint Found: hewan_ternak_kelompok_id_hewan_key');
      console.log('   Columns:');
      uniqueConstraint.rows.forEach(row => {
        console.log(`     ${row.ordinal_position}. ${row.column_name}`);
      });
      console.log('\n✅ This ensures ID Bisnis (id_hewan) is unique PER KELOMPOK\n');
    } else {
      console.log('❌ UNIQUE Constraint NOT Found!\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkUniqueConstraint();
