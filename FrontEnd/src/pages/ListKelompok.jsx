import React, { useEffect, useState } from 'react';
import { Users, Search, Phone, MapPin, User, Mail, MapPinIcon, Plus, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import AddKelompokModalWithMap from '../components/kelompok/AddKelompokModalWithMap';
import { useAuth } from '../hooks/useAuth';

export default function ListKelompok() {
  const navigate = useNavigate();
  const { appRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [kelompok, setKelompok] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingKelompok, setEditingKelompok] = useState(null);
  const [notif, setNotif] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterDesa, setFilterDesa] = useState('');
  const [filterKecamatan, setFilterKecamatan] = useState('');

  useEffect(() => {
    fetchKelompok();
  }, []);

  const fetchKelompok = async () => {
    try {
      setLoading(true);
      const res = await client.get('/api/kelompok');
      const list = res.data?.data || [];
      setKelompok(list);
      setFiltered(list);
    } catch (err) {
      console.warn('Failed to load kelompok', err.message || err);
      setKelompok([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

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

  const showNotif = (type, message) => {
    setNotif({ type, message });
    setTimeout(() => setNotif(null), 3000);
  };

  const kecamatanList = [...new Set(kelompok.map(k => k.kecamatan).filter(Boolean))].sort();
  const desaList = [...new Set(kelompok.map(k => k.desa).filter(Boolean))].sort();

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

  const openEditModal = (data) => {
    setModalMode('edit');
    setEditingKelompok(data);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pt-8 sm:pt-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg sm:rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Daftar Kelompok Ternak</h1>
        <p className="text-blue-100">Kelola dan lihat profil semua kelompok ternak di wilayah Cilacap</p>
      </div>

      {/* Action Buttons */}
      {appRole === 'admin' && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              setModalMode('add');
              setEditingKelompok(null);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition"
          >
            <Plus size={20} />
            Tambah Kelompok
          </button>
          <button
            onClick={() => navigate('/peta-sebaran')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            <Map size={20} />
            Lihat Peta Sebaran
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600">{kelompok.length}</div>
          <div className="text-xs sm:text-sm font-medium text-gray-600 mt-1 sm:mt-2">Total Kelompok</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="text-2xl sm:text-3xl font-bold text-blue-600">{kecamatanList.length}</div>
          <div className="text-xs sm:text-sm font-medium text-gray-600 mt-1 sm:mt-2">Kecamatan</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="text-2xl sm:text-3xl font-bold text-purple-600">{desaList.length}</div>
          <div className="text-xs sm:text-sm font-medium text-gray-600 mt-1 sm:mt-2">Desa</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="text-2xl sm:text-3xl font-bold text-orange-600">{filtered.length}</div>
          <div className="text-xs sm:text-sm font-medium text-gray-600 mt-1 sm:mt-2">Tampil</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Search size={18} className="text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filter & Cari</h3>
        </div>

        {/* Search Input */}
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

        {/* Kecamatan Filter */}
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

        {/* Desa Filter */}
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

        {/* Clear Filters */}
        {(searchTerm || filterKecamatan || filterDesa) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterKecamatan('');
              setFilterDesa('');
              setFiltered(kelompok);
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            ✕ Hapus Semua Filter
          </button>
        )}
      </div>

      {/* Kelompok Cards */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-gray-600">Loading...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 sm:p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">
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
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-600 text-white">
                      <Users size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{kelompokItem.name || '-'}</h3>
                      {kelompokItem.email && (
                        <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
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
                    <MapPin size={16} className="text-blue-600 flex-shrink-0" />
                    <span className="font-medium">{kelompokItem.kecamatan}</span>
                  </div>
                )}
                {kelompokItem.desa && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPinIcon size={16} className="text-emerald-600 flex-shrink-0" />
                    <span>{kelompokItem.desa}</span>
                  </div>
                )}
                {kelompokItem.catatan && (
                  <div className="text-xs text-gray-600 italic mt-2 p-2 bg-gray-50 rounded">
                    {`"${kelompokItem.catatan}"`}
                  </div>
                )}
              </div>

              {/* PIC Info */}
              <div className="px-6 py-4 space-y-3">
                {/* PIC 1 */}
                {(kelompokItem.pic1Nama || kelompokItem.pic1NoHp) && (
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <User size={14} className="text-blue-600" />
                      <span className="text-xs font-semibold text-blue-600">PENANGGUNG JAWAB 1</span>
                    </div>
                    {kelompokItem.pic1Nama && (
                      <div className="text-sm font-semibold text-gray-900">{kelompokItem.pic1Nama}</div>
                    )}
                    {kelompokItem.pic1NoHp && (
                      <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                        <Phone size={12} />
                        {kelompokItem.pic1NoHp}
                      </div>
                    )}
                  </div>
                )}

                {/* PIC 2 */}
                {(kelompokItem.pic2Nama || kelompokItem.pic2NoHp) && (
                  <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
                    <div className="flex items-center gap-2 mb-2">
                      <User size={14} className="text-teal-600" />
                      <span className="text-xs font-semibold text-teal-600">PENANGGUNG JAWAB 2</span>
                    </div>
                    {kelompokItem.pic2Nama && (
                      <div className="text-sm font-semibold text-gray-900">{kelompokItem.pic2Nama}</div>
                    )}
                    {kelompokItem.pic2NoHp && (
                      <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                        <Phone size={12} />
                        {kelompokItem.pic2NoHp}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              {appRole === 'admin' && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-2">
                  <button
                    onClick={() => openEditModal(kelompokItem)}
                    className="flex-1 px-3 py-2 text-sm border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 font-medium transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(kelompokItem.id)}
                    className="flex-1 px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium transition"
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Notifications */}
      {notif && (
        <div className={`fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg text-white z-50 animate-pulse ${
          notif.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {notif.message}
        </div>
      )}

      {/* Modal */}
      <AddKelompokModalWithMap
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onKelompokAdded={fetchKelompok}
        mode={modalMode}
        initialData={editingKelompok}
      />
    </div>
  );
}

