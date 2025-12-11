import React, { useState } from 'react';
import { MapPin, Users, Search } from 'lucide-react';

const mockKelompok = [
  { id: 1, name: 'Donan Sejahtera', location: 'Donan', kecamatan: 'Donan', subCount: 5 },
  { id: 2, name: 'Kelompok Donan Sejahtera', location: 'Gandrungmangu', kecamatan: 'Gandrungmangu', subCount: 3 },
  { id: 3, name: 'Pusat', location: 'Cilacap Kota', kecamatan: 'Lomalangu', subCount: 8 },
];

export default function ListKelompok() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtered, setFiltered] = useState(mockKelompok);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const result = mockKelompok.filter(k => 
      k.name.toLowerCase().includes(value) || 
      k.location.toLowerCase().includes(value)
    );
    setFiltered(result);
  };

  const kecamatanCount = [...new Set(mockKelompok.map(k => k.kecamatan))].length;
  const desaCount = mockKelompok.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">List Kelompok</h1>
        <p className="text-gray-600 mt-2">Kelola data master kelompok ternak</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-4xl font-bold text-gray-900">{mockKelompok.length}</div>
          <div className="text-sm font-medium text-gray-600 mt-2">Total Kelompok</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-4xl font-bold text-cyan-600">{kecamatanCount}</div>
          <div className="text-sm font-medium text-gray-600 mt-2">Kecamatan</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-4xl font-bold text-purple-600">{desaCount}</div>
          <div className="text-sm font-medium text-gray-600 mt-2">Desa</div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 relative">
          <Search size={18} className="absolute left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Cari kelompok..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Kelompok List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Daftar Kelompok ({filtered.length})</h2>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 font-medium">Tidak ada kelompok yang cocok</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filtered.map((kelompok) => (
              <div key={kelompok.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <Users size={20} />
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-3">{kelompok.name}</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={16} />
                    <span>{kelompok.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={16} />
                    <span>{kelompok.kecamatan}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-600">Anggota: {kelompok.subCount}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

