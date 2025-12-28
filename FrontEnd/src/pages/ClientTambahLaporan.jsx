import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import client from '../api/client';
import { 
  ArrowRight, ArrowLeft, Plus, CheckCircle,
  Droplet, Home, Heart, TrendingUp, Baby, ShoppingCart, Sprout
} from 'lucide-react';

const JENIS_LAPORAN_LIST = [
  { 
    id: 'pakan', 
    label: 'Pakan', 
    icon: Droplet,
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
    description: 'Catat jenis pakan, jumlah, dan biaya'
  },
  { 
    id: 'kandang', 
    label: 'Kandang', 
    icon: Home,
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-50 border-amber-200',
    description: 'Catat kondisi kandang dan kebersihan'
  },
  { 
    id: 'kesehatan', 
    label: 'Kesehatan', 
    icon: Heart,
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-50 border-red-200',
    description: 'Catat vaksinasi, obat, dan status kesehatan'
  },
  { 
    id: 'populasi', 
    label: 'Populasi', 
    icon: TrendingUp,
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50 border-green-200',
    description: 'Catat jumlah ternak berdasarkan kategori'
  },
  { 
    id: 'kelahiran', 
    label: 'Kelahiran', 
    icon: Baby,
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-50 border-pink-200',
    description: 'Catat kelahiran anak dengan jenis kelamin'
  },
  { 
    id: 'penjualan', 
    label: 'Penjualan', 
    icon: ShoppingCart,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    description: 'Catat penjualan ternak dan pembeli'
  },
  { 
    id: 'pengembangan', 
    label: 'Pengembangan', 
    icon: Sprout,
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50 border-emerald-200',
    description: 'Catat kegiatan pengembangan dan pelatihan'
  },
];

export default function ClientPilihJenisLaporan() {
  const navigate = useNavigate();
  useAuth();
  const [step, setStep] = useState('select'); // 'select' or 'form'
  const [selectedJenis, setSelectedJenis] = useState(null);
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    data: {}
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Get today's date as max
  const today = new Date().toISOString().split('T')[0];

  const handleSelectJenis = (jenisId) => {
    setSelectedJenis(jenisId);
    setFormData({
      tanggal: new Date().toISOString().split('T')[0],
      data: {}
    });
    setError(null);
    setStep('form');
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      data: { ...prev.data, [field]: value }
    }));
  };

  const handleDateChange = (e) => {
    setFormData(prev => ({
      ...prev,
      tanggal: e.target.value
    }));
  };

  const validateForm = () => {
    if (!formData.tanggal) {
      setError('Tanggal laporan wajib diisi');
      return false;
    }

    // Validate based on jenis
    switch (selectedJenis) {
      case 'pakan':
        if (!formData.data.jenis_pakan) {
          setError('Jenis pakan wajib diisi');
          return false;
        }
        if (!formData.data.jumlah_kg) {
          setError('Jumlah pakan wajib diisi');
          return false;
        }
        break;
      case 'kandang':
        if (!formData.data.kondisi_kandang) {
          setError('Kondisi kandang wajib diisi');
          return false;
        }
        break;
      case 'kesehatan':
        if (!formData.data.status_kesehatan) {
          setError('Status kesehatan wajib diisi');
          return false;
        }
        break;
      case 'populasi':
        if (!formData.data.total_induk && !formData.data.total_pejantan) {
          setError('Minimal isi satu data populasi');
          return false;
        }
        break;
      case 'kelahiran':
        if (!formData.data.tanggal_kelahiran) {
          setError('Tanggal kelahiran wajib diisi');
          return false;
        }
        break;
      case 'penjualan':
        if (!formData.data.jumlah_ternak || !formData.data.harga_satuan) {
          setError('Jumlah dan harga penjualan wajib diisi');
          return false;
        }
        break;
      case 'pengembangan':
        if (!formData.data.jenis_kegiatan) {
          setError('Jenis kegiatan wajib diisi');
          return false;
        }
        break;
      default:
        break;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload = {
        jenis: selectedJenis,
        data: formData.data,
        tanggal: formData.tanggal
      };

      const res = await client.post('/api/laporan', payload);

      if (res.data?.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/klg-laporan');
        }, 1500);
      } else {
        setError(res.data?.message || 'Gagal menyimpan laporan');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const selectedConfig = JENIS_LAPORAN_LIST.find(j => j.id === selectedJenis);
  const Icon = selectedConfig?.icon || Plus;

  return (
    <div className="space-y-6 pt-8 sm:pt-12">
      {/* Header */}
      <div className={`rounded-lg sm:rounded-2xl p-6 sm:p-8 text-white shadow-lg bg-gradient-to-r ${
        selectedConfig?.color || 'from-emerald-600 to-emerald-500'
      }`}>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
          {step === 'select' ? 'Tambah Laporan Baru' : `Form ${selectedConfig?.label || ''}`}
        </h1>
        <p className="text-white/80 text-sm sm:text-base">
          {step === 'select' 
            ? 'Pilih jenis laporan yang ingin Anda buat'
            : selectedConfig?.description || ''}
        </p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle size={20} />
          Laporan berhasil disimpan! Mengalihkan...
        </div>
      )}

      {/* STEP 1: Select Jenis */}
      {step === 'select' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {JENIS_LAPORAN_LIST.map((jenis) => {
            const JenisIcon = jenis.icon;
            return (
              <button
                key={jenis.id}
                onClick={() => handleSelectJenis(jenis.id)}
                className={`p-6 rounded-lg border-2 transition-all text-left hover:shadow-lg hover:scale-105 ${jenis.bgColor}`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${jenis.color} text-white`}>
                    <JenisIcon size={24} />
                  </div>
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-1">{jenis.label}</h3>
                <p className="text-sm text-gray-700">{jenis.description}</p>
                <div className="mt-4 flex items-center gap-2 text-gray-700 font-medium text-sm">
                  Buat Laporan <ArrowRight size={16} />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* STEP 2: Form */}
      {step === 'form' && selectedConfig && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className={`bg-gradient-to-r ${selectedConfig.color} text-white p-6`}>
            <div className="flex items-center gap-3">
              <Icon size={28} />
              <h2 className="text-2xl font-bold">{selectedConfig.label}</h2>
            </div>
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
                onChange={handleDateChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* PAKAN Form */}
            {selectedJenis === 'pakan' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Jenis Pakan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Rumput kering, Jagung, Dedak"
                    value={formData.data.jenis_pakan || ''}
                    onChange={(e) => handleFormChange('jenis_pakan', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Jumlah (kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0.00"
                    value={formData.data.jumlah_kg || ''}
                    onChange={(e) => handleFormChange('jumlah_kg', parseFloat(e.target.value) || '')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Harga Satuan
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.data.harga_satuan || ''}
                    onChange={(e) => handleFormChange('harga_satuan', parseInt(e.target.value) || '')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Keterangan
                  </label>
                  <textarea
                    placeholder="Catatan tambahan tentang pakan..."
                    value={formData.data.keterangan || ''}
                    onChange={(e) => handleFormChange('keterangan', e.target.value)}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </>
            )}

            {/* KANDANG Form */}
            {selectedJenis === 'kandang' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Kondisi Kandang <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.data.kondisi_kandang || ''}
                    onChange={(e) => handleFormChange('kondisi_kandang', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  >
                    <option value="">Pilih Kondisi</option>
                    <option value="baik">Baik</option>
                    <option value="sedang">Sedang</option>
                    <option value="buruk">Buruk</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Luas Kandang (m²)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.data.luas_kandang_m2 || ''}
                    onChange={(e) => handleFormChange('luas_kandang_m2', parseFloat(e.target.value) || '')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Kebersihan
                  </label>
                  <select
                    value={formData.data.kebersihan || ''}
                    onChange={(e) => handleFormChange('kebersihan', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Pilih Level</option>
                    <option value="baik">Baik</option>
                    <option value="sedang">Sedang</option>
                    <option value="buruk">Buruk</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Keterangan
                  </label>
                  <textarea
                    placeholder="Catatan tentang kandang..."
                    value={formData.data.keterangan || ''}
                    onChange={(e) => handleFormChange('keterangan', e.target.value)}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </>
            )}

            {/* KESEHATAN Form */}
            {selectedJenis === 'kesehatan' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Status Kesehatan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.data.status_kesehatan || ''}
                    onChange={(e) => handleFormChange('status_kesehatan', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  >
                    <option value="">Pilih Status</option>
                    <option value="sehat">Sehat</option>
                    <option value="sakit_ringan">Sakit Ringan</option>
                    <option value="sakit_berat">Sakit Berat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Jumlah Ternak Sakit
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.data.ternak_sakit || ''}
                    onChange={(e) => handleFormChange('ternak_sakit', parseInt(e.target.value) || '')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Vaksinasi Diberikan
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., ND, AIPV"
                    value={formData.data.vaksinasi_diberikan || ''}
                    onChange={(e) => handleFormChange('vaksinasi_diberikan', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Obat Diberikan
                  </label>
                  <input
                    type="text"
                    placeholder="Nama obat..."
                    value={formData.data.obat_diberikan || ''}
                    onChange={(e) => handleFormChange('obat_diberikan', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </>
            )}

            {/* POPULASI Form */}
            {selectedJenis === 'populasi' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Total Induk
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.data.total_induk || ''}
                      onChange={(e) => handleFormChange('total_induk', parseInt(e.target.value) || '')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Total Pejantan
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.data.total_pejantan || ''}
                      onChange={(e) => handleFormChange('total_pejantan', parseInt(e.target.value) || '')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Anakan Jantan
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.data.total_anakan_jantan || ''}
                      onChange={(e) => handleFormChange('total_anakan_jantan', parseInt(e.target.value) || '')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Anakan Betina
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.data.total_anakan_betina || ''}
                      onChange={(e) => handleFormChange('total_anakan_betina', parseInt(e.target.value) || '')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </>
            )}

            {/* KELAHIRAN Form */}
            {selectedJenis === 'kelahiran' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Tanggal Kelahiran <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    max={today}
                    value={formData.data.tanggal_kelahiran || ''}
                    onChange={(e) => handleFormChange('tanggal_kelahiran', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Induk ID/Nama
                  </label>
                  <input
                    type="text"
                    placeholder="Nomor atau nama induk"
                    value={formData.data.induk_id || ''}
                    onChange={(e) => handleFormChange('induk_id', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Jenis Kelamin Anak
                  </label>
                  <select
                    value={formData.data.jenis_kelamin_anak || ''}
                    onChange={(e) => handleFormChange('jenis_kelamin_anak', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="">Pilih</option>
                    <option value="jantan">Jantan</option>
                    <option value="betina">Betina</option>
                    <option value="keduanya">Keduanya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Jumlah Anak
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.data.jumlah_anak || ''}
                    onChange={(e) => handleFormChange('jumlah_anak', parseInt(e.target.value) || '')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </>
            )}

            {/* PENJUALAN Form */}
            {selectedJenis === 'penjualan' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Jumlah Ternak <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.data.jumlah_ternak || ''}
                    onChange={(e) => handleFormChange('jumlah_ternak', parseInt(e.target.value) || '')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Harga Satuan (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.data.harga_satuan || ''}
                    onChange={(e) => handleFormChange('harga_satuan', parseInt(e.target.value) || '')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Pembeli
                  </label>
                  <input
                    type="text"
                    placeholder="Nama pembeli..."
                    value={formData.data.pembeli || ''}
                    onChange={(e) => handleFormChange('pembeli', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {/* PENGEMBANGAN Form */}
            {selectedJenis === 'pengembangan' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Jenis Kegiatan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.data.jenis_kegiatan || ''}
                    onChange={(e) => handleFormChange('jenis_kegiatan', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="">Pilih Jenis</option>
                    <option value="pelatihan">Pelatihan</option>
                    <option value="pertemuan">Pertemuan</option>
                    <option value="sosialisasi">Sosialisasi</option>
                    <option value="pendampingan">Pendampingan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Deskripsi Kegiatan
                  </label>
                  <textarea
                    placeholder="Jelaskan kegiatan..."
                    value={formData.data.deskripsi_kegiatan || ''}
                    onChange={(e) => handleFormChange('deskripsi_kegiatan', e.target.value)}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Jumlah Peserta
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.data.peserta || ''}
                    onChange={(e) => handleFormChange('peserta', parseInt(e.target.value) || '')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </>
            )}
          </div>

          {/* Buttons */}
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 sm:py-6 flex gap-3 sm:gap-4 flex-col sm:flex-row">
            <button
              type="button"
              onClick={() => setStep('select')}
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
      )}
    </div>
  );
}
