#!/usr/bin/env node

require('dotenv').config();
const db = require('./src/db');

async function check() {
  try {
    console.log('Checking last 5 hewan_ternak records:\n');
    
    const res = await db.query(
      `SELECT id, id_hewan, ras, catatan, jenis_kelamin, bobot, source 
       FROM hewan_ternak 
       ORDER BY id DESC 
       LIMIT 5`
    );

    console.log('Last 5 hewan:');
    res.rows.forEach((row, idx) => {
      console.log(`\n${idx + 1}. ID Database: ${row.id}`);
      console.log(`   ID Hewan (Business): ${row.id_hewan || '(null)'}`);
      console.log(`   Ras: ${row.ras}`);
      console.log(`   Jenis: ${row.jenis_kelamin}`);
      console.log(`   Bobot: ${row.bobot}`);
      console.log(`   Catatan: ${row.catatan || '(null)'}`);
      console.log(`   Source: ${row.source}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

check();
