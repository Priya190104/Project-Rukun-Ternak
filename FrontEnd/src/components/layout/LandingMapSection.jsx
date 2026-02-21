import React, { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import client from '../../api/client';
import MapSebaranKelompok from '../kelompok/MapSebaranKelompok';
import ListKelompokMap from '../kelompok/ListKelompokMap';

export default function LandingMapSection() {
  const [kelompok, setKelompok] = useState([]);
  const [selectedKelompok, setSelectedKelompok] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKelompok = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await client.get('/api/kelompok');
        const list = res.data?.data || [];
        setKelompok(list);
      } catch (err) {
        console.error('Failed to load kelompok', err);
        setError(err.response?.data?.message || 'Gagal memuat data kelompok');
        setKelompok([]);
      } finally {
        setLoading(false);
      }
    };
    fetchKelompok();
  }, []);

  const handleMarkerClick = (kelompokData) => {
    setSelectedKelompok(kelompokData);
  };

  const handleSelectFromList = (kelompokData) => {
    setSelectedKelompok(kelompokData);
  };

  const kelompokWithLocation = kelompok.filter(k => k.latitude && k.longitude);

  if (loading) {
    return (
      <section className="mt-16 bg-white/80 border border-primary-100 rounded-3xl shadow-lg p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center text-xl font-bold">
            📍
          </div>
          <h2 className="text-3xl font-bold">Peta Sebaran Kelompok Rukun Ternak</h2>
        </div>
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader size={40} className="animate-spin text-primary-600 mx-auto mb-3" />
            <p className="text-gray-700">Memuat data kelompok...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-16 bg-white/80 border border-primary-100 rounded-3xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center text-xl font-bold">
            📍
          </div>
          <h2 className="text-3xl font-bold">Peta Sebaran Kelompok Rukun Ternak</h2>
        </div>
        <div className="bg-danger-50 border border-danger-100 rounded-lg p-4">
          <p className="text-red-800 font-medium">⚠️ Terjadi kesalahan</p>
          <p className="text-danger text-sm mt-1">{error}</p>
        </div>
      </section>
    );
  }

  if (kelompokWithLocation.length === 0) {
    return (
      <section className="mt-16 bg-white/80 border border-primary-100 rounded-3xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary-300 text-white flex items-center justify-center text-xl font-bold">
            📍
          </div>
          <h2 className="text-3xl font-bold">Peta Sebaran Kelompok Rukun Ternak</h2>
        </div>
        <div className="bg-primary-50 border border-primary-100 rounded-lg p-12 text-center">
          <div className="text-5xl mb-4">📍</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Belum Ada Data Lokasi Kelompok</h3>
          <p className="text-gray-700">
            Data lokasi kelompok akan ditampilkan setelah kelompok menentukan posisi mereka.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-16 bg-white/80 border border-primary-100 rounded-3xl shadow-lg p-8 relative z-0">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center text-xl font-bold">
          📍
        </div>
        <h2 className="text-3xl font-bold">Peta Sebaran Kelompok Rukun Ternak</h2>
      </div>

      {/* Map and list layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Map section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 h-96 md:h-[500px] relative z-0">
            <MapSebaranKelompok
              kelompokList={kelompok}
              onMarkerClick={handleMarkerClick}
              highlightedMarkerId={selectedKelompok?.id}
            />
          </div>

          {/* Map info */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 text-sm text-primary-800">
            <p className="font-medium mb-1">ℹ️ Informasi Peta</p>
            <ul className="text-xs space-y-1">
              <li>• Klik marker untuk melihat informasi kelompok</li>
              <li>• Gunakan scroll untuk zoom in/out</li>
              <li>• Klik daftar di samping untuk fokus ke marker</li>
              <li>• Total: {kelompokWithLocation.length} kelompok</li>
            </ul>
          </div>
        </div>

        {/* List section - tinggi sama dengan peta */}
        <div className="lg:col-span-1 h-96 md:h-[500px]">
          <ListKelompokMap
            kelompokList={kelompok}
            onSelectKelompok={handleSelectFromList}
            selectedKelompokId={selectedKelompok?.id}
          />
        </div>
      </div>
    </section>
  );
}

