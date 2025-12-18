const db = require('../db');
const { renderCertificate } = require('../../certificates/renderCertificate');

async function generateSertifikatKelahiran(req, res) {
  try {
    const laporanId = parseInt(req.params.id, 10);
    if (Number.isNaN(laporanId)) {
      return res.status(400).json({ success: false, message: 'ID laporan tidak valid' });
    }

    // Fetch laporan data
    const laporanRes = await db.query(
      `SELECT l.*, k.id as kelompok_id, k.name as kelompok_name, k.pic1_nama, k.desa, k.kecamatan, u.full_name
       FROM laporan l
       LEFT JOIN kelompok k ON l.kelompok_id = k.id
       LEFT JOIN users u ON l.user_id = u.id
       WHERE l.id = $1`,
      [laporanId]
    );

    if (!laporanRes.rows[0]) {
      return res.status(404).json({ success: false, message: 'Laporan tidak ditemukan' });
    }

    const laporan = laporanRes.rows[0];

    // Only allow Kelahiran type
    if (laporan.jenis !== 'Kelahiran') {
      return res.status(400).json({ success: false, message: 'Sertifikat hanya tersedia untuk laporan Kelahiran' });
    }

    // Prepare data for certificate
    const data = laporan.data || {};
    const certificateData = {
      namaKelompok: laporan.kelompok_name || '-',
      peternak: data.nama_anggota || '-',
      tanggalLahir: data.tanggal || '-',
      noRegistrasi: data.register || '-',
      idTernak: data.id || '-',
      jenisKelamin: data.jenis_kelamin || '-',
      warna: data.warna || '-',
      ras: data.ras || '-',
      induk: data.induk || '-',
      pejantan: data.pejantan || '-',
      bobot: (data.bobot || '-') + (data.bobot ? ' kg' : ''),
      tanggal: new Date(laporan.tanggal).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    };

    // Render certificate to PDF
    const pdf = await renderCertificate(certificateData);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Sertifikat_Kelahiran_${laporanId}.pdf"`);
    res.setHeader('Content-Length', pdf.length);

    // Send PDF
    res.send(pdf);
  } catch (e) {
    console.error('Error generating sertifikat:', e);
    return res.status(500).json({ success: false, message: 'Server error generating certificate' });
  }
}

module.exports = { generateSertifikatKelahiran };
