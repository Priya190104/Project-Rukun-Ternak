import React, { useState } from 'react';
import { Search, UserPlus } from 'lucide-react';

const mockUsers = [
  { id: 1, name: 'Aplikasi Pengaduan', email: 'aplikasipenggaduan@gmail.com', kelompok: 'Donan Sejahtera', role: 'kelompok' },
  { id: 2, name: 'Priya Ardhana', email: 'ardhana32@gmail.com', kelompok: 'Pusat', role: 'admin' },
  { id: 3, name: 'Budi Satrio', email: 'budisatrio@gmail.com', kelompok: 'Pusat', role: 'admin' },
  { id: 4, name: 'Rini Wijaya', email: 'rini.wijaya@gmail.com', kelompok: 'Kelompok Donan', role: 'kelompok' },
  { id: 5, name: 'Sinta Putri', email: 'sinta.putri@gmail.com', kelompok: '-', role: 'pending' },
  { id: 6, name: 'Hendro Suryanto', email: 'hendro@gmail.com', kelompok: 'KLP2', role: 'kelompok' },
  { id: 7, name: 'Dewi Lestari', email: 'dewi.lestari@gmail.com', kelompok: '-', role: 'pending' },
  { id: 8, name: 'Ahmad Rizki', email: 'ahmad.rizki@gmail.com', kelompok: 'KLP3', role: 'kelompok' },
];

export default function KelolaUser() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtered, setFiltered] = useState(mockUsers);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const result = mockUsers.filter(u => 
      u.name.toLowerCase().includes(value) || 
      u.email.toLowerCase().includes(value)
    );
    setFiltered(result);
  };

  const adminCount = mockUsers.filter(u => u.role === 'admin').length;
  const kelompokCount = mockUsers.filter(u => u.role === 'kelompok').length;
  const pendingCount = mockUsers.filter(u => u.role === 'pending').length;

  const getRoleBadge = (role) => {
    const badges = {
      'admin': 'bg-purple-100 text-purple-700 border border-purple-300',
      'kelompok': 'bg-emerald-100 text-emerald-700 border border-emerald-300',
      'pending': 'bg-yellow-100 text-yellow-700 border border-yellow-300',
    };
    return badges[role] || 'bg-gray-100 text-gray-700 border border-gray-300';
  };

  const getRoleLabel = (role) => {
    const labels = {
      'admin': 'Admin',
      'kelompok': 'Kelompok',
      'pending': 'Belum Diatur',
    };
    return labels[role] || role;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Kelola Pengguna</h1>
        <p className="text-gray-600 mt-2">Atur role dan kelompok pengguna</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-4xl font-bold text-gray-900">{mockUsers.length}</div>
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
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium flex items-center justify-center gap-2 whitespace-nowrap">
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
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.kelompok}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadge(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button className="text-emerald-600 hover:text-emerald-700 font-medium">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
