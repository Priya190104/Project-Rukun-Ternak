import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AdminPageHeader from '../components/admin/AdminPageHeader';
import client from '../api/client';
import { AlertCircle, Loader, Heart, Plus } from 'lucide-react';
import AddHewanModal from '../components/AddHewanModal';

export default function HewanTernakPage() {
  const { appRole } = useAuth();
  const [hewan, setHewan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddingHewan, setIsAddingHewan] = useState(false);
  const [duplicateIDModal, setDuplicateIDModal] = useState(null);

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
          const dataSources = {
            penyaluran: res.data.data.filter(h => h.source === 'Penyaluran').length,
            kelahiran: res.data.data.filter(h => h.source === 'Kelahiran').length
          };
          console.log('[HewanTernakPage] Data sources:', dataSources, 'Total:', res.data.data.length);
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

    // Listen for refetch trigger from other pages (e.g., ClientTambahLaporan)
    const handleRefetchTrigger = (_e) => {
      console.log('[HewanTernakPage] Received refetch trigger from localStorage event');
      const triggerData = JSON.parse(localStorage.getItem('hewanDataRefetchTrigger'));
      if (triggerData) {
        console.log('[HewanTernakPage] Refetch triggered by:', triggerData.message);
        fetchHewan();
      }
    };

    window.addEventListener('storage', handleRefetchTrigger);
    
    return () => {
      window.removeEventListener('storage', handleRefetchTrigger);
    };
  }, [appRole]);

  const handleAddHewan = async (formData) => {
    try {
      setIsAddingHewan(true);
      const res = await client.post('/api/hewan', {
        id_hewan: formData.id_hewan,
        jenis_kelamin: formData.jenis_kelamin,
        ras: formData.ras,
        bobot: parseFloat(formData.bobot),
        umur: formData.umur,
        catatan: formData.catatan || null,
        source: 'Penambahan'
      });

      if (res.data?.success) {
        // Refresh data
        const hewanRes = await client.get('/api/hewan');
        if (hewanRes.data?.success) {
          setHewan(hewanRes.data.data);
        }
        
        setIsAddModalOpen(false);
        alert('✅ Hewan ternak berhasil ditambahkan!');
      } else {
        // Handle specific error codes
        if (res.data?.error_code === 'DUPLICATE_ID_BISNIS') {
          const idBisnis = formData.id_hewan;
          setDuplicateIDModal(idBisnis);
        } else {
          alert('❌ Gagal menambahkan hewan ternak: ' + (res.data?.message || 'Error tidak diketahui'));
        }
      }
    } catch (err) {
      console.error('Error adding hewan:', err);
      
      // Handle specific error codes
      if (err.response?.data?.error_code === 'DUPLICATE_ID_BISNIS') {
        const idBisnis = formData.id_hewan;
        setDuplicateIDModal(idBisnis);
      } else {
        alert('❌ Terjadi kesalahan: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setIsAddingHewan(false);
    }
  };

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
    <div className="space-y-8 pb-12">
      <AdminPageHeader
        title="Hewan Ternak"
        subtitle="Kelola data hewan ternak kelompok Anda"
      />

      {/* Content */}
      <div className="space-y-6">
        
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
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Plus size={18} />
                Tambah Ternak
              </button>
              <p className="text-xs text-gray-500">
                Data hewan aktif dan dalam kandang
              </p>
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
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Sumber</th>
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
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{h.id_hewan || `#${h.id}`}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        h.source === 'Kelahiran' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {h.source || 'Tidak Diketahui'}
                      </span>
                    </td>
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

      {/* Add Hewan Modal */}
      <AddHewanModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddHewan}
        isLoading={isAddingHewan}
      />

      {/* Modal ID Bisnis Duplikat */}
      {duplicateIDModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-orange-50 border-b border-orange-200 px-6 py-4">
              <h3 className="text-lg font-bold text-orange-900">
                ⚠️ ID Bisnis Sudah Terdaftar
              </h3>
            </div>
            
            <div className="px-6 py-4 space-y-3">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-800">
                  ID Bisnis <span className="font-bold">"{duplicateIDModal}"</span> sudah terdaftar di kelompok ini.
                </p>
              </div>
              
              <p className="text-sm text-gray-700">
                Silakan gunakan ID Bisnis yang berbeda untuk hewan ini.
              </p>
            </div>

            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
              <button
                onClick={() => setDuplicateIDModal(null)}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
