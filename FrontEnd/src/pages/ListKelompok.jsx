import React, { useEffect, useState } from 'react';
import { Users, Search, Phone, MapPin, User, Mail, MapPinIcon, Plus, Map, Eye, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import AdminPageHeader from '../components/admin/AdminPageHeader';
import AddKelompokModalWithMap from '../components/kelompok/AddKelompokModalWithMap';
import AlertModal from '../components/common/AlertModal';
import { useAuth } from '../hooks/useAuth';
import { useCachedData, useInvalidateCache } from '../hooks/useCachedData';

export default function ListKelompok() {
  const navigate = useNavigate();
  const { appRole } = useAuth();
  const invalidate = useInvalidateCache();
  
  // Fetch data dengan automatic caching
  const { data: cachedKelompok, loading, refetch } = useCachedData('/api/kelompok');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [kelompok, setKelompok] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingKelompok, setEditingKelompok] = useState(null);
  const [notif] = useState(null);
  const [filterDesa, setFilterDesa] = useState('');
  const [filterKecamatan, setFilterKecamatan] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, type: 'success', title: '', message: '' });

  // Update kelompok ketika cached data berubah
  useEffect(() => {
    if (cachedKelompok) {
      const list = cachedKelompok?.data || cachedKelompok || [];
      setKelompok(list);
      setFiltered(list);
    }
  }, [cachedKelompok]);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    filterResults(value, filterKecamatan, filterDesa);
  };

  const handleFilterKecamatan = (value) => {
    setFilterKecamatan(value);
    filterResults(searchTerm, value, filterDesa);
  };

  const handleFilterDesa = (value) => {
    setFilterDesa(value);
    filterResults(searchTerm, filterKecamatan, value);
  };

  const filterResults = (search, kec, desa) => {
    let result = kelompok;

    if (search) {
      result = result.filter(k =>
        (k.name && k.name.toLowerCase().includes(search)) ||
        (k.email && k.email.toLowerCase().includes(search))
      );
    }

    if (kec) {
      result = result.filter(k => k.kecamatan === kec);
    }

    if (desa) {
      result = result.filter(k => k.desa === desa);
    }

    setFiltered(result);
  };

  const kecamatanList = [...new Set(kelompok.map(k => k.kecamatan).filter(Boolean))].sort();
  const desaList = [...new Set(kelompok.map(k => k.desa).filter(Boolean))].sort();

  const handleDelete = async (id) => {
    if (!deleteConfirmation) {
      // Show confirmation dialog first
      const kelompokToDelete = kelompok.find(k => k.id === id);
      setDeleteConfirmation({
        id,
        name: kelompokToDelete?.name || 'Kelompok'
      });
      return;
    }

    // Perform actual deletion
    if (deleteConfirmation.id !== id) return;

    try {
      setIsDeleting(true);
      await client.delete(`/api/kelompok/${id}`);
      
      // Show success alert
      setAlert({
        isOpen: true,
        type: 'success',
        title: '✓ Data Dihapus',
        message: `Kelompok "${deleteConfirmation.name}" dan semua data terkait berhasil dihapus.`,
        autoCloseMs: 2000
      });
      
      setDeleteConfirmation(null);
      
      // Invalidate cache dan refresh data
      invalidate('/api/kelompok');
      setTimeout(() => {
        refetch();
      }, 2000);
    } catch (err) {
      console.error('Delete kelompok failed', err);
      const errorMessage = err.response?.data?.message || 'Gagal menghapus kelompok';
      setAlert({
        isOpen: true,
        type: 'error',
        title: '✗ Kesalahan Penghapusan',
        message: errorMessage
      });
      setDeleteConfirmation(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (data) => {
    setModalMode('edit');
    setEditingKelompok(data);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-12">
      <AdminPageHeader
        title="Daftar Kelompok Ternak"
        subtitle="Kelola dan lihat profil semua kelompok ternak di wilayah Cilacap"
        backTo="/dashboard"
        showBackButton={true}
        actionButton={
          appRole === 'admin' ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => {
                  setModalMode('add');
                  setEditingKelompok(null);
                  setIsModalOpen(true);
                }}
                className="px-6 py-3 bg-white text-primary-600 rounded-lg hover:bg-gray-50 transition font-semibold flex items-center gap-2 justify-center"
              >
                <Plus size={18} />
                Tambah Kelompok
              </button>
              <button
                onClick={() => navigate('/peta-sebaran')}
                className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition font-semibold flex items-center gap-2 justify-center"
              >
                <Map size={18} />
                Peta Sebaran
              </button>
            </div>
          ) : null
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="text-2xl sm:text-3xl font-bold text-primary-600">{kelompok.length}</div>
          <div className="text-xs sm:text-sm font-medium text-gray-700 mt-1 sm:mt-2">Total Kelompok</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="text-2xl sm:text-3xl font-bold text-primary-600">{kecamatanList.length}</div>
          <div className="text-xs sm:text-sm font-medium text-gray-700 mt-1 sm:mt-2">Kecamatan</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="text-2xl sm:text-3xl font-bold text-info">{desaList.length}</div>
          <div className="text-xs sm:text-sm font-medium text-gray-700 mt-1 sm:mt-2">Desa</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="text-2xl sm:text-3xl font-bold text-orange-600">{filtered.length}</div>
          <div className="text-xs sm:text-sm font-medium text-gray-700 mt-1 sm:mt-2">Tampil</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Search size={18} className="text-gray-700" />
          <h3 className="font-semibold text-gray-900">Filter & Cari</h3>
        </div>

        {/* Search Input - Baris 1 */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama kelompok atau email..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* Kecamatan & Desa Filter - Baris 2 (side by side) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kecamatan</label>
            <select
              value={filterKecamatan}
              onChange={(e) => handleFilterKecamatan(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Semua Kecamatan</option>
              {kecamatanList.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Desa</label>
            <select
              value={filterDesa}
              onChange={(e) => handleFilterDesa(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Semua Desa</option>
              {desaList.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(searchTerm || filterKecamatan || filterDesa) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterKecamatan('');
              setFilterDesa('');
              setFiltered(kelompok);
            }}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            âœ• Hapus Semua Filter
          </button>
        )}
      </div>

      {/* Kelompok Cards */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-gray-700">Loading...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 sm:p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-700">
            {kelompok.length === 0
              ? 'Belum ada kelompok terdaftar'
              : 'Tidak ada kelompok sesuai filter yang dipilih'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filtered.map((kelompokItem) => (
            <div
              key={kelompokItem.id}
              className="bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary-600 text-white">
                      <Users size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{kelompokItem.name || '-'}</h3>
                      {kelompokItem.email && (
                        <div className="flex items-center gap-1 text-xs text-gray-700 mt-1">
                          <Mail size={12} />
                          <span className="truncate">{kelompokItem.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Info */}
              <div className="px-6 py-4 space-y-2 border-b border-gray-200">
                {kelompokItem.kecamatan && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPin size={16} className="text-primary-600 flex-shrink-0" />
                    <span className="font-medium">{kelompokItem.kecamatan}</span>
                  </div>
                )}
                {kelompokItem.desa && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPinIcon size={16} className="text-primary-600 flex-shrink-0" />
                    <span>{kelompokItem.desa}</span>
                  </div>
                )}
                {kelompokItem.catatan && (
                  <div className="text-xs text-gray-700 italic mt-2 p-2 bg-gray-50 rounded">
                    {`"${kelompokItem.catatan}"`}
                  </div>
                )}
              </div>

              {/* PIC Info */}
              <div className="px-6 py-4 space-y-3">
                {/* PIC 1 */}
                {(kelompokItem.pic1Nama || kelompokItem.pic1NoHp) && (
                  <div className="bg-primary-50 rounded-lg p-3 border border-primary-200">
                    <div className="flex items-center gap-2 mb-2">
                      <User size={14} className="text-primary-600" />
                      <span className="text-xs font-semibold text-primary-600">PENANGGUNG JAWAB 1</span>
                    </div>
                    {kelompokItem.pic1Nama && (
                      <div className="text-sm font-semibold text-gray-900">{kelompokItem.pic1Nama}</div>
                    )}
                    {kelompokItem.pic1NoHp && (
                      <div className="flex items-center gap-1 text-xs text-gray-700 mt-1">
                        <Phone size={12} />
                        {kelompokItem.pic1NoHp}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-2">
                <button
                  onClick={() => navigate(`/kelompok/${kelompokItem.id}`)}
                  title="Lihat detail"
                  className="p-2 text-primary-600 hover:bg-primary-100 rounded transition"
                >
                  <Eye size={18} />
                </button>
                {appRole === 'admin' && (
                  <>
                    <button
                      onClick={() => openEditModal(kelompokItem)}
                      title="Edit kelompok"
                      className="p-2 text-warning hover:bg-warning-100 rounded transition"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(kelompokItem.id)}
                      title="Hapus kelompok"
                      className="p-2 text-danger hover:bg-danger-100 rounded transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notifications */}
      {notif && (
        <div className={`fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg text-white z-50 animate-pulse ${
          notif.type === 'success' ? 'bg-primary-600' : 'bg-danger'
        }`}>
          {notif.message}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-danger-50 border-b border-danger-100 px-6 py-4">
              <h3 className="text-lg font-bold text-red-900">
                Hapus Kelompok "{deleteConfirmation.name}"?
              </h3>
            </div>
            
            <div className="px-6 py-4 space-y-3">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800 font-medium">
                  ⚠️ Peringatan: Tindakan ini TIDAK DAPAT DIBATALKAN!
                </p>
              </div>
              
              <p className="text-sm text-gray-700">
                Jika kelompok ini dihapus, data berikut akan ikut terhapus:
              </p>
              
              <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                <li>Semua data hewan ternak kelompok ini</li>
                <li>Semua laporan kelahiran dan kematian</li>
                <li>Semua data penyaluran & bantuan</li>
                <li>Semua pengguna yang terikat kelompok ini</li>
                <li>Semua riwayat dan data terkait lainnya</li>
              </ul>

              <p className="text-sm text-danger font-semibold">
                Pastikan Anda benar-benar ingin menghapus kelompok ini beserta semua datanya.
              </p>
            </div>

            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
              <button
                onClick={() => setDeleteConfirmation(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmation.id)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-danger text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  'Hapus Kelompok'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <AddKelompokModalWithMap
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onKelompokAdded={() => {
          // Invalidate cache dan refresh
          invalidate('/api/kelompok');
          refetch();
        }}
        mode={modalMode}
        initialData={editingKelompok}
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={alert.isOpen}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        autoCloseMs={alert.autoCloseMs || 3000}
      />
    </div>
  );
}


