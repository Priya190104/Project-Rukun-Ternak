#!/usr/bin/env node

/**
 * CKEditor 5 Implementation Verification
 * Rukun Ternak Project
 * 
 * Run this to verify CKEditor is properly implemented
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Verifying CKEditor 5 Implementation...\n');

const checks = [
  {
    name: 'CKEditor imports in BeritaForm.jsx',
    file: 'FrontEnd/src/components/berita/BeritaForm.jsx',
    checks: [
      { pattern: /import.*CKEditor.*from.*@ckeditor\/ckeditor5-react/, desc: 'CKEditor import' },
      { pattern: /import.*ClassicEditor.*from.*@ckeditor\/ckeditor5-build-classic/, desc: 'ClassicEditor import' },
      { pattern: /<CKEditor/, desc: 'CKEditor component usage' },
      { pattern: /editor={ClassicEditor}/, desc: 'Editor prop' },
      { pattern: /data={content}/, desc: 'Data binding' },
      { pattern: /onChange.*editor.*getData/, desc: 'onChange handler' },
    ]
  },
  {
    name: 'CKEditor not lazy loaded',
    file: 'FrontEnd/src/pages/KelolaBerita.jsx',
    checks: [
      { pattern: /import BeritaForm from.*\/components\/berita\/BeritaForm/, desc: 'Direct import (not lazy)' },
      { pattern: /!.*lazy.*\(/, desc: 'No lazy loading', invert: true },
    ]
  },
  {
    name: 'CSS Styling',
    file: 'FrontEnd/src/components/berita/berita-editor.css',
    checks: [
      { pattern: /\.ck-editor-wrapper/, desc: 'Editor wrapper styles' },
      { pattern: /\.ck\.ck-editor__editable/, desc: 'Editable area styles' },
      { pattern: /\.ck\.ck-toolbar/, desc: 'Toolbar styles' },
    ]
  },
  {
    name: 'BeritaForm CSS import',
    file: 'FrontEnd/src/components/berita/BeritaForm.jsx',
    checks: [
      { pattern: /import.*\.\/berita-editor\.css/, desc: 'CSS import' },
    ]
  },
  {
    name: 'State management',
    file: 'FrontEnd/src/components/berita/BeritaForm.jsx',
    checks: [
      { pattern: /const \[content, setContent\].*useState/, desc: 'Content state' },
      { pattern: /setContent\(data\)/, desc: 'setState on change' },
    ]
  },
  {
    name: 'Form validation',
    file: 'FrontEnd/src/components/berita/BeritaForm.jsx',
    checks: [
      { pattern: /stripHtml.*replace.*<.*>/, desc: 'HTML stripping for validation' },
    ]
  },
];

let totalChecks = 0;
let passedChecks = 0;

checks.forEach(check => {
  const filePath = path.join(__dirname, '..', check.file);
  
  console.log(`\n📄 ${check.name}`);
  console.log(`   File: ${check.file}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    check.checks.forEach(c => {
      totalChecks++;
      const matches = c.pattern.test(content);
      const isPass = c.invert ? !matches : matches;
      
      if (isPass) {
        console.log(`   ✅ ${c.desc}`);
        passedChecks++;
      } else {
        console.log(`   ❌ ${c.desc}`);
      }
    });
  } catch (err) {
    console.log(`   ⚠️  File not found: ${check.file}`);
  }
});

console.log(`\n${'='.repeat(50)}`);
console.log(`\n📊 Results: ${passedChecks}/${totalChecks} checks passed\n`);

if (passedChecks === totalChecks) {
  console.log('✅ All checks passed! CKEditor is properly implemented.\n');
  process.exit(0);
} else {
  console.log(`⚠️  ${totalChecks - passedChecks} checks failed. Please review.\n`);
  process.exit(1);
}
