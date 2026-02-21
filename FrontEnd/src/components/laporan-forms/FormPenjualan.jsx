import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function FormPenjualan({ 
  formData, 
  onFormChange, 
  onDateChange,
  onSubmit, 
  onBack, 
  saving, 
  today,
  selectedConfig,
  penjualanCandidates,
  loadingPenjualanCandidates
}) {
  return (
    <form onSubmit={onSubmit} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className={`bg-gradient-to-r ${selectedConfig.color} text-white p-6`}>
        <h2 className="text-2xl font-bold">{selectedConfig.label}</h2>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Tanggal */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Tanggal Laporan <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            max={today}
            value={formData.tanggal}
            onChange={onDateChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Jumlah Hewan yang Dijual */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Jumlah Hewan yang Dijual <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            value={formData.data.jumlah_hewan || ''}
            onChange={(e) => {
              const value = parseInt(e.target.value) || '';
              onFormChange('jumlah_hewan', value);
              // Initialize penjualan_list if not exists
              if (value && (!formData.data.penjualan_list || formData.data.penjualan_list.length !== value)) {
                const newList = Array(value).fill(null).map(() => ({
                  jenis_penjualan: '',
                  jenis_hewan: '',
                  id_hewan: '',
                  catatan: ''
                }));
                onFormChange('penjualan_list', newList);
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Dynamic Penjualan Items */}
        {formData.data.jumlah_hewan && formData.data.jumlah_hewan > 0 && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 space-y-6">
            <p className="text-sm font-semibold text-primary-900">
              Masukkan detail penjualan untuk {formData.data.jumlah_hewan} hewan
            </p>

            {Array.from({ length: formData.data.jumlah_hewan }).map((_, idx) => {
              const item = formData.data.penjualan_list?.[idx] || {};
              
              return (
                <div key={idx} className="bg-white rounded-lg p-4 border border-primary-100">
                  <h4 className="font-semibold text-gray-900 mb-4">Hewan #{idx + 1}</h4>

                  {/* Jenis Penjualan */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Jenis Penjualan <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={item.jenis_penjualan || ''}
                      onChange={(e) => {
                        const newList = [...(formData.data.penjualan_list || [])];
                        newList[idx] = { ...newList[idx], jenis_penjualan: e.target.value };
                        onFormChange('penjualan_list', newList);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Pilih jenis penjualan</option>
                      <option value="Retail">Retail</option>
                      <option value="Aqiqah">Aqiqah</option>
                      <option value="Qurban">Qurban</option>
                    </select>
                  </div>

                  {/* Jenis Hewan */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Jenis Hewan <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={item.jenis_hewan || ''}
                      onChange={(e) => {
                        const newList = [...(formData.data.penjualan_list || [])];
                        newList[idx] = { ...newList[idx], jenis_hewan: e.target.value, id_hewan: '' };
                        onFormChange('penjualan_list', newList);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Pilih jenis hewan</option>
                      <option value="Pejantan">Pejantan</option>
                      <option value="Indukan">Indukan</option>
                      <option value="Calon Indukan">Calon Indukan</option>
                      <option value="Calon Pejantan">Calon Pejantan</option>
                      <option value="Jantan Potong">Jantan Potong</option>
                      <option value="Betina Potong">Betina Potong</option>
                    </select>
                  </div>

                  {/* ID Hewan */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      ID Hewan (ID Bisnis) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={item.id_hewan || ''}
                      onChange={(e) => {
                        const newList = [...(formData.data.penjualan_list || [])];
                        newList[idx] = { ...newList[idx], id_hewan: e.target.value };
                        onFormChange('penjualan_list', newList);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!item.jenis_hewan}
                      required
                    >
                      <option value="">
                        {!item.jenis_hewan ? 'Pilih jenis hewan dulu' : (loadingPenjualanCandidates ? 'Memuat...' : 'Pilih hewan')}
                      </option>
                      {item.jenis_hewan && penjualanCandidates[item.jenis_hewan]?.map((hewan) => (
                        <option key={hewan.id} value={hewan.id_hewan}>
                          {hewan.id_hewan} - {hewan.ras} ({hewan.umur_display || `${hewan.umur_bulan} bulan`})
                        </option>
                      ))}
                    </select>
                    {!item.jenis_hewan && (
                      <p className="text-xs text-yellow-600 mt-1">⚠️ Pilih jenis hewan dulu</p>
                    )}
                    {item.jenis_hewan && penjualanCandidates[item.jenis_hewan]?.length === 0 && (
                      <p className="text-xs text-yellow-600 mt-1">⚠️ Tidak ada hewan tersedia untuk jenis ini</p>
                    )}
                  </div>

                  {/* Data Hewan (Read-only) */}
                  {item.id_hewan && item.jenis_hewan && (
                    (() => {
                      const selectedHewan = penjualanCandidates[item.jenis_hewan]?.find(h => h.id_hewan === item.id_hewan);
                      return selectedHewan ? (
                        <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <p className="text-sm font-semibold text-gray-900 mb-2">Data Hewan</p>
                          <div className="text-sm text-gray-700 space-y-1">
                            <p><strong>Jenis Kelamin:</strong> <span className="text-gray-700">{selectedHewan.jenis_kelamin || '-'}</span></p>
                            <p><strong>Umur:</strong> <span className="text-gray-700">{selectedHewan.umur_display || `${selectedHewan.umur_bulan} bulan` || '-'}</span></p>
                            <p><strong>Ras:</strong> <span className="text-gray-700">{selectedHewan.ras || '-'}</span></p>
                            <p><strong>Bobot:</strong> <span className="text-gray-700">{selectedHewan.bobot || '-'} kg</span></p>
                          </div>
                        </div>
                      ) : null;
                    })()
                  )}

                  {/* Catatan Penjualan */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Catatan Penjualan
                    </label>
                    <textarea
                      placeholder="Catatan tentang penjualan hewan ini..."
                      value={item.catatan || ''}
                      onChange={(e) => {
                        const newList = [...(formData.data.penjualan_list || [])];
                        newList[idx] = { ...newList[idx], catatan: e.target.value };
                        onFormChange('penjualan_list', newList);
                      }}
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Catatan Umum */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Catatan Umum (Opsional)
          </label>
          <textarea
            placeholder="Catatan tambahan tentang penjualan..."
            value={formData.data.catatan || ''}
            onChange={(e) => onFormChange('catatan', e.target.value)}
            rows="2"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 sm:py-6 flex gap-3 sm:gap-4 flex-col sm:flex-row">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-100 font-medium transition"
        >
          <ArrowLeft size={18} />
          Kembali
        </button>
        <button
          type="submit"
          disabled={saving}
          className={`flex-1 px-6 py-3 rounded-lg font-medium text-white transition flex items-center justify-center gap-2 ${
            saving
              ? 'bg-gray-400 cursor-not-allowed'
              : `bg-gradient-to-r ${selectedConfig.color} hover:shadow-lg`
          }`}
        >
          {saving ? 'Menyimpan...' : 'Simpan Laporan'}
        </button>
      </div>
    </form>
  );
}
