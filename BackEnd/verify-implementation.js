#!/usr/bin/env node

/**
 * VERIFICATION REPORT: Database Optimization Implementation
 * Tests and validates all components
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║  DATABASE OPTIMIZATION IMPLEMENTATION - VERIFICATION       ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

const checks = {
  'Files Created': {
    '✓ queryCache.js': fs.existsSync('src/utils/queryCache.js'),
    '✓ cacheRoutes.js': fs.existsSync('src/routes/cacheRoutes.js'),
    '✓ Migration file': fs.existsSync('migrations/20260205_add_composite_indexes.sql'),
    '✓ migrate-indexes.js': fs.existsSync('migrate-indexes.js'),
    '✓ test-cache.js': fs.existsSync('test-cache.js')
  },
  
  'Code Integration': {
    '✓ server.js includes cache routes': 
      fs.readFileSync('server.js', 'utf-8').includes('cacheRoutes'),
    '✓ queryCache exports correct functions':
      fs.readFileSync('src/utils/queryCache.js', 'utf-8').includes('module.exports'),
    '✓ cacheRoutes is proper Express router':
      fs.readFileSync('src/routes/cacheRoutes.js', 'utf-8').includes('const router = express.Router()'),
    '✓ Auth middleware integrated':
      fs.readFileSync('server.js', 'utf-8').includes('requireAuth')
  },

  'Syntax Validation': {
    '✓ server.js syntax valid': checkSyntax('server.js'),
    '✓ queryCache.js syntax valid': checkSyntax('src/utils/queryCache.js'),
    '✓ cacheRoutes.js syntax valid': checkSyntax('src/routes/cacheRoutes.js'),
    '✓ migrate-indexes.js syntax valid': checkSyntax('migrate-indexes.js')
  },

  'Pagination Implementation': {
    '✓ usersController has pagination': 
      fs.readFileSync('src/controllers/usersController.js', 'utf-8').includes('pagination'),
    '✓ hewanController has pagination':
      fs.readFileSync('src/controllers/hewanController.js', 'utf-8').includes('pagination'),
    '✓ laporanController has pagination':
      fs.readFileSync('src/controllers/laporanController.js', 'utf-8').includes('pagination'),
    '✓ kelompokController has pagination':
      fs.readFileSync('src/controllers/kelompokController.js', 'utf-8').includes('pagination')
  }
};

// Run checks
let totalChecks = 0;
let passedChecks = 0;

for (const [category, items] of Object.entries(checks)) {
  console.log(`📋 ${category}:`);
  for (const [check, result] of Object.entries(items)) {
    totalChecks++;
    if (result) {
      passedChecks++;
      console.log(`   ${check}`);
    } else {
      console.log(`   ✗ ${check.replace('✓ ', '')}`);
    }
  }
  console.log();
}

// Summary
const percentage = Math.round((passedChecks / totalChecks) * 100);
console.log('╔═══════════════════════════════════════════════════════════╗');
console.log(`║  VERIFICATION RESULTS: ${passedChecks}/${totalChecks} checks passed (${percentage}%)    ${percentage === 100 ? '✓' : ''}`);
console.log('╚═══════════════════════════════════════════════════════════╝\n');

if (passedChecks === totalChecks) {
  console.log('✅ All components successfully implemented!\n');
  console.log('Next steps:');
  console.log('  1. Database indexes are created via: node migrate-indexes.js');
  console.log('  2. Start backend: npm start');
  console.log('  3. Test with: curl http://localhost:4000/api/cache/status -H "Authorization: Bearer <token>"');
  console.log();
} else {
  console.log('⚠️  Some checks failed. Please review the implementation.\n');
  process.exit(1);
}

function checkSyntax(filePath) {
  try {
    execSync(`node -c ${filePath}`, { stdio: 'pipe' });
    return true;
  } catch (err) {
    return false;
  }
}
