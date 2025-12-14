import React, { useEffect, useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import client from '../../api/client';

export default function AddKelompokModal({ isOpen, onClose, onKelompokAdded, mode = 'add', initialData = null }) {
  const [form, setForm] = useState({
    name: '',
    kecamatan: '',
    desa: '',
    catatan: '',
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setForm({
          name: initialData.name || '',
          kecamatan: initialData.kecamatan || '',
          desa: initialData.desa || '',
          catatan: initialData.catatan || '',
        });
      } else {
        setForm({ name: '', kecamatan: '', desa: '', catatan: '' });
      }
      setErrors({});
      setNotification(null);
    }
  }, [isOpen, mode, initialData]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) {
      newErrors.name = 'Nama Kelompok wajib diisi';
    }
    if (!form.kecamatan.trim()) {
      newErrors.kecamatan = 'Kecamatan wajib diisi';
    }
    if (!form.desa.trim()) {
      newErrors.desa = 'Desa wajib diisi';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification('error', 'Mohon isi semua field yang wajib');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        kecamatan: form.kecamatan.trim(),
        desa: form.desa.trim(),
        catatan: form.catatan.trim() || null,
      };

      const response = mode === 'edit' && initialData?.id
        ? await client.put(`/api/kelompok/${initialData.id}`, payload)
        : await client.post('/api/kelompok', payload);

      if (response.data?.success && response.data?.data) {
        showNotification('success', mode === 'edit' ? 'Kelompok berhasil diperbarui!' : 'Kelompok berhasil ditambahkan!');
        setForm({ name: '', kecamatan: '', desa: '', catatan: '' });
        setTimeout(() => {
          onClose();
          if (onKelompokAdded) onKelompokAdded(response.data.data);
        }, 1000);
      } else {
        showNotification('error', 'Gagal menyimpan kelompok');
      }
    } catch (err) {
      console.error('Error saving kelompok:', err);
      showNotification('error', err.response?.data?.message || 'Terjadi kesalahan saat menyimpan');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      {/* Modal */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{mode === 'edit' ? 'Edit Kelompok' : 'Tambah Kelompok Baru'}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`p-3 border-l-4 flex items-start gap-2 ${
            notification.type === 'success'
              ? 'bg-green-50 border-green-400 text-green-800'
              : 'bg-red-50 border-red-400 text-red-800'
          }`}>
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* Nama Kelompok */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Nama Kelompok *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Masukkan nama kelompok"
              disabled={loading}
              className={`w-full h-9 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Kecamatan */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Kecamatan *
            </label>
            <input
              type="text"
              name="kecamatan"
              value={form.kecamatan}
              onChange={handleChange}
              placeholder="Masukkan kecamatan"
              disabled={loading}
              className={`w-full h-9 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                errors.kecamatan ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.kecamatan && (
              <p className="text-red-600 text-sm mt-1">{errors.kecamatan}</p>
            )}
          </div>

          {/* Desa */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Desa *
            </label>
            <input
              type="text"
              name="desa"
              value={form.desa}
              onChange={handleChange}
              placeholder="Masukkan desa"
              disabled={loading}
              className={`w-full h-9 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                errors.desa ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.desa && (
              <p className="text-red-600 text-sm mt-1">{errors.desa}</p>
            )}
          </div>

          {/* Catatan (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Catatan Tambahan
            </label>
            <textarea
              name="catatan"
              value={form.catatan}
              onChange={handleChange}
              placeholder="Catatan tambahan (opsional)"
              disabled={loading}
              rows="2"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded-lg text-gray-900 font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-9 px-3 text-sm bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                mode === 'edit' ? 'Perbarui' : 'Tambah'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
