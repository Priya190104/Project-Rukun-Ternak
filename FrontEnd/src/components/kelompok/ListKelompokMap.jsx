import React, { useState } from 'react';
import { MapPin } from 'lucide-react';

export default function ListKelompokMap({ kelompokList = [], onSelectKelompok = null, selectedKelompokId = null }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter list based on search
  const filteredList = kelompokList.filter(k => {
    const search = searchTerm.toLowerCase();
    return (
      (k.name && k.name.toLowerCase().includes(search)) ||
      (k.desa && k.desa.toLowerCase().includes(search)) ||
      (k.kecamatan && k.kecamatan.toLowerCase().includes(search))
    );
  });

  // Show only kelompok dengan lokasi yang valid
  const kelompokWithLocation = filteredList.filter(k => k.latitude && k.longitude);

  const handleSelectKelompok = (kelompok) => {
    if (onSelectKelompok) {
      onSelectKelompok(kelompok);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-3">Daftar Kelompok</h3>
        <input
          type="text"
          placeholder="Cari nama, desa, atau kecamatan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {kelompokWithLocation.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            {kelompokList.length === 0 ? (
              <div>
                <p className="text-base font-medium mb-1">📍 Belum ada data kelompok</p>
                <p className="text-xs">Silakan tambah kelompok terlebih dahulu</p>
              </div>
            ) : (
              <div>
                <p className="text-base font-medium mb-1">📍 Belum ada lokasi</p>
                <p className="text-xs">Kelompok dengan lokasi akan ditampilkan di sini</p>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {kelompokWithLocation.map((kelompok) => (
              <div
                key={kelompok.id}
                onClick={() => handleSelectKelompok(kelompok)}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedKelompokId === kelompok.id
                    ? 'bg-blue-100 border-l-4 border-l-blue-600'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm">
                      {kelompok.name || 'Nama Kelompok'}
                    </p>
                    <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                      <p>
                        <span className="text-gray-500">Desa:</span>{' '}
                        <span>{kelompok.desa || '-'}</span>
                      </p>
                      <p>
                        <span className="text-gray-500">Kecamatan:</span>{' '}
                        <span>{kelompok.kecamatan || '-'}</span>
                      </p>
                      {kelompok.latitude && kelompok.longitude && (
                        <p className="text-gray-400 pt-1">
                          {kelompok.latitude.toFixed(4)}°, {kelompok.longitude.toFixed(4)}°
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer info */}
      {kelompokWithLocation.length > 0 && (
        <div className="p-3 bg-blue-50 border-t border-gray-200 text-xs text-blue-700">
          📌 Menampilkan {kelompokWithLocation.length} kelompok dengan lokasi
        </div>
      )}
    </div>
  );
}
