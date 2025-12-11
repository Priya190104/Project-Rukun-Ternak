import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getReports } from '../services/reportService';
import { useAuth } from '../hooks/useAuth';
import { Filter, FileText } from 'lucide-react';

const jenisLaporan = ['Budidaya', 'Kelahiran', 'Kematian', 'Kurban-Aqiqah'];
const kelompokList = ['Semua Kelompok', 'KLP1', 'KLP2', 'KLP3'];

export default function DaftarSemuaLaporan() {
  const { user, appRole } = useAuth();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [filterKelompok, setFilterKelompok] = useState('Semua Kelompok');
  const [filterJenis, setFilterJenis] = useState('Semua Jenis');

  useEffect(() => {
    let mounted = true;
    async function load() {
      const data = await getReports({ userId: user?.id, role: appRole });
      if (mounted) {
        setReports(data);
        setFilteredReports(data);
      }
    }
    load();
    return () => { mounted = false; };
  }, [user, appRole]);

  useEffect(() => {
    let filtered = reports;

    if (filterKelompok !== 'Semua Kelompok') {
      filtered = filtered.filter(r => r.kelompok === filterKelompok);
    }

    if (filterJenis !== 'Semua Jenis') {
      filtered = filtered.filter(r => r.jenis === filterJenis);
    }

    setFilteredReports(filtered);
  }, [filterKelompok, filterJenis, reports]);

  const getJenisIcon = (jenis) => {
    const icons = {
      'Budidaya': '🐑',
      'Kelahiran': '👶',
      'Kematian': '⚰️',
      'Kurban-Aqiqah': '🙏',
    };
    return icons[jenis] || '📄';
  };

  const getJenisColor = (jenis) => {
    const colors = {
      'Budidaya': 'bg-blue-50 border-blue-200 text-blue-700',
      'Kelahiran': 'bg-green-50 border-green-200 text-green-700',
      'Kematian': 'bg-red-50 border-red-200 text-red-700',
      'Kurban-Aqiqah': 'bg-yellow-50 border-yellow-200 text-yellow-700',
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter Kelompok</label>
            <select
              value={filterKelompok}
              onChange={(e) => setFilterKelompok(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {kelompokList.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter Jenis Laporan</label>
            <select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Semua Jenis">Semua Jenis</option>
              {jenisLaporan.map(j => (
                <option key={j} value={j}>{j}</option>
              ))}
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
                      <div className="text-gray-500">Pemilik</div>
                      <div className="font-medium text-gray-900">{report.createdBy || '-'}</div>
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
