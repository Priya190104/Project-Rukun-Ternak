import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, MapPin, Phone, Mail, User, Users, Building2, Loader, AlertCircle } from 'lucide-react';
import { useCachedData, useInvalidateCache } from '../hooks/useCachedData';
import client from '../api/client';
import { useAuth } from '../hooks/useAuth';
import AddKelompokModalWithMap from '../components/kelompok/AddKelompokModalWithMap';

export default function DetailMitraKelompok() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { appRole, user } = useAuth();
  const invalidate = useInvalidateCache();

  const { data: mitraData, loading, error, refetch } = useCachedData(
    `/api/mitra-kelompok/${id}`,
    [`/api/mitra-kelompok/${id}`],
    { ttl: 5 * 60 * 1000 }
  );

  const [mitra, setMitra] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (mitraData) {
      const data = mitraData.data || mitraData;
      setMitra(data);
    }
  }, [mitraData]);

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    try {
      setIsDeleting(true);
      await client.delete(`/api/mitra-kelompok/${id}`);
      invalidate('/api/mitra-kelompok');
      alert('✅ Mitra Kelompok berhasil dihapus');
      navigate('/mitra-kelompok');
    } catch (err) {
      alert('❌ Gagal menghapus mitra kelompok: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(false);
    }
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    invalidate(`/api/mitra-kelompok/${id}`);
    invalidate('/api/mitra-kelompok');
    refetch();
  };

  const openEditModal = () => setIsEditModalOpen(true);

  // canEdit: admin semua, kelompok hanya miliki mitra sendiri
  const canEdit = appRole === 'admin' ||
    (appRole === 'kelompok' && mitra?.parent_kelompok_id === user?.kelompok_id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader className="w-12 h-12 text-emerald-600 mx-auto mb-3 animate-spin" />
          <p className="text-gray-700">Memuat data mitra kelompok...</p>
        </div>
      </div>
    );
  }

  if (error || !mitra) {
    return (
      <div className="space-y-8 pb-12">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/mitra-kelompok')} className="p-2 hover:bg-gray-100 rounded transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Detail Mitra Kelompok</h1>
        </div>
        <div className="bg-danger-50 border border-danger-100 rounded-lg p-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-danger mb-1">Error</p>
              <p className="text-danger-800">{error || 'Data mitra kelompok tidak ditemukan'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate('/mitra-kelompok')}
            className="p-2 hover:bg-gray-100 rounded transition mt-0.5 shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{mitra.name}</h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                Mitra Kelompok
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <p className="text-sm text-gray-600">ID Internal: {mitra.id}</p>
              {mitra.kode_kelompok && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                  {mitra.kode_kelompok}
                </span>
              )}
              {mitra.parent_kelompok_name && (
                <span className="text-sm text-gray-600">
                  ↳ <span className="font-medium text-emerald-700">{mitra.parent_kelompok_name}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {canEdit && (
          <div className="flex gap-2 flex-wrap pl-11 sm:pl-0">
            <button
              onClick={openEditModal}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm"
            >
              <Edit2 size={16} />
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition text-sm ${
                deleteConfirm
                  ? 'bg-danger hover:bg-red-700 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }`}
            >
              <Trash2 size={16} />
              {deleteConfirm ? 'Konfirmasi Hapus?' : 'Hapus'}
            </button>
            {deleteConfirm && (
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition text-sm"
              >
                Batal
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informasi Dasar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Informasi Dasar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Kode Kelompok</label>
                <p className="text-gray-900">
                  {mitra.kode_kelompok
                    ? <span className="font-bold text-emerald-700">{mitra.kode_kelompok}</span>
                    : <span className="text-gray-400 italic">Belum diset</span>
                  }
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Nama Mitra Kelompok</label>
                <p className="text-gray-900 text-lg">{mitra.name || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Kelompok Induk</label>
                <p className="font-medium text-emerald-700">
                  {mitra.parent_kelompok_name || '-'}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Email</label>
                <p className="text-gray-900 flex items-center gap-2">
                  {mitra.email ? (
                    <>
                      <Mail size={16} className="text-emerald-600" />
                      {mitra.email}
                    </>
                  ) : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Kecamatan</label>
                <p className="text-gray-900">{mitra.kecamatan || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Desa</label>
                <p className="text-gray-900">{mitra.desa || '-'}</p>
              </div>
            </div>
            {mitra.catatan && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="text-sm font-semibold text-gray-700 block mb-2">Catatan</label>
                <p className="text-gray-900">{mitra.catatan}</p>
              </div>
            )}
          </div>

          {/* PIC Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Informasi Penanggung Jawab Utama</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Nama</label>
                <p className="text-gray-900 flex items-center gap-2">
                  {mitra.pic1_nama ? (
                    <>
                      <User size={16} className="text-emerald-600" />
                      {mitra.pic1_nama}
                    </>
                  ) : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">NIK</label>
                <p className="text-gray-900">{mitra.pic1_nik || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">No. HP</label>
                <p className="text-gray-900 flex items-center gap-2">
                  {mitra.pic1_no_hp ? (
                    <>
                      <Phone size={16} className="text-emerald-600" />
                      {mitra.pic1_no_hp}
                    </>
                  ) : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Email</label>
                <p className="text-gray-900">{mitra.pic1_email || '-'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-gray-700 block mb-2">Alamat</label>
                <p className="text-gray-900">{mitra.pic1_alamat || '-'}</p>
              </div>
            </div>
          </div>

          {/* Lokasi */}
          {(mitra.latitude || mitra.longitude) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={20} />
                Lokasi
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Latitude</label>
                  <p className="text-gray-900">{mitra.latitude?.toFixed(6) || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Longitude</label>
                  <p className="text-gray-900">{mitra.longitude?.toFixed(6) || '-'}</p>
                </div>
              </div>
              {mitra.latitude && mitra.longitude && (
                <div className="mt-4">
                  <a
                    href={`https://maps.google.com/?q=${mitra.latitude},${mitra.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm"
                  >
                    Buka di Google Maps →
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Stats */}
        <div className="space-y-6">
          {/* Fasilitas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 size={18} />
              Fasilitas
            </h2>
            <div className="space-y-4">
              <div className="bg-emerald-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-1">Jumlah Kandang</p>
                <p className="text-2xl font-bold text-emerald-600">{mitra.jumlah_kandang || 0}</p>
              </div>
              <div className="bg-info-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-1">Jumlah Ternak</p>
                <p className="text-2xl font-bold text-info-600">{mitra.jumlah_ternak || 0}</p>
              </div>
            </div>
          </div>

          {/* Anggota */}
          {mitra.anggota_count !== undefined && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users size={18} />
                Anggota
              </h2>
              <div className="bg-success-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-1">Total Anggota</p>
                <p className="text-2xl font-bold text-success-600">{mitra.anggota_count || 0}</p>
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Aksi Cepat</h2>
            <div className="space-y-2">
              <Link
                to={`/admin/hewan-ternak?kelompok=${id}`}
                className="block px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg transition text-center"
              >
                Lihat Hewan Ternak
              </Link>
              <Link
                to={`/laporan?kelompok=${id}`}
                className="block px-4 py-2 bg-info-50 hover:bg-info-100 text-info-700 font-semibold rounded-lg transition text-center"
              >
                Lihat Laporan
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <AddKelompokModalWithMap
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onKelompokAdded={handleEditSuccess}
          mode="edit"
          initialData={mitra}
          isMitraMode={true}
          parentKelompokId={mitra.parent_kelompok_id}
        />
      )}
    </div>
  );
}
