import React, { useEffect, useState } from 'react';
import StatsCard from '../components/StatsCard';
import { FileText, Users, TrendingUp, Newspaper } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import client from '../api/client';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totals: { laporan: 0, users: 0, kelompok: 0 }, latest: [], perMonth: [], perKelompok: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('[Dashboard] Loading stats...');
        const res = await client.get('/api/stats');
        if (!mounted) return;
        console.log('[Dashboard] Stats loaded:', res.data?.data);
        setStats(res.data?.data || { totals: { laporan: 0, users: 0, kelompok: 0 }, latest: [], perMonth: [], perKelompok: [] });
      } catch (err) {
        console.error('[Dashboard] Failed to load stats:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load stats');
        setStats({ totals: { laporan: 0, users: 0, kelompok: 0 }, latest: [], perMonth: [], perKelompok: [] });
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-emerald-700 text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Welcome Banner - ADMIN GLOBAL */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-lg sm:rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Dashboard Admin 👋</h1>
            <p className="text-emerald-100 text-sm sm:text-base lg:text-lg">Halo <span className="font-semibold">{user?.full_name || user?.username || 'Admin'}</span>, ini adalah ringkasan global semua kelompok.</p>
          </div>
          <div className="text-4xl sm:text-5xl md:text-6xl opacity-20">🐑</div>
        </div>
      </div>

      {/* Stats Grid - GLOBAL */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Ringkasan Data Global</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <StatsCard 
            title="Total Laporan" 
            value={stats.totals?.laporan ?? 0}
            icon={<FileText className="w-5 h-5 sm:w-6 sm:h-6" />}
            color="bg-blue-100 text-blue-600"
          />
          <StatsCard 
            title="Total User" 
            value={stats.totals?.users ?? 0}
            icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />}
            color="bg-green-100 text-green-600"
          />
          <StatsCard 
            title="Total Kelompok" 
            value={stats.totals?.kelompok ?? 0}
            icon={<TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />}
            color="bg-purple-100 text-purple-600"
          />
        </div>
      </div>

      {/* Stats Per Kelompok */}
      {stats.perKelompok && stats.perKelompok.length > 0 && (
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Statistik Per Kelompok</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {stats.perKelompok.map((k) => (
              <div key={k.id} className="bg-white rounded-lg sm:rounded-xl shadow-sm sm:shadow-md border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{k.name}</h3>
                <div className="text-2xl sm:text-3xl font-bold text-emerald-600">{k.laporan_count}</div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1">Total Laporan</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Latest Reports */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Laporan Terbaru</h2>
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm sm:shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelompok</th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.latest && stats.latest.length > 0 ? (
                  stats.latest.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 text-xs sm:text-sm">
                      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-gray-600">
                        {new Date(item.tanggal).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <span className="px-2 sm:px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                          {item.jenis || 'N/A'}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-gray-900">
                        {item.kelompok_name || item.kelompok || '-'}
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-gray-600">
                        {item.full_name || item.username || '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-3 sm:px-6 py-8 sm:py-12 text-center text-gray-500">
                      <FileText className="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-gray-300 mb-2" />
                      <p>Belum ada laporan</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Aksi Cepat</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          {/* Admin-only shortcut to Kelola Berita */}
          {user?.role === 'admin' && (
            <a href="/kelola-berita" className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg border border-pink-200 hover:border-pink-400 transition text-left group">
              <div className="flex items-center gap-3">
                <Newspaper className="w-6 h-6 text-pink-600 group-hover:scale-110 transition" />
                <div>
                  <div className="font-semibold text-gray-900">Kelola Berita</div>
                  <div className="text-sm text-gray-600">Tambah, edit, hapus berita</div>
                </div>
              </div>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
