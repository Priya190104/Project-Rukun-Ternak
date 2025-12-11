import React from 'react';
import StatsCard from '../components/StatsCard';
import { FileText, Heart, Skull, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const mockStats = {
  totalLaporan: 12,
  kelahiran: 8,
  kematian: 2,
  activeKelompok: 5,
};

const recentBirth = [
  { id: 1, kelompok: 'Kelompok A', no: '#KA-001', jk: 'Betina', berat: '45 kg', status: 'Sehat' },
  { id: 2, kelompok: 'Kelompok B', no: '#KB-002', jk: 'Jantan', berat: '42 kg', status: 'Sehat' },
];

const recentDeath = [
  { id: 1, kelompok: 'Kelompok A', no: '#KA-005', penyebab: 'Penyakit', tanggal: '2025-12-10' },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Selamat Datang di Rukun Ternak! 👋</h1>
            <p className="text-emerald-100 text-lg">Halo <span className="font-semibold">{user?.full_name || user?.name || 'User'}</span>, kelola data ternak dengan mudah dan efisien.</p>
          </div>
          <div className="text-6xl opacity-20">🐑</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Ringkasan Data</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard 
            title="Total Laporan" 
            value={mockStats.totalLaporan}
            icon={<FileText className="w-6 h-6" />}
            color="bg-blue-100 text-blue-600"
          />
          <StatsCard 
            title="Kelahiran Bulan Ini" 
            value={mockStats.kelahiran}
            icon={<Heart className="w-6 h-6" />}
            color="bg-green-100 text-green-600"
          />
          <StatsCard 
            title="Kematian Bulan Ini" 
            value={mockStats.kematian}
            icon={<Skull className="w-6 h-6" />}
            color="bg-red-100 text-red-600"
          />
          <StatsCard 
            title="Kelompok Aktif" 
            value={mockStats.activeKelompok}
            icon={<Users className="w-6 h-6" />}
            color="bg-purple-100 text-purple-600"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Birth Reports */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-green-600" />
              <h3 className="text-xl font-bold text-gray-900">Kelahiran Terbaru</h3>
            </div>
          </div>
          <div className="p-6 space-y-3">
            {recentBirth.length > 0 ? (
              recentBirth.map((item) => (
                <div key={item.id} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:border-green-300 transition">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-bold text-gray-900">{item.kelompok}</div>
                      <div className="text-sm text-gray-600 mt-1">{item.no}</div>
                    </div>
                    <span className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">{item.status}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>JK: <strong>{item.jk}</strong></span>
                    <span>Berat: <strong>{item.berat}</strong></span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Heart className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p>Belum ada data kelahiran bulan ini</p>
              </div>
            )}
          </div>
        </div>

        {/* Death Reports */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h3 className="text-xl font-bold text-gray-900">Laporan Kematian</h3>
            </div>
          </div>
          <div className="p-6 space-y-3">
            {recentDeath.length > 0 ? (
              recentDeath.map((item) => (
                <div key={item.id} className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200 hover:border-red-300 transition">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-bold text-gray-900">{item.kelompok}</div>
                      <div className="text-sm text-gray-600 mt-1">{item.no}</div>
                    </div>
                    <span className="text-xs text-gray-600 font-medium">{item.tanggal}</span>
                  </div>
                  <div className="text-sm text-gray-600">Penyebab: <strong>{item.penyebab}</strong></div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Skull className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p>Tidak ada laporan kematian bulan ini</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Aksi Cepat</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:border-blue-400 transition text-left group">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-600 group-hover:scale-110 transition" />
              <div>
                <div className="font-semibold text-gray-900">Lihat Semua Laporan</div>
                <div className="text-sm text-gray-600">Kelola semua laporan</div>
              </div>
            </div>
          </button>
          <button className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200 hover:border-emerald-400 transition text-left group">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition" />
              <div>
                <div className="font-semibold text-gray-900">Kelompok</div>
                <div className="text-sm text-gray-600">Kelola kelompok</div>
              </div>
            </div>
          </button>
          <button className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 hover:border-purple-400 transition text-left group">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-purple-600 group-hover:scale-110 transition" />
              <div>
                <div className="font-semibold text-gray-900">Analisis</div>
                <div className="text-sm text-gray-600">Lihat statistik & trend</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
