import React from 'react';
import AppLogo from '../components/branding/AppLogo';
import SupportedByLogo from '../components/branding/SupportedByLogo';
import {AlertCircle } from 'lucide-react';
import client from '../api/client';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import KelompokDashboardCard from '../components/KelompokDashboardCard';
import PenyaluranBantuanCard from '../components/PenyaluranBantuanCard';

export default function ClientDashboard() {
  const { user, appRole } = useAuth();
  const [kelompok, setKelompok] = useState(null);
  const [dashboardKelompok, setDashboardKelompok] = useState(null);
  const [kelahiranStats, setKelahiranStats] = useState(null);
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
          // Load dashboard kelompok (7 cards)
          try {
            const dashKelRes = await client.get('/api/stats/dashboard/kelompok');
            if (mounted && dashKelRes.data?.data) {
              setDashboardKelompok(dashKelRes.data.data);
            }
          } catch (err) {
            console.warn('Dashboard kelompok fetch failed:', err);
          }

          // Load kelahiran stats from hewan_ternak
          try {
            const kelahiranRes = await client.get('/api/stats/kelahiran');
            if (mounted && kelahiranRes.data?.data) {
              setKelahiranStats(kelahiranRes.data.data);
            }
          } catch (err) {
            console.warn('Kelahiran stats fetch failed:', err);
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

  const dashboardTitle = appRole === 'kelompok' 
    ? `Dashboard Kelompok` 
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
    <div className="space-y-6 sm:space-y-8 pt-8 sm:pt-12">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-50 rounded-lg sm:rounded-2xl p-6 sm:p-8 text-gray-900 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{dashboardTitle}</h1>
            <p className="text-emerald-1000 text-sm sm:text-base lg:text-lg">{dashboardDesc}</p>
            {user?.full_name && (
              <p className="text-emerald-1000 text-sm sm:text-base lg:text-lg">Halo, {user.full_name}</p>
            )}
          </div>
          <div className="flex flex-col items-center gap-3">
            <AppLogo size="2xl" variant="icon" />
            <SupportedByLogo mainLogoSize={100} />
          </div>
        </div>
      </div>

      {/* SECTION A: Profil Kelompok (untuk kelompok role) */}
      {appRole === 'kelompok' && (
        <KelompokDashboardCard kelompok={kelompok} loading={loading} />
      )}

      {/* SECTION B: Penyaluran dan Bantuan (untuk kelompok role) */}
      {appRole === 'kelompok' && (
        <PenyaluranBantuanCard penyaluran={dashboardKelompok?.penyaluran} bantuan={dashboardKelompok?.bantuan} loading={loading} />
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

      {/* SECTION D: Dashboard Kelompok (8 Cards) */}
      {appRole === 'kelompok' && (
        <>
          <div className="pt-6 sm:pt-8 border-t-2 border-gray-200">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Progress Kelompok</h2>
          </div>

          {dashboardKelompok ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card 1: Pakan */}
            <div className="bg-white rounded-xl shadow-md border border-orange-200 overflow-hidden hover:shadow-lg transition">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 flex items-center gap-3">
                <h3 className="font-bold text-lg">Pakan</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-600 font-semibold mb-1">
                    Tanggal Input Terakhir
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {dashboardKelompok.pakan?.tanggalInput ? formatTanggal(dashboardKelompok.pakan.tanggalInput) : '-'}
                  </p>
                </div>
                <hr className="border-orange-100" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-600 font-semibold mb-1">Jenis Pakan</p>
                  <p className="text-sm font-semibold text-gray-800">{dashboardKelompok.pakan?.jenisPakan || '-'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-600 font-semibold mb-1">Sumber</p>
                  <p className="text-sm font-semibold text-gray-800">{dashboardKelompok.pakan?.sumberPakan || '-'}</p>
                </div>
              </div>
            </div>

            {/* Card 2: Kandang */}
            <div className="bg-white rounded-xl shadow-md border border-amber-200 overflow-hidden hover:shadow-lg transition">
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-4 flex items-center gap-3">
                <h3 className="font-bold text-lg">Kandang</h3>
              </div>
              <div className="p-6 space-y-3">
                <div className="bg-amber-50 p-3 rounded-lg">
                  <p className="text-xs uppercase tracking-wide text-amber-700 font-semibold mb-1">Kandang Kelompok (Penyaluran)</p>
                  <p className="text-2xl font-bold text-amber-900">{dashboardKelompok.penyaluran?.jumlahKandang || 0}</p>
                </div>
                <div className="bg-amber-50 p-3 rounded-lg">
                  <p className="text-xs uppercase tracking-wide text-amber-700 font-semibold mb-1">Kandang Anggota (Pengembangan)</p>
                  <p className="text-2xl font-bold text-amber-900">{dashboardKelompok.kandang?.pengembanganTotal || 0}</p>
                </div>
              </div>
            </div>

            {/* Card 3: Kelahiran */}
            <div className="bg-white rounded-xl shadow-md border border-pink-200 overflow-hidden hover:shadow-lg transition">
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white p-4 flex items-center gap-3">
                <h3 className="font-bold text-lg">Kelahiran</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-pink-50 p-4 rounded-lg text-center">
                  <p className="text-xs uppercase tracking-wide text-pink-700 font-semibold mb-1">Total Kelahiran</p>
                  <p className="text-4xl font-bold text-pink-900">{kelahiranStats?.total_kelahiran ?? dashboardKelompok?.kelahiran?.totalEkor ?? 0}</p>
                  <p className="text-xs text-pink-600 mt-1">ekor</p>
                </div>
                <hr className="border-pink-100" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-pink-50 p-3 rounded-lg">
                    <p className="text-xs uppercase tracking-wide text-pink-700 font-semibold mb-1">Betina</p>
                    <p className="text-2xl font-bold text-pink-900">{kelahiranStats?.kelahiran_betina ?? dashboardKelompok?.kelahiran?.anakBetina ?? 0}</p>
                  </div>
                  <div className="bg-pink-50 p-3 rounded-lg">
                    <p className="text-xs uppercase tracking-wide text-pink-700 font-semibold mb-1">Jantan</p>
                    <p className="text-2xl font-bold text-pink-900">{kelahiranStats?.kelahiran_jantan ?? dashboardKelompok?.kelahiran?.anakJantan ?? 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: Populasi */}
            <div className="bg-white rounded-xl shadow-md border border-green-200 overflow-hidden hover:shadow-lg transition">
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 text-white p-4 flex items-center gap-3">
                <h3 className="font-bold text-lg">Populasi</h3>
              </div>
              <div className="p-6 space-y-3">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-xs uppercase tracking-wide text-green-700 font-semibold mb-1">Total Populasi</p>
                  <p className="text-3xl font-bold text-green-900">{dashboardKelompok.populasiHewan?.total || dashboardKelompok.populasi?.totalPopulasi || 0}</p>
                  <p className="text-xs text-green-600 mt-1">ekor</p>
                </div>
                <hr className="border-green-100" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs uppercase tracking-wide text-green-700 font-semibold mb-1">Jantan</p>
                    <p className="text-2xl font-bold text-green-900">{dashboardKelompok.populasiHewan?.jantan || 0}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs uppercase tracking-wide text-green-700 font-semibold mb-1">Betina</p>
                    <p className="text-2xl font-bold text-green-900">{dashboardKelompok.populasiHewan?.betina || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 5: Penjualan (30 hari) */}
            <div className="bg-white rounded-xl shadow-md border border-blue-200 overflow-hidden hover:shadow-lg transition">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 flex items-center gap-3">
                <h3 className="font-bold text-lg">Penjualan</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-xs uppercase tracking-wide text-blue-700 font-semibold mb-1">Total Terjual</p>
                  <p className="text-4xl font-bold text-blue-900">{dashboardKelompok.penjualan?.totalTerjual || 0}</p>
                  <p className="text-xs text-blue-600 mt-1">ekor</p>
                </div>
                <hr className="border-blue-100" />
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-blue-50 p-2 rounded">
                    <span className="text-xs font-semibold text-gray-700">Pejantan</span>
                    <span className="text-lg font-bold text-blue-900">{dashboardKelompok.penjualan?.pejantanTerjual || 0}</span>
                  </div>
                  <div className="flex justify-between items-center bg-blue-50 p-2 rounded">
                    <span className="text-xs font-semibold text-gray-700">Indukan</span>
                    <span className="text-lg font-bold text-blue-900">{dashboardKelompok.penjualan?.indukanTerjual || 0}</span>
                  </div>
                  <div className="flex justify-between items-center bg-blue-50 p-2 rounded">
                    <span className="text-xs font-semibold text-gray-700">Calon Indukan (8-11 bln)</span>
                    <span className="text-lg font-bold text-blue-900">{dashboardKelompok.penjualan?.calonIndukanTerjual || 0}</span>
                  </div>
                  <div className="flex justify-between items-center bg-blue-50 p-2 rounded">
                    <span className="text-xs font-semibold text-gray-700">Calon Pejantan (8-11 bln)</span>
                    <span className="text-lg font-bold text-blue-900">{dashboardKelompok.penjualan?.calonPejantanTerjual || 0}</span>
                  </div>
                  <div className="flex justify-between items-center bg-blue-50 p-2 rounded">
                    <span className="text-xs font-semibold text-gray-700">Jantan Potong</span>
                    <span className="text-lg font-bold text-blue-900">{dashboardKelompok.penjualan?.jantanPotongTerjual || 0}</span>
                  </div>
                  <div className="flex justify-between items-center bg-blue-50 p-2 rounded">
                    <span className="text-xs font-semibold text-gray-700">Betina Potong</span>
                    <span className="text-lg font-bold text-blue-900">{dashboardKelompok.penjualan?.betinaPotongTerjual || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 6: Pengolahan */}
            <div className="bg-white rounded-xl shadow-md border border-lime-200 overflow-hidden hover:shadow-lg transition">
              <div className="bg-gradient-to-br from-lime-500 to-lime-600 text-white p-4 flex items-center gap-3">
                <h3 className="font-bold text-lg">Pengolahan</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-600 font-semibold mb-2">Pupuk Organik Cair</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-lime-900">
                      {(dashboardKelompok.pengolahan?.pupukCair || 0).toFixed(1)}
                    </p>
                    <p className="text-sm font-semibold text-gray-600">liter</p>
                  </div>
                </div>
                <hr className="border-lime-100" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-600 font-semibold mb-2">Pupuk Organik Padat</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-lime-900">
                      {(dashboardKelompok.pengolahan?.pupukPadat || 0).toFixed(1)}
                    </p>
                    <p className="text-sm font-semibold text-gray-600">kg</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="col-span-1 md:col-span-2 bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">ℹ️ Informasi Dashboard</p>
                <ul className="text-xs space-y-1 text-blue-800">
                  <li>• Data pakan menampilkan laporan terakhir</li>
                  <li>• Data kelahiran dan penjualan adalah periode 30 hari terakhir</li>
                  <li>• Data populasi menampilkan laporan populasi terbaru</li>
                  <li>• Data penyaluran & bantuan awal ditampilkan dalam card terpisah</li>
                  <li>• Semua data diperbarui otomatis sesuai laporan yang masuk</li>
                </ul>
              </div>
            </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center">
              <p className="text-yellow-800 font-medium">Memuat data progress kelompok...</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
