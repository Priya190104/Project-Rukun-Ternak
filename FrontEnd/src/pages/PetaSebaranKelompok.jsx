import React, { useEffect, useState } from 'react';
import { MapPin, Loader } from 'lucide-react';
import client from '../api/client';
import MapSebaranKelompok from '../components/kelompok/MapSebaranKelompok';
import ListKelompokMap from '../components/kelompok/ListKelompokMap';
import { useCachedData } from '../hooks/useCachedData';

export default function PetaSebaranKelompok() {
  // Fetch kelompok dengan caching (15 menit TTL - static location data)
  const { data: cachedKelompok, loading, error, refetch } = useCachedData(
    '/api/kelompok',
    ['/api/kelompok'],
    { ttl: 15 * 60 * 1000 }
  );
  
  const [kelompok, setKelompok] = useState([]);
  const [selectedKelompok, setSelectedKelompok] = useState(null);

  // Sync kelompok data
  useEffect(() => {
    if (cachedKelompok) {
      const list = Array.isArray(cachedKelompok) ? cachedKelompok : (cachedKelompok?.data || []);
      console.log('Kelompok data loaded:', list);
      console.log('Kelompok with location:', list.filter(k => k.latitude && k.longitude));
      setKelompok(list);
    }
  }, [cachedKelompok]);

  const handleMarkerClick = (kelompokData) => {
    setSelectedKelompok(kelompokData);
  };

  const handleSelectFromList = (kelompokData) => {
    setSelectedKelompok(kelompokData);
  };

  const kelompokWithLocation = kelompok.filter(k => k.latitude && k.longitude);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <MapPin className="text-danger" size={28} />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Peta Sebaran Kelompok Rukun Ternak
          </h1>
        </div>
        <p className="text-gray-700 text-sm md:text-base">
          Visualisasi sebaran lokasi kelompok ternak di wilayah Cilacap
        </p>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader size={40} className="animate-spin text-primary-600 mx-auto mb-3" />
            <p className="text-gray-700">Memuat data kelompok...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-danger-50 border border-danger-100 rounded-lg p-4 mb-6">
          <p className="text-red-800 font-medium">âš ï¸ Terjadi kesalahan</p>
          <p className="text-danger text-sm mt-1">{error}</p>
          <button
            onClick={refetch}
            className="mt-3 px-4 py-2 bg-danger text-white rounded-lg text-sm hover:bg-red-700 transition"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {kelompokWithLocation.length === 0 ? (
            // Empty state
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">📍</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Belum Ada Data Lokasi Kelompok
              </h2>
              <p className="text-gray-700 mb-4">
                Total kelompok terdaftar: <strong>{kelompok.length}</strong><br/>
                Dengan lokasi: <strong>{kelompokWithLocation.length}</strong>
              </p>
              <p className="text-gray-700 mb-4 text-sm">
                Tambahkan kelompok dan tentukan lokasinya (latitude & longitude) untuk melihat peta sebaran.
              </p>
              <a
                href="/list-kelompok"
                className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition"
              >
                Kelola Kelompok
              </a>
            </div>
          ) : (
            // Map and list layout
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map section */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md overflow-hidden h-96 md:h-[600px]">
                  <MapSebaranKelompok
                    kelompokList={kelompok}
                    onMarkerClick={handleMarkerClick}
                    highlightedMarkerId={selectedKelompok?.id}
                  />
                </div>

                {/* Map info */}
                <div className="mt-4 bg-primary-50 border border-primary-200 rounded-lg p-4 text-sm text-primary-800">
                  <p className="font-medium mb-1">ℹ️ Informasi Peta</p>
                  <ul className="text-xs space-y-1">
                    <li>• Klik marker untuk melihat informasi kelompok</li>
                    <li>• Gunakan scroll untuk zoom in/out</li>
                    <li>• Klik daftar di samping untuk fokus ke marker</li>
                    <li>• Total: {kelompokWithLocation.length} kelompok</li>
                  </ul>
                </div>
              </div>

              {/* List section */}
              <div className="lg:col-span-1">
                <ListKelompokMap
                  kelompokList={kelompok}
                  onSelectKelompok={handleSelectFromList}
                  selectedKelompokId={selectedKelompok?.id}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

