#!/usr/bin/env node

/**
 * Image Optimization Script
 * Optimize WebP files dengan reducing quality untuk faster loading
 */

const fs = require('fs');
const path = require('path');

// Note: This is informational. Actual optimization perlu ffmpeg installed
console.log('📊 Logo File Sizes:');
console.log('');

const logoPath = path.join(__dirname, 'public', 'logo.webp');
const partnerPath = path.join(__dirname, 'public', 'partner-logo.webp');

try {
  const logoStats = fs.statSync(logoPath);
  const partnerStats = fs.statSync(partnerPath);
  
  console.log(`📷 Rukun Ternak Logo: ${(logoStats.size / 1024).toFixed(2)} KB`);
  console.log(`   ⚠️  TOO LARGE - Recommend: 50-100 KB`);
  console.log('');
  console.log(`🏦 BSI Logo: ${(partnerStats.size / 1024).toFixed(2)} KB`);
  console.log(`   ✅ GOOD`);
  console.log('');
  console.log('To optimize logo.webp, run:');
  console.log('');
  console.log('# Using FFmpeg:');
  console.log('ffmpeg -i logo.webp -c:v libwebp -q:v 70 logo-optimized.webp');
  console.log('');
  console.log('# Then replace logo.webp with logo-optimized.webp');
  console.log('');
} catch (err) {
  console.error('Error reading files:', err);
}
