import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminPageHeader from '../components/admin/AdminPageHeader';
import Pagination from '../components/common/Pagination';
import { Filter, Eye, Download, Loader } from 'lucide-react';
import { exportToCSV, exportToPDF } from '../utils/exportUtils';
import client from '../api/client';

const jenisLaporan = ['Budidaya', 'Kelahiran', 'Kematian', 'Penjualan'];

export default function ClientDaftarLaporan() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(20);
  
  // Filter states
  const [filterJenis, setFilterJenis] = useState('');

  // Fetch laporan with pagination and filters
  useEffect(() => {
    const fetchLaporan = async () => {
      try {
        setLoading(true);
        
        // Build query params
        const params = new URLSearchParams({
          page: currentPage,
          limit: itemsPerPage
        });
        
        if (filterJenis) params.append('jenis', filterJenis);
        
        const res = await client.get(`/api/laporan/list?${params.toString()}`);
        
        if (res.data?.success) {
          const data = res.data.data || [];
          setReports(data);
          
          if (res.data.pagination) {
            setTotalPages(res.data.pagination.totalPages || 1);
            setTotalItems(res.data.pagination.total || 0);
          }
        }
      } catch (err) {
        console.error('Error fetching laporan:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLaporan();
  }, [currentPage, itemsPerPage, filterJenis]);

  const handleExportCSV = () => {
    exportToCSV(reports, `laporan_${new Date().toISOString().split('T')[0]}.csv`);
    setShowExportMenu(false);
  };

  const handleExportPDF = () => {
    exportToPDF(reports, `laporan_${new Date().toISOString().split('T')[0]}.pdf`);
    setShowExportMenu(false);
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8 pb-12">
      <AdminPageHeader
        title="Laporan Saya"
        subtitle="Kelola laporan ternak kelompok Anda"
      />

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-emerald-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filter Laporan</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter Jenis Laporan</label>
            <select
              value={filterJenis}
              onChange={(e) => { setFilterJenis(e.target.value); setCurrentPage(1); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Semua Jenis</option>
              {jenisLaporan.map(j => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex gap-3">
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
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
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Loader className="w-12 h-12 text-primary-600 mx-auto mb-3 animate-spin" />
          <p className="text-gray-700">Memuat data laporan...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {reports.length === 0 ? (
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Keterangan</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reports.map((report, index) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {report.tanggal ? new Date(report.tanggal).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{report.jenis}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
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
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded transition"
                        >
                          <Eye size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              disabled={loading}
            />
          </div>
        )}
      </div>
      )}
    </div>
  );
}

