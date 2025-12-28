import React, { useEffect, useState } from 'react';
import { Search, UserPlus } from 'lucide-react';
import client from '../api/client';
import AddUserModal from '../components/user/AddUserModal';

export default function KelolaUser() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [kelompokList, setKelompokList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
    fetchKelompok();
  }, []);

  const fetchKelompok = async () => {
    try {
      const res = await client.get('/api/kelompok');
      setKelompokList(res.data?.data || []);
    } catch (err) {
      console.warn('Failed to load kelompok', err.message || err);
      setKelompokList([]);
    }
  };

  const fetchData = async () => {
    try {
      const res = await client.get('/api/users');
      setUsers(res.data?.data || []);
      setFiltered(res.data?.data || []);
    } catch (err) {
      console.warn('Failed to load users', err.message || err);
      setUsers([]);
      setFiltered([]);
    }
  };



  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const result = users.filter(u =>
      (u.full_name || u.username || '').toLowerCase().includes(value) ||
      (u.username || '').toLowerCase().includes(value) ||
      (String(u.kelompok || '')).toLowerCase().includes(value)
    );
    setFiltered(result);
  };

  const adminCount = users.filter(u => u.role === 'admin').length;
  const kelompokCount = users.filter(u => u.role === 'kelompok').length;
  const pendingCount = users.filter(u => !u.role || u.role === 'pending' || u.role === 'belum ditentukan').length;

  const changeRole = async (userId, role) => {
    try {
      await client.put(`/api/users/${userId}/role`, { role });
      fetchData();
    } catch (err) {
      console.warn('Failed to update role', err.message || err);
    }
  };

  const changeKelompok = async (userId, kelompok) => {
    try {
      await client.put(`/api/users/${userId}/kelompok`, { kelompok });
      fetchData();
    } catch (err) {
      console.warn('Failed to update kelompok', err.message || err);
    }
  };

  const removeUser = async (userId) => {
    if (!window.confirm('Hapus pengguna ini?')) return;
    try {
      await client.delete(`/api/users/${userId}`);
      fetchData();
    } catch (err) {
      console.warn('Failed to delete user', err.message || err);
    }
  };



  return (
    <div className="space-y-6 pt-6 sm:pt-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Kelola Pengguna</h1>
        <p className="text-gray-600 mt-2">Atur role dan kelompok pengguna</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-4xl font-bold text-gray-900">{users.length}</div>
          <div className="text-sm font-medium text-gray-600 mt-2">Total</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-4xl font-bold text-purple-600">{adminCount}</div>
          <div className="text-sm font-medium text-gray-600 mt-2">Admin</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-4xl font-bold text-emerald-600">{kelompokCount}</div>
          <div className="text-sm font-medium text-gray-600 mt-2">Kelompok</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-4xl font-bold text-yellow-600">{pendingCount}</div>
          <div className="text-sm font-medium text-gray-600 mt-2">Belum Diatur</div>
        </div>
      </div>

      {/* Search & Add */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama, email, atau kelompok..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium flex items-center justify-center gap-2 whitespace-nowrap"
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
            <p className="text-gray-500 font-medium">Tidak ada pengguna yang cocok</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nama</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Kelompok</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.full_name || user.username}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.username}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <select
                        value={user.kelompok_id || ''}
                        onChange={(e) => changeKelompok(user.id, e.target.value || null)}
                        className="px-3 py-1 border rounded-md text-sm"
                      >
                        <option value="">-</option>
                        {kelompokList.map((k) => (
                          <option key={k.id} value={k.id}>{k.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <select
                        value={user.role || 'pending'}
                        onChange={(e) => changeRole(user.id, e.target.value)}
                        className="px-3 py-1 border rounded-md text-sm"
                      >
                        <option value="pending">Belum Diatur (Legacy)</option>
                        <option value="belum ditentukan">Belum Ditentukan</option>
                        <option value="admin">Admin</option>
                        <option value="kelompok">Kelompok</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button onClick={() => removeUser(user.id)} className="text-red-600 hover:text-red-700 font-medium">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUserAdded={fetchData}
        kelompokList={kelompokList}
      />
    </div>
  );
}
