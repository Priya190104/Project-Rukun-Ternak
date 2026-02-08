import React, { useEffect, useState } from 'react';
import { 
  BarChart3, TrendingUp, Users, AlertCircle, 
  Filter, Building2
} from 'lucide-react';
import client from '../api/client';
import AdminPageHeader from '../components/admin/AdminPageHeader';
import { useCachedData } from '../hooks/useCachedData';

const JENIS_COLORS = {
  pakan: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
  kandang: { bg: 'bg-warning-50', text: 'text-warning', border: 'border-warning-100' },
  kesehatan: { bg: 'bg-danger-50', text: 'text-danger', border: 'border-danger-100' },
  populasi: { bg: 'bg-success-50', text: 'text-success', border: 'border-success-100' },
  kelahiran: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200' },
  penjualan: { bg: 'bg-primary-50', text: 'text-primary-600', border: 'border-primary-200' },
  pengembangan: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
};

const JENIS_LABELS = {
  pakan: 'Pakan',
  kandang: 'Kandang',
  kesehatan: 'Kesehatan',
  populasi: 'Populasi',
  kelahiran: 'Kelahiran',
  penjualan: 'Penjualan',
  pengembangan: 'Pengembangan',
};

export default function AdminAnalisis() {
  // Fetch stats dengan caching (15 menit TTL)
  const { data: cachedStats, loading: statsLoading } = useCachedData(
    '/api/stats',
    ['/api/stats'],
    { ttl: 15 * 60 * 1000 }
  );
  
  // Fetch all laporan dengan caching (5 menit TTL)
  const { data: cachedLaporan, loading: laporanLoading } = useCachedData(
    '/api/laporan',
    ['/api/laporan'],
    { ttl: 5 * 60 * 1000 }
  );
  
  // State
  const [stats, setStats] = useState({
    totals: { laporan: 0, users: 0, kelompok: 0 },
    latest: [],
    perMonth: [],
    perKelompok: [],
  });
  const [allLaporan, setAllLaporan] = useState([]);
  const [filterKecamatan, setFilterKecamatan] = useState('');
  const [filterDesa, setFilterDesa] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [filterKelompok, setFilterKelompok] = useState('');
  const [kecamatanList, setKecamatanList] = useState([]);
  const [desaList, setDesaList] = useState([]);
  const [kelompokList, setKelompokList] = useState([]);

  // Sync cached data to state
  useEffect(() => {
    if (cachedStats) {
      setStats(cachedStats?.data || cachedStats || {});
    }
  }, [cachedStats]);

  // Load laporan and extract filters
  useEffect(() => {
    if (cachedLaporan) {
      const laporan = Array.isArray(cachedLaporan) ? cachedLaporan : (cachedLaporan?.data || []);
      setAllLaporan(laporan);

      // Extract unique kecamatan, desa, kelompok
      const kecamatan = [...new Set(laporan
        .map(l => l.kecamatan)
        .filter(k => k)
      )].sort();
      setKecamatanList(kecamatan);

      const desa = [...new Set(laporan
        .map(l => l.desa)
        .filter(d => d)
      )].sort();
      setDesaList(desa);

      const kelompok = [...new Set(laporan
        .map(l => l.kelompok)
        .filter(k => k)
      )].sort();
      setKelompokList(kelompok);
    }
  }, [cachedLaporan]);

  const loading = statsLoading || laporanLoading;

  // Filter laporan based on selected filters
  const filteredLaporan = allLaporan.filter(lap => {
    if (filterJenis && lap.jenis?.toLowerCase() !== filterJenis.toLowerCase()) {
      return false;
    }
    if (filterKecamatan && lap.kecamatan !== filterKecamatan) {
      return false;
    }
    if (filterDesa && lap.desa !== filterDesa) {
      return false;
    }
    if (filterKelompok && lap.kelompok !== filterKelompok) {
      return false;
    }
    return true;
  });

  // Calculate statistics per jenis from filtered laporan
  const statsByJenis = {};
  filteredLaporan.forEach(lap => {
    const jenis = lap.jenis?.toLowerCase() || 'unknown';
    if (!statsByJenis[jenis]) {
      statsByJenis[jenis] = {
        count: 0,
        kelompok: new Set(),
        tanggalTerbaru: null,
      };
    }
    statsByJenis[jenis].count += 1;
    if (lap.kelompok) statsByJenis[jenis].kelompok.add(lap.kelompok);
    if (!statsByJenis[jenis].tanggalTerbaru || new Date(lap.tanggal) > new Date(statsByJenis[jenis].tanggalTerbaru)) {
      statsByJenis[jenis].tanggalTerbaru = lap.tanggal;
    }
  });

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  // Clear filters
  const clearFilters = () => {
    setFilterJenis('');
    setFilterKecamatan('');
    setFilterDesa('');
    setFilterKelompok('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-700">Memuat data analisis...</div>
      </div>
    );
  }

  const totalKelompok = stats.totals?.kelompok || 0;
  const totalLaporan = filteredLaporan.length || 0;
  const totalUsers = stats.totals?.users || 0;
  const uniqueKelompok = new Set(filteredLaporan.map(l => l.kelompok_id)).size;

  return (
    <div className="space-y-8 pb-12">
      <AdminPageHeader
        title="Analisis Admin"
        subtitle="Visualisasi data laporan global dari semua kelompok"
        backTo="/dashboard"
        showBackButton={true}
      />

      {/* Global Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Laporan */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-medium text-gray-700">Total Laporan</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{totalLaporan}</div>
              <p className="text-xs text-gray-500 mt-2">
                {uniqueKelompok === 0 ? 'Tidak ada' : uniqueKelompok === 1 ? '1 kelompok' : `${uniqueKelompok} kelompok`}
              </p>
            </div>
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <BarChart3 size={24} />
            </div>
          </div>
        </div>

        {/* Total Kelompok */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-medium text-gray-700">Total Kelompok</div>
              <div className="text-3xl font-bold text-info mt-2">{totalKelompok}</div>
              <p className="text-xs text-gray-500 mt-2">Kelompok ternak aktif</p>
            </div>
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-info-50 text-info">
              <Building2 size={24} />
            </div>
          </div>
        </div>

        {/* Total Pengguna */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-medium text-gray-700">Total Pengguna</div>
              <div className="text-3xl font-bold text-success mt-2">{totalUsers}</div>
              <p className="text-xs text-gray-500 mt-2">Admin & anggota</p>
            </div>
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-success-50 text-success">
              <Users size={24} />
            </div>
          </div>
        </div>

        {/* Jenis Laporan */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-medium text-gray-700">Jenis Laporan</div>
              <div className="text-3xl font-bold text-warning mt-2">{Object.keys(statsByJenis).length}</div>
              <p className="text-xs text-gray-500 mt-2">Dari 7 jenis</p>
            </div>
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-warning-50 text-warning">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filter Data</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filter by Jenis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Laporan</label>
            <select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Semua Jenis</option>
              <option value="pakan">Pakan</option>
              <option value="kandang">Kandang</option>
              <option value="kesehatan">Kesehatan</option>
              <option value="populasi">Populasi</option>
              <option value="kelahiran">Kelahiran</option>
              <option value="penjualan">Penjualan</option>
              <option value="pengembangan">Pengembangan</option>
            </select>
          </div>

          {/* Filter by Kelompok */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kelompok</label>
            <select
              value={filterKelompok}
              onChange={(e) => setFilterKelompok(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Semua Kelompok</option>
              {kelompokList.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          {/* Filter by Kecamatan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kecamatan</label>
            <select
              value={filterKecamatan}
              onChange={(e) => setFilterKecamatan(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Semua Kecamatan</option>
              {kecamatanList.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          {/* Filter by Desa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Desa</label>
            <select
              value={filterDesa}
              onChange={(e) => setFilterDesa(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Semua Desa</option>
              {desaList.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {(filterJenis || filterKecamatan || filterDesa || filterKelompok) && (
          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
          >
            Hapus Filter
          </button>
        )}
      </div>

      {/* Statistics per Jenis */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistik Berdasarkan Jenis Laporan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(JENIS_LABELS).map(([jenisKey, jenisLabel]) => {
            const jenisStat = statsByJenis[jenisKey];
            const colors = JENIS_COLORS[jenisKey];
            return (
              <div
                key={jenisKey}
                className={`${colors.bg} border ${colors.border} rounded-lg p-4 cursor-pointer hover:shadow-md transition`}
                onClick={() => setFilterJenis(filterJenis === jenisKey ? '' : jenisKey)}
              >
                <div className={`text-sm font-medium ${colors.text}`}>
                  {jenisLabel}
                </div>
                <div className={`text-2xl font-bold ${colors.text} mt-2`}>
                  {jenisStat ? jenisStat.count : 0}
                </div>
                <div className="text-xs text-gray-700 mt-1">
                  {jenisStat && jenisStat.tanggalTerbaru ? (
                    <>
                      <div>Laporan terbaru:</div>
                      <div>{formatDate(jenisStat.tanggalTerbaru)}</div>
                    </>
                  ) : (
                    <div>Belum ada laporan</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Latest Reports Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Laporan Terbaru</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Jenis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Kelompok
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Pengguna
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLaporan
                .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
                .slice(0, 10)
                .map((lap) => {
                  const colors = JENIS_COLORS[lap.jenis?.toLowerCase()] || JENIS_COLORS.pakan;
                  return (
                    <tr key={lap.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDate(lap.tanggal)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${colors.text} ${colors.bg}`}>
                          {JENIS_LABELS[lap.jenis?.toLowerCase()] || lap.jenis || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {lap.kelompok || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {lap.full_name || lap.username || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <a href={`/laporan/${lap.id}`} className="text-primary-600 hover:text-primary-800 font-medium">
                          Lihat Detail
                        </a>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {filteredLaporan.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            <AlertCircle size={24} className="mx-auto mb-2 text-gray-400" />
            <p className="font-medium">Tidak ada laporan yang sesuai dengan filter</p>
          </div>
        )}
      </div>

      {/* Distribution by Kelompok */}
      {stats.perKelompok && stats.perKelompok.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900">Distribusi Laporan per Kelompok</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Kelompok
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Total Laporan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Progres
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.perKelompok.map((k) => {
                  const percentage = stats.totals?.laporan > 0 
                    ? Math.round((k.laporan_count / stats.totals.laporan) * 100)
                    : 0;
                  return (
                    <tr key={k.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {k.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {k.laporan_count} laporan
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-gray-700 font-medium">{percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Timeline by Month */}
      {stats.perMonth && stats.perMonth.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Tren Laporan per Bulan</h2>
          <div className="space-y-3">
            {stats.perMonth.slice(0, 12).map((month) => {
              const maxCount = Math.max(...stats.perMonth.map(m => m.count), 1);
              const percentage = (month.count / maxCount) * 100;
              return (
                <div key={month.month} className="flex items-center gap-3">
                  <div className="w-20 text-sm font-medium text-gray-700">
                    {month.month}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-8">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-primary-600 h-8 rounded-full flex items-center justify-end pr-3 transition-all"
                      style={{ width: `${percentage}%` }}
                    >
                      {percentage > 10 && (
                        <span className="text-xs font-bold text-white">
                          {month.count}
                        </span>
                      )}
                    </div>
                  </div>
                  {percentage <= 10 && (
                    <span className="w-10 text-sm font-medium text-gray-700">
                      {month.count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

