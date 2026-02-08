import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AdminPageHeader from '../components/admin/AdminPageHeader';
import { AlertCircle, Loader } from 'lucide-react';
import { useCachedData } from '../hooks/useCachedData';

export default function AdminHewanTernakPage() {
  const { appRole } = useAuth();
  
  // Fetch admin hewan dengan caching (5 menit TTL)
  const { data: cachedHewan, loading: hewanLoading } = useCachedData(
    '/api/admin/hewan',
    ['/api/admin/hewan'],
    { ttl: 5 * 60 * 1000 }
  );
  
  // Fetch kelompok dengan caching (15 menit TTL)
  const { data: cachedKelompok, loading: kelompokLoading } = useCachedData(
    '/api/kelompok',
    ['/api/kelompok'],
    { ttl: 15 * 60 * 1000 }
  );
  
  const [hewan, setHewan] = useState([]);
  const [filteredHewan, setFilteredHewan] = useState([]);
  const [error, setError] = useState(null);
  
  // Filter states
  const [kelompokList, setKelompokList] = useState([]);
  const [filterKelompok, setFilterKelompok] = useState('');
  const [filterUmurMin, setFilterUmurMin] = useState('');
  const [filterUmurMax, setFilterUmurMax] = useState('');
  const [filterBobotMin, setFilterBobotMin] = useState('');
  const [filterBobotMax, setFilterBobotMax] = useState('');

  // Sync hewan data
  useEffect(() => {
    if (cachedHewan) {
      const data = cachedHewan?.data || cachedHewan || [];
      setHewan(data);
      setFilteredHewan(data);
    }
  }, [cachedHewan]);

  // Sync kelompok data
  useEffect(() => {
    if (cachedKelompok) {
      const data = Array.isArray(cachedKelompok) ? cachedKelompok : (cachedKelompok?.data || []);
      const names = data.map(k => k.name);
      setKelompokList(names);
    }
  }, [cachedKelompok]);

  // Allow both admin and viewer (viewer in read-only mode)
  useEffect(() => {
    if (appRole !== 'admin' && appRole !== 'viewer') {
      setError('Akses ditolak. Halaman ini hanya untuk user admin.');
    }
  }, [appRole]);

  const loading = hewanLoading || kelompokLoading;

  // Apply filters (client-side, no reload)
  useEffect(() => {
    let filtered = [...hewan];

    // Filter by kelompok
    if (filterKelompok) {
      filtered = filtered.filter(h => h.nama_kelompok === filterKelompok);
    }

    // Filter by umur (dalam hari)
    if (filterUmurMin || filterUmurMax) {
      filtered = filtered.filter(h => {
        const umurHari = h.umur.hari;
        const minOk = !filterUmurMin || umurHari >= parseInt(filterUmurMin);
        const maxOk = !filterUmurMax || umurHari <= parseInt(filterUmurMax);
        return minOk && maxOk;
      });
    }

    // Filter by bobot
    if (filterBobotMin || filterBobotMax) {
      filtered = filtered.filter(h => {
        const bobot = h.bobot || 0;
        const minOk = !filterBobotMin || bobot >= parseFloat(filterBobotMin);
        const maxOk = !filterBobotMax || bobot <= parseFloat(filterBobotMax);
        return minOk && maxOk;
      });
    }

    setFilteredHewan(filtered);
  }, [hewan, filterKelompok, filterUmurMin, filterUmurMax, filterBobotMin, filterBobotMax]);

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
    setFilterUmurMin('');
    setFilterUmurMax('');
    setFilterBobotMin('');
    setFilterBobotMax('');
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Filter Kelompok */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Kelompok
              </label>
              <select
                value={filterKelompok}
                onChange={(e) => setFilterKelompok(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-gray-900 text-sm"
              >
                <option value="">Semua Kelompok</option>
                {kelompokList.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>

            {/* Filter Umur Min */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Umur Min (hari)
              </label>
              <input
                type="number"
                min="0"
                value={filterUmurMin}
                onChange={(e) => setFilterUmurMin(e.target.value)}
                placeholder="Dari"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-gray-900 text-sm"
              />
            </div>

            {/* Filter Umur Max */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Umur Max (hari)
              </label>
              <input
                type="number"
                min="0"
                value={filterUmurMax}
                onChange={(e) => setFilterUmurMax(e.target.value)}
                placeholder="Sampai"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-900 text-sm"
              />
            </div>

            {/* Filter Bobot Min */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bobot Min (kg)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={filterBobotMin}
                onChange={(e) => setFilterBobotMin(e.target.value)}
                placeholder="Dari"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-900 text-sm"
              />
            </div>

            {/* Filter Bobot Max */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bobot Max (kg)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={filterBobotMax}
                onChange={(e) => setFilterBobotMax(e.target.value)}
                placeholder="Sampai"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-900 text-sm"
              />
            </div>
          </div>

          {/* Filter Info */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-700">
              Menampilkan <span className="font-semibold text-gray-900">{filteredHewan.length}</span> dari <span className="font-semibold text-gray-900">{hewan.length}</span> hewan
            </p>
          </div>
        </div>

        {/* Hewan List */}
        {filteredHewan.length > 0 ? (
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
                {filteredHewan.map((h) => (
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
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="text-5xl mb-4">🐑</div>
            <p className="text-gray-700 font-semibold mb-2">Tidak ada data hewan ternak</p>
            <p className="text-gray-500 text-sm">
              {hewan.length === 0 
                ? 'Belum ada data hewan dari semua kelompok' 
                : 'Filter yang Anda gunakan tidak menemukan hasil'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

