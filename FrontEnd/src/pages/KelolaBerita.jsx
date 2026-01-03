import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Plus, Newspaper } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AdminPageHeader from '../components/admin/AdminPageHeader';
import BeritaForm from '../components/berita/BeritaForm';
import BeritaList from '../components/berita/BeritaList';
import {
  fetchAllBerita,
  createBerita,
  updateBerita,
  deleteBerita,
} from '../services/beritaService';

export default function KelolaBerita() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [berita, setBerita] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingBerita, setEditingBerita] = useState(null);

  // Check if user is admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Load berita on mount
  useEffect(() => {
    loadBerita();
  }, []);

  const loadBerita = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllBerita();
      setBerita(data || []);
    } catch (err) {
      setError('Gagal memuat berita');
      console.error('Error loading berita:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBerita = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const newBerita = await createBerita(data.caption, data.imageFile, data.publishedAt, data.content);
      setBerita([newBerita, ...berita]);
    } catch (err) {
      setError('Gagal menambahkan berita');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setEditingBerita(item);
  };

  const handleUpdateBerita = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await updateBerita(editingId, data.caption, data.imageFile, data.publishedAt, data.content);
      setBerita(berita.map((b) => (b.id === editingId ? updated : b)));
      setEditingId(null);
      setEditingBerita(null);
    } catch (err) {
      setError('Gagal memperbarui berita');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBerita = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await deleteBerita(id);
      setBerita(berita.filter((b) => b.id !== id));
    } catch (err) {
      setError('Gagal menghapus berita');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingBerita(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-sky-50 to-emerald-100 flex items-center justify-center">
        <div className="text-gray-600 font-medium">Memuat...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-8 pb-12">
      <AdminPageHeader
        title="Kelola Berita"
        subtitle="Tambah, edit, dan kelola berita Rukun Ternak"
        backTo="/dashboard"
        showBackButton={true}
      />

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <div className="space-y-8">
          {/* Form */}
          <div>
            {editingId ? (
              <div className="space-y-4">
                <BeritaForm
                  onSubmit={handleUpdateBerita}
                  loading={loading}
                  initialData={editingBerita}
                  isEditing={true}
                />
                <button
                  onClick={handleCancel}
                  className="w-full px-6 py-3 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 transition"
                >
                  Batal Edit
                </button>
              </div>
            ) : (
              <BeritaForm onSubmit={handleAddBerita} loading={loading} />
            )}
          </div>

          {/* List */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Daftar Berita ({berita.length})</h2>
              {editingId && (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                  Mode Edit
                </span>
              )}
            </div>
            <BeritaList
              berita={berita}
              onEdit={handleEditClick}
              onDelete={handleDeleteBerita}
              loading={loading}
            />
          </div>
        </div>
    </div>
  );
}
