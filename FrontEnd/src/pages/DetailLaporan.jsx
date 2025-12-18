import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, FileText, AlertCircle, Download } from 'lucide-react';
import client from '../api/client';

export default function DetailLaporan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [laporan, setLaporan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchLaporanDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await client.get(`/api/laporan/${id}`);
        
        if (response.data?.success) {
          setLaporan(response.data.data);
        } else {
          setError('Gagal memuat detail laporan');
        }
      } catch (err) {
        console.error('Error fetching laporan detail:', err);
        setError(err.response?.data?.message || 'Terjadi kesalahan saat memuat laporan');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLaporanDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium mb-6 transition"
          >
            <ArrowLeft size={20} />
            Kembali
          </button>
          <div className="text-center py-12">
            <p className="text-gray-600">Loading detail laporan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium mb-6 transition"
          >
            <ArrowLeft size={20} />
            Kembali
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-4">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="text-red-900 font-bold text-lg mb-1">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!laporan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium mb-6 transition"
          >
            <ArrowLeft size={20} />
            Kembali
          </button>
          <p className="text-gray-600">Laporan tidak ditemukan</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const handleDownloadSertifikat = async () => {
    if (laporan.jenis !== 'Kelahiran') {
      alert('Download sertifikat hanya tersedia untuk laporan Kelahiran');
      return;
    }

    setDownloading(true);
    try {
      const response = await client.get(`/api/laporan/${id}/sertifikat`, {
        responseType: 'blob'
      });

      // Create blob and download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Sertifikat_Kelahiran_${laporan.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading sertifikat:', err);
      alert('Gagal mengunduh sertifikat: ' + (err.response?.data?.message || err.message));
    } finally {
      setDownloading(false);
    }
  };

  const getJenisColor = (jenis) => {
    switch (jenis) {
      case 'Kelahiran':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Kematian':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Penjualan':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Budidaya':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getJenisLabel = (jenis) => {
    switch (jenis) {
      case 'Kelahiran':
        return '🐑 Laporan Kelahiran';
      case 'Kematian':
        return '💔 Laporan Kematian';
      case 'Penjualan':
        return '💰 Penjualan';
      case 'Budidaya':
        return '📊 Laporan Budidaya';
      default:
        return `📋 ${jenis}`;
    }
  };

  const renderDataDetails = () => {
    const data = laporan.data || {};
    
    return (
      <div className="space-y-4">
        {Object.entries(data).map(([key, value]) => {
          // Skip kategori as it's for budidaya type
          if (key === 'kategori') return null;
          
          return (
            <div key={key} className="border-b border-gray-200 pb-3 last:border-0">
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">
                {key.replace(/_/g, ' ')}
              </p>
              <p className="text-base text-gray-900 break-words">
                {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium mb-8 transition"
        >
          <ArrowLeft size={20} />
          Kembali
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className={`${getJenisColor(laporan.jenis)} p-6 sm:p-8 border-b-2`}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                  {getJenisLabel(laporan.jenis)}
                </h1>
                <p className="text-sm opacity-80">
                  ID Laporan: <span className="font-mono font-bold">{laporan.id}</span>
                </p>
              </div>
              <div className={`px-4 py-2 rounded-lg border-2 font-bold text-sm whitespace-nowrap ${getJenisColor(laporan.jenis)}`}>
                {laporan.jenis}
              </div>
            </div>

            {/* Action Buttons */}
            {laporan.jenis === 'Kelahiran' && (
              <div className="flex gap-3">
                <button
                  onClick={handleDownloadSertifikat}
                  disabled={downloading}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold rounded-lg transition"
                >
                  <Download size={18} />
                  {downloading ? 'Mengunduh...' : 'Download Sertifikat'}
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* Meta Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Tanggal */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="text-emerald-600" size={24} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Tanggal Laporan</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {formatDate(laporan.tanggal)}
                  </p>
                </div>
              </div>

              {/* Kelompok (if exists) */}
              {laporan.kelompok && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <User className="text-teal-600" size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Kelompok</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {laporan.kelompok}
                    </p>
                  </div>
                </div>
              )}

              {/* User (if exists) */}
              {laporan.full_name && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <User className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Pembuat Laporan</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {laporan.full_name}
                    </p>
                    {laporan.username && (
                      <p className="text-sm text-gray-600 mt-1">@{laporan.username}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Data Details */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="text-emerald-600" size={20} />
                <h2 className="text-2xl font-bold text-gray-900">Detail Data</h2>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                {renderDataDetails()}
                {Object.keys(laporan.data || {}).filter(k => k !== 'kategori').length === 0 && (
                  <p className="text-gray-600 italic">Tidak ada data tambahan</p>
                )}
              </div>
            </div>

            {/* Created At */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                Dibuat pada: {new Date(laporan.created_at || laporan.createdAt).toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
