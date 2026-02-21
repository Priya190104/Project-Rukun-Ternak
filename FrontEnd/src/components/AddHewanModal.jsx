import React, { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import { fetchNextBisnisId, buildBisnisId } from '../utils/bisnisIdGenerator';

export default function AddHewanModal({ isOpen, onClose, onSubmit, isLoading }) {
  const [form, setForm] = useState({
    id_hewan: '',
    jenis_kelamin: 'JANTAN',
    ras: '',
    bobot: '',
    umur: '',
    catatan: ''
  });
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // State untuk ID bisnis terstruktur
  const [idPrefix, setIdPrefix] = useState('');       // e.g. "RT.NB" — tidak bisa diedit
  const [idYearMonth, setIdYearMonth] = useState(''); // e.g. "26.01" — bisa diedit
  const [idSequence, setIdSequence] = useState('');   // e.g. "001" — bisa diedit
  const [loadingId, setLoadingId] = useState(false);

  // Auto-generate ID bisnis saat modal dibuka
  useEffect(() => {
    if (!isOpen) return;
    const generate = async () => {
      try {
        setLoadingId(true);
        const result = await fetchNextBisnisId();
        setIdPrefix(result.prefix);
        setIdYearMonth(result.year_month);
        setIdSequence(result.sequence);
        setForm(prev => ({ ...prev, id_hewan: result.next_id }));
      } catch (err) {
        console.error('Gagal generate ID bisnis:', err);
        // Biarkan user isi manual jika gagal
      } finally {
        setLoadingId(false);
      }
    };
    generate();
  }, [isOpen]);

  // Sync id_hewan setiap kali bagian yang bisa diedit berubah
  useEffect(() => {
    if (idPrefix && idYearMonth && idSequence) {
      setForm(prev => ({ ...prev, id_hewan: buildBisnisId(idPrefix, idYearMonth, idSequence) }));
    }
  }, [idPrefix, idYearMonth, idSequence]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!form.id_hewan.trim()) {
      setError('ID Hewan Ternak wajib diisi');
      return;
    }
    if (!form.ras.trim()) {
      setError('Ras wajib diisi');
      return;
    }
    if (!form.bobot || parseFloat(form.bobot) <= 0) {
      setError('Bobot harus berupa angka positif');
      return;
    }
    if (!form.umur || parseInt(form.umur) < 0) {
      setError('Umur harus berupa angka positif (dalam bulan)');
      return;
    }

    // Show confirmation dialog
    setShowConfirmation(true);
  };

  const handleConfirmAdd = async () => {
    setShowConfirmation(false);
    // Submit
    await onSubmit(form);
    
    // Reset form
    setForm({
      id_hewan: '',
      jenis_kelamin: 'JANTAN',
      ras: '',
      bobot: '',
      umur: '',
      catatan: ''
    });
    setIdPrefix('');
    setIdYearMonth('');
    setIdSequence('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-100 text-white p-6 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-2xl font-bold">Tambah Hewan Ternak</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-danger-50 border border-danger-100 text-danger px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* ID Hewan Ternak */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ID Hewan Ternak (ID Bisnis) *
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
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none text-center text-sm "
                  disabled={isLoading}
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
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none text-center text-sm "
                  disabled={isLoading}
                />
              </div>
            )}
            <div className="mt-1 flex items-center gap-2">
              <p className="text-xs text-gray-500">
                Hasil: <span className="font-semibold text-gray-700">{form.id_hewan || '-'}</span>
              </p>
              <span className="text-xs text-gray-400">|</span>
              <span className="text-xs text-gray-400 bg-gray-100 px-1 rounded">{idPrefix}</span>
              <span className="text-xs text-gray-400">= dari kode kelompok (terkunci)</span>
            </div>
          </div>

          {/* Jenis Kelamin */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Jenis Kelamin *
            </label>
            <select
              name="jenis_kelamin"
              value={form.jenis_kelamin}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
              disabled={isLoading}
            >
              <option value="JANTAN">♂️ Pejantan</option>
              <option value="BETINA">♀️ Betina</option>
            </select>
          </div>

          {/* Ras */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ras *
            </label>
            <input
              type="text"
              name="ras"
              value={form.ras}
              onChange={handleChange}
              placeholder="e.g. Sapi Brahman, Domba Lokal"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
              disabled={isLoading}
            />
          </div>

          {/* Bobot */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bobot (kg) *
            </label>
            <input
              type="number"
              name="bobot"
              value={form.bobot}
              onChange={handleChange}
              placeholder="e.g. 450"
              step="0.1"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
              disabled={isLoading}
            />
          </div>

          {/* Umur */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Umur (Bulan) *
            </label>
            <input
              type="number"
              name="umur"
              value={form.umur}
              onChange={handleChange}
              placeholder="e.g. 6, 12, 24"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">Masukkan umur dalam bulan (angka saja)</p>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Catatan (Opsional)
            </label>
            <textarea
              name="catatan"
              value={form.catatan}
              onChange={handleChange}
              placeholder="Tambahkan catatan tentang hewan ini..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none resize-none"
              disabled={isLoading}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Menyimpan...' : 'Simpan Hewan Ternak'}
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
            <div className="bg-gradient-to-r from-primary-500 to-primary-100 text-white p-6 flex items-center justify-between border-b border-gray-200">
              <h3 className="text-lg font-bold">Konfirmasi Penambahan</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-700 font-medium">Apakah Anda yakin untuk menambahkan hewan ternak ini?</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2 text-sm">
                <p><span className="font-semibold text-gray-700">ID Hewan:</span> <span className="text-gray-900">{form.id_hewan}</span></p>
                <p><span className="font-semibold text-gray-700">Ras:</span> <span className="text-gray-900">{form.ras}</span></p>
                <p><span className="font-semibold text-gray-700">Jenis Kelamin:</span> <span className="text-gray-900">{form.jenis_kelamin === 'JANTAN' ? '♂️ Pejantan' : '♀️ Betina'}</span></p>
                <p><span className="font-semibold text-gray-700">Bobot:</span> <span className="text-gray-900">{form.bobot} kg</span></p>
                <p><span className="font-semibold text-gray-700">Umur:</span> <span className="text-gray-900">{form.umur} bulan</span></p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowConfirmation(false)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmAdd}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Menyimpan...' : 'Ya, Tambahkan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


