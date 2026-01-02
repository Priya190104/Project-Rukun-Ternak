import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { Filter, Eye, Edit2, Trash2, Download } from 'lucide-react';
import { exportToCSV, exportToPDF } from '../utils/exportUtils';

const jenisLaporan = ['Budidaya', 'Kelahiran', 'Kematian', 'Penjualan'];

export default function DaftarSemuaLaporan() {
  const { user, appRole } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [filterKelompok, setFilterKelompok] = useState('Semua Kelompok');
  const [filterJenis, setFilterJenis] = useState('Semua Jenis');
  const [filterBulan, setFilterBulan] = useState('Semua Bulan');
  const [filterSubJenis, setFilterSubJenis] = useState('Semua');
  const [kelompokOptions, setKelompokOptions] = useState(['Semua Kelompok']);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await client.get('/api/laporan');
        const data = (res.data?.data || []).map(item => ({
          ...item,
          // Normalize kelompok field (backend returns kelompok or kelompok_name)
          kelompok: item.kelompok || item.kelompok_name || '-'
        }));
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

  const handleEditLaporan = (id) => {
    // Navigate to detail page where edit can be done
    navigate(`/laporan/${id}`);
  };

  const handleDeleteLaporan = async (id) => {
    const confirmDelete = window.confirm('Yakin ingin menghapus laporan ini?');
    if (!confirmDelete) return;

    try {
      await client.delete(`/api/laporan/${id}`);
      // Remove from state
      setReports(reports.filter(r => r.id !== id));
    } catch (err) {
      console.error('Failed to delete laporan:', err);
      alert('Gagal menghapus laporan');
    }
  };

  const handleExportCSV = () => {
    exportToCSV(filteredReports, `laporan_${new Date().toISOString().split('T')[0]}.csv`);
    setShowExportMenu(false);
  };

  const handleExportPDF = () => {
    exportToPDF(filteredReports, `laporan_${new Date().toISOString().split('T')[0]}.pdf`);
    setShowExportMenu(false);
  };

  return (
    <div className="space-y-6 pt-6 sm:pt-6">
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

      {/* Export Button */}
      <div className="flex gap-3">
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Download size={20} />
            Export
          </button>
          
          {showExportMenu && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                onClick={handleExportCSV}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-900 border-b border-gray-200 flex items-center gap-2"
              >
                Export ke Excel
              </button>
              <button
                onClick={handleExportPDF}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-900 flex items-center gap-2"
              >
                Export ke PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredReports.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 font-medium">Belum ada laporan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">No</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Jenis Laporan</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Kelompok</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Keterangan</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredReports.map((report, index) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {report.tanggal ? new Date(report.tanggal).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{report.jenis}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{report.kelompok || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {report.data && typeof report.data === 'object' 
                        ? Object.entries(report.data)
                            .slice(0, 2)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(', ') || '-'
                        : '-'
                      }
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <div className="flex gap-2 items-center justify-center">
                        <Link
                          to={`/laporan/${report.id}`}
                          title="Lihat detail"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                        >
                          <Eye size={16} />
                        </Link>
                        {appRole !== 'viewer' && (
                          <>
                            <button 
                              title="Edit laporan"
                              onClick={() => handleEditLaporan(report.id)}
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded transition"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              title="Hapus laporan"
                              onClick={() => handleDeleteLaporan(report.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
