import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, FileText, AlertCircle, Download } from 'lucide-react';
import client from '../api/client';

export default function DetailLaporan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [laporan, setLaporan] = useState(null);
  const [hewanMap, setHewanMap] = useState({}); // Map of hewan ID to id_hewan (ID Bisnis)
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
          const laporanData = response.data.data;
          setLaporan(laporanData);
          
          // Always fetch hewan mapping for ID Bisnis lookup (for both Kelahiran and other types)
          // This is needed for INDUK ID and PEJANTAN ID fields
          if (laporanData.kelompok_id) {
            fetchHewanMapping(laporanData.kelompok_id);
          }
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

  const fetchHewanMapping = async (_kelompokId) => {
    try {
      console.log('[DetailLaporan] Fetching hewan mapping for kelompok:', _kelompokId);
      const response = await client.get(`/api/hewan`);
      console.log('[DetailLaporan] API response from /api/hewan:', response.data);
      if (response.data?.success && Array.isArray(response.data.data)) {
        // Create a map of hewan.id -> hewan.id_hewan (ID Bisnis)
        const map = {};
        response.data.data.forEach(hewan => {
          console.log('[DetailLaporan] Processing hewan:', { id: hewan.id, id_hewan: hewan.id_hewan });
          if (hewan.id && hewan.id_hewan) {
            map[hewan.id] = hewan.id_hewan;
          }
        });
        console.log('[DetailLaporan] ✅ Hewan mapping created with', Object.keys(map).length, 'entries:', map);
        setHewanMap(map);
      } else {
        console.warn('[DetailLaporan] ❌ No hewan data received or not success:', response.data);
      }
    } catch (err) {
      console.error('[DetailLaporan] ❌ Error fetching hewan mapping:', err);
      // Non-critical error, continue rendering
    }
  };

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
        return 'Laporan Kelahiran';
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

  const renderPenyaluranData = () => {
    const data = laporan.data || {};
    
    return (
      <div className="space-y-6">
        {/* Kandang & Ternak Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.jumlahKandang !== undefined && (
            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
              <p className="text-xs font-semibold text-indigo-700 uppercase mb-1">Kandang Disalurkan</p>
              <p className="text-3xl font-bold text-indigo-900">{data.jumlahKandang || 0}</p>
            </div>
          )}
          {data.jumlahTernak !== undefined && (
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
              <p className="text-xs font-semibold text-emerald-700 uppercase mb-1">Hewan Ternak</p>
              <p className="text-3xl font-bold text-emerald-900">{data.jumlahTernak || 0}</p>
            </div>
          )}
        </div>

        {/* Peralatan Section */}
        {data.pakanList && Array.isArray(data.pakanList) && data.pakanList.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Peralatan Pendukung</h4>
            <div className="space-y-2">
              {data.pakanList.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <span className="text-sm font-medium text-gray-800">{item.jenisPeralatan || item.jenisPakan || '-'}</span>
                  <span className="text-sm font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                    {item.jumlahPeralatan || item.jumlahPakan || 0} unit
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Kesehatan Section */}
        {data.kesehatanList && Array.isArray(data.kesehatanList) && data.kesehatanList.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Program Kesehatan</h4>
            <div className="space-y-2">
              {data.kesehatanList.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-red-50 rounded-lg p-3 border border-red-200">
                  <span className="text-sm font-medium text-gray-800">{item.jenisKesehatan || '-'}</span>
                  <span className="text-sm font-bold text-red-700 bg-red-100 px-3 py-1 rounded-full">
                    {item.jumlah || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    );
  };

  const renderDataDetails = () => {
    const data = laporan.data || {};
    
    // Debug logging
    if (laporan.jenis === 'Kelahiran') {
      console.log(`[DetailLaporan] Rendering Kelahiran laporan:`, {
        laporan_id: laporan.id,
        jenis: laporan.jenis,
        data_keys: Object.keys(data),
        induk_id: data.induk_id,
        pejantan_id: data.pejantan_id,
        hewanMapKeys: Object.keys(hewanMap),
        hewanMapData: hewanMap
      });
    }
    
    // Check if this is a penyaluran laporan
    if (laporan.jenis === 'Penyaluran' && (data.jumlahKandang !== undefined || data.pakanList || data.kesehatanList)) {
      return renderPenyaluranData();
    }
    
    // Special handling for Penjualan laporan
    if (laporan.jenis === 'Penjualan') {
      return (
        <div className="space-y-4">
          {/* Jumlah Hewan yang Dijual */}
          {data.jumlah_hewan !== undefined && (
            <div className="border-b border-gray-200 pb-3">
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">Jumlah Hewan yang Dijual</p>
              <p className="text-base text-gray-900 font-bold">{data.jumlah_hewan}</p>
            </div>
          )}
          
          {/* Penjualan List */}
          {data.penjualan_list && Array.isArray(data.penjualan_list) && data.penjualan_list.length > 0 && (
            <div className="border-b border-gray-200 pb-3">
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-3">Detail Hewan Terjual</p>
              <div className="space-y-4">
                {data.penjualan_list.map((item, idx) => (
                  <div key={idx} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-semibold text-gray-900 mb-3">Hewan #{idx + 1}</h4>
                    
                    {/* Jenis Penjualan */}
                    {item.jenis_penjualan && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Jenis Penjualan</p>
                        <p className="text-sm text-gray-900">{item.jenis_penjualan}</p>
                      </div>
                    )}
                    
                    {/* Jenis Hewan */}
                    {item.jenis_hewan && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Jenis Hewan</p>
                        <p className="text-sm text-gray-900">{item.jenis_hewan}</p>
                      </div>
                    )}
                    
                    {/* ID Hewan (ID Bisnis) */}
                    {item.id_hewan && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">ID Hewan (ID Bisnis)</p>
                        <p className="text-sm text-gray-900 font-bold">{item.id_hewan}</p>
                      </div>
                    )}
                    
                    {/* Catatan Penjualan */}
                    {item.catatan && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Catatan Penjualan</p>
                        <p className="text-sm text-gray-900 break-words whitespace-pre-wrap">{item.catatan || '-'}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Catatan Umum */}
          {data.catatan && (
            <div className="border-b border-gray-200 pb-3 last:border-0">
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">Catatan Umum</p>
              <p className="text-base text-gray-900 break-words whitespace-pre-wrap">{data.catatan}</p>
            </div>
          )}
        </div>
      );
    }
    
    // Special handling for Kelahiran laporan
    if (laporan.jenis === 'Kelahiran') {
      console.log('[DetailLaporan] Rendering Kelahiran laporan:', { laporan_id: laporan.id, data, hewanMap });
      return (
        <div className="space-y-4">
          {/* Kelahiran-specific fields with ID Bisnis lookup */}
          
          {/* ID Anak (ID Bisnis) */}
          {data.id && (
            <div className="border-b border-gray-200 pb-3">
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">ID Anak (ID Bisnis)</p>
              <p className="text-base text-gray-900 font-bold">{data.id}</p>
            </div>
          )}
          
          {/* ID Induk (ID Bisnis) */}
          {data.induk_id && (
            <div className="border-b border-gray-200 pb-3">
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">ID Induk (ID Bisnis)</p>
              <p className="text-base text-gray-900 font-bold">
                {data.induk_id_bisnis || data.induk_id || '-'}
              </p>
            </div>
          )}
          
          {/* ID Pejantan (ID Bisnis) */}
          {data.pejantan_id && (
            <div className="border-b border-gray-200 pb-3">
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">ID Pejantan (ID Bisnis)</p>
              <p className="text-base text-gray-900 font-bold">
                {data.pejantan_id_bisnis || data.pejantan_id || '-'}
              </p>
            </div>
          )}
          
          {/* Render all other non-array, non-special fields */}
          {Object.entries(data)
            .filter(([key, value]) => {
              // Skip kelahiran-specific fields we already rendered
              if (key === 'id') return false;
              if (key === 'induk_id') return false;
              if (key === 'pejantan_id') return false;
              if (key === 'induk_id_bisnis') return false;  // Skip enriched field
              if (key === 'pejantan_id_bisnis') return false;  // Skip enriched field
              if (key === 'kategori') return false;
              if (key === 'catatan') return false;
              if (key === 'keterangan') return false;
              
              // Skip array/object data
              if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
                return false;
              }
              
              // Skip if value is null, undefined, or empty string
              if (value === null || value === undefined || value === '') {
                return false;
              }
              
              return true;
            })
            .map(([key, value]) => (
              <div key={key} className="border-b border-gray-200 pb-3">
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">
                  {key.replace(/_/g, ' ')}
                </p>
                <p className="text-base text-gray-900 break-words">
                  {String(value) || '-'}
                </p>
              </div>
            ))}
          
          {/* Catatan - displayed last */}
          {data.catatan && (
            <div className="border-b border-gray-200 pb-3 last:border-0">
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">Catatan</p>
              <p className="text-base text-gray-900 break-words whitespace-pre-wrap">{data.catatan}</p>
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {/* First: Render pengembangan_kandang if it exists */}
        {data.pengembangan_kandang !== undefined && (
          <div className="border-b border-gray-200 pb-3">
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">
              Pengembangan Kandang
            </p>
            <p className="text-base text-gray-900 break-words">
              {String(data.pengembangan_kandang)}
            </p>
          </div>
        )}
        
        {/* Second: Render all other non-array, non-special fields */}
        {Object.entries(data)
          .filter(([key, value]) => {
            // Skip special fields
            if (key === 'pengembangan_kandang') return false;
            if (key === 'kategori') return false;
            if (key === 'catatan') return false;
            if (key === 'keterangan') return false;
            if (key === 'luas_kandang_list') return false;
            // Skip kesehatan-specific dynamic fields (will render separately)
            if (key === 'jenis_pencegahan') return false;
            if (key === 'jenis_pengobatan') return false;
            if (key === 'jenis_perawatan') return false;
            if (key === 'jenis_tindakan') return false;
            
            // Skip array/object data
            if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
              return false;
            }
            
            return true;
          })
          .map(([key, value]) => (
            <div key={key} className="border-b border-gray-200 pb-3">
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">
                {key.replace(/_/g, ' ')}
              </p>
              <p className="text-base text-gray-900 break-words">
                {String(value) || '-'}
              </p>
            </div>
          ))}
        
        {/* Render dynamic fields for kesehatan form - hide if status = mati */}
        {data.status_kesehatan_ternak !== 'mati' && data.jenis_pencegahan && (
          <div className="border-b border-gray-200 pb-3">
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">Jenis Pencegahan</p>
            <p className="text-base text-gray-900 break-words">{data.jenis_pencegahan}</p>
          </div>
        )}
        
        {data.status_kesehatan_ternak !== 'mati' && data.jenis_pengobatan && (
          <div className="border-b border-gray-200 pb-3">
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">Jenis Pengobatan</p>
            <p className="text-base text-gray-900 break-words">{data.jenis_pengobatan}</p>
          </div>
        )}
        
        {data.status_kesehatan_ternak !== 'mati' && data.jenis_perawatan && (
          <div className="border-b border-gray-200 pb-3">
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">Jenis Perawatan</p>
            <p className="text-base text-gray-900 break-words">{data.jenis_perawatan}</p>
          </div>
        )}
        
        {data.status_kesehatan_ternak !== 'mati' && data.jenis_tindakan && (
          <div className="border-b border-gray-200 pb-3">
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">Jenis Tindakan</p>
            <p className="text-base text-gray-900 break-words">{data.jenis_tindakan}</p>
          </div>
        )}
        
        {/* Third: Render luas_kandang_list array */}
        {data.luas_kandang_list && Array.isArray(data.luas_kandang_list) && (
          <div className="border-b border-gray-200 pb-3">
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">Luas Kandang (m²)</p>
            <div className="space-y-2 pl-2">
              {data.luas_kandang_list.map((luas, index) => (
                <p key={index} className="text-base text-gray-900">
                  • Kandang {index + 1}: {luas} m²
                </p>
              ))}
            </div>
          </div>
        )}
        
        {/* Keterangan - displayed at bottom */}
        {data.keterangan && (
          <div className="border-b border-gray-200 pb-3">
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">Keterangan</p>
            <p className="text-base text-gray-900 break-words whitespace-pre-wrap">{data.keterangan}</p>
          </div>
        )}
        
        {/* Catatan - displayed last */}
        {data.catatan && (
          <div className="border-b border-gray-200 pb-3 last:border-0">
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">Catatan</p>
            <p className="text-base text-gray-900 break-words whitespace-pre-wrap">{data.catatan}</p>
          </div>
        )}
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
