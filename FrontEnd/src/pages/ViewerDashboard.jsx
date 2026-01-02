import React, { useEffect, useState } from 'react';
import StatsCard from '../components/StatsCard';
import AppLogo from '../components/branding/AppLogo';
import SupportedByLogo from '../components/branding/SupportedByLogo';
import { FileText, Users, TrendingUp } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import client from '../api/client';

export default function ViewerDashboard() {
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
        console.log('[ViewerDashboard] Loading stats...');
        const res = await client.get('/api/stats');
        if (!mounted) return;
        console.log('[ViewerDashboard] Stats loaded:', res.data?.data);
        setStats(res.data?.data || { totals: { laporan: 0, users: 0, kelompok: 0 }, latest: [], perMonth: [], perKelompok: [] });
      } catch (err) {
        console.error('[ViewerDashboard] Failed to load stats:', err);
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
    <div className="space-y-6 sm:space-y-8 pt-8 sm:pt-12">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Welcome Banner - VIEWER */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-50 rounded-lg sm:rounded-2xl p-6 sm:p-8 text-gray-900 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Dashboard Viewer</h1>
            <p className="text-emerald-900 text-sm sm:text-base lg:text-lg">
              Halo <span className="font-semibold">{user?.full_name || user?.username || 'Viewer'}</span>, Anda memiliki akses read-only untuk melihat data aplikasi.
            </p>
            <div className="mt-3 inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
              🔒 READ-ONLY ACCESS
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <AppLogo size="2xl" variant="icon" />
            <SupportedByLogo mainLogoSize={100} />
          </div>
        </div>
      </div>

      {/* Stats Grid - GLOBAL (Read-only) */}
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
              <div key={k.id} className="bg-white rounded-lg sm:rounded-xl shadow-sm sm:shadow-md border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition cursor-not-allowed opacity-75">
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

      {/* Info Box - READ-ONLY */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <div className="flex gap-4">
          <div className="text-2xl">🔒</div>
          <div>
            <h3 className="font-bold text-blue-900 mb-2">Akses Read-Only</h3>
            <p className="text-sm text-blue-800 mb-3">
              Anda memiliki akses untuk melihat semua data aplikasi Rukun Ternak. 
              Namun, Anda tidak memiliki izin untuk membuat, mengedit, atau menghapus data.
            </p>
            <ul className="text-xs text-blue-800 space-y-1 ml-4">
              <li>✓ Melihat laporan dan statistik</li>
              <li>✓ Melihat data kelompok</li>
              <li>✓ Melihat data pengguna</li>
              <li>✗ Tidak dapat membuat laporan baru</li>
              <li>✗ Tidak dapat mengedit data</li>
              <li>✗ Tidak dapat menghapus data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
