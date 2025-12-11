import React from 'react';
import { Link } from 'react-router-dom';
import StatsCard from '../components/StatsCard';
import { FilePlus, FileText, TrendingUp, Clock } from 'lucide-react';
import createPageUrl from '../utils/createPageUrl';

const mock = {
  myReports: 12,
  lastReport: '2025-12-07',
  openTasks: 2,
};

const myRecent = [
  { id: 'r1', title: 'Laporan Harian - 2025-12-07', date: '2025-12-07', type: 'Budidaya' },
  { id: 'r2', title: 'Laporan Mingguan - 2025-11-30', date: '2025-11-30', type: 'Kelahiran' },
];

export default function ClientDashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold mb-2">Dashboard Kelompok 🐑</h1>
        <p className="text-emerald-100 text-lg">Kelola laporan ternak Anda dengan mudah dan cepat</p>
      </div>

      {/* Stats Cards */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Ringkasan Laporan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatsCard 
            title="Laporan Saya" 
            value={mock.myReports}
            icon={<FileText className="w-6 h-6" />}
            color="bg-blue-100 text-blue-600"
          />
          <StatsCard 
            title="Terakhir Dikirim" 
            value={mock.lastReport.split('-').reverse().join('/')}
            icon={<TrendingUp className="w-6 h-6" />}
            color="bg-green-100 text-green-600"
          />
          <StatsCard 
            title="Tugas Terbuka" 
            value={mock.openTasks}
            icon={<Clock className="w-6 h-6" />}
            color="bg-yellow-100 text-yellow-600"
          />
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-gray-900">Laporan Terbaru</h2>
          </div>
          <Link to="/pilih-jenis" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold text-sm flex items-center gap-2 shadow-sm">
            <FilePlus size={18} />
            Buat Laporan
          </Link>
        </div>

        <div className="p-6">
          {myRecent.length > 0 ? (
            <div className="space-y-3">
              {myRecent.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-50 rounded-lg border border-gray-200 hover:border-emerald-300 hover:shadow-sm transition group">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 group-hover:text-emerald-700 transition">{r.title}</div>
                    <div className="text-sm text-gray-600 mt-2 flex items-center gap-3">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-semibold">{r.type}</span>
                      <span className="text-gray-500">{r.date}</span>
                    </div>
                  </div>
                  <Link to={createPageUrl('laporan', r.id)} className="ml-4 px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition font-medium text-sm whitespace-nowrap">
                    👁️ Lihat
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="font-semibold text-lg">Belum ada laporan</p>
              <p className="text-sm mt-2 mb-4">Buat laporan pertama Anda sekarang</p>
              <Link to="/pilih-jenis" className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold inline-flex items-center gap-2">
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
