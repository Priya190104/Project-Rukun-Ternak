import React, { useEffect, useState } from 'react';
import { Users, Search, Phone, User, Mail, Plus, Eye, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import AdminPageHeader from '../components/admin/AdminPageHeader';
import AddKelompokModalWithMap from '../components/kelompok/AddKelompokModalWithMap';
import AlertModal from '../components/common/AlertModal';
import { useAuth } from '../hooks/useAuth';
import { useCachedData, useInvalidateCache } from '../hooks/useCachedData';

export default function ListMitraKelompok() {
  const navigate = useNavigate();
  const { appRole, user } = useAuth();
  const invalidate = useInvalidateCache();

  // URL fetch bergantung role: kelompok hanya ambil mitranya, admin bisa semua
  const fetchUrl = appRole === 'kelompok'
    ? `/api/mitra-kelompok?parent_id=${user?.kelompok_id}`
    : '/api/mitra-kelompok';

  const { data: cachedMitra, loading, refetch } = useCachedData(fetchUrl);

  const [searchTerm, setSearchTerm] = useState('');
  const [mitraList, setMitraList] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingMitra, setEditingMitra] = useState(null);
  const [notif] = useState(null);
  const [filterDesa, setFilterDesa] = useState('');
  const [filterKecamatan, setFilterKecamatan] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, type: 'success', title: '', message: '' });

  useEffect(() => {
    if (cachedMitra) {
      const list = cachedMitra?.data || cachedMitra || [];
      setMitraList(list);
      setFiltered(list);
    }
  }, [cachedMitra]);

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
    let result = mitraList;
    if (search) {
      result = result.filter(k =>
        (k.name && k.name.toLowerCase().includes(search)) ||
        (k.email && k.email.toLowerCase().includes(search))
      );
    }
    if (kec) result = result.filter(k => k.kecamatan === kec);
    if (desa) result = result.filter(k => k.desa === desa);
    setFiltered(result);
  };

  const kecamatanList = [...new Set(mitraList.map(k => k.kecamatan).filter(Boolean))].sort();
  const desaList = [...new Set(mitraList.map(k => k.desa).filter(Boolean))].sort();

  const handleDelete = async (id) => {
    if (!deleteConfirmation) {
      const mitraToDelete = mitraList.find(k => k.id === id);
      setDeleteConfirmation({ id, name: mitraToDelete?.name || 'Mitra Kelompok' });
      return;
    }
    if (deleteConfirmation.id !== id) return;

    try {
      setIsDeleting(true);
      await client.delete(`/api/mitra-kelompok/${id}`);
      setAlert({
        isOpen: true,
        type: 'success',
        title: '✓ Data Dihapus',
        message: `Mitra Kelompok "${deleteConfirmation.name}" dan semua data terkait berhasil dihapus.`,
        autoCloseMs: 2000
      });
      setDeleteConfirmation(null);
      invalidate(fetchUrl);
      setTimeout(() => { refetch(); }, 2000);
    } catch (err) {
      console.error('Delete mitra kelompok failed', err);
      const errorMessage = err.response?.data?.message || 'Gagal menghapus mitra kelompok';
      setAlert({ isOpen: true, type: 'error', title: '✗ Kesalahan Penghapusan', message: errorMessage });
      setDeleteConfirmation(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (data) => {
    setModalMode('edit');
    setEditingMitra(data);
    setIsModalOpen(true);
  };

  // Tentukan backTo berdasarkan role
  const backTo = appRole === 'kelompok' ? '/client' : '/dashboard';

  return (
    <div className="space-y-8 pb-12">
      <AdminPageHeader
        title="Daftar Mitra Kelompok"
        subtitle={
          appRole === 'kelompok'
            ? 'Kelola dan lihat profil semua mitra kelompok Anda'
            : 'Kelola dan lihat profil semua mitra kelompok dari seluruh kelompok'
        }
        backTo={backTo}
        showBackButton={true}
        actionButton={
          (appRole === 'admin' || appRole === 'kelompok') ? (
            <button
              onClick={() => {
                setModalMode('add');
                setEditingMitra(null);
                setIsModalOpen(true);
              }}
              className="px-6 py-3 bg-white text-primary-600 rounded-lg hover:bg-gray-50 transition font-semibold flex items-center gap-2 justify-center"
            >
              <Plus size={18} />
              Tambah Mitra Kelompok
            </button>
          ) : null
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="text-2xl sm:text-3xl font-bold text-primary-600">{mitraList.length}</div>
          <div className="text-xs sm:text-sm font-medium text-gray-700 mt-1 sm:mt-2">Total Mitra</div>
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

        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama mitra kelompok atau email..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kecamatan</label>
            <select
              value={filterKecamatan}
              onChange={(e) => handleFilterKecamatan(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Semua Kecamatan</option>
              {kecamatanList.map(k => <option key={k} value={k}>{k}</option>)}
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
              {desaList.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {(searchTerm || filterKecamatan || filterDesa) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterKecamatan('');
              setFilterDesa('');
              setFiltered(mitraList);
            }}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            ✕ Hapus Semua Filter
          </button>
        )}
      </div>

      {/* Mitra Kelompok Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-gray-700">Loading...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 sm:p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-700">
            {mitraList.length === 0
              ? 'Belum ada mitra kelompok terdaftar'
              : 'Tidak ada mitra kelompok sesuai filter yang dipilih'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">

          {/* ── Mobile Cards (< md) ── */}
          <div className="md:hidden divide-y divide-gray-100">
            {filtered.map((mitraItem, idx) => (
              <div key={mitraItem.id} className="p-4 space-y-2">
                {/* Row 1: nomor + kode + nama */}
                <div className="flex items-start gap-2">
                  <span className="text-xs text-gray-400 pt-0.5 w-5 shrink-0">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {mitraItem.kode_kelompok && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 shrink-0">
                          {mitraItem.kode_kelompok}
                        </span>
                      )}
                      <span className="font-semibold text-gray-900 text-sm">{mitraItem.name || '-'}</span>
                    </div>
                    {appRole === 'admin' && mitraItem.parent_kelompok_name && (
                      <p className="text-xs text-emerald-700 font-medium mt-0.5">↳ {mitraItem.parent_kelompok_name}</p>
                    )}
                  </div>
                </div>

                {/* Row 2: lokasi */}
                {(mitraItem.kecamatan || mitraItem.desa) && (
                  <div className="flex items-center gap-1 text-xs text-gray-600 pl-7">
                    <span>{[mitraItem.kecamatan, mitraItem.desa].filter(Boolean).join(' / ')}</span>
                  </div>
                )}

                {/* Row 3: email */}
                {mitraItem.email && (
                  <div className="flex items-center gap-1 text-xs text-gray-600 pl-7">
                    <Mail size={12} className="text-gray-400 shrink-0" />
                    <span>{mitraItem.email}</span>
                  </div>
                )}

                {/* Row 4: PIC + HP */}
                {(mitraItem.pic1_nama || mitraItem.pic1_no_hp) && (
                  <div className="flex items-center gap-3 text-xs text-gray-700 pl-7 flex-wrap">
                    {mitraItem.pic1_nama && (
                      <span className="flex items-center gap-1">
                        <User size={12} className="text-emerald-500 shrink-0" />
                        {mitraItem.pic1_nama}
                      </span>
                    )}
                    {mitraItem.pic1_no_hp && (
                      <span className="flex items-center gap-1">
                        <Phone size={12} className="text-gray-400 shrink-0" />
                        {mitraItem.pic1_no_hp}
                      </span>
                    )}
                  </div>
                )}

                {/* Row 5: actions */}
                <div className="flex items-center gap-2 pl-7 pt-1">
                  <button
                    onClick={() => navigate(`/mitra-kelompok/${mitraItem.id}`)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition"
                  >
                    <Eye size={13} /> Detail
                  </button>
                  {(appRole === 'admin' || appRole === 'kelompok') && (
                    <>
                      <button
                        onClick={() => openEditModal(mitraItem)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition"
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(mitraItem.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                      >
                        <Trash2 size={13} /> Hapus
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ── Desktop Table (md+) ── */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-emerald-50 border-b border-gray-200 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-700 w-10">No</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Kode</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Nama Mitra</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Email</th>
                  {appRole === 'admin' && (
                    <th className="px-4 py-3 font-semibold text-gray-700">Kelompok Induk</th>
                  )}
                  <th className="px-4 py-3 font-semibold text-gray-700">Kecamatan</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Desa</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Penanggung Jawab</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">No. HP</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((mitraItem, idx) => (
                  <tr key={mitraItem.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-500 text-center">{idx + 1}</td>
                    <td className="px-4 py-3">
                      {mitraItem.kode_kelompok ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                          {mitraItem.kode_kelompok}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{mitraItem.name || '-'}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {mitraItem.email ? (
                        <div className="flex items-center gap-1">
                          <Mail size={13} className="text-gray-400 flex-shrink-0" />
                          <span>{mitraItem.email}</span>
                        </div>
                      ) : '-'}
                    </td>
                    {appRole === 'admin' && (
                      <td className="px-4 py-3 text-gray-700">
                        {mitraItem.parent_kelompok_name ? (
                          <span className="text-emerald-700 font-medium">{mitraItem.parent_kelompok_name}</span>
                        ) : '-'}
                      </td>
                    )}
                    <td className="px-4 py-3 text-gray-700">{mitraItem.kecamatan || '-'}</td>
                    <td className="px-4 py-3 text-gray-700">{mitraItem.desa || '-'}</td>
                    <td className="px-4 py-3 text-gray-900">
                      {mitraItem.pic1_nama ? (
                        <div className="flex items-center gap-1">
                          <User size={13} className="text-emerald-500 flex-shrink-0" />
                          <span>{mitraItem.pic1_nama}</span>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {mitraItem.pic1_no_hp ? (
                        <div className="flex items-center gap-1">
                          <Phone size={13} className="text-gray-400 flex-shrink-0" />
                          <span>{mitraItem.pic1_no_hp}</span>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => navigate(`/mitra-kelompok/${mitraItem.id}`)}
                          title="Lihat detail"
                          className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded transition"
                        >
                          <Eye size={16} />
                        </button>
                        {(appRole === 'admin' || appRole === 'kelompok') && (
                          <>
                            <button
                              onClick={() => openEditModal(mitraItem)}
                              title="Edit mitra kelompok"
                              className="p-1.5 text-warning hover:bg-warning-100 rounded transition"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(mitraItem.id)}
                              title="Hapus mitra kelompok"
                              className="p-1.5 text-danger hover:bg-danger-100 rounded transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                Hapus Mitra Kelompok "{deleteConfirmation.name}"?
              </h3>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800 font-medium">
                  ⚠️ Peringatan: Tindakan ini TIDAK DAPAT DIBATALKAN!
                </p>
              </div>
              <p className="text-sm text-gray-700">
                Jika mitra kelompok ini dihapus, data berikut akan ikut terhapus:
              </p>
              <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                <li>Semua data hewan ternak mitra kelompok ini</li>
                <li>Semua laporan kelahiran dan kematian</li>
                <li>Semua data penyaluran & bantuan</li>
                <li>Semua pengguna yang terikat mitra kelompok ini</li>
                <li>Semua riwayat dan data terkait lainnya</li>
              </ul>
              <p className="text-sm text-danger font-semibold">
                Pastikan Anda benar-benar ingin menghapus mitra kelompok ini beserta semua datanya.
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
                  'Hapus Mitra Kelompok'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add/Edit — gunakan komponen yang sama dengan kelompok,
          tambahkan parentKelompokId agar backend tahu ini adalah mitra */}
      <AddKelompokModalWithMap
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onKelompokAdded={() => {
          invalidate(fetchUrl);
          refetch();
        }}
        mode={modalMode}
        initialData={editingMitra}
        isMitraMode={true}
        parentKelompokId={appRole === 'kelompok' ? user?.kelompok_id : editingMitra?.parent_kelompok_id}
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
