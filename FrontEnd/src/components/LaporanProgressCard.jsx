import React, { useEffect, useState } from 'react';
import client from '../api/client';

export default function LaporanProgressCard({ loading: parentLoading }) {
  const [laporanData, setLaporanData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await client.get('/api/stats');
        if (!mounted) return;
        if (res.data?.data?.latest && res.data.data.latest.length > 0) {
          const latestLaporan = res.data.data.latest[0];
          setLaporanData(latestLaporan);
        }
      } catch (err) {
        console.error('Failed to load laporan data:', err);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const isLoading = parentLoading || loading;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!laporanData || !laporanData.data) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <p className="text-gray-500 text-center py-8">Belum ada data laporan</p>
      </div>
    );
  }

  const data = laporanData.data;

  // Extract data from laporan
  const penyaluranItems = [
    { label: 'Tanggal Penyaluran', value: data.tanggal_penyaluran || '-', icon: 'ðŸ“…' },
    { label: 'Indukan', value: data.indukan || 'Belum', icon: 'ï¿½' },
    { label: 'Pejantan', value: data.pejantan || 'Belum', icon: 'ðŸ‘¨' },
    { label: 'Kandang', value: data.kandang || 'Belum', icon: 'ðŸ ' },
  ];



  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-5 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Laporan Penyaluran</h2>
      </div>

      <div className="p-6 space-y-6">
        
        {/* Section B: Penyaluran / Bantuan */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {penyaluranItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-50 rounded-lg border border-gray-200 hover:border-amber-300 transition">
                <div>
                  <p className="text-xs font-semibold text-gray-700 uppercase">{item.label}</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{item.value}</p>
                </div>
                <span className="text-3xl">{item.icon}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

