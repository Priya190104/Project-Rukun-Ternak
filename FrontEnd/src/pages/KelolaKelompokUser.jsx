import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Search, UserPlus, Trash2, Users, ChevronDown, X, AlertCircle, Eye, EyeOff } from 'lucide-react';
import client from '../api/client';
import AdminPageHeader from '../components/admin/AdminPageHeader';
import AlertModal from '../components/common/AlertModal';
import { useCachedData } from '../hooks/useCachedData';
import { useAuth } from '../hooks/useAuth';

const ROLE_OPTIONS = [
  { value: 'mitra_kelompok', label: 'Mitra Kelompok' },
  { value: 'viewer', label: 'Viewer' },
];

/**
 * KelolaKelompokUser — Halaman pengelolaan pengguna mitra kelompok
 * Hanya untuk role 'kelompok'. Admin tidak memiliki akses.
 * Route: /kelola-mitra-user
 *
 * Menampilkan semua pengguna yang terdaftar pada mitra-mitra milik kelompok ini.
 * CRUD langsung tanpa navigasi ke halaman lain.
 */
export default function KelolaKelompokUser() {
  const { user } = useAuth();

  // Mitra list (for dropdown + filter)
  const mitraKey = useMemo(() => `/api/mitra-kelompok?parent_id=${user?.kelompok_id}`, [user?.kelompok_id]);
  const { data: cachedMitra } = useCachedData(mitraKey, [mitraKey], { ttl: 5 * 60 * 1000 });
  const mitraList = useMemo(() => cachedMitra?.data || cachedMitra || [], [cachedMitra]);

  // Users state (fetched manually so we can refresh after mutations)
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMitraId, setFilterMitraId] = useState('');

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    mitraId: '',
    full_name: '',
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    role: 'mitra_kelompok',
  });
  const [addLoading, setAddLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [notification, setNotification] = useState(null);

  // Alert modal state
  const [alert, setAlert] = useState({ open: false, title: '', message: '', type: 'info' });

  // Role update loading tracker (keyed by user id)
  const [roleLoading, setRoleLoading] = useState({});

  const showAlert = (title, message, type = 'info') =>
    setAlert({ open: true, title, message, type });

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Reset form when modal opens
  useEffect(() => {
    if (showAddModal) {
      setAddForm({ mitraId: '', full_name: '', username: '', email: '', password: '', passwordConfirm: '', role: 'mitra_kelompok' });
      setFormErrors({});
      setNotification(null);
      setShowPassword(false);
      setShowPasswordConfirm(false);
    }
  }, [showAddModal]);

  const validateForm = () => {
    const newErrors = {};
    if (!addForm.mitraId) {
      newErrors.mitraId = 'Pilih mitra kelompok terlebih dahulu';
    }
    if (!addForm.username.trim()) {
      newErrors.username = 'Username wajib diisi';
    }
    if (!addForm.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(addForm.email)) {
        newErrors.email = 'Format email tidak valid';
      }
    }
    if (!addForm.password.trim() || addForm.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }
    if (!addForm.passwordConfirm.trim()) {
      newErrors.passwordConfirm = 'Konfirmasi password wajib diisi';
    }
    if (addForm.password && addForm.passwordConfirm && addForm.password !== addForm.passwordConfirm) {
      newErrors.passwordConfirm = 'Password dan konfirmasi password tidak sama';
    }
    if (!addForm.full_name.trim()) {
      newErrors.full_name = 'Nama lengkap wajib diisi';
    }
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fetch all mitra users
  const fetchUsers = useCallback(async () => {
    if (!mitraList.length) return;
    setLoadingUsers(true);
    try {
      // Fetch per mitra so we get the mitra association on each user
      const all = [];
      for (const mitra of mitraList) {
        try {
          const res = await client.get(`/api/mitra-kelompok/${mitra.id}/users`);
          const mitraUsers = res.data?.data || res.data || [];
          mitraUsers.forEach((u) => {
            all.push({ ...u, _mitraId: mitra.id, _mitraName: mitra.name });
          });
        } catch {
          // ignore per-mitra errors
        }
      }
      setUsers(all);
    } catch (err) {
      showAlert('Gagal', 'Tidak dapat memuat data pengguna.', 'error');
    } finally {
      setLoadingUsers(false);
    }
  }, [mitraList]);

  useEffect(() => {
    if (mitraList.length > 0) fetchUsers();
    else setLoadingUsers(false);
  }, [mitraList, fetchUsers]);

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      !q ||
      (u.nama_lengkap || '').toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q);
    const matchMitra = !filterMitraId || String(u._mitraId) === String(filterMitraId);
    return matchSearch && matchMitra;
  });

  // Stats
  const roleCounts = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});

  // Change role inline
  const handleRoleChange = async (u, newRole) => {
    setRoleLoading((prev) => ({ ...prev, [u.id]: true }));
    try {
      await client.put(`/api/mitra-kelompok/${u._mitraId}/users/${u.id}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((item) => (item.id === u.id ? { ...item, role: newRole } : item))
      );
    } catch (err) {
      showAlert('Gagal', err?.response?.data?.message || 'Gagal mengubah role.', 'error');
    } finally {
      setRoleLoading((prev) => ({ ...prev, [u.id]: false }));
    }
  };

  // Delete user
  const handleDelete = async (u) => {
    if (!window.confirm(`Hapus pengguna "${u.nama_lengkap || u.username}"?`)) return;
    try {
      await client.delete(`/api/mitra-kelompok/${u._mitraId}/users/${u.id}`);
      setUsers((prev) => prev.filter((item) => item.id !== u.id));
      showAlert('Berhasil', 'Pengguna berhasil dihapus.', 'success');
    } catch (err) {
      showAlert('Gagal', err?.response?.data?.message || 'Gagal menghapus pengguna.', 'error');
    }
  };

  // Add user
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showNotification('error', 'Mohon isi semua field yang wajib');
      return;
    }
    setAddLoading(true);
    try {
      await client.post(`/api/mitra-kelompok/${addForm.mitraId}/users`, {
        full_name: addForm.full_name.trim(),
        username: addForm.username.trim(),
        email: addForm.email.trim(),
        password: addForm.password.trim(),
        role: addForm.role,
      });
      showNotification('success', 'Pengguna baru berhasil ditambahkan!');
      setShowAddModal(false);
      setAddForm({ mitraId: '', nama_lengkap: '', username: '', email: '', password: '', passwordConfirm: '', role: 'mitra_kelompok' });
      setFormErrors({});
      setShowPassword(false);
      setShowPasswordConfirm(false);
      await fetchUsers();
    } catch (err) {
      showNotification('error', err?.response?.data?.message || 'Gagal menambah pengguna.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <AdminPageHeader
        title="Kelola Pengguna Mitra"
        subtitle="Tambah, ubah role, atau hapus pengguna mitra kelompok Anda"
        backTo="/client"
        showBackButton={true}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="text-3xl font-bold text-primary-600">{users.length}</div>
          <div className="text-xs font-medium text-gray-500 mt-1">Total Pengguna</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="text-3xl font-bold text-emerald-600">{roleCounts['mitra_kelompok'] || 0}</div>
          <div className="text-xs font-medium text-gray-500 mt-1">Role Mitra Kelompok</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="text-3xl font-bold text-blue-600">{mitraList.length}</div>
          <div className="text-xs font-medium text-gray-500 mt-1">Jumlah Mitra</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="text-3xl font-bold text-gray-400">
            {mitraList.filter((m) => !users.find((u) => u._mitraId === m.id)).length}
          </div>
          <div className="text-xs font-medium text-gray-500 mt-1">Mitra Tanpa Pengguna</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama, username, atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
        <div className="relative">
          <select
            value={filterMitraId}
            onChange={(e) => setFilterMitraId(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white min-w-[180px]"
          >
            <option value="">Semua Mitra</option>
            {mitraList.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition"
        >
          <UserPlus size={15} />
          Tambah Pengguna
        </button>
      </div>

      {/* Table */}
      {loadingUsers ? (
        <div className="flex justify-center py-16">
          <div className="text-gray-500 text-sm">Memuat data pengguna...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary-50 border-b border-gray-200 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-700 w-10">No</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Nama Lengkap</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Username</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Mitra Kelompok</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Role</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                      <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                      {users.length === 0
                        ? 'Belum ada pengguna terdaftar pada mitra kelompok Anda.'
                        : 'Tidak ada pengguna yang cocok dengan filter.'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u, idx) => (
                    <tr key={`${u._mitraId}-${u.id}`} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-gray-500 text-center">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{u.nama_lengkap || '-'}</td>
                      <td className="px-4 py-3 text-gray-700">{u.username || '-'}</td>
                      <td className="px-4 py-3 text-gray-500">{u.email || '-'}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                          {u._mitraName || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u, e.target.value)}
                            disabled={!!roleLoading[u.id]}
                            className="appearance-none pl-2 pr-6 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white disabled:opacity-60"
                          >
                            {ROLE_OPTIONS.map((r) => (
                              <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                          </select>
                          <ChevronDown size={11} className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDelete(u)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 transition"
                          title="Hapus pengguna"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Tambah Pengguna Mitra</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-700 transition disabled:opacity-50"
                disabled={addLoading}
              >
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

            <form onSubmit={handleAddSubmit} className="p-4 space-y-3" noValidate>
              {/* Mitra selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1">
                  Mitra Kelompok <span className="text-red-500">*</span>
                </label>
                <select
                  name="mitraId"
                  value={addForm.mitraId}
                  onChange={handleAddFormChange}
                  disabled={addLoading}
                  className={`w-full h-9 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                    formErrors.mitraId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">-- Pilih Mitra --</option>
                  {mitraList.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                {formErrors.mitraId && <p className="text-danger text-xs mt-1">{formErrors.mitraId}</p>}
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={addForm.username}
                  onChange={handleAddFormChange}
                  placeholder="Username"
                  disabled={addLoading}
                  className={`w-full h-9 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                    formErrors.username ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.username && <p className="text-danger text-xs mt-1">{formErrors.username}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={addForm.email}
                  onChange={handleAddFormChange}
                  placeholder="user@example.com"
                  disabled={addLoading}
                  className={`w-full h-9 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                    formErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.email && <p className="text-danger text-xs mt-1">{formErrors.email}</p>}
                <p className="text-gray-500 text-xs mt-1">📧 Diperlukan untuk fitur reset password</p>
              </div>

              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={addForm.full_name}
                  onChange={handleAddFormChange}
                  placeholder="Nama lengkap"
                  disabled={addLoading}
                  className={`w-full h-9 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                    formErrors.full_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.full_name && <p className="text-danger text-xs mt-1">{formErrors.full_name}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={addForm.password}
                    onChange={handleAddFormChange}
                    placeholder="Min. 6 karakter"
                    disabled={addLoading}
                    className={`w-full h-9 px-3 pr-10 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                      formErrors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={addLoading}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formErrors.password && <p className="text-danger text-xs mt-1">{formErrors.password}</p>}
              </div>

              {/* Konfirmasi Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1">
                  Konfirmasi Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswordConfirm ? 'text' : 'password'}
                    name="passwordConfirm"
                    value={addForm.passwordConfirm}
                    onChange={handleAddFormChange}
                    placeholder="Ketik ulang password"
                    disabled={addLoading}
                    className={`w-full h-9 px-3 pr-10 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                      formErrors.passwordConfirm ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    disabled={addLoading}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition disabled:opacity-50"
                  >
                    {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formErrors.passwordConfirm && <p className="text-danger text-xs mt-1">{formErrors.passwordConfirm}</p>}
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1">Role</label>
                <select
                  name="role"
                  value={addForm.role}
                  onChange={handleAddFormChange}
                  disabled={addLoading}
                  className={`w-full h-9 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                    formErrors.role ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                {formErrors.role && <p className="text-danger text-xs mt-1">{formErrors.role}</p>}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setAddForm({ mitraId: '', full_name: '', username: '', email: '', password: '', passwordConfirm: '', role: 'mitra_kelompok' });
                    setFormErrors({});
                    setShowPassword(false);
                    setShowPasswordConfirm(false);
                  }}
                  disabled={addLoading}
                  className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded-lg text-gray-900 font-medium hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex-1 h-9 px-3 text-sm bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {addLoading ? (
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
      )}

      {/* Alert Modal */}
      <AlertModal
        isOpen={alert.open}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert((a) => ({ ...a, open: false }))}
      />
    </div>
  );
}
