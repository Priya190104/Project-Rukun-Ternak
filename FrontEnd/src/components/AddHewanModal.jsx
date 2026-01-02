import React, { useState } from 'react';
import { X } from 'lucide-react';

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
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 flex items-center justify-between border-b border-gray-200">
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
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* ID Hewan Ternak */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ID Hewan Ternak *
            </label>
            <input
              type="text"
              name="id_hewan"
              value={form.id_hewan}
              onChange={handleChange}
              placeholder="e.g. HW-001, SAPI-2024-001"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">ID bisnis hewan, bukan ID sistem</p>
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
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Menyimpan...' : 'Simpan Hewan Ternak'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
