import React, { useEffect, useState } from 'react';
import { X, AlertCircle, Eye, EyeOff } from 'lucide-react';
import client from '../../api/client';

export default function AddUserModal({ isOpen, onClose, onUserAdded, kelompokList = [] }) {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    full_name: '',
    role: 'kelompok',
    kelompok_id: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [errors, setErrors] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({ username: '', email: '', password: '', passwordConfirm: '', full_name: '', role: 'kelompok', kelompok_id: '' });
      setErrors({});
      setNotification(null);
      setShowPassword(false);
      setShowPasswordConfirm(false);
      setShowConfirmation(false);
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
    if (!form.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else {
      // Validasi format email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        newErrors.email = 'Format email tidak valid';
      }
    }
    if (!form.password.trim() || form.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }
    if (!form.passwordConfirm.trim()) {
      newErrors.passwordConfirm = 'Konfirmasi password wajib diisi';
    }
    if (form.password && form.passwordConfirm && form.password !== form.passwordConfirm) {
      newErrors.passwordConfirm = 'Password dan konfirmasi password tidak sama';
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

    // Show confirmation dialog
    setShowConfirmation(true);
  };

  const handleConfirmAdd = async () => {
    setShowConfirmation(false);
    setLoading(true);
    try {
      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password.trim(),
        full_name: form.full_name.trim(),
        role: form.role,
        kelompok_id: form.kelompok_id ? parseInt(form.kelompok_id, 10) : null,
      };

      const response = await client.post('/api/users', payload);

      if (response.data?.success) {
        showNotification('success', 'Pengguna berhasil ditambahkan!');
        setForm({ username: '', email: '', password: '', passwordConfirm: '', full_name: '', role: 'kelompok', kelompok_id: '' });
        setShowPassword(false);
        setShowPasswordConfirm(false);
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
    <>
      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Konfirmasi Tambah Pengguna</h3>
            <p className="text-sm text-gray-600 mb-4">
              Apakah Anda yakin ingin menambahkan pengguna dengan data berikut?
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2 text-sm">
              <div><span className="font-semibold">Username:</span> {form.username}</div>
              <div><span className="font-semibold">Email:</span> {form.email}</div>
              <div><span className="font-semibold">Nama:</span> {form.full_name}</div>
              <div><span className="font-semibold">Role:</span> {form.role}</div>
              {form.role === 'kelompok' && form.kelompok_id && (
                <div><span className="font-semibold">Kelompok:</span> {kelompokList.find(k => k.id === parseInt(form.kelompok_id))?.name}</div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmAdd}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition"
              >
                Ya, Tambahkan
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Tambah Pengguna Baru</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition" disabled={loading}>
            <X size={20} />
          </button>
        </div>

        {notification && (
          <div className={`p-3 border-l-4 flex items-start gap-2 ${
            notification.type === 'success' ? 'bg-primary-50 border-blue-400 text-primary-800' : 'bg-danger-50 border-red-400 text-red-800'
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
            {errors.username && <p className="text-danger text-xs mt-1">{errors.username}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="user@example.com"
              disabled={loading}
              className={`w-full h-9 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && <p className="text-danger text-xs mt-1">{errors.email}</p>}
            <p className="text-gray-500 text-xs mt-1">📧 Required untuk fitur reset password</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-1">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 6 karakter"
                disabled={loading}
                className={`w-full h-9 px-3 pr-10 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition disabled:opacity-50"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-danger text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-1">Konfirmasi Password *</label>
            <div className="relative">
              <input
                type={showPasswordConfirm ? 'text' : 'password'}
                name="passwordConfirm"
                value={form.passwordConfirm}
                onChange={handleChange}
                placeholder="Ketik ulang password"
                disabled={loading}
                className={`w-full h-9 px-3 pr-10 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                  errors.passwordConfirm ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                disabled={loading}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition disabled:opacity-50"
              >
                {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.passwordConfirm && <p className="text-danger text-xs mt-1">{errors.passwordConfirm}</p>}
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
            {errors.full_name && <p className="text-danger text-xs mt-1">{errors.full_name}</p>}
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
            {errors.role && <p className="text-danger text-xs mt-1">{errors.role}</p>}
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
              {errors.kelompok_id && <p className="text-danger text-xs mt-1">{errors.kelompok_id}</p>}
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
              className="flex-1 h-9 px-3 text-sm bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
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
    </>
  );
}

