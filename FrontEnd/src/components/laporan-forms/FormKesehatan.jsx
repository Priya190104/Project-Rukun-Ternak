import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function FormKesehatan({ 
  formData, 
  onFormChange, 
  onDateChange,
  onSubmit, 
  onBack, 
  saving, 
  today,
  selectedConfig,
  hewanTernakList,
  loadingHewanTernak
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

        {/* ID Ternak */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            ID Ternak <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.data.id_ternak || ''}
            onChange={(e) => onFormChange('id_ternak', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            disabled={loadingHewanTernak}
            required
          >
            <option value="">
              {loadingHewanTernak ? 'Memuat data ternak...' : 'Pilih Ternak'}
            </option>
            {hewanTernakList.map((hewan) => (
              <option key={hewan.id} value={hewan.id_hewan}>
                {hewan.id_hewan} - {hewan.jenis_kelamin} ({hewan.umur?.display || 'Umur unknown'})
              </option>
            ))}
          </select>
        </div>

        {/* Status Kesehatan Ternak */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Status Kesehatan Ternak <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.data.status_kesehatan_ternak || ''}
            onChange={(e) => onFormChange('status_kesehatan_ternak', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          >
            <option value="">Pilih Status</option>
            <option value="sehat">Sehat</option>
            <option value="sakit_ringan">Sakit Ringan</option>
            <option value="sakit_berat">Sakit Berat</option>
            <option value="mati">Mati</option>
          </select>
        </div>

        {/* Jenis Tindakan - hanya muncul jika status bukan "mati" */}
        {formData.data.status_kesehatan_ternak && formData.data.status_kesehatan_ternak !== 'mati' && (
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Jenis Tindakan <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.data.jenis_tindakan || ''}
              onChange={(e) => onFormChange('jenis_tindakan', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            >
              <option value="">Pilih Jenis Tindakan</option>
              <option value="pencegahan">Pencegahan</option>
              <option value="pengobatan">Pengobatan</option>
              <option value="perawatan">Perawatan</option>
            </select>
          </div>
        )}

        {/* Jenis Pencegahan - muncul jika jenis_tindakan = pencegahan */}
        {formData.data.jenis_tindakan === 'pencegahan' && (
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Jenis Pencegahan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Vaksinasi, Pembersihan kandang"
              value={formData.data.jenis_pencegahan || ''}
              onChange={(e) => onFormChange('jenis_pencegahan', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>
        )}

        {/* Jenis Pengobatan - muncul jika jenis_tindakan = pengobatan */}
        {formData.data.jenis_tindakan === 'pengobatan' && (
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Jenis Pengobatan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Antibiotik, Vitamin"
              value={formData.data.jenis_pengobatan || ''}
              onChange={(e) => onFormChange('jenis_pengobatan', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>
        )}

        {/* Jenis Perawatan - muncul jika jenis_tindakan = perawatan */}
        {formData.data.jenis_tindakan === 'perawatan' && (
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Jenis Perawatan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Isolasi, Kompres, Infus"
              value={formData.data.jenis_perawatan || ''}
              onChange={(e) => onFormChange('jenis_perawatan', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>
        )}

        {/* Keterangan */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Keterangan
          </label>
          <textarea
            placeholder="Catatan tambahan tentang kesehatan ternak..."
            value={formData.data.keterangan || ''}
            onChange={(e) => onFormChange('keterangan', e.target.value)}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
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
