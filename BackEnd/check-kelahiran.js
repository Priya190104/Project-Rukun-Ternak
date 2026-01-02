#!/usr/bin/env node

require('dotenv').config();
const db = require('./src/db');

async function check() {
  try {
    const res = await db.query('SELECT id, source, catatan FROM hewan_ternak WHERE source = $1 LIMIT 5', ['Kelahiran']);
    console.log('Hewan from Kelahiran:');
    console.log(res.rows);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    db.end();
  }
}

check();
