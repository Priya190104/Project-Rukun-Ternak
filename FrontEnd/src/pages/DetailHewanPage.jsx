import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import client from '../api/client';
import { AlertCircle, Loader, ArrowLeft, Calendar, Weight } from 'lucide-react';

export default function DetailHewanPage() {
  const { id } = useParams();
  const { appRole } = useAuth();
  const [hewan, setHewan] = useState(null);
  const [laporanKematian, setLaporanKematian] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Support admin, kelompok, mitra_kelompok, and viewer roles
    if (appRole !== 'kelompok' && appRole !== 'admin' && appRole !== 'viewer' && appRole !== 'mitra_kelompok') {
      setError('Akses ditolak. Halaman ini hanya untuk user kelompok atau admin.');
      setLoading(false);
      return;
    }

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Determine endpoint based on role
        const endpoint = appRole === 'admin' 
          ? `/api/admin/hewan/${id}` 
          : `/api/hewan/${id}`;
        
        const res = await client.get(endpoint);
        if (res.data?.success) {
          const hewanData = res.data.data;
          setHewan(hewanData);
          
          // Fetch laporan kematian jika status TIDAK_AKTIF
          if (hewanData.status === 'TIDAK_AKTIF' && hewanData.id_hewan) {
            try {
              const laporanRes = await client.get(`/api/laporan/list?jenis=kesehatan&limit=100`);
              if (laporanRes.data?.success && laporanRes.data.data) {
                // Find laporan kesehatan dengan status=mati untuk hewan ini
                const kematianLaporan = laporanRes.data.data.find(laporan => 
                  laporan.jenis === 'kesehatan' && 
                  laporan.data?.status_kesehatan_ternak === 'mati' &&
                  laporan.data?.id_ternak === hewanData.id_hewan
                );
                if (kematianLaporan) {
                  setLaporanKematian(kematianLaporan);
                }
              }
            } catch (laporanError) {
              console.warn('Failed to fetch laporan kematian:', laporanError);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching detail:', err);
        setError(err.response?.data?.message || 'Gagal mengambil detail hewan');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, appRole]);

  const formatTanggal = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary-600 mx-auto mb-3 animate-spin" />
          <p className="text-gray-700">Memuat detail hewan...</p>
        </div>
      </div>
    );
  }

  if (error || !hewan) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 px-4">
        <div className="max-w-2xl mx-auto">
          <Link to={appRole === 'admin' ? "/admin/hewan-ternak" : "/hewan-ternak"} className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 font-semibold">
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
          <div className="bg-danger-50 border border-danger-100 rounded-lg p-6 flex gap-3">
            <AlertCircle className="w-6 h-6 text-danger flex-shrink-0" />
            <div>
              <p className="text-red-900 font-semibold">{error || 'Hewan tidak ditemukan'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      'AKTIF': 'text-primary-700 bg-primary-50',
      'MATI': 'text-danger bg-danger-50',
      'TERJUAL': 'text-primary-700 bg-primary-50'
    };
    return colors[status] || 'text-gray-700 bg-gray-50';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-600 text-white py-6 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <Link to={appRole === 'admin' ? "/admin/hewan-ternak" : "/hewan-ternak"} className="inline-flex items-center gap-2 text-primary-50 hover:text-white mb-4 font-semibold transition">
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            Detail Hewan Ternak
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 pt-8 sm:pt-12">
        {/* Identitas Hewan */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-6 border-b border-gray-200">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">ID {hewan.id_hewan || `#${hewan.id}`}</p>
              <h2 className="text-3xl font-bold text-gray-900 mt-2">{hewan.ras}</h2>
              <p className="text-gray-700 mt-2">
                {hewan.jenis_kelamin === 'JANTAN' ? '♂️ Pejantan' : '♀️ Betina'}
              </p>
            </div>
            <div className={`text-right ${getStatusColor(hewan.status)}`}>
              <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Status</p>
              <p className="text-2xl font-bold">{hewan.status}</p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900">Informasi Dasar</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-700 uppercase tracking-wider font-semibold mb-1">Tanggal Lahir</p>
                <p className="text-lg font-semibold text-gray-900">{formatTanggal(hewan.tanggal_lahir)}</p>
                <p className="text-sm text-gray-700 mt-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Umur: {hewan.umur.display} ({hewan.umur.hari} hari)
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-700 uppercase tracking-wider font-semibold mb-1">Ras</p>
                <p className="text-lg font-semibold text-gray-900">{hewan.ras}</p>
              </div>

              {hewan.bobot && (
                <div className="bg-primary-50 p-4 rounded-lg border border-primary-200">
                  <p className="text-xs text-primary-700 uppercase tracking-wider font-semibold mb-1">Bobot Terakhir</p>
                  <p className="text-2xl font-bold text-primary-900">{hewan.bobot} kg</p>
                  <p className="text-xs text-primary-700 mt-1">
                    <Weight className="w-4 h-4 inline mr-1" />
                    Berat badan saat ini
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-gray-900">Silsilah</h3>

              {hewan.induk ? (
                <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                  <p className="text-xs text-pink-700 uppercase tracking-wider font-semibold mb-1">Induk (Ibu)</p>
                  <div>
                    <p className="text-lg font-semibold text-pink-900">ID {hewan.induk.id_hewan || `#${hewan.induk.id}`}</p>
                    <p className="text-sm text-pink-700 mt-1">Ras: {hewan.induk.ras}</p>
                    <p className="text-xs text-pink-600 mt-0.5">
                      {hewan.induk.jenis_kelamin === 'JANTAN' ? '♂️ Jantan' : '♀️ Betina'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-700 uppercase tracking-wider font-semibold mb-1">Induk (Ibu)</p>
                  <p className="text-gray-700">Tidak ada data</p>
                </div>
              )}

              {hewan.pejantan ? (
                <div className="bg-primary-50 p-4 rounded-lg border border-primary-200">
                  <p className="text-xs text-primary-700 uppercase tracking-wider font-semibold mb-1">Pejantan (Ayah)</p>
                  <div>
                    <p className="text-lg font-semibold text-primary-900">ID {hewan.pejantan.id_hewan || `#${hewan.pejantan.id}`}</p>
                    <p className="text-sm text-primary-700 mt-1">Ras: {hewan.pejantan.ras}</p>
                    <p className="text-xs text-primary-600 mt-0.5">
                      {hewan.pejantan.jenis_kelamin === 'JANTAN' ? '♂️ Jantan' : '♀️ Betina'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-700 uppercase tracking-wider font-semibold mb-1">Pejantan (Ayah)</p>
                  <p className="text-gray-700">Tidak ada data</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Catatan */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-4">Catatan Hewan</h3>
          
          {hewan.catatan ? (
            <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
              <p className="text-gray-900 whitespace-pre-wrap">{hewan.catatan}</p>
              <p className="text-xs text-gray-500 mt-3">Catatan tersimpan untuk hewan ini</p>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-700 italic">Tidak ada catatan</p>
            </div>
          )}
        </div>

        {/* Riwayat Bobot */}
        {hewan.riwayatBobot && hewan.riwayatBobot.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Riwayat Bobot (12 Bulan Terakhir)</h3>
            
            <div className="space-y-3">
              {hewan.riwayatBobot.map((r, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition">
                  <div>
                    <p className="font-semibold text-gray-900">
                      <Weight className="w-4 h-4 inline mr-2 text-primary-600" />
                      {r.bobot} kg
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      {new Date(r.tanggal_update).toLocaleDateString('id-ID')}
                    </p>
                    {r.keterangan && (
                      <p className="text-xs text-gray-500 mt-1 italic">{r.keterangan}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!hewan.bobot && (!hewan.riwayatBobot || hewan.riwayatBobot.length === 0) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-900 font-semibold">Belum ada riwayat bobot</p>
              <p className="text-yellow-800 text-sm mt-1">
                Mulai catat bobot hewan ini melalui fitur &quot;Update Ternak&quot;
              </p>
            </div>
          </div>
        )}

        {/* Data Kematian - Displayed at bottom if hewan status = TIDAK_AKTIF */}
        {hewan.status === 'TIDAK_AKTIF' && laporanKematian && (
          <div className="bg-danger-50 rounded-2xl shadow-sm border border-danger-100 p-6">
            <h3 className="font-bold text-red-900 mb-4">Data Kematian</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-red-100">
                <Calendar className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Tanggal Laporan</p>
                  <p className="text-base text-gray-900 mt-1">
                    {laporanKematian.tanggal 
                      ? new Date(laporanKematian.tanggal).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : '-'
                    }
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-red-100">
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Status</p>
                <p className="text-base text-danger font-semibold mt-1">Mati</p>
              </div>

              {laporanKematian.data?.keterangan && (
                <div className="p-4 bg-white rounded-lg border border-red-100">
                  <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Keterangan</p>
                  <p className="text-base text-gray-900 mt-1 whitespace-pre-wrap break-words">
                    {laporanKematian.data.keterangan}
                  </p>
                </div>
              )}

              {!laporanKematian.data?.keterangan && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-700 italic">Tidak ada keterangan</p>
                </div>
              )}
            </div>
          </div>
        )}

        {hewan.status === 'TIDAK_AKTIF' && !laporanKematian && (
          <div className="bg-danger-50 rounded-2xl shadow-sm border border-danger-100 p-6">
            <h3 className="font-bold text-red-900 mb-4">Data Kematian</h3>
            <p className="text-danger">Tidak tersedia</p>
          </div>
        )}
      </div>
    </div>
  );
}


