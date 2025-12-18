import React from 'react';
import { Link } from 'react-router-dom';
import { FilePlus, FileText } from 'lucide-react';
import createPageUrl from '../utils/createPageUrl';
import client from '../api/client';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import KelompokDashboardCard from '../components/KelompokDashboardCard';
import LaporanProgressCard from '../components/LaporanProgressCard';

export default function ClientDashboard() {
  const { user, appRole } = useAuth();
  const [kelompok, setKelompok] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [stats, setStats] = useState({ totals: { laporan: 0 }, latest: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Load stats
        const statsRes = await client.get('/api/stats');
        if (mounted) {
          setStats(statsRes.data?.data || { totals: { laporan: 0 }, latest: [] });
        }

        // Load dashboard summary jika user adalah kelompok role
        if (appRole === 'kelompok' && user?.kelompok_id) {
          try {
            const dashRes = await client.get('/api/stats/dashboard');
            if (mounted && dashRes.data?.data) {
              setDashboardData(dashRes.data.data);
            }
          } catch (err) {
            console.warn('Dashboard data fetch failed:', err);
          }

          // Load kelompok data
          const kelompokRes = await client.get(`/api/kelompok/${user.kelompok_id}`);
          if (mounted && kelompokRes.data?.data) {
            setKelompok(kelompokRes.data.data);
          }
        }
      } catch (err) {
        console.error('Dashboard error:', err);
        setError(err.response?.data?.message || err.message || 'Gagal memuat data');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [appRole, user?.kelompok_id]);

  const myRecent = stats.latest || [];
  
  const dashboardTitle = appRole === 'kelompok' 
    ? `Dashboard Kelompok 🐑` 
    : 'Dashboard 📋';
  
  const dashboardDesc = appRole === 'kelompok'
    ? 'Kelola data kelompok dan laporan ternak dengan mudah'
    : 'Kelola laporan Anda dengan mudah dan cepat';

  const formatTanggal = (tanggal) => {
    return new Date(tanggal).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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

      {/* SECTION A: Profil Kelompok (untuk kelompok role) */}
      {appRole === 'kelompok' && (
        <KelompokDashboardCard kelompok={kelompok} loading={loading} />
      )}

      {/* SECTION B: Ringkasan Data Laporan */}
      {appRole === 'kelompok' && dashboardData && (
        <div className="bg-white rounded-lg sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Ringkasan Data Laporan</h2>
            <p className="text-sm text-gray-600 mt-1">Rangkuman laporan terakhir dari setiap jenis</p>
          </div>
          <div className="p-6 space-y-4">
            {Object.entries(dashboardData).map(([jenis, laporan]) => {
              if (!laporan) return null;
              const jenisLabel = jenis.charAt(0).toUpperCase() + jenis.slice(1);
              return (
                <div
                  key={jenis}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition bg-gradient-to-r from-gray-50 to-white"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900">{jenisLabel}</h3>
                    {laporan.tanggal && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                        {formatTanggal(laporan.tanggal)}
                      </span>
                    )}
                  </div>
                  {laporan.data && typeof laporan.data === 'object' && (
                    <div className="text-sm text-gray-700 space-y-1">
                      {Object.entries(laporan.data)
                        .slice(0, 3)
                        .map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600">{key}:</span>
                            <span className="font-semibold">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION C: Laporan Progress */}
      {appRole === 'kelompok' && (
        <LaporanProgressCard loading={loading} />
      )}

      {/* Quick Stats */}
      {appRole !== 'kelompok' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="text-gray-600 text-sm font-semibold mb-2">Total Laporan</div>
            <div className="text-3xl font-bold text-emerald-600">{stats.totals?.laporan ?? 0}</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="text-gray-600 text-sm font-semibold mb-2">Terakhir Dikirim</div>
            <div className="text-lg font-semibold text-gray-900">
              {(stats.latest && stats.latest[0] && (new Date(stats.latest[0].tanggal).toLocaleDateString())) || '-'}
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="text-gray-600 text-sm font-semibold mb-2">Status</div>
            <div className="text-lg font-semibold text-emerald-600">Aktif</div>
          </div>
        </div>
      )}

      {/* Laporan Terbaru */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm sm:shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Laporan Terbaru</h2>
          </div>
          <Link 
            to={appRole === 'kelompok' ? '/klg-tambah-laporan' : '/pilih-jenis'} 
            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold text-sm flex items-center justify-center sm:justify-start gap-2 shadow-sm"
          >
            <FilePlus size={18} />
            <span>Buat Laporan</span>
          </Link>
        </div>

        <div className="p-4 sm:p-6">
          {myRecent.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {myRecent.slice(0, 5).map((r) => (
                <div key={r.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-50 rounded-lg border border-gray-200 hover:border-emerald-300 hover:shadow-sm transition group gap-3 sm:gap-0">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 group-hover:text-emerald-700 transition text-sm sm:text-base">{r.jenis || 'Laporan'}</div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-semibold inline-block">
                        {r.jenis}
                      </span>
                      <span className="text-gray-500 ml-3">
                        {r.tanggal ? (new Date(r.tanggal).toLocaleDateString('id-ID')) : '-'}
                      </span>
                    </div>
                  </div>
                  <Link to={createPageUrl('laporan', r.id)} className="w-full sm:w-auto px-3 sm:px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition font-medium text-xs sm:text-sm whitespace-nowrap text-center sm:text-left">
                    👁️ Lihat Detail
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 text-gray-500">
              <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-300 mb-3 sm:mb-4" />
              <p className="font-semibold text-base sm:text-lg">Belum ada laporan</p>
              <p className="text-xs sm:text-sm mt-1 sm:mt-2 mb-3 sm:mb-4">Buat laporan pertama Anda sekarang</p>
              <Link 
                to={appRole === 'kelompok' ? '/klg-tambah-laporan' : '/pilih-jenis'} 
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold inline-flex items-center gap-2 text-sm"
              >
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
