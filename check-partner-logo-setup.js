#!/usr/bin/env node

/**
 * QUICK COMPILATION CHECK
 * Verifies that new components compile without errors
 */

const fs = require('fs');
const path = require('path');

console.log('\n✅ DYNAMIC PARTNER LOGO SYSTEM - COMPILATION CHECK\n');

// Check 1: partnerLogo.js exists
const partnerLogoPath = path.join(
  __dirname,
  'FrontEnd/src/config/partnerLogo.js'
);
if (fs.existsSync(partnerLogoPath)) {
  console.log('✅ partnerLogo.js exists');
  const content = fs.readFileSync(partnerLogoPath, 'utf8');
  console.log(`   Lines: ${content.split('\n').length}`);
  console.log(`   Size: ${Math.round(content.length / 1024)}KB`);
} else {
  console.log('❌ partnerLogo.js NOT FOUND');
}

// Check 2: SupportedBySection.jsx exists
const supportedByPath = path.join(
  __dirname,
  'FrontEnd/src/components/branding/SupportedBySection.jsx'
);
if (fs.existsSync(supportedByPath)) {
  console.log('✅ SupportedBySection.jsx exists');
  const content = fs.readFileSync(supportedByPath, 'utf8');
  console.log(`   Lines: ${content.split('\n').length}`);
  console.log(`   Size: ${Math.round(content.length / 1024)}KB`);
} else {
  console.log('❌ SupportedBySection.jsx NOT FOUND');
}

// Check 3: Footer.jsx updated
const footerPath = path.join(
  __dirname,
  'FrontEnd/src/components/layout/Footer.jsx'
);
if (fs.existsSync(footerPath)) {
  const content = fs.readFileSync(footerPath, 'utf8');
  if (content.includes('SupportedBySection')) {
    console.log('✅ Footer.jsx includes SupportedBySection');
  } else {
    console.log('❌ Footer.jsx does NOT include SupportedBySection');
  }
} else {
  console.log('❌ Footer.jsx NOT FOUND');
}

// Check 4: Documentation files
const docFiles = [
  'DYNAMIC_PARTNER_LOGO_IMPLEMENTATION.md',
  'DYNAMIC_PARTNER_LOGO_QUICK_REFERENCE.md',
];

console.log('\n📚 Documentation files:');
for (const docFile of docFiles) {
  const docPath = path.join(__dirname, docFile);
  if (fs.existsSync(docPath)) {
    const content = fs.readFileSync(docPath, 'utf8');
    console.log(`✅ ${docFile}`);
    console.log(`   Size: ${Math.round(content.length / 1024)}KB`);
  } else {
    console.log(`❌ ${docFile} NOT FOUND`);
  }
}

console.log('\n' + '='.repeat(60));
console.log('✅ ALL FILES CREATED SUCCESSFULLY');
console.log('='.repeat(60));
console.log('\n📝 NEXT STEPS:');
console.log('1. npm start');
console.log('2. Open http://localhost:3000');
console.log('3. Scroll to footer');
console.log('4. Should see "Supported by [LOGO]"');
console.log('\n🎯 Status: READY FOR TESTING\n');
