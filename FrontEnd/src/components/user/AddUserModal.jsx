import React, { useEffect, useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import client from '../../api/client';

export default function AddUserModal({ isOpen, onClose, onUserAdded, kelompokList = [] }) {
  const [form, setForm] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'kelompok',
    kelompok_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setForm({ username: '', password: '', full_name: '', role: 'kelompok', kelompok_id: '' });
      setErrors({});
      setNotification(null);
    }
  }, [isOpen]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.username.trim()) {
      newErrors.username = 'Username wajib diisi';
    }
    if (!form.password.trim() || form.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }
    if (!form.full_name.trim()) {
      newErrors.full_name = 'Nama lengkap wajib diisi';
    }
    if (!form.role) {
      newErrors.role = 'Role wajib dipilih';
    }
    // Validasi Kelompok wajib jika role = kelompok
    if (form.role === 'kelompok' && !form.kelompok_id) {
      newErrors.kelompok_id = 'Kelompok wajib dipilih untuk role Kelompok';
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
        username: form.username.trim(),
        password: form.password.trim(),
        full_name: form.full_name.trim(),
        role: form.role,
        kelompok_id: form.kelompok_id ? parseInt(form.kelompok_id, 10) : null,
      };

      const response = await client.post('/api/users', payload);

      if (response.data?.success) {
        showNotification('success', 'Pengguna berhasil ditambahkan!');
        setForm({ username: '', password: '', full_name: '', role: 'kelompok', kelompok_id: '' });
        setTimeout(() => {
          onClose();
          if (onUserAdded) onUserAdded();
        }, 1000);
      } else {
        showNotification('error', 'Gagal menambahkan pengguna');
      }
    } catch (err) {
      console.error('Error creating user:', err);
      showNotification('error', err.response?.data?.message || 'Terjadi kesalahan saat menyimpan');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Tambah Pengguna Baru</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition" disabled={loading}>
            <X size={20} />
          </button>
        </div>

        {notification && (
          <div className={`p-3 border-l-4 flex items-start gap-2 ${
            notification.type === 'success' ? 'bg-green-50 border-green-400 text-green-800' : 'bg-red-50 border-red-400 text-red-800'
          }`}>
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-1">Username *</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Username"
              disabled={loading}
              className={`w-full h-9 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                errors.username ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.username && <p className="text-red-600 text-xs mt-1">{errors.username}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-1">Password *</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 6 karakter"
              disabled={loading}
              className={`w-full h-9 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-1">Nama Lengkap *</label>
            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Nama lengkap"
              disabled={loading}
              className={`w-full h-9 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                errors.full_name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.full_name && <p className="text-red-600 text-xs mt-1">{errors.full_name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-1">Role *</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              disabled={loading}
              className={`w-full h-9 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                errors.role ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="kelompok">Kelompok</option>
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
            </select>
            {errors.role && <p className="text-red-600 text-xs mt-1">{errors.role}</p>}
          </div>

          {form.role === 'kelompok' && (
            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-1">Kelompok *</label>
              <select
                name="kelompok_id"
                value={form.kelompok_id}
                onChange={handleChange}
                disabled={loading}
                className={`w-full h-9 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                  errors.kelompok_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">- Pilih Kelompok -</option>
                {kelompokList.map(k => (
                  <option key={k.id} value={k.id}>{k.name}</option>
                ))}
              </select>
              {errors.kelompok_id && <p className="text-red-600 text-xs mt-1">{errors.kelompok_id}</p>}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded-lg text-gray-900 font-medium hover:bg-gray-50 transition disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-9 px-3 text-sm bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Tambah Pengguna'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
