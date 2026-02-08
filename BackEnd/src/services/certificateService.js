/**
 * Certificate Service
 * 
 * Handles all certificate generation logic
 * Separation of concerns: business logic away from controllers
 * 
 * Key responsibilities:
 * 1. Fetch laporan data from database
 * 2. Validate laporan type
 * 3. Transform data to certificate format
 * 4. Generate PDF
 */

const db = require('../db');
const { renderCertificate } = require('../../certificates/renderCertificate');

/**
 * Generate certificate for a laporan (birth report)
 * 
 * @param {number} laporanId - ID of the laporan to generate certificate for
 * @param {object} user - Authenticated user object (for authorization)
 * @returns {Promise<Buffer>} - PDF buffer
 * @throws {Error} - If laporan not found, invalid type, or PDF generation fails
 */
async function generateCertificateForLaporan(laporanId, user) {
  // ===== STEP 1: Validation =====
  if (!laporanId || Number.isNaN(parseInt(laporanId))) {
    const error = new Error('ID laporan tidak valid');
    error.statusCode = 400;
    throw error;
  }

  if (!user || !user.id) {
    const error = new Error('User tidak terautentikasi');
    error.statusCode = 401;
    throw error;
  }

  // ===== STEP 2: Fetch laporan with full data =====
  let laporanRes;
  try {
    laporanRes = await db.query(
      `SELECT 
        l.id,
        l.jenis,
        l.laporan_type,
        l.kelompok_id,
        l.user_id,
        l.data,
        l.tanggal,
        l.created_at,
        k.id as kelompok_ref_id,
        k.name as kelompok_name,
        k.desa,
        k.kecamatan,
        k.pic1_nama,
        u.full_name,
        u.username
       FROM laporan l
       LEFT JOIN kelompok k ON l.kelompok_id = k.id
       LEFT JOIN users u ON l.user_id = u.id
       WHERE l.id = $1`,
      [laporanId]
    );
  } catch (err) {
    console.error('[CertificateService] Database error fetching laporan:', err);
    const error = new Error('Gagal mengambil data laporan dari database');
    error.statusCode = 500;
    throw error;
  }

  const laporan = laporanRes.rows[0];

  // ===== STEP 3: Check if laporan exists =====
  if (!laporan) {
    const error = new Error('Laporan tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  // ===== STEP 4: Validate laporan type (ONLY Kelahiran allowed) =====
  const jenisLower = laporan.jenis?.toLowerCase();
  if (jenisLower !== 'kelahiran') {
    const error = new Error(`Sertifikat hanya tersedia untuk laporan Kelahiran. Laporan ini bertipe: ${laporan.jenis}`);
    error.statusCode = 400;
    throw error;
  }

  // ===== STEP 5: Authorization check =====
  // Rules:
  // - Admin: can generate any certificate
  // - Kelompok: can only generate for their own kelompok
  // - User: can only generate for their own laporan
  // - Viewer: cannot generate (read-only)
  
  const isAdmin = user.role === 'admin';
  const isKelompok = user.role === 'kelompok' && user.kelompok_id === laporan.kelompok_id;
  const isOwner = user.id === laporan.user_id;

  // DEBUG: Log authorization check
  console.log('[CertificateService] Authorization check:', {
    user_id: user.id,
    user_role: user.role,
    user_kelompok_id: user.kelompok_id,
    laporan_user_id: laporan.user_id,
    laporan_kelompok_id: laporan.kelompok_id,
    isAdmin,
    isKelompok,
    isOwner,
  });

  if (!isAdmin && !isKelompok && !isOwner) {
    const error = new Error('Anda tidak memiliki izin untuk menghasilkan sertifikat laporan ini');
    error.statusCode = 403;
    throw error;
  }

  // ===== STEP 6: Transform laporan data to certificate format =====
  const laporanData = laporan.data || {};
  
  const certificateData = {
    namaKelompok: laporan.kelompok_name || '-',
    tanggalLahir: laporanData.tanggal_kelahiran || '-',
    noRegistrasi: laporanData.id || '-',
    idTernak: laporanData.id_hewan || laporanData.id || '-',
    jenisKelamin: laporanData.jenis_kelamin_anak || '-',
    ras: laporanData.ras || '-',
    induk: laporanData.induk_id || '-',
    pejantan: laporanData.pejantan_id || '-',
    bobot: (laporanData.bobot || '-') + (laporanData.bobot ? ' kg' : ''),
  };

  // ===== STEP 7: Generate PDF =====
  let pdf;
  try {
    console.log('[CertificateService] Generating PDF for laporan:', laporan.id);
    pdf = await renderCertificate(certificateData);
    console.log('[CertificateService] ✅ PDF generated successfully, size:', pdf.length, 'bytes');
  } catch (err) {
    console.error('[CertificateService] PDF generation error:', err);
    const error = new Error('Gagal menghasilkan PDF sertifikat');
    error.statusCode = 500;
    error.details = err.message;
    throw error;
  }

  return {
    pdf,
    filename: `Sertifikat_Kelahiran_${laporan.id}_${laporan.kelompok_name || 'unknown'}.pdf`,
  };
}

/**
 * Helper: Format date to Indonesian locale
 * @param {string|Date} dateString
 * @returns {string} - Formatted date
 */
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString || '-';
  }
}

module.exports = {
  generateCertificateForLaporan,
};
