import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, Activity } from 'lucide-react';

const mockData = {
  populasi: 1,
  kelahiran: 1,
  kematian: 0,
  pertumbuhan: '+100.0%',
};

export default function Analisis() {
  const [filterKelompok, setFilterKelompok] = useState('Semua Kelompok');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analisis Perkembangan</h1>
        <p className="text-gray-600 mt-2">Visualisasi data perkembangan ternak</p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={20} className="text-emerald-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filter Analisis</h2>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter Kelompok</label>
          <select
            value={filterKelompok}
            onChange={(e) => setFilterKelompok(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-md"
          >
            <option>Semua Kelompok</option>
            <option>KLP1</option>
            <option>KLP2</option>
            <option>KLP3</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Populasi Saat Ini */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600">Populasi Saat Ini</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{mockData.populasi}</div>
            </div>
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <Users size={24} />
            </div>
          </div>
        </div>

        {/* Total Kelahiran */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600">Total Kelahiran</div>
              <div className="text-3xl font-bold text-green-600 mt-2">{mockData.kelahiran}</div>
            </div>
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-green-50 text-green-600">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        {/* Total Kematian */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600">Total Kematian</div>
              <div className="text-3xl font-bold text-red-600 mt-2">{mockData.kematian}</div>
            </div>
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-red-50 text-red-600">
              <Activity size={24} />
            </div>
          </div>
        </div>

        {/* Pertumbuhan */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600">Pertumbuhan</div>
              <div className="text-3xl font-bold text-blue-600 mt-2">{mockData.pertumbuhan}</div>
            </div>
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <BarChart3 size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Perkembangan Populasi</h2>
        <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-center text-gray-500">
            <BarChart3 size={48} className="mx-auto mb-2 text-gray-300" />
            <p className="font-medium">Chart placeholder</p>
            <p className="text-sm mt-1">Grafik perkembangan populasi akan ditampilkan di sini</p>
          </div>
        </div>
      </div>
    </div>
  );
}
