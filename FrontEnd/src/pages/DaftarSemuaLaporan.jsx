import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { Filter, FileText } from 'lucide-react';

const jenisLaporan = ['Budidaya', 'Kelahiran', 'Kematian', 'Penjualan'];

export default function DaftarSemuaLaporan() {
  const { user, appRole } = useAuth();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [filterKelompok, setFilterKelompok] = useState('Semua Kelompok');
  const [filterJenis, setFilterJenis] = useState('Semua Jenis');
  const [filterBulan, setFilterBulan] = useState('Semua Bulan');
  const [filterSubJenis, setFilterSubJenis] = useState('Semua');
  const [kelompokOptions, setKelompokOptions] = useState(['Semua Kelompok']);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await client.get('/api/laporan');
        const data = res.data?.data || [];
        if (mounted) {
          setReports(data);
          setFilteredReports(data);
        }
      } catch (err) {
        console.warn('Failed to load laporan', err);
      }
    }
    load();
    return () => { mounted = false; };
  }, [user, appRole]);

  useEffect(() => {
    (async () => {
      try {
        const res = await client.get('/api/kelompok');
        const list = res.data?.data?.map(k => k.name) || [];
        setKelompokOptions(['Semua Kelompok', ...list]);
      } catch (err) {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    let filtered = reports;

    if (filterKelompok !== 'Semua Kelompok') {
      filtered = filtered.filter(r => r.kelompok === filterKelompok);
    }

    if (filterJenis !== 'Semua Jenis') {
      filtered = filtered.filter(r => r.jenis === filterJenis);
    }

    if (filterBulan !== 'Semua Bulan') {
      const now = new Date();
      filtered = filtered.filter(r => {
        if (!r.tanggal) return false;
        const reportDate = new Date(r.tanggal);
        
        if (filterBulan === 'Bulan Ini') {
          return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear();
        } else if (filterBulan === 'Bulan Kemarin') {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
          return reportDate.getMonth() === lastMonth.getMonth() && reportDate.getFullYear() === lastMonth.getFullYear();
        } else {
          // Filter untuk bulan tertentu (Januari - Desember)
          const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
          const monthIndex = monthNames.indexOf(filterBulan);
          return monthIndex >= 0 && reportDate.getMonth() === monthIndex && reportDate.getFullYear() === now.getFullYear();
        }
      });
    }

    if (filterSubJenis !== 'Semua' && filterJenis === 'Penjualan') {
      filtered = filtered.filter(r => r.data?.jenis_penjualan === filterSubJenis);
    }

    setFilteredReports(filtered);
  }, [filterKelompok, filterJenis, filterBulan, filterSubJenis, reports]);

  const getJenisIcon = (jenis) => {
    const icons = {
      'Budidaya': '🐑',
      'Kelahiran': '👶',
      'Kematian': '⚰️',
      'Penjualan': '💰',
    };
    return icons[jenis] || '📄';
  };

  const getJenisColor = (jenis) => {
    const colors = {
      'Budidaya': 'bg-blue-50 border-blue-200 text-blue-700',
      'Kelahiran': 'bg-green-50 border-green-200 text-green-700',
      'Kematian': 'bg-red-50 border-red-200 text-red-700',
      'Penjualan': 'bg-yellow-50 border-yellow-200 text-yellow-700',
    };
    return colors[jenis] || 'bg-gray-50 border-gray-200 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Daftar Semua Laporan</h1>
        <p className="text-gray-600 mt-2">Kelola semua jenis laporan ternak</p>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-emerald-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filter Laporan</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter Kelompok</label>
            <select
              value={filterKelompok}
              onChange={(e) => setFilterKelompok(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {kelompokOptions.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter Jenis Laporan</label>
            <select
              value={filterJenis}
              onChange={(e) => {
                setFilterJenis(e.target.value);
                if (e.target.value !== 'Penjualan') {
                  setFilterSubJenis('Semua');
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Semua Jenis">Semua Jenis</option>
              {jenisLaporan.map(j => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
          </div>
          
          {filterJenis === 'Penjualan' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sub Jenis Penjualan</label>
              <select
                value={filterSubJenis}
                onChange={(e) => setFilterSubJenis(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Semua">Semua</option>
                <option value="Aqiqah">Aqiqah</option>
                <option value="Kurban">Kurban</option>
                <option value="Retail">Retail</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter Bulan</label>
            <select
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Semua Bulan">Semua Bulan</option>
              <option value="Bulan Ini">Bulan Ini</option>
              <option value="Bulan Kemarin">Bulan Kemarin</option>
              <option value="Januari">Januari</option>
              <option value="Februari">Februari</option>
              <option value="Maret">Maret</option>
              <option value="April">April</option>
              <option value="Mei">Mei</option>
              <option value="Juni">Juni</option>
              <option value="Juli">Juli</option>
              <option value="Agustus">Agustus</option>
              <option value="September">September</option>
              <option value="Oktober">Oktober</option>
              <option value="November">November</option>
              <option value="Desember">Desember</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">Belum ada laporan</p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div key={report.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getJenisIcon(report.jenis)}</span>
                    <h3 className="text-lg font-semibold text-gray-900">{report.jenis}</h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getJenisColor(report.jenis)}`}>
                      {report.jenis}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                    <div>
                      <div className="text-gray-500">Tanggal</div>
                      <div className="font-medium text-gray-900">{report.tanggal || '-'}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Kelompok</div>
                      <div className="font-medium text-gray-900">{report.kelompok || '-'}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Pemilik (user_id)</div>
                      <div className="font-medium text-gray-900">{report.user_id || '-'}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Status</div>
                      <div className="font-medium text-emerald-600">Selesai</div>
                    </div>
                  </div>
                </div>
                <Link
                  to={`/laporan/${report.id}`}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium whitespace-nowrap"
                >
                  Lihat Detail
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
