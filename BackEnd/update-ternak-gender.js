/**
 * Script: Update existing kelompok with default ternak gender split
 * Split: 50% jantan, 50% betina
 */

const db = require('./src/db');

async function updateTernakGender() {
  try {
    console.log('Updating kelompok ternak gender split...\n');

    // Get all kelompok with jumlah_ternak but no gender split
    const { rows } = await db.query(`
      SELECT id, name, jumlah_ternak, ternak_jantan, ternak_betina
      FROM kelompok
      WHERE jumlah_ternak IS NOT NULL
        AND jumlah_ternak > 0
        AND (ternak_jantan IS NULL OR ternak_betina IS NULL)
      ORDER BY id
    `);

    console.log(`Found ${rows.length} kelompok to update\n`);

    for (const kelompok of rows) {
      const total = kelompok.jumlah_ternak;
      const jantan = Math.ceil(total / 2);
      const betina = Math.floor(total / 2);

      await db.query(
        `UPDATE kelompok SET ternak_jantan = $1, ternak_betina = $2 WHERE id = $3`,
        [jantan, betina, kelompok.id]
      );

      console.log(`✓ ${kelompok.name}: ${total} ternak → ${jantan} jantan, ${betina} betina`);
    }

    console.log(`\n✅ Update complete! ${rows.length} kelompok updated.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

updateTernakGender();
