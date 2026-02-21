import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function FormPakan({ 
  formData, 
  onFormChange, 
  onDateChange,
  onSubmit, 
  onBack, 
  saving, 
  today,
  selectedConfig 
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

        {/* Jenis Pakan */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Jenis Pakan <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Rumput kering, Jagung, Dedak"
            value={formData.data.jenis_pakan || ''}
            onChange={(e) => onFormChange('jenis_pakan', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>

        {/* Sumber Pakan */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Sumber Pakan <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Petani Lokal, Koperasi, Distributor"
            value={formData.data.sumber || ''}
            onChange={(e) => onFormChange('sumber', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>

        {/* Keterangan */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Keterangan
          </label>
          <textarea
            placeholder="Catatan tambahan tentang pakan..."
            value={formData.data.keterangan || ''}
            onChange={(e) => onFormChange('keterangan', e.target.value)}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
