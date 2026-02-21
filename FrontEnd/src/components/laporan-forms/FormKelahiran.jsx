import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader } from 'lucide-react';
import { fetchNextBisnisId, buildBisnisId } from '../../utils/bisnisIdGenerator';

export default function FormKelahiran({ 
  formData, 
  onFormChange, 
  onDateChange,
  onSubmit, 
  onBack, 
  saving, 
  today,
  selectedConfig,
  pejantanCandidates,
  indukCandidates,
  loadingCandidates
}) {
  // State untuk ID bisnis terstruktur
  const [idPrefix, setIdPrefix] = useState('');       // e.g. "RT.NB" — terkunci
  const [idYearMonth, setIdYearMonth] = useState(''); // e.g. "26.01" — bisa diedit
  const [idSequence, setIdSequence] = useState('');   // e.g. "001" — bisa diedit
  const [loadingId, setLoadingId] = useState(false);

  // Auto-generate ID bisnis saat form pertama kali dibuka
  useEffect(() => {
    const generate = async () => {
      try {
        setLoadingId(true);
        const result = await fetchNextBisnisId();
        setIdPrefix(result.prefix);
        setIdYearMonth(result.year_month);
        setIdSequence(result.sequence);
        onFormChange('id', result.next_id);
      } catch (err) {
        console.error('Gagal generate ID bisnis anakan:', err);
      } finally {
        setLoadingId(false);
      }
    };
    generate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync id ke formData parent setiap kali bagian editable berubah
  useEffect(() => {
    if (idPrefix && idYearMonth && idSequence) {
      onFormChange('id', buildBisnisId(idPrefix, idYearMonth, idSequence));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idPrefix, idYearMonth, idSequence]);
  return (
    <form onSubmit={onSubmit} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className={`bg-gradient-to-r ${selectedConfig.color} text-white p-6`}>
        <h2 className="text-2xl font-bold">{selectedConfig.label}</h2>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Tanggal Laporan */}
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

        {/* Tanggal Kelahiran */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Tanggal Kelahiran <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            max={today}
            value={formData.data.tanggal_kelahiran || ''}
            onChange={(e) => onFormChange('tanggal_kelahiran', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            required
          />
        </div>

        {/* ID Anakan */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            ID Anakan (ID Bisnis) <span className="text-red-500">*</span>
          </label>
          {loadingId ? (
            <div className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50">
              <Loader size={14} className="animate-spin text-gray-400" />
              <span className="text-sm text-gray-400">Membuat ID bisnis...</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              {/* Prefix — locked */}
              <input
                type="text"
                value={idPrefix}
                disabled
                title="Prefix dari kode kelompok, tidak dapat diubah"
                className="w-24 px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 text-center text-sm cursor-not-allowed"
              />
              <span className="text-gray-400 font-bold">.</span>
              {/* Tahun.Bulan — editable */}
              <input
                type="text"
                value={idYearMonth}
                onChange={(e) => setIdYearMonth(e.target.value)}
                placeholder="26.01"
                maxLength={5}
                title="Format: YY.MM (tahun 2 digit . bulan 2 digit)"
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-center text-sm "
                disabled={saving}
              />
              <span className="text-gray-400 font-bold">.</span>
              {/* Sequence — editable */}
              <input
                type="text"
                value={idSequence}
                onChange={(e) => setIdSequence(e.target.value)}
                placeholder="001"
                maxLength={5}
                title="Nomor urut hewan"
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-center text-sm "
                disabled={saving}
              />
            </div>
          )}
          <div className="mt-1 flex items-center gap-2">
            <p className="text-xs text-gray-500">
              Hasil: <span className="font-semibold text-gray-700">{formData.data.id || '-'}</span>
            </p>
            <span className="text-xs text-gray-400">|</span>
            <span className="text-xs text-gray-400 bg-gray-100 px-1 rounded">{idPrefix}</span>
            <span className="text-xs text-gray-400">= dari kode kelompok (terkunci)</span>
          </div>
        </div>

        {/* Jenis Kelamin + Ras + Bobot */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Jenis Kelamin Anak <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.data.jenis_kelamin_anak || ''}
              onChange={(e) => onFormChange('jenis_kelamin_anak', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            >
              <option value="">Pilih</option>
              <option value="jantan">Jantan</option>
              <option value="betina">Betina</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Ras Anak
            </label>
            <input
              type="text"
              placeholder="e.g., Domba Lokal"
              value={formData.data.ras || ''}
              onChange={(e) => onFormChange('ras', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Bobot Awal (kg)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              placeholder="e.g., 2.5"
              value={formData.data.bobot || ''}
              onChange={(e) => onFormChange('bobot', parseFloat(e.target.value) || '')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>

        {/* Pejantan + Induk */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Pejantan<span className="text-red-500">*</span>
            </label>
            <select
              value={formData.data.pejantan_id || ''}
              onChange={(e) => onFormChange('pejantan_id', e.target.value || '')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              disabled={loadingCandidates}
              required
            >
              <option value="">
                {loadingCandidates ? 'Memuat...' : 'Pilih pejantan (jantan > 8 bulan)'}
              </option>
              {pejantanCandidates.map((hewan) => (
                <option key={hewan.id} value={hewan.id_hewan}>
                  {hewan.id_hewan || `#${hewan.id}`} - {hewan.ras} ({hewan.umur_display})
                </option>
              ))}
            </select>
            {pejantanCandidates.length === 0 && !loadingCandidates && (
              <p className="text-xs text-yellow-600 mt-1">
                ⚠ Tidak ada pejantan tersedia (jantan usia {'>'} 8 bulan)
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Induk<span className="text-red-500">*</span>
            </label>
            <select
              value={formData.data.induk_id || ''}
              onChange={(e) => onFormChange('induk_id', e.target.value || '')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              disabled={loadingCandidates}
              required
            >
              <option value="">
                {loadingCandidates ? 'Memuat...' : 'Pilih induk (betina > 8 bulan)'}
              </option>
              {indukCandidates.map((hewan) => (
                <option key={hewan.id} value={hewan.id_hewan}>
                  {hewan.id_hewan || `#${hewan.id}`} - {hewan.ras} ({hewan.umur_display})
                </option>
              ))}
            </select>
            {indukCandidates.length === 0 && !loadingCandidates && (
              <p className="text-xs text-yellow-600 mt-1">
                ⚠ Tidak ada induk tersedia (betina usia {'>'} 8 bulan)
              </p>
            )}
          </div>
        </div>

        {/* Detail Pejantan & Induk - 2 Column Layout */}
        {(formData.data.pejantan_id || formData.data.induk_id) && (
          <div className="grid grid-cols-2 gap-4">
            {/* Detail Pejantan */}
            {formData.data.pejantan_id && (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <h4 className="font-semibold text-primary-900 mb-2">Detail Pejantan</h4>
                {pejantanCandidates
                  .filter(h => h.id_hewan === formData.data.pejantan_id)
                  .map(h => (
                    <div key={h.id} className="text-sm text-primary-800 space-y-1">
                      <p><strong>ID Bisnis:</strong> {h.id_hewan || '-'}</p>
                      <p><strong>Jenis Kelamin:</strong> {h.jenis_kelamin}</p>
                      <p><strong>Ras:</strong> {h.ras}</p>
                      <p><strong>Umur:</strong> {h.umur_display}</p>
                    </div>
                  ))}
              </div>
            )}

            {/* Detail Induk */}
            {formData.data.induk_id && (
              <div className="bg-info-50 border border-info-100 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">Detail Induk</h4>
                {indukCandidates
                  .filter(h => h.id_hewan === formData.data.induk_id)
                  .map(h => (
                    <div key={h.id} className="text-sm text-purple-800 space-y-1">
                      <p><strong>ID Bisnis:</strong> {h.id_hewan || '-'}</p>
                      <p><strong>Jenis Kelamin:</strong> {h.jenis_kelamin}</p>
                      <p><strong>Ras:</strong> {h.ras}</p>
                      <p><strong>Umur:</strong> {h.umur_display}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Catatan (Opsional) */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Catatan (Opsional)
          </label>
          <textarea
            placeholder="Catatan tambahan tentang kelahiran..."
            value={formData.data.catatan || ''}
            onChange={(e) => onFormChange('catatan', e.target.value)}
            rows="2"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
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
