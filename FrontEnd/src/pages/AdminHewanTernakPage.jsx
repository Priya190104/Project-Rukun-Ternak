import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AdminPageHeader from '../components/admin/AdminPageHeader';
import Pagination from '../components/common/Pagination';
import { AlertCircle, Loader } from 'lucide-react';
import client from '../api/client';

export default function AdminHewanTernakPage() {
  const { appRole } = useAuth();
  
  const [hewan, setHewan] = useState([]);
  const [kelompokList, setKelompokList] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(20);
  
  // Filter states
  const [filterKelompok, setFilterKelompok] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSource, setFilterSource] = useState('');

  // Allow both admin and viewer (viewer in read-only mode)
  useEffect(() => {
    if (appRole !== 'admin' && appRole !== 'viewer') {
      setError('Akses ditolak. Halaman ini hanya untuk user admin.');
    }
  }, [appRole]);

  // Fetch kelompok list for filter options
  useEffect(() => {
    const fetchKelompok = async () => {
      try {
        const res = await client.get('/api/kelompok');
        if (res.data?.success) {
          const data = res.data?.data || [];
          setKelompokList(data);
        }
      } catch (err) {
        console.error('Error fetching kelompok:', err);
      }
    };
    
    fetchKelompok();
  }, []);

  // Fetch hewan with pagination and filters
  useEffect(() => {
    const fetchHewan = async () => {
      try {
        setLoading(true);
        
        // Build query params
        const params = new URLSearchParams({
          page: currentPage,
          limit: itemsPerPage
        });
        
        if (filterKelompok) params.append('kelompok_id', filterKelompok);
        if (filterStatus) params.append('status', filterStatus);
        if (filterSource) params.append('source', filterSource);
        
        const res = await client.get(`/api/admin/hewan?${params.toString()}`);
        
        if (res.data?.success) {
          setHewan(res.data.data || []);
          
          if (res.data.pagination) {
            setTotalPages(res.data.pagination.totalPages || 1);
            setTotalItems(res.data.pagination.total || 0);
          }
        }
      } catch (err) {
        console.error('Error fetching hewan:', err);
        setError('Gagal memuat data hewan ternak');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHewan();
  }, [currentPage, itemsPerPage, filterKelompok, filterStatus, filterSource]);

  const getStatusBadge = (status) => {
    const statusColors = {
      'AKTIF': 'bg-success-100 text-green-800',
      'MATI': 'bg-danger-100 text-red-800',
      'TERJUAL': 'bg-primary-100 text-primary-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getJenisKelaminDisplay = (jk) => {
    return jk === 'JANTAN' ? 'Jantan' : 'Betina';
  };

  const getSourceDisplay = (source) => {
    const sourceMap = {
      'Kelahiran': 'Kelahiran',
      'Penyaluran': 'Penyaluran',
      'Penambahan': 'Penambahan'
    };
    return sourceMap[source] || source || 'Tidak Diketahui';
  };

  const getSourceColor = (source) => {
    const colorMap = {
      'Kelahiran': 'bg-primary-100 text-primary-800',
      'Penyaluran': 'bg-info-100 text-purple-800',
      'Penambahan': 'bg-orange-100 text-orange-800'
    };
    return colorMap[source] || 'bg-gray-100 text-gray-800';
  };

  const handleResetFilter = () => {
    setFilterKelompok('');
    setFilterStatus('');
    setFilterSource('');
    setCurrentPage(1);
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary-600 mx-auto mb-3 animate-spin" />
          <p className="text-gray-700">Memuat data hewan ternak...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <AdminPageHeader
        title="Hewan Ternak"
        subtitle="Kelola semua data hewan ternak dari semua kelompok"
        backTo="/dashboard"
        showBackButton={true}
      />

      {/* Content */}
      <div className="space-y-6">
        {error && (
          <div className="bg-danger-50 border border-danger-100 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-900 font-semibold">Error</p>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Filter Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Filter Data Hewan</h2>
            <button
              onClick={handleResetFilter}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Reset Filter
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Filter Kelompok */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Kelompok
              </label>
              <select
                value={filterKelompok}
                onChange={(e) => { setFilterKelompok(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-gray-900 text-sm"
              >
                <option value="">Semua Kelompok</option>
                {kelompokList.map((k) => (
                  <option key={k.id} value={k.id}>{k.name}</option>
                ))}
              </select>
            </div>

            {/* Filter Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-gray-900 text-sm"
              >
                <option value="">Semua Status</option>
                <option value="AKTIF">AKTIF</option>
                <option value="TIDAK_AKTIF">TIDAK AKTIF</option>
                <option value="TERJUAL">TERJUAL</option>
              </select>
            </div>

            {/* Filter Source */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sumber
              </label>
              <select
                value={filterSource}
                onChange={(e) => { setFilterSource(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-900 text-sm"
              >
                <option value="">Semua Sumber</option>
                <option value="Kelahiran">Kelahiran</option>
                <option value="Penyaluran">Penyaluran</option>
                <option value="Penambahan">Penambahan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Hewan List */}
        {hewan.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-primary-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Sumber</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ras</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Kelompok</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Jenis Kelamin</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Umur</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Bobot (kg)</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {hewan.map((h) => (
                  <tr key={h.id} className="border-b border-gray-100 hover:bg-primary-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{h.id_hewan || `#${h.id}`}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSourceColor(h.source)}`}>
                        {getSourceDisplay(h.source)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{h.ras}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{h.nama_kelompok}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{getJenisKelaminDisplay(h.jenis_kelamin)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{h.umur?.display || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{h.bobot || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusBadge(h.status)}`}>
                        {h.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/admin/hewan-ternak/${h.id}`}
                        className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
                      >
                        Lihat→
                      </Link>
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
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="text-5xl mb-4">🐑</div>
            <p className="text-gray-700 font-semibold mb-2">Tidak ada data hewan ternak</p>
            <p className="text-gray-500 text-sm">
              {totalItems === 0 
                ? 'Belum ada data hewan dari semua kelompok' 
                : 'Filter yang Anda gunakan tidak menemukan hasil'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

