/**
 * DOM Inspection Test: Check if catatan fields are actually rendered in the HTML
 * This test uses Puppeteer to open browser and inspect actual rendered DOM
 */

const puppeteer = require('puppeteer');

async function inspectDOM() {
  let browser;
  
  try {
    console.log('\n' + '='.repeat(80));
    console.log('DOM INSPECTION TEST: Checking if Catatan Fields are Rendered');
    console.log('='.repeat(80) + '\n');

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    
    // Test 1: Kelahiran Form
    console.log('Test 1: KELAHIRAN FORM');
    console.log('-'.repeat(80));
    
    await page.goto('http://localhost:3000/pilih-jenis', { waitUntil: 'networkidle2' });
    
    // Click on kelahiran button
    await page.click('button:has-text("Kelahiran")');
    await page.waitForTimeout(1000);
    
    // Check for catatan textarea in kelahiran form
    const catatanFieldKelahiran = await page.$('textarea[placeholder*="kelahiran"]');
    
    if (catatanFieldKelahiran) {
      console.log('✅ Catatan textarea FOUND in Kelahiran form');
      const value = await page.evaluate(el => el.value, catatanFieldKelahiran);
      const placeholder = await page.evaluate(el => el.placeholder, catatanFieldKelahiran);
      const rows = await page.evaluate(el => el.rows, catatanFieldKelahiran);
      console.log(`   Placeholder: "${placeholder}"`);
      console.log(`   Rows: ${rows}`);
      console.log(`   Visible: ${await catatanFieldKelahiran.isVisible()}`);
    } else {
      console.log('❌ Catatan textarea NOT FOUND in Kelahiran form');
    }

    // Get all fields visible in form to check order
    const allLabels = await page.$$eval('label', labels => 
      labels.map(l => l.textContent.trim())
    );
    
    console.log('\nAll form fields (in order):');
    allLabels.forEach((label, idx) => {
      if (label.includes('Tanggal') || label.includes('Induk') || label.includes('Jenis') || 
          label.includes('Jumlah') || label.includes('Ras') || label.includes('Bobot') || 
          label.includes('ID') || label.includes('Catatan')) {
        console.log(`  ${idx + 1}. ${label}`);
      }
    });

    // Check position of catatan field
    const catatanLabel = await page.$('label:has-text("Catatan")');
    if (catatanLabel) {
      const boundingBox = await catatanLabel.boundingBox();
      console.log(`\n✅ Catatan field position: Y=${boundingBox.y}, visible on page`);
    }

    console.log('\n✅ Test 1 Complete\n');

    // Test 2: Pembuatan Kelompok Form - Hewan Ternak
    console.log('Test 2: PEMBUATAN KELOMPOK FORM - HEWAN TERNAK');
    console.log('-'.repeat(80));
    
    // Navigate to pembuatan kelompok
    await page.goto('http://localhost:3000/kl-buat', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    
    // Check for catatan fields in hewan ternak section
    const catatanFieldsKelompok = await page.$$('textarea[placeholder*="hewan"]');
    
    if (catatanFieldsKelompok.length > 0) {
      console.log(`✅ Found ${catatanFieldsKelompok.length} catatan textarea(s) in hewan ternak section`);
      for (let i = 0; i < catatanFieldsKelompok.length; i++) {
        const placeholder = await page.evaluate(el => el.placeholder, catatanFieldsKelompok[i]);
        const visible = await page.evaluate(el => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden';
        }, catatanFieldsKelompok[i]);
        console.log(`   Catatan ${i + 1}: placeholder="${placeholder}", visible=${visible}`);
      }
    } else {
      console.log('❌ No catatan textarea found in hewan ternak section');
    }

    // Get all labels in form
    const allLabelsKelompok = await page.$$eval('label', labels => 
      labels.map(l => l.textContent.trim()).filter(t => t.length > 0 && t.length < 100)
    );
    
    console.log('\nAll visible labels in form:');
    const catatanIndex = allLabelsKelompok.findIndex(l => l.includes('Catatan'));
    if (catatanIndex >= 0) {
      console.log(`  ... (showing fields around Catatan)`);
      for (let i = Math.max(0, catatanIndex - 2); i < Math.min(allLabelsKelompok.length, catatanIndex + 3); i++) {
        const marker = i === catatanIndex ? ' ⬅️ CATATAN' : '';
        console.log(`  ${i + 1}. ${allLabelsKelompok[i]}${marker}`);
      }
    } else {
      console.log('  (Catatan label not found in visible labels)');
    }

    console.log('\n✅ Test 2 Complete\n');

    console.log('='.repeat(80));
    console.log('CONCLUSION:');
    console.log('='.repeat(80));
    
    const catatanFoundKelahiran = catatanFieldKelahiran !== null;
    const catatanFoundKelompok = catatanFieldsKelompok.length > 0;
    
    if (catatanFoundKelahiran && catatanFoundKelompok) {
      console.log('✅ Catatan fields ARE rendered in both forms');
      console.log('   1. Kelahiran form: ✅ Found');
      console.log('   2. Kelompok/Hewan form: ✅ Found');
      console.log('\n✅ VERIFICATION PASSED - Fields are in the DOM\n');
    } else {
      console.log('❌ Catatan fields are MISSING:');
      if (!catatanFoundKelahiran) console.log('   1. Kelahiran form: ❌ NOT Found');
      if (!catatanFoundKelompok) console.log('   2. Kelompok/Hewan form: ❌ NOT Found');
      console.log('\n❌ VERIFICATION FAILED - Check JSX rendering\n');
    }

  } catch (error) {
    console.error('❌ Inspection Error:', error.message);
  } finally {
    if (browser) await browser.close();
  }
}

inspectDOM();
