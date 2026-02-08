import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, MapPin, Phone, Mail, User, Users, Building2, Loader, AlertCircle } from 'lucide-react';
import { useCachedData, useInvalidateCache } from '../hooks/useCachedData';
import client from '../api/client';
import { useAuth } from '../hooks/useAuth';
import AddKelompokModalWithMap from '../components/kelompok/AddKelompokModalWithMap';

export default function DetailKelompok() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { appRole } = useAuth();
  const invalidate = useInvalidateCache();
  
  const { data: kelompokData, loading, error, refetch } = useCachedData(
    `/api/kelompok/${id}`,
    [`/api/kelompok/${id}`],
    { ttl: 5 * 60 * 1000 }
  );
  
  const [kelompok, setKelompok] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (kelompokData) {
      const data = kelompokData.data || kelompokData;
      setKelompok(data);
    }
  }, [kelompokData]);

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    try {
      setIsDeleting(true);
      await client.delete(`/api/kelompok/${id}`);
      invalidate('/api/kelompok');
      alert('✅ Kelompok berhasil dihapus');
      navigate('/kelompok');
    } catch (err) {
      alert('❌ Gagal menghapus kelompok: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(false);
    }
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    invalidate(`/api/kelompok/${id}`);
    invalidate('/api/kelompok');
    refetch();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary-600 mx-auto mb-3 animate-spin" />
          <p className="text-gray-700">Memuat data kelompok...</p>
        </div>
      </div>
    );
  }

  if (error || !kelompok) {
    return (
      <div className="space-y-8 pb-12">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/kelompok')}
            className="p-2 hover:bg-gray-100 rounded transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Detail Kelompok</h1>
        </div>

        <div className="bg-danger-50 border border-danger-100 rounded-lg p-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-danger mb-1">Error</p>
              <p className="text-danger-800">{error || 'Data kelompok tidak ditemukan'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/kelompok')}
            className="p-2 hover:bg-gray-100 rounded transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{kelompok.name}</h1>
            <p className="text-sm text-gray-600 mt-1">ID: {kelompok.id}</p>
          </div>
        </div>

        {appRole === 'admin' && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              <Edit2 size={18} />
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                deleteConfirm
                  ? 'bg-danger hover:bg-red-700 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }`}
            >
              <Trash2 size={18} />
              {deleteConfirm ? 'Konfirmasi Hapus?' : 'Hapus'}
            </button>
            {deleteConfirm && (
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition"
              >
                Batal
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informasi Dasar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Informasi Dasar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Nama Kelompok</label>
                <p className="text-gray-900 text-lg">{kelompok.name || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Email</label>
                <p className="text-gray-900 flex items-center gap-2">
                  {kelompok.email ? (
                    <>
                      <Mail size={16} className="text-primary-600" />
                      {kelompok.email}
                    </>
                  ) : (
                    '-'
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Kecamatan</label>
                <p className="text-gray-900">{kelompok.kecamatan || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Desa</label>
                <p className="text-gray-900">{kelompok.desa || '-'}</p>
              </div>
            </div>
            {kelompok.catatan && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="text-sm font-semibold text-gray-700 block mb-2">Catatan</label>
                <p className="text-gray-900">{kelompok.catatan}</p>
              </div>
            )}
          </div>

          {/* PIC 1 Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Informasi Penanggung Jawab Utama</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Nama</label>
                <p className="text-gray-900 flex items-center gap-2">
                  {kelompok.pic1_nama ? (
                    <>
                      <User size={16} className="text-primary-600" />
                      {kelompok.pic1_nama}
                    </>
                  ) : (
                    '-'
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">NIK</label>
                <p className="text-gray-900">{kelompok.pic1_nik || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">No. HP</label>
                <p className="text-gray-900 flex items-center gap-2">
                  {kelompok.pic1_no_hp ? (
                    <>
                      <Phone size={16} className="text-primary-600" />
                      {kelompok.pic1_no_hp}
                    </>
                  ) : (
                    '-'
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Email</label>
                <p className="text-gray-900">{kelompok.pic1_email || '-'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-gray-700 block mb-2">Alamat</label>
                <p className="text-gray-900">{kelompok.pic1_alamat || '-'}</p>
              </div>
            </div>
          </div>

          {/* Lokasi */}
          {(kelompok.latitude || kelompok.longitude) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={20} />
                Lokasi
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Latitude</label>
                  <p className="text-gray-900">{kelompok.latitude?.toFixed(6) || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Longitude</label>
                  <p className="text-gray-900">{kelompok.longitude?.toFixed(6) || '-'}</p>
                </div>
              </div>
              {kelompok.latitude && kelompok.longitude && (
                <div className="mt-4">
                  <a
                    href={`https://maps.google.com/?q=${kelompok.latitude},${kelompok.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
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
          {/* Statistik Ternak */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 size={18} />
              Fasilitas
            </h2>
            <div className="space-y-4">
              <div className="bg-primary-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-1">Jumlah Kandang</p>
                <p className="text-2xl font-bold text-primary-600">{kelompok.jumlah_kandang || 0}</p>
              </div>
              <div className="bg-info-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-1">Jumlah Ternak</p>
                <p className="text-2xl font-bold text-info-600">{kelompok.jumlah_ternak || 0}</p>
              </div>
            </div>
          </div>

          {/* Anggota */}
          {kelompok.anggota_count !== undefined && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users size={18} />
                Anggota
              </h2>
              <div className="bg-success-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-1">Total Anggota</p>
                <p className="text-2xl font-bold text-success-600">{kelompok.anggota_count || 0}</p>
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Aksi Cepat</h2>
            <div className="space-y-2">
              <Link
                to={`/hewan-ternak?kelompok=${id}`}
                className="block px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 font-semibold rounded-lg transition text-center"
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
          kelompok={kelompok}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onKelompokAdded={handleEditSuccess}
          mode="edit"
          initialData={kelompok}
        />
      )}
    </div>
  );
}
