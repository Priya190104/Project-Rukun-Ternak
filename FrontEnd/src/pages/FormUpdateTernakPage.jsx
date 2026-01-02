import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import client from '../api/client';
import { AlertCircle, Loader, ArrowLeft, Check, Heart } from 'lucide-react';

export default function FormUpdateTernakPage() {
  const navigate = useNavigate();
  const { appRole } = useAuth();
  
  const [hewan, setHewan] = useState([]);
  const [formData, setFormData] = useState({
    hewan_id: '',
    bobot: '',
    keterangan: '',
    tanggal_update: new Date().toISOString().split('T')[0]
  });
  
  const [selectedHewan, setSelectedHewan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch hewan aktif
  useEffect(() => {
    if (appRole !== 'kelompok') {
      setError('Akses ditolak. Form ini hanya untuk user kelompok.');
      setLoading(false);
      return;
    }

    const fetchHewan = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await client.get('/api/hewan-aktif');
        if (res.data?.success) {
          setHewan(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching hewan:', err);
        setError(err.response?.data?.message || 'Gagal mengambil data hewan');
      } finally {
        setLoading(false);
      }
    };

    fetchHewan();
  }, [appRole]);

  // Update selected hewan details
  const handleHewanChange = (e) => {
    const hewanId = parseInt(e.target.value);
    setFormData({ ...formData, hewan_id: hewanId });
    
    const selected = hewan.find(h => h.id === hewanId);
    setSelectedHewan(selected || null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi
    if (!formData.hewan_id) {
      setError('Pilih hewan terlebih dahulu');
      return;
    }
    if (!formData.bobot || parseFloat(formData.bobot) <= 0) {
      setError('Bobot harus diisi dengan angka positif');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const res = await client.post('/api/update-ternak', {
        hewan_id: formData.hewan_id,
        bobot: parseFloat(formData.bobot),
        keterangan: formData.keterangan || null,
        tanggal_update: formData.tanggal_update
      });

      if (res.data?.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/laporan');
        }, 2000);
      }
    } catch (err) {
      console.error('Error submitting:', err);
      setError(err.response?.data?.message || 'Gagal menyimpan update ternak');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader className="w-12 h-12 text-emerald-600 mx-auto mb-3 animate-spin" />
          <p className="text-gray-600">Memuat form...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Berhasil!</h2>
          <p className="text-gray-600 mb-6">Update ternak berhasil disimpan</p>
          <p className="text-sm text-gray-500">Mengalihkan ke halaman laporan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-6 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <Link to="/pilih-jenis" className="inline-flex items-center gap-2 text-emerald-50 hover:text-white mb-4 font-semibold transition">
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Heart className="w-7 h-7" />
            Update Ternak
          </h1>
          <p className="text-emerald-50 mt-1">Perbarui bobot badan hewan ternak Anda</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6">
        
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-900 font-semibold">Error</p>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {hewan.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-semibold mb-2">Belum ada hewan aktif</p>
            <p className="text-gray-500 text-sm">
              Tidak ada hewan ternak dengan status AKTIF di kelompok Anda
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
            
            {/* Pilih Hewan */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                ID Hewan Ternak *
              </label>
              <select
                value={formData.hewan_id}
                onChange={handleHewanChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900"
                required
              >
                <option value="">-- Pilih Hewan --</option>
                {hewan.map(h => (
                  <option key={h.id} value={h.id}>
                    ID {h.id_hewan || `#${h.id}`} - {h.ras} ({h.umur.display})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Hanya menampilkan hewan dengan status AKTIF</p>
            </div>

            {/* Ras (Read-only) */}
            {selectedHewan && (
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Ras
                </label>
                <input
                  type="text"
                  value={selectedHewan.ras}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Terisi otomatis dari data hewan</p>
              </div>
            )}

            {/* Bobot */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Bobot (kg) *
              </label>
              <input
                type="number"
                name="bobot"
                value={formData.bobot}
                onChange={handleInputChange}
                placeholder="Contoh: 45.5"
                step="0.1"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Masukkan bobot dalam kilogram</p>
            </div>

            {/* Tanggal Update */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Tanggal Update
              </label>
              <input
                type="date"
                name="tanggal_update"
                value={formData.tanggal_update}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1">Default: hari ini</p>
            </div>

            {/* Keterangan */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Keterangan (Opsional)
              </label>
              <textarea
                name="keterangan"
                value={formData.keterangan}
                onChange={handleInputChange}
                placeholder="Contoh: Hewan terlihat sehat dan aktif"
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder-gray-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">Catatan tambahan (tidak wajib)</p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 font-semibold mb-2">ℹ️ Informasi Penting</p>
              <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                <li>Update bobot hanya boleh 1 kali per bulan per hewan</li>
                <li>Data bobot akan disimpan sebagai riwayat</li>
                <li>Hewan dengan status MATI atau TERJUAL tidak dapat diupdate</li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Link
                to="/pilih-jenis"
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold text-center"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Simpan Update
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
