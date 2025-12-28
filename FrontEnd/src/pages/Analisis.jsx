import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, Activity } from 'lucide-react';
import client from '../api/client';

export default function Analisis() {
  const [filterKelompok, setFilterKelompok] = useState('Semua Kelompok');
  const [stats, setStats] = useState({ totals: { laporan: 0, users: 0, kelompok: 0 }, latest: [], perMonth: [] });
  const [kelahiran, setKelahiran] = useState(0);
  const [kematian, setKematian] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await client.get('/api/stats');
        if (!mounted) return;
        setStats(res.data?.data || { totals: { laporan: 0, users: 0, kelompok: 0 }, latest: [], perMonth: [] });
      } catch (err) {
        console.warn('Failed to load stats', err.message || err);
      }

      try {
        const res2 = await client.get('/api/laporan');
        if (!mounted) return;
        const all = res2.data?.data || [];
        setKelahiran(all.filter(r => (r.jenis || '').toLowerCase() === 'kelahiran').length);
        setKematian(all.filter(r => (r.jenis || '').toLowerCase() === 'kematian').length);
      } catch (err) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  const populasi = stats.totals?.laporan || 0;
  const pertumbuhan = stats.perMonth && stats.perMonth.length > 1 ? `${Math.round(((stats.perMonth[stats.perMonth.length-1].count - stats.perMonth[0].count) / Math.max(1, stats.perMonth[0].count)) * 100)}%` : '0%';

  return (
    <div className="space-y-6 pt-6 sm:pt-6">
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
              <div className="text-3xl font-bold text-gray-900 mt-2">{populasi}</div>
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
              <div className="text-3xl font-bold text-green-600 mt-2">{kelahiran}</div>
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
              <div className="text-3xl font-bold text-red-600 mt-2">{kematian}</div>
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
              <div className="text-3xl font-bold text-blue-600 mt-2">{pertumbuhan}</div>
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
