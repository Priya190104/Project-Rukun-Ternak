import React from 'react';
import { Link } from 'react-router-dom';
import StatsCard from '../components/StatsCard';
import { FilePlus, FileText, TrendingUp, Clock } from 'lucide-react';
import createPageUrl from '../utils/createPageUrl';
import client from '../api/client';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function ClientDashboard() {
  const { user, appRole } = useAuth();
  const [stats, setStats] = useState({ totals: { laporan: 0, users: 0, kelompok: 0 }, latest: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('[ClientDashboard] Loading stats...');
        const res = await client.get('/api/stats');
        if (!mounted) return;
        console.log('[ClientDashboard] Stats loaded:', res.data?.data);
        setStats(res.data?.data || { totals: { laporan: 0, users: 0, kelompok: 0 }, latest: [] });
      } catch (err) {
        console.error('[ClientDashboard] Failed to load stats:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load stats');
        setStats({ totals: { laporan: 0, users: 0, kelompok: 0 }, latest: [] });
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-emerald-700 text-lg">Loading...</div>
      </div>
    );
  }

  const myRecent = stats.latest || [];
  
  // Tentukan judul berdasarkan role
  const dashboardTitle = appRole === 'kelompok' 
    ? `Dashboard Kelompok ${user?.kelompok || ''} 🐑` 
    : 'Dashboard Client 📋';
  
  const dashboardDesc = appRole === 'kelompok'
    ? `Kelola laporan kelompok ${user?.kelompok || 'Anda'} dengan mudah dan cepat`
    : 'Kelola laporan pribadi Anda dengan mudah dan cepat';

  return (
    <div className="space-y-6 sm:space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-lg sm:rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{dashboardTitle}</h1>
        <p className="text-emerald-100 text-sm sm:text-base lg:text-lg">{dashboardDesc}</p>
        {user?.full_name && (
          <p className="text-emerald-200 text-xs sm:text-sm mt-2">Halo, {user.full_name}</p>
        )}
      </div>

      {/* Stats Cards */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Ringkasan Laporan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <StatsCard 
            title="Total Laporan" 
            value={stats.totals?.laporan ?? 0}
            icon={<FileText className="w-5 h-5 sm:w-6 sm:h-6" />}
            color="bg-blue-100 text-blue-600"
          />
          <StatsCard 
            title="Terakhir Dikirim" 
            value={(stats.latest && stats.latest[0] && (new Date(stats.latest[0].tanggal).toLocaleDateString())) || '-'}
            icon={<TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />}
            color="bg-green-100 text-green-600"
          />
          <StatsCard 
            title="Tugas Terbuka" 
            value={0}
            icon={<Clock className="w-5 h-5 sm:w-6 sm:h-6" />}
            color="bg-yellow-100 text-yellow-600"
          />
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm sm:shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Laporan Terbaru</h2>
          </div>
          <Link to="/pilih-jenis" className="w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold text-sm flex items-center justify-center sm:justify-start gap-2 shadow-sm">
            <FilePlus size={18} />
            <span>Buat Laporan</span>
          </Link>
        </div>

        <div className="p-4 sm:p-6">
          {myRecent.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {myRecent.map((r) => (
                <div key={r.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-50 rounded-lg border border-gray-200 hover:border-emerald-300 hover:shadow-sm transition group gap-3 sm:gap-0">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 group-hover:text-emerald-700 transition text-sm sm:text-base truncate">{r.jenis || 'Laporan'}</div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2 flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-semibold whitespace-nowrap">{r.jenis}</span>
                      <span className="text-gray-500 whitespace-nowrap">{r.tanggal ? (new Date(r.tanggal).toLocaleDateString()) : '-'}</span>
                    </div>
                  </div>
                  <Link to={createPageUrl('laporan', r.id)} className="w-full sm:w-auto px-3 sm:px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition font-medium text-xs sm:text-sm whitespace-nowrap text-center sm:text-left">
                    👁️ Lihat
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 text-gray-500">
              <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-300 mb-3 sm:mb-4" />
              <p className="font-semibold text-base sm:text-lg">Belum ada laporan</p>
              <p className="text-xs sm:text-sm mt-1 sm:mt-2 mb-3 sm:mb-4">Buat laporan pertama Anda sekarang</p>
              <Link to="/pilih-jenis" className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold inline-flex items-center gap-2 text-sm">
                <FilePlus size={18} />
                Buat Laporan Baru
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
