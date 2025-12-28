import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import client from '../api/client';
import { AlertCircle, Loader, Heart } from 'lucide-react';

export default function HewanTernakPage() {
  const { appRole } = useAuth();
  const [hewan, setHewan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('[HewanTernakPage] Mounted with appRole:', appRole);
    
    if (appRole !== 'kelompok') {
      console.error('[HewanTernakPage] Access denied - user role is not kelompok:', appRole);
      setError('Akses ditolak. Halaman ini hanya untuk user kelompok.');
      setLoading(false);
      return;
    }

    const fetchHewan = async () => {
      try {
        console.log('[HewanTernakPage] Fetching hewan data...');
        setLoading(true);
        setError(null);
        const res = await client.get('/api/hewan');
        console.log('[HewanTernakPage] API Response:', res.data);
        if (res.data?.success) {
          setHewan(res.data.data);
        }
      } catch (err) {
        console.error('[HewanTernakPage] Error fetching hewan:', err);
        setError(err.response?.data?.message || 'Gagal mengambil data hewan');
      } finally {
        setLoading(false);
      }
    };

    fetchHewan();
  }, [appRole]);

  const getStatusBadge = (status) => {
    const statusColors = {
      'AKTIF': 'bg-green-100 text-green-800',
      'MATI': 'bg-red-100 text-red-800',
      'TERJUAL': 'bg-blue-100 text-blue-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getJenisKelaminDisplay = (jk) => {
    return jk === 'JANTAN' ? '♂️ Jantan' : '♀️ Betina';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader className="w-12 h-12 text-emerald-600 mx-auto mb-3 animate-spin" />
          <p className="text-gray-600">Memuat data hewan ternak...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8 sm:pt-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Heart className="w-7 h-7" />
            Hewan Ternak
          </h1>
          <p className="text-emerald-50 mt-1">Kelola data hewan ternak kelompok Anda</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
        
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-900 font-semibold">Error</p>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Filter dan Info */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-gray-900">Total Hewan Ternak</h2>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{hewan.length} Ekor</p>
            </div>
            <div className="text-xs text-gray-500">
              <p>Data hewan aktif dan dalam kandang</p>
            </div>
          </div>
        </div>

        {/* List Hewan */}
        {hewan.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-emerald-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ras</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Jenis Kelamin</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Umur</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Bobot (kg)</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {hewan.map((h) => (
                  <tr key={h.id} className="border-b border-gray-100 hover:bg-emerald-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{h.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{h.ras}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{getJenisKelaminDisplay(h.jenis_kelamin)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{h.umur?.display || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{h.bobot || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusBadge(h.status)}`}>
                        {h.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/hewan-ternak/${h.id}`}
                        className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm"
                      >
                        Lihat →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-semibold mb-2">Belum ada data hewan ternak</p>
            <p className="text-gray-500 text-sm">
              Data hewan akan muncul ketika ada laporan kelahiran baru
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
