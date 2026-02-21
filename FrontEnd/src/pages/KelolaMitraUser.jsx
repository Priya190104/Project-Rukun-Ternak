import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Search, UserPlus, Trash2 } from 'lucide-react';
import client from '../api/client';
import AdminPageHeader from '../components/admin/AdminPageHeader';
import { useAuth } from '../hooks/useAuth';
import AlertModal from '../components/common/AlertModal';

/**
 * KelolaMitraUser — Halaman kelola pengguna untuk satu mitra kelompok
 * Route: /mitra-kelompok/:id/kelola-user
 * Accessible by: admin, kelompok (owner only)
 */
export default function KelolaMitraUser() {
  const { id } = useParams();       // mitraKelompokId
  const { appRole } = useAuth();

  const [mitraName, setMitraName] = useState('');
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, type: 'success', title: '', message: '' });

  // Form tambah user
  const [form, setForm] = useState({
    username: '', email: '', password: '', full_name: '', role: 'mitra_kelompok'
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await client.get(`/api/mitra-kelompok/${id}/users`);
      const data = res.data?.data || [];
      setUsers(data);
      setFiltered(data);
    } catch (err) {
      console.error('Fetch mitra users failed', err);
    }
  };

  const fetchMitraName = async () => {
    try {
      const res = await client.get(`/api/mitra-kelompok/${id}`);
      setMitraName(res.data?.data?.name || 'Mitra Kelompok');
    } catch (err) {
      console.error('Fetch mitra name failed', err);
    }
  };

  useEffect(() => {
    fetchMitraName();
    fetchUsers();
    // eslint-disable-next-line
  }, [id]);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const result = users.filter(u =>
      (u.full_name || u.username || '').toLowerCase().includes(value) ||
      (u.username || '').toLowerCase().includes(value)
    );
    setFiltered(result);
  };

  const changeRole = async (userId, role) => {
    try {
      await client.put(`/api/mitra-kelompok/${id}/users/${userId}/role`, { role });
      fetchUsers();
    } catch (err) {
      console.warn('Failed to update role', err.message || err);
    }
  };

  const removeUser = async (userId) => {
    if (!window.confirm('Hapus pengguna ini dari mitra kelompok?')) return;
    try {
      await client.delete(`/api/mitra-kelompok/${id}/users/${userId}`);
      fetchUsers();
      setAlert({ isOpen: true, type: 'success', title: '✓ Pengguna Dihapus', message: 'Pengguna berhasil dihapus dari mitra kelompok.' });
    } catch (err) {
      console.warn('Failed to delete user', err.message || err);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.username.trim() || !form.password.trim() || !form.full_name.trim() || !form.email.trim()) {
      setFormError('Semua field wajib diisi');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setFormError('Format email tidak valid');
      return;
    }

    try {
      setIsSubmitting(true);
      await client.post(`/api/mitra-kelompok/${id}/users`, form);
      setIsAddOpen(false);
      setForm({ username: '', email: '', password: '', full_name: '', role: 'mitra_kelompok' });
      fetchUsers();
      setAlert({ isOpen: true, type: 'success', title: '✓ Pengguna Ditambahkan', message: `Pengguna "${form.full_name}" berhasil ditambahkan.` });
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menambahkan pengguna';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const mitraCount = users.filter(u => u.role === 'mitra_kelompok').length;
  const lainCount = users.filter(u => u.role !== 'mitra_kelompok').length;
  const pendingCount = users.filter(u => !u.role || u.role === 'pending' || u.role === 'belum ditentukan').length;

  return (
    <div className="space-y-8 pb-12">
      <AdminPageHeader
        title={`Kelola Pengguna — ${mitraName}`}
        subtitle="Atur pengguna yang terdaftar di mitra kelompok ini"
        backTo={appRole === 'kelompok' ? '/kelola-mitra-user' : `/mitra-kelompok/${id}`}
        showBackButton={true}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-4xl font-bold text-gray-900">{users.length}</div>
          <div className="text-sm font-medium text-gray-700 mt-2">Total</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-4xl font-bold text-emerald-600">{mitraCount}</div>
          <div className="text-sm font-medium text-gray-700 mt-2">Mitra Kelompok</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-4xl font-bold text-primary-600">{lainCount}</div>
          <div className="text-sm font-medium text-gray-700 mt-2">Role Lain</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-4xl font-bold text-yellow-600">{pendingCount}</div>
          <div className="text-sm font-medium text-gray-700 mt-2">Belum Diatur</div>
        </div>
      </div>

      {/* Search & Add */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama atau username..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 rounded-lg transition font-medium flex items-center justify-center gap-2 whitespace-nowrap bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <UserPlus size={18} />
            Tambah Pengguna
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Daftar Pengguna ({filtered.length})</h2>
        </div>
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 font-medium">Belum ada pengguna di mitra kelompok ini</p>
          </div>
        ) : (
          <>
            {/* ── Mobile Cards (< md) ── */}
            <div className="md:hidden divide-y divide-gray-100">
              {filtered.map((u) => (
                <div key={u.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{u.full_name || u.username}</p>
                      <p className="text-xs text-gray-500">{u.username}</p>
                    </div>
                    <button
                      title="Hapus pengguna"
                      onClick={() => removeUser(u.id)}
                      className="p-1.5 text-danger hover:bg-red-50 rounded transition shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  {u.email && (
                    <p className="text-xs text-gray-600">{u.email}</p>
                  )}
                  <div className="pt-1">
                    <label className="text-xs text-gray-500 mb-1 block">Role</label>
                    <select
                      value={u.role || 'pending'}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="pending">Belum Diatur</option>
                      <option value="mitra_kelompok">Mitra Kelompok</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Desktop Table (md+) ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nama</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Username</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.full_name || u.username}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{u.email || <span className="text-gray-400 italic">Belum diset</span>}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{u.username}</td>
                      <td className="px-6 py-4 text-sm">
                        <select
                          value={u.role || 'pending'}
                          onChange={(e) => changeRole(u.id, e.target.value)}
                          className="px-3 py-1 border rounded-md text-sm"
                        >
                          <option value="pending">Belum Diatur</option>
                          <option value="mitra_kelompok">Mitra Kelompok</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          title="Hapus pengguna"
                          onClick={() => removeUser(u.id)}
                          className="p-2 text-danger hover:bg-danger-50 rounded transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Add User Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-emerald-600 px-6 py-4 rounded-t-lg">
              <h3 className="text-lg font-bold text-white">Tambah Pengguna ke {mitraName}</h3>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm(p => ({ ...p, full_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Username *</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm(p => ({ ...p, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="Masukkan username"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="Masukkan email"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="Minimal 6 karakter"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm(p => ({ ...p, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  <option value="mitra_kelompok">Mitra Kelompok</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsAddOpen(false); setFormError(''); }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Menyimpan...
                    </>
                  ) : 'Tambah Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      <AlertModal
        isOpen={alert.isOpen}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        autoCloseMs={3000}
      />
    </div>
  );
}
