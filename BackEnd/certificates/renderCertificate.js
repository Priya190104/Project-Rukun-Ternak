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
  
  // ========================================
  // STEP 1: Baca template dan CSS
  // ========================================
  let html = fs.readFileSync(templatePath, 'utf8');
  const cssContent = fs.readFileSync(stylePath, 'utf8');

  // ========================================
  // STEP 2: Resolve SEMUA asset ke absolute path dan convert ke data URL
  // CRITICAL: Ini handle BAIK SVG maupun PNG/JPG/JPEG
  // Data URL adalah solusi PALING RELIABLE untuk Puppeteer PDF rendering
  // karena:
  // 1. Tidak perlu resolve file:// path (yang sering gagal)
  // 2. Semua resource ter-embed dalam HTML string
  // 3. Puppeteer tidak perlu load dari disk saat rendering PDF
  // ========================================
  
  const assetMap = {
    // Logo - bisa SVG atau PNG/JPG
    'assets/logo-baznas.svg': path.resolve(assetsPath, 'logo-baznas.png'),
    'assets/logo-baznas.png': path.resolve(assetsPath, 'logo-baznas.png'),
    // Background - bisa SVG atau PNG/JPG
    'assets/background.svg': path.resolve(assetsPath, 'background.png'),
    'assets/background.png': path.resolve(assetsPath, 'background.png'),
    // Background Footer
    'assets/background-footer.svg': path.resolve(assetsPath, 'background-footer.png'),
    'assets/background-footer.png': path.resolve(assetsPath, 'background-footer.png'),
    // Stempel - bisa SVG atau PNG/JPG
    'assets/stempel.svg': path.resolve(assetsPath, 'stempel.svg'),
    'assets/stempel.png': path.resolve(assetsPath, 'stempel.png'),
    // Tanda tangan - bisa SVG atau PNG/JPG
    'assets/tanda-tangan.svg': path.resolve(assetsPath, 'tanda-tangan.svg'),
    'assets/tanda-tangan.png': path.resolve(assetsPath, 'tanda-tangan.png'),
    // Lamb/Domba - bisa SVG atau PNG/JPG (ternak1.png)
    'assets/lamb.svg': path.resolve(assetsPath, 'ternak1.png'),
    'assets/lamb.png': path.resolve(assetsPath, 'ternak1.png'),
    'assets/ternak1.png': path.resolve(assetsPath, 'ternak1.png'),
    'assets/ternak1.svg': path.resolve(assetsPath, 'ternak1.png'),
    // Ternak 2 - PNG baru
    'assets/ternak2.png': path.resolve(assetsPath, 'ternak2.png'),
    'assets/ternak2.svg': path.resolve(assetsPath, 'ternak2.png'),
  };

  // Replace asset paths dengan data URL
  // Try untuk find actual file dan convert, fallback ke original path jika file tidak ada
  for (const [originalPath, actualFilePath] of Object.entries(assetMap)) {
    if (fs.existsSync(actualFilePath)) {
      const dataUrl = assetToDataUrl(actualFilePath);
      if (dataUrl) {
        html = html.replace(new RegExp(originalPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), dataUrl);
        console.log(`✅ Loaded asset: ${originalPath} → ${path.basename(actualFilePath)}`);
      }
    }
  }

  // ========================================
  // STEP 3: Inject CSS sebagai embedded <style> tag
  // ========================================
  html = html.replace(
    /<link[^>]*href="style\.css"[^>]*>/gi,
    `<style>${cssContent}</style>`
  );

  // ========================================
  // STEP 4: Replace template placeholders dengan data
  // ========================================
  const replacements = {
    namaKelompok: data.namaKelompok || '-',
    peternak: data.peternak || '-',
    tanggalLahir: data.tanggalLahir || '-',
    noRegistrasi: data.noRegistrasi || '-',
    idTernak: data.idTernak || '-',
    jenisKelamin: data.jenisKelamin || '-',
    warna: data.warna || '-',
    ras: data.ras || '-',
    induk: data.induk || '-',
    pejantan: data.pejantan || '-',
    bobot: data.bobot || '-',
    tanggal: data.tanggal || new Date().toLocaleDateString('id-ID'),
  };

  for (const [key, value] of Object.entries(replacements)) {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }

  // ========================================
  // STEP 5: Launch Puppeteer dengan config optimal
  // ========================================
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

    // ========================================
    // STEP 6: Emulate media type dan set viewport
    // ========================================
    await page.emulateMediaType('screen');

    await page.setViewport({
      width: 1190,
      height: 842,
      deviceScaleFactor: 2,
    });

    // ========================================
    // STEP 7: Set content dengan HTML yang sudah ter-process
    // Tunggu network idle untuk memastikan semua resource loaded
    // ========================================
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // ========================================
    // STEP 8: Tunggu semua image elements ter-render
    // Penting untuk memastikan data URL images sudah di-load browser
    // ========================================
    try {
      await page.waitForFunction(() => {
        const images = document.querySelectorAll('img');
        if (images.length === 0) return false;
        
        return Array.from(images).every(img => {
          // Check apakah image fully loaded
          return img.complete && img.naturalHeight !== 0;
        });
      }, { timeout: 5000 });
    } catch (e) {
      console.warn('⚠️  Image load wait timeout (continuing anyway)');
    }

    // ========================================
    // STEP 9: Generate PDF dengan config TEPAT untuk image rendering
    // ========================================
    const pdf = await page.pdf({
      format: 'A4',
      landscape: true,
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
      printBackground: true,     // WAJIB: render background & image
      preferCSSPageSize: false,
    });

    return pdf;
  } finally {
    await browser.close();
  }
}

module.exports = { renderCertificate };
