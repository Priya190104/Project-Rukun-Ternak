const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

/**
 * Convert SVG file to data URL
 * SVG adalah text-based, bisa di-encode langsung
 */
function svgToDataUrl(filePath) {
  try {
    const svgContent = fs.readFileSync(filePath, 'utf8');
    return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
  } catch (e) {
    console.warn(`⚠️  SVG not found: ${filePath}`);
    return '';
  }
}

/**
 * Convert PNG/JPG/JPEG file to base64 data URL
 * Binary files harus dibaca sebagai Buffer dan di-encode ke base64
 * CRITICAL: Ini adalah solusi untuk PNG/JPG yang tidak muncul di Puppeteer
 */
function imageToDataUrl(filePath, mimeType) {
  try {
    // Baca file sebagai binary Buffer
    const imageBuffer = fs.readFileSync(filePath);
    // Convert ke base64 string
    const base64String = imageBuffer.toString('base64');
    // Return sebagai data URL
    return `data:${mimeType};base64,${base64String}`;
  } catch (e) {
    console.warn(`⚠️  Image not found: ${filePath}`);
    return '';
  }
}

/**
 * Helper function untuk detect file type dan convert ke data URL
 * Support: SVG, PNG, JPG, JPEG
 */
function assetToDataUrl(filePath, defaultMimeType = 'image/png') {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  Asset file not found: ${filePath}`);
    return '';
  }

  const ext = path.extname(filePath).toLowerCase();

  // SVG: text-based
  if (ext === '.svg') {
    return svgToDataUrl(filePath);
  }

  // Binary image format: PNG, JPG, JPEG
  const mimeTypes = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };

  const mimeType = mimeTypes[ext] || defaultMimeType;
  return imageToDataUrl(filePath, mimeType);
}

async function renderCertificate(data) {
  const templatePath = path.resolve(__dirname, 'template.html');
  const stylePath = path.resolve(__dirname, 'style.css');
  const assetsPath = path.resolve(__dirname, 'assets');
  
  console.log('[RenderCertificate] Starting certificate generation...');
  
  // ========================================
  // STEP 1: Baca template dan CSS
  // ========================================
  let html = fs.readFileSync(templatePath, 'utf8');
  const cssContent = fs.readFileSync(stylePath, 'utf8');
  console.log(`[RenderCertificate] Template: ${html.length} bytes, CSS: ${cssContent.length} bytes`);
  
  // Validate HTML basic structure
  if (!html.includes('<html') || !html.includes('</html>')) {
    throw new Error('Invalid template HTML structure');
  }
  console.log('[RenderCertificate] HTML structure validated');

  // ========================================
  // STEP 2: Resolve asset baru ke absolute path dan convert ke data URL
  // CRITICAL: Semua asset di-embed dalam HTML string sebagai data URL
  // ========================================
  
  const assetMap = {
    // Background template lengkap
    'assets/image1.png': path.resolve(assetsPath, 'image1.png'),
    // Logo BAZNAS
    'assets/logo.png': path.resolve(assetsPath, 'logo.png'),
    // Gambar hewan dekoratif
    'assets/Picture1.png': path.resolve(assetsPath, 'Picture1.png'),
    'assets/Picture2.png': path.resolve(assetsPath, 'Picture2.png'),
    // Rumput dekoratif
    'assets/Picture3.png': path.resolve(assetsPath, 'Picture3.png'),
  };

  // Replace asset paths dengan data URL
  let assetsLoaded = 0;
  let assetsFailed = 0;
  for (const [originalPath, actualFilePath] of Object.entries(assetMap)) {
    if (fs.existsSync(actualFilePath)) {
      const dataUrl = assetToDataUrl(actualFilePath);
      if (dataUrl && dataUrl.length > 20) {  // Valid data URL harus punya length > 20
        html = html.replace(new RegExp(originalPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), dataUrl);
        assetsLoaded++;
        console.log(`  [${assetsLoaded}] ${path.basename(actualFilePath)} → ${dataUrl.substring(0, 50)}...`);
      } else {
        assetsFailed++;
        console.warn(`  ❌ Failed to convert ${path.basename(actualFilePath)}`);
      }
    } else {
      assetsFailed++;
      console.warn(`  ❌ Asset not found: ${path.basename(actualFilePath)}`);
    }
  }
  console.log(`[RenderCertificate] Assets loaded: ${assetsLoaded}/${Object.keys(assetMap).length}`);

  // ========================================
  // STEP 3: Inject CSS sebagai embedded <style> tag
  // ========================================
  html = html.replace(
    /<link[^>]*href="style\.css"[^>]*>/gi,
    `<style>${cssContent}</style>`
  );
  console.log(`[RenderCertificate] CSS injected, HTML now ${html.length} chars`);

  // ========================================
  // STEP 4: Replace template placeholders dengan data
  // ========================================
  const replacements = {
    namaKelompok: data.namaKelompok || '-',
    tanggalLahir: data.tanggalLahir || '-',
    noRegistrasi: data.noRegistrasi || '-',
    idTernak: data.idTernak || '-',
    jenisKelamin: data.jenisKelamin || '-',
    ras: data.ras || '-',
    induk: data.induk || '-',
    pejantan: data.pejantan || '-',
    bobot: data.bobot || '-',
  };

  console.log('[RenderCertificate] Replacing placeholders:');
  let unresolvedCount = 0;
  for (const [key, value] of Object.entries(replacements)) {
    const placeholder = `{{${key}}}`;
    const countBefore = (html.match(new RegExp(`{{${key}}}`, 'g')) || []).length;
    if (html.includes(placeholder)) {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
      const countAfter = (html.match(new RegExp(`{{${key}}}`, 'g')) || []).length;
      console.log(`  ✅ ${key}: "${value}" (found: ${countBefore})`);
      if (countAfter > 0) {
        console.warn(`    ⚠️  Some placeholders remain: ${countAfter}`);
        unresolvedCount += countAfter;
      }
    } else {
      console.warn(`  ⚠️  Placeholder not found: ${placeholder}`);
    }
  }
  if (unresolvedCount > 0) {
    console.warn(`[RenderCertificate] Warning: ${unresolvedCount} unresolved placeholders remain`);
  }

  // ========================================
  // STEP 5: Launch Puppeteer dengan config optimal
  // ========================================
  console.log('[RenderCertificate] Launching Puppeteer...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  });

  try {
    const page = await browser.newPage();
    console.log('[RenderCertificate] Page created');

    // Track page errors
    page.on('error', err => console.error('[RenderCertificate] Page error:', err));
    page.on('pageerror', err => console.error('[RenderCertificate] Uncaught exception:', err));

    // ========================================
    // STEP 6: Emulate media type untuk PDF print
    // 'print' media adalah yang seharusnya untuk PDF rendering
    // ========================================
    await page.emulateMediaType('print');

    await page.setViewport({
      width: 1600,
      height: 900,
      deviceScaleFactor: 2,
    });
    console.log('[RenderCertificate] Viewport set: 1600x900@2x, media: print');

    // ========================================
    // STEP 7: Set content dengan HTML yang sudah ter-process
    // Semua assets sudah embedded sebagai data URL dan CSS sebagai <style>
    // ========================================
    console.log('[RenderCertificate] Setting HTML content...');
    try {
      await page.setContent(html, {
        waitUntil: 'domcontentloaded',  // Fast: DOM ready, tidak perlu wait untuk network
        timeout: 30000,
      });
      console.log('[RenderCertificate] HTML content set successfully');
    } catch (setContentErr) {
      console.warn('[RenderCertificate] setContent warning:', setContentErr.message);
      // Continue anyway
    }

    // ========================================
    // STEP 8: Debug page content & Take screenshot for verification
    // ========================================
    const pageContent = await page.evaluate(() => {
      const titlesTxt = document.querySelectorAll('.title-text');
      const dataItems = document.querySelectorAll('.data-item');
      const images = document.querySelectorAll('img');
      const wrapper = document.querySelector('.certificate-wrapper');
      return {
        hasTitle: titlesTxt.length > 0,
        titleCount: titlesTxt.length,
        dataItemCount: dataItems.length,
        imageCount: images.length,
        wrapperVisible: wrapper ? window.getComputedStyle(wrapper).display !== 'none' : false,
        wrapperSize: wrapper ? {
          width: wrapper.clientWidth,
          height: wrapper.clientHeight,
        } : null,
        bodyHTML: document.body.innerHTML ? document.body.innerHTML.substring(0, 150) : 'empty',
      };
    });
    console.log('[RenderCertificate] Page content debug:', JSON.stringify(pageContent));

    // Optional: Save screenshot untuk debug (uncomment jika perlu)
    // const screenshot = await page.screenshot({ path: '/tmp/cert-debug.png', fullPage: true });
    // console.log('[RenderCertificate] Screenshot saved to /tmp/cert-debug.png');

    // Wait untuk print media CSS fully applied
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('[RenderCertificate] Render delay completed');

    // ========================================
    // STEP 9: Generate PDF dengan custom size untuk 16:9 aspect ratio
    // ========================================
    console.log('[RenderCertificate] Generating PDF (size: 1600x900)...');
    const pdf = await page.pdf({
      width: '1600px',
      height: '900px',
      margin: '0px',
      printBackground: true,
      preferCSSPageSize: false,
      scale: 1,
      displayHeaderFooter: false,
    });

    if (!pdf || pdf.length === 0) {
      throw new Error('PDF generation produced empty output');
    }

    console.log(`[RenderCertificate] ✅ PDF generated successfully: ${pdf.length} bytes`);
    return pdf;
  } finally {
    await browser.close();
  }
}

module.exports = { renderCertificate };
