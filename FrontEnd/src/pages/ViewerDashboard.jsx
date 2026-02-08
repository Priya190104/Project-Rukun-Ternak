import React, { useEffect, useState } from 'react';
import StatsCard from '../components/StatsCard';
import AppLogo from '../components/branding/AppLogo';
import SupportedByLogo from '../components/branding/SupportedByLogo';
import { FileText, Users, Activity } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCachedData } from '../hooks/useCachedData';

export default function ViewerDashboard() {
  const { user } = useAuth();
  
  // Fetch dashboard stats dengan automatic caching (10 menit TTL) - Same as Admin Dashboard
  const { data: cachedStats, loading, error } = useCachedData(
    '/api/stats/admin/dashboard',
    ['/api/stats/admin/dashboard'],
    { ttl: 10 * 60 * 1000 } // 10 minutes
  );
  
  const [stats, setStats] = useState({ totals: { laporan: 0, users: 0, kelompok: 0 }, latest: [], perMonth: [], perKelompok: [], populasi: {}, kelahiran: {}, kematian: {}, penjualan: {} });

  useEffect(() => {
    if (cachedStats) {
      // Handle both { data: {...} } and direct object structure
      const statsData = cachedStats.data || cachedStats;
      console.log('[ViewerDashboard] Admin stats loaded:', statsData);
      setStats(statsData || { totals: { laporan: 0, users: 0, kelompok: 0 }, latest: [], perMonth: [], perKelompok: [], populasi: {}, kelahiran: {}, kematian: {}, penjualan: {} });
    }
  }, [cachedStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-primary-700 text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pt-6 pb-12">
      {error && (
        <div className="bg-danger-50 border border-danger-100 text-danger px-4 py-3 rounded-lg text-sm font-medium">
          ?? {error}
        </div>
      )}

      {/* Welcome Banner - VIEWER (READ-ONLY VERSION OF ADMIN) */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-200 rounded-lg sm:rounded-2xl p-6 sm:p-8 text-gray-900 shadow-lg border-2 border-primary-300">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Dashboard Admin</h1>
              <span className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-xs font-semibold">
                ?? READ-ONLY
              </span>
            </div>
            <p className="text-primary-900 text-sm sm:text-base lg:text-lg">Halo <span className="font-semibold">{user?.full_name || user?.username || 'Viewer'}</span>, ini adalah ringkasan global semua kelompok (akses read-only).</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <AppLogo size="2xl" variant="icon" />
            <SupportedByLogo size="sm" />
          </div>
        </div>
      </div>

      {/* SECTION 1: SUMMARY CARDS (KPI TOP) */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Ringkasan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            title="Total Kelompok" 
            value={stats.totals?.kelompok ?? 0}
            icon={<Users className="w-5 h-5" />}
            color="bg-primary-100 text-primary-600"
          />
          <StatsCard 
            title="Total User" 
            value={stats.totals?.users ?? 0}
            icon={<Users className="w-5 h-5" />}
            color="bg-primary-100 text-primary-600"
          />
          <StatsCard 
            title="Total Laporan" 
            value={stats.totals?.laporan ?? 0}
            icon={<FileText className="w-5 h-5" />}
            color="bg-orange-100 text-orange-600"
          />
          <StatsCard 
            title="Status Sistem" 
            value="Aktif"
            icon={<Activity className="w-5 h-5" />}
            color="bg-primary-100 text-primary-600"
          />
        </div>
      </div>

      {/* SECTION 2: INFORMATION CARDS GRID (MAJOO STYLE) */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Analisis & Informasi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Populasi Ternak */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Populasi Ternak</h3>
            </div>
            <div className="flex-1">
              {stats.populasi?.total_hewan ? (
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.populasi.total_hewan}
                  </div>
                  <div className="text-xs text-gray-700 space-y-1">
                    <p>Jantan: <span className="font-semibold">{stats.populasi.hewan_jantan}</span></p>
                    <p>Betina: <span className="font-semibold">{stats.populasi.hewan_betina}</span></p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500 py-6">Belum ada data</p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className="text-gray-400 text-xs font-semibold cursor-not-allowed">
                Lihat Semua (read-only) ?
              </span>
            </div>
          </div>

          {/* Card 2: Data Kelahiran */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Data Kelahiran</h3>
            </div>
            <div className="flex-1">
              {stats.kelahiran?.total_kelahiran ? (
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-pink-600">
                    {stats.kelahiran.total_kelahiran}
                  </div>
                  <div className="text-xs text-gray-700 space-y-1">
                    <p>Jantan: <span className="font-semibold">{stats.kelahiran.kelahiran_jantan}</span></p>
                    <p>Betina: <span className="font-semibold">{stats.kelahiran.kelahiran_betina}</span></p>
                    <p className="text-primary-600 font-semibold">Bulan ini: {stats.kelahiran.this_month}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500 py-6">Belum ada data</p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className="text-gray-400 text-xs font-semibold cursor-not-allowed">
                Lihat Semua (read-only) ?
              </span>
            </div>
          </div>

          {/* Card 3: Data Kematian */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Data Kematian</h3>
            </div>
            <div className="flex-1">
              {stats.kematian?.total_mati ? (
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-danger">
                    {stats.kematian.total_mati}
                  </div>
                  <div className="text-xs text-gray-700 space-y-1">
                    <p>Jantan: <span className="font-semibold">{stats.kematian.mati_jantan}</span></p>
                    <p>Betina: <span className="font-semibold">{stats.kematian.mati_betina}</span></p>
                    <p className="text-danger font-semibold">Bulan ini: {stats.kematian.this_month}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500 py-6">Belum ada data</p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className="text-gray-400 text-xs font-semibold cursor-not-allowed">
                Lihat Semua (read-only) ?
              </span>
            </div>
          </div>

          {/* Card 4: Data Penjualan */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Data Penjualan</h3>
            </div>
            <div className="flex-1">
              {stats.penjualan?.total_terjual ? (
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-primary-600">
                    {stats.penjualan.total_terjual}
                  </div>
                  <div className="text-xs text-gray-700">
                    <p>Bulan ini: <span className="font-semibold text-primary-600">{stats.penjualan.this_month}</span></p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500 py-6">Belum ada data</p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className="text-gray-400 text-xs font-semibold cursor-not-allowed">
                Lihat Semua (read-only) ?
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: MANAGEMENT CARDS (READ-ONLY) */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Manajemen & Konten</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card: Kelompok */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Kelompok</h3>
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-primary-600 mb-1">
                {stats.totals?.kelompok ?? 0}
              </div>
              <p className="text-xs text-gray-700">Total kelompok terdaftar</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className="text-gray-400 text-xs font-semibold cursor-not-allowed">
                Kelola Kelompok (read-only) ?
              </span>
            </div>
          </div>

          {/* Card: User */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Pengguna</h3>
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-primary-600 mb-1">
                {stats.totals?.users ?? 0}
              </div>
              <p className="text-xs text-gray-700">Total user aktif</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className="text-gray-400 text-xs font-semibold cursor-not-allowed">
                Lihat Semua (read-only) ?
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* INFO BOX - VIEWER READ-ONLY MODE */}
      <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-6">
        <div className="flex gap-4">
          <div className="text-2xl">??</div>
          <div>
            <h3 className="font-bold text-primary-900 mb-2">Akses Read-Only</h3>
            <p className="text-sm text-primary-800 mb-3">
              Anda memiliki akses untuk melihat semua data aplikasi Rukun Ternak. 
              Namun, Anda tidak memiliki izin untuk membuat, mengedit, atau menghapus data.
            </p>
            <ul className="text-xs text-primary-800 space-y-1 ml-4">
              <li>? Melihat laporan dan statistik</li>
              <li>? Melihat data kelompok dan hewan</li>
              <li>? Melihat data pengguna</li>
              <li>? Tidak dapat membuat laporan baru</li>
              <li>? Tidak dapat mengedit data</li>
              <li>? Tidak dapat menghapus data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );}