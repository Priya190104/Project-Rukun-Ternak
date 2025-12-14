import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReportById } from '../services/reportService';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, Calendar, FileText, Heart, Skull, Gift, BarChart3, Edit2, Trash2 } from 'lucide-react';

const JENIS_CONFIG = {
  'Kelahiran': { icon: Heart, color: 'green', label: 'Laporan Kelahiran' },
  'Kematian': { icon: Skull, color: 'red', label: 'Laporan Kematian' },
  'Penjualan': { icon: Gift, color: 'yellow', label: 'Penjualan' },
  'Budidaya': { icon: BarChart3, color: 'blue', label: 'Laporan Budidaya' }
};

const FIELD_LABELS = {
  nomor_indukan: 'Nomor Indukan',
  nomor_pejantan: 'Nomor Pejantan',
  nomor_kelahiran: 'Nomor Kelahiran',
  jenis_kelamin: 'Jenis Kelamin',
  bobot_lahir: 'Bobot Lahir',
  kondisi_lahir: 'Kondisi Lahir',
  nomor_ternak: 'Nomor Ternak',
  penyebab: 'Penyebab',
  detail_penyebab: 'Detail Penyebab',
  tindakan: 'Tindakan',
  umur: 'Umur',
  bobot: 'Bobot',
  kondisi_kesehatan: 'Kondisi Kesehatan',
  status_siap: 'Status Kesiapan',
  kategori: 'Kategori',
  jenis_pakan: 'Jenis Pakan',
  jumlah: 'Jumlah',
  sumber_pakan: 'Sumber Pakan',
  kondisi_kandang: 'Kondisi Kandang',
  kebersihan: 'Kebersihan',
  kapasitas: 'Kapasitas',
  jumlah_ternak: 'Jumlah Ternak',
  program_vaksinasi: 'Program Vaksinasi',
  penyakit: 'Penyakit',
  tindakan_pengobatan: 'Tindakan Pengobatan',
  catatan: 'Catatan'
};

export default function ClientLihatLaporan() {
  const { id } = useParams();
  const { user, appRole } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const r = await getReportById(id);
        if (!mounted) return;
        
        if (!r) {
          setError('Laporan tidak ditemukan');
          return;
        }

        // kelompok may only view own reports
        if (appRole === 'kelompok' && r.kelompok_id !== user.kelompok_id) {
          setError('Anda tidak memiliki akses ke laporan ini');
          return;
        }

        // user can only view own reports (non-kelompok)
        if (appRole !== 'admin' && r.user_id !== user.id) {
          setError('Anda tidak memiliki akses ke laporan ini');
          return;
        }

        setReport(r);
      } catch (err) {
        setError('Gagal memuat laporan: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [id, user, appRole]);

  const handleDelete = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus laporan ini?')) return;
    try {
      // TODO: Implement delete endpoint
      alert('Fitur delete akan segera tersedia');
    } catch (err) {
      alert('Gagal menghapus laporan: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-emerald-700 font-medium">Memuat laporan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/laporan')}
            className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition"
          >
            Kembali ke Laporan
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  const config = JENIS_CONFIG[report.jenis] || { icon: FileText, color: 'gray' };
  const Icon = config.icon;
  const colorMap = {
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    blue: 'bg-blue-100 text-blue-700',
    gray: 'bg-gray-100 text-gray-700'
  };

  const formattedDate = new Date(report.tanggal).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const reportData = report.data || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/laporan')}
          className="flex items-center gap-2 text-emerald-700 hover:text-emerald-900 mb-6 font-medium transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali ke Daftar Laporan
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-6">
          <div className="flex items-start justify-between mb-6 gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-lg ${colorMap[config.color]}`}>
                <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{config.label}</h1>
                <p className="text-gray-600">ID: {report.id}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/laporan/${id}/edit`)}
                className="p-2 sm:p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition hidden sm:flex items-center"
                title="Edit laporan"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 sm:p-3 text-red-600 hover:bg-red-50 rounded-lg transition hidden sm:flex items-center"
                title="Hapus laporan"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Date Info */}
          <div className="flex items-center gap-3 text-gray-700 bg-gray-50 rounded-lg p-4">
            <Calendar className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-600">Tanggal Laporan</p>
              <p className="font-semibold text-gray-900">{formattedDate}</p>
            </div>
          </div>
        </div>

        {/* Data Fields */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Detail Data</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(reportData).map(([key, value]) => {
              if (value === null || value === undefined || value === '') return null;
              const label = FIELD_LABELS[key] || key;
              return (
                <div key={key} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                  <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
                  <p className="text-gray-900 font-semibold break-words">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </p>
                </div>
              );
            })}
          </div>

          {Object.keys(reportData).length === 0 && (
            <p className="text-center text-gray-500 py-8">Tidak ada data yang ditampilkan</p>
          )}
        </div>

        {/* Mobile Action Buttons */}
        <div className="mt-6 flex gap-3 sm:hidden">
          <button
            onClick={() => navigate(`/laporan/${id}/edit`)}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
