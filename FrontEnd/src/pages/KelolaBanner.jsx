import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Plus, Loader } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import BannerForm from '../components/banners/BannerForm';
import BannerList from '../components/banners/BannerList';
import {
  fetchAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../services/bannerService';

export default function KelolaBanner() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Load banners on mount
  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllBanners();
      setBanners(data || []);
    } catch (err) {
      setError('Gagal memuat banner');
      console.error('Error loading banners:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBanner = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const newBanner = await createBanner(data.imageFile);
      setBanners([newBanner, ...banners]);
      setShowForm(false);
    } catch (err) {
      setError('Gagal menambahkan banner');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      setError(null);
      const updated = await updateBanner(id, isActive);
      setBanners(banners.map((b) => (b.id === id ? updated : b)));
    } catch (err) {
      setError('Gagal memperbarui banner');
      console.error('Error updating banner:', err);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus banner ini?')) {
      return;
    }

    try {
      setError(null);
      await deleteBanner(id);
      setBanners(banners.filter((b) => b.id !== id));
    } catch (err) {
      setError('Gagal menghapus banner');
      console.error('Error deleting banner:', err);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-emerald-700 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Manajemen Banner</h1>
            <p className="text-gray-600">Kelola banner yang tampil di halaman landing utama</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              showForm
                ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
            }`}
          >
            <Plus size={20} />
            {showForm ? 'Batal' : 'Tambah Banner'}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Upload Form Modal */}
      {showForm && (
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Upload Banner Baru</h2>
          <BannerForm 
            onSubmit={handleAddBanner} 
            loading={loading}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Stats Card */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-gray-600 text-sm font-medium">Total Banner</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{banners.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-gray-600 text-sm font-medium">Banner Aktif</div>
          <div className="text-3xl font-bold text-emerald-600 mt-2">
            {banners.filter(b => b.isActive).length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-gray-600 text-sm font-medium">Banner Nonaktif</div>
          <div className="text-3xl font-bold text-gray-500 mt-2">
            {banners.filter(b => !b.isActive).length}
          </div>
        </div>
      </div>

      {/* Banner List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Daftar Banner</h2>
        </div>
        
        {loading && banners.length === 0 ? (
          <div className="p-12 text-center">
            <Loader className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
            <p className="text-gray-600">Memuat banner...</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600 mb-4">Belum ada banner. Mulai dengan menambahkan banner baru.</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium text-sm"
            >
              <Plus size={18} />
              Tambah Banner Pertama
            </button>
          </div>
        ) : (
          <div className="p-6">
            <BannerList
              banners={banners}
              onDelete={handleDeleteBanner}
              onToggleActive={handleToggleActive}
              loading={loading}
            />
          </div>
        )}
      </div>

      {/* Info Tips */}
      <div className="mt-8 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-6">
        <h3 className="font-bold text-emerald-900 mb-3">💡 Tips Manajemen Banner</h3>
        <ul className="text-sm text-emerald-800 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 font-bold mt-0.5">✓</span>
            <span>Hanya banner dengan status <strong>Aktif</strong> yang ditampilkan di halaman landing</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 font-bold mt-0.5">✓</span>
            <span>Banner ditampilkan sebagai slider/carousel dengan transisi otomatis</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 font-bold mt-0.5">✓</span>
            <span>Gunakan tombol <strong>Nonaktifkan</strong> untuk menyembunyikan banner tanpa menghapusnya</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 font-bold mt-0.5">✓</span>
            <span>Format gambar harus JPG/JPEG dengan ukuran maksimal 5MB</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 font-bold mt-0.5">✓</span>
            <span>Semakin banyak banner, slider akan lebih menarik bagi pengunjung</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
