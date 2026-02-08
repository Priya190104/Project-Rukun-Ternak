/**
 * Sertifikat Controller
 * 
 * Handles HTTP requests for certificate generation
 * Delegates business logic to certificateService
 */

const { generateCertificateForLaporan } = require('../services/certificateService');

/**
 * POST /api/laporan/:id/sertifikat
 * Generate and download certificate for a laporan (birth report)
 * 
 * Query params:
 *   - view: if "true", open in browser instead of downloading
 * 
 * Response:
 *   - PDF stream with appropriate headers
 */
async function generateSertifikatKelahiran(req, res) {
  try {
    const laporanId = parseInt(req.params.id, 10);
    const viewInBrowser = req.query.view === 'true';

    // Call service to generate certificate
    const { pdf, filename } = await generateCertificateForLaporan(laporanId, req.user);

    // Ensure pdf is a Buffer
    const pdfBuffer = Buffer.isBuffer(pdf) ? pdf : Buffer.from(pdf);

    // Set response headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader(
      'Content-Disposition',
      `${viewInBrowser ? 'inline' : 'attachment'}; filename="${filename}"`
    );
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Send PDF as binary data
    res.end(pdfBuffer);
  } catch (error) {
    // Handle service errors with proper status codes
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Terjadi kesalahan saat menghasilkan sertifikat';

    console.error(
      '[SertifikatController] Error:',
      statusCode,
      message,
      error.details || ''
    );

    return res.status(statusCode).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === 'development' && { details: error.details }),
    });
  }
}

module.exports = { generateSertifikatKelahiran };
