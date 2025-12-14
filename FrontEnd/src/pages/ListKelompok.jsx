import React, { useEffect, useState } from 'react';
import { Users, Search, Plus, Edit3, Trash2 } from 'lucide-react';
import client from '../api/client';
import AddKelompokModalBase44 from '../components/kelompok/AddKelompokModalBase44';
import { useAuth } from '../hooks/useAuth';

export default function ListKelompok() {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [kelompok, setKelompok] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingKelompok, setEditingKelompok] = useState(null);
  const [notif, setNotif] = useState(null);

  useEffect(() => {
    fetchKelompok();
  }, []);

  const fetchKelompok = async () => {
    try {
      const res = await client.get('/api/kelompok');
      const list = res.data?.data || [];
      setKelompok(list);
      setFiltered(list);
    } catch (err) {
      console.warn('Failed to load kelompok', err.message || err);
      setKelompok([]);
      setFiltered([]);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const result = kelompok.filter(k =>
      (k.name || '').toLowerCase().includes(value) ||
      (k.kecamatan || '').toLowerCase().includes(value) ||
      (k.desa || '').toLowerCase().includes(value)
    );
    setFiltered(result);
  };

  const kecamatanCount = [...new Set(kelompok.map(k => k.kecamatan).filter(Boolean))].length;
  const desaCount = [...new Set(kelompok.map(k => k.desa).filter(Boolean))].length;

  const showNotif = (type, message) => {
    setNotif({ type, message });
    setTimeout(() => setNotif(null), 3000);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Hapus kelompok ini?');
    if (!confirmDelete) return;
    try {
      await client.delete(`/api/kelompok/${id}`);
      showNotif('success', 'Kelompok berhasil dihapus');
      fetchKelompok();
    } catch (err) {
      console.error('Delete kelompok failed', err);
      showNotif('error', err.response?.data?.message || 'Gagal menghapus kelompok');
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setEditingKelompok(null);
    setIsModalOpen(true);
  };

  const openEditModal = (data) => {
    setModalMode('edit');
    setEditingKelompok(data);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header with Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">List Kelompok</h1>
          <p className="text-gray-600 mt-2">Kelola data master kelompok ternak</p>
        </div>
        {isAdmin && (
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition sm:w-auto w-full"
          >
            <Plus size={20} />
            Tambah Kelompok
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-4xl font-bold text-gray-900">{kelompok.length}</div>
          <div className="text-sm font-medium text-gray-600 mt-2">Total Kelompok</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-4xl font-bold text-cyan-600">{kecamatanCount}</div>
          <div className="text-sm font-medium text-gray-600 mt-2">Kecamatan</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-4xl font-bold text-purple-600">{desaCount}</div>
          <div className="text-sm font-medium text-gray-600 mt-2">Desa</div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 relative">
          <Search size={18} className="absolute left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Cari kelompok, kecamatan, desa..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Kelompok List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Daftar Kelompok ({filtered.length})</h2>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 font-medium">Tidak ada kelompok yang cocok</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filtered.map((kelompokItem) => (
              <div key={kelompokItem.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <Users size={20} />
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(kelompokItem)}
                        className="px-3 py-1 text-sm border border-gray-200 rounded-md hover:bg-gray-50 flex items-center gap-1"
                      >
                        <Edit3 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(kelompokItem.id)}
                        className="px-3 py-1 text-sm border border-red-200 text-red-600 rounded-md hover:bg-red-50 flex items-center gap-1"
                      >
                        <Trash2 size={16} />
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-3">{kelompokItem.name || '-'}</h3>
                
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="font-medium">📍 {kelompokItem.kecamatan || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="font-medium">🏘️ {kelompokItem.desa || '-'}</span>
                  </div>
                  {kelompokItem.catatan && (
                    <div className="text-gray-500 text-xs italic">
                      {kelompokItem.catatan}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{kelompokItem.anggota_count ?? 0}</div>
                    <div className="text-xs text-gray-500">Total Anggota</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {notif && (
        <div className={`fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg text-white z-40 ${
          notif.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {notif.message}
        </div>
      )}

      <AddKelompokModalBase44
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onKelompokAdded={fetchKelompok}
        mode={modalMode}
        initialData={editingKelompok}
      />
    </div>
  );
}

