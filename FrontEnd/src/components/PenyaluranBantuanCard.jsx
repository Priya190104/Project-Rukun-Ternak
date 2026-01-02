import React from 'react';
import { Package, AlertCircle } from 'lucide-react';

export default function PenyaluranBantuanCard({ penyaluran, bantuan, loading }) {
  // Debug: Log received data
  React.useEffect(() => {
    if (penyaluran) {
      console.log('PenyaluranBantuanCard received penyaluran:', {
        jumlahKandang: penyaluran.jumlahKandang,
        tarnakJantan: penyaluran.tarnakJantan,
        tarnakBetina: penyaluran.tarnakBetina,
        pakanList: penyaluran.pakanList
      });
    }
    if (bantuan) {
      console.log('PenyaluranBantuanCard received bantuan:', {
        jumlahTernak: bantuan.jumlahTernak,
        kesehatanList: bantuan.kesehatanList
      });
    }
  }, [penyaluran, bantuan]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-100 rounded"></div>
          <div className="h-4 bg-gray-100 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!penyaluran && !bantuan) {
    return null;
  }

  // Check if there's any data to display
  const hasData = (penyaluran?.jumlahKandang || penyaluran?.tarnakJantan || penyaluran?.tarnakBetina) ||
                  (penyaluran?.pakanList && Array.isArray(penyaluran.pakanList) && penyaluran.pakanList.length > 0) ||
                  (bantuan?.kesehatanList && Array.isArray(bantuan.kesehatanList) && bantuan.kesehatanList.length > 0);

  // Parse JSON if they're strings
  const pakanList = penyaluran?.pakanList && typeof penyaluran.pakanList === 'string' 
    ? JSON.parse(penyaluran.pakanList) 
    : (penyaluran?.pakanList || []);
  
  const kesehatanList = bantuan?.kesehatanList && typeof bantuan.kesehatanList === 'string' 
    ? JSON.parse(bantuan.kesehatanList) 
    : (bantuan?.kesehatanList || []);

  const pakanArray = Array.isArray(pakanList) ? pakanList : [];
  const kesehatanArray = Array.isArray(kesehatanList) ? kesehatanList : [];

  return (
    <div className="bg-white rounded-xl shadow-md border border-indigo-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-4">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6" />
          <h2 className="text-xl font-bold">Penyaluran dan Bantuan Awal</h2>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        
        {/* Section 1: Kandang dan Hewan Ternak */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Kandang */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b-2 border-indigo-200">Kandang Disalurkan</h3>
            <div className="bg-indigo-50 rounded-lg p-4 text-center">
              <p className="text-4xl font-bold text-indigo-900">{penyaluran?.jumlahKandang || 0}</p>
              <p className="text-xs text-indigo-600 mt-1">unit</p>
            </div>
          </div>

          {/* Hewan Ternak - Jantan */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b-2 border-blue-200">Hewan Ternak Jantan</h3>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-4xl font-bold text-blue-900">{penyaluran?.tarnakJantan || 0}</p>
              <p className="text-xs text-blue-600 mt-1">ekor</p>
            </div>
          </div>

          {/* Hewan Ternak - Betina */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b-2 border-pink-200">Hewan Ternak Betina</h3>
            <div className="bg-pink-50 rounded-lg p-4 text-center">
              <p className="text-4xl font-bold text-pink-900">{penyaluran?.tarnakBetina || 0}</p>
              <p className="text-xs text-pink-600 mt-1">ekor</p>
            </div>
          </div>
        </div>

        {/* Section 1B: Total Hewan Ternak */}
        <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg p-4 border-l-4 border-indigo-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Total Hewan Ternak Disalurkan</p>
              <p className="text-3xl font-bold text-indigo-900">{(penyaluran?.tarnakJantan || 0) + (penyaluran?.tarnakBetina || 0)}</p>
            </div>
          </div>
        </div>

        {/* Section 2: Peralatan Pendukung */}
        {pakanArray.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b-2 border-indigo-200">Peralatan Pendukung</h3>
            <div className="space-y-2">
              {pakanArray.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-indigo-50 rounded-lg p-3">
                  <span className="text-sm font-semibold text-gray-800">
                    {item.jenisPeralatan || item.jenisPakan || '-'}
                  </span>
                  <span className="text-sm font-bold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">
                    {item.jumlahPeralatan || item.jumlahPakan || 0} unit
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Program Kesehatan */}
        {kesehatanArray.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b-2 border-indigo-200">Program Kesehatan</h3>
            <div className="space-y-2">
              {kesehatanArray.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-indigo-50 rounded-lg p-3">
                  <span className="text-sm font-semibold text-gray-800">
                    {item.jenisKesehatan || '-'}
                  </span>
                  <span className="text-sm font-bold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">
                    {item.jumlah || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!hasData && (
          <div className="bg-gray-50 rounded-lg p-6 text-center flex items-center justify-center gap-3">
            <AlertCircle className="w-5 h-5 text-gray-400" />
            <p className="text-gray-500 text-sm">Belum ada data penyaluran dan bantuan awal</p>
          </div>
        )}
      </div>
    </div>
  );
}
