import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, MapPin, Phone, Mail, User, Users, Building2, Loader, AlertCircle, Network } from 'lucide-react';
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

  const { data: mitraData, loading: mitraLoading } = useCachedData(
    `/api/mitra-kelompok?parent_id=${id}`,
    [`/api/mitra-kelompok?parent_id=${id}`],
    { ttl: 5 * 60 * 1000 }
  );

  const mitraList = mitraData?.data || mitraData || [];
  
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

  const openEditModal = () => {
    console.log('[DetailKelompok] Opening edit modal with data:', kelompok);
    setIsEditModalOpen(true);
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
            <div className="flex items-center gap-3 mt-1">
              <p className="text-sm text-gray-600">ID Internal: {kelompok.id}</p>
              {kelompok.kode_kelompok && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-700">
                  {kelompok.kode_kelompok}
                </span>
              )}
            </div>
          </div>
        </div>

        {appRole === 'admin' && (
          <div className="flex gap-2">
            <button
              onClick={openEditModal}
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
                <label className="text-sm font-semibold text-gray-700 block mb-2">Kode Kelompok</label>
                <p className="text-gray-900">
                  {kelompok.kode_kelompok
                    ? <span className="font-bold text-primary-700">{kelompok.kode_kelompok}</span>
                    : <span className="text-gray-400 italic">Belum diset</span>
                  }
                </p>
              </div>
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

      {/* Mitra Kelompok Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Network size={20} className="text-emerald-600" />
          Mitra Kelompok
        </h2>
        {mitraLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 text-emerald-600 animate-spin mr-2" />
            <span className="text-gray-600 text-sm">Memuat data mitra...</span>
          </div>
        ) : mitraList.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Belum ada mitra kelompok terdaftar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-emerald-50 border-b border-gray-200 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-700 w-10">No</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Kode</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Nama Mitra</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Kecamatan</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Desa</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Penanggung Jawab</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">No. HP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mitraList.map((mitra, idx) => (
                  <tr key={mitra.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-500 text-center">{idx + 1}</td>
                    <td className="px-4 py-3">
                      {mitra.kode_kelompok ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                          {mitra.kode_kelompok}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{mitra.name || '-'}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {mitra.email ? (
                        <div className="flex items-center gap-1">
                          <Mail size={13} className="text-gray-400 flex-shrink-0" />
                          <span>{mitra.email}</span>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{mitra.kecamatan || '-'}</td>
                    <td className="px-4 py-3 text-gray-700">{mitra.desa || '-'}</td>
                    <td className="px-4 py-3 text-gray-900">
                      {mitra.pic1_nama ? (
                        <div className="flex items-center gap-1">
                          <User size={13} className="text-emerald-500 flex-shrink-0" />
                          <span>{mitra.pic1_nama}</span>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {mitra.pic1_no_hp ? (
                        <div className="flex items-center gap-1">
                          <Phone size={13} className="text-gray-400 flex-shrink-0" />
                          <span>{mitra.pic1_no_hp}</span>
                        </div>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
