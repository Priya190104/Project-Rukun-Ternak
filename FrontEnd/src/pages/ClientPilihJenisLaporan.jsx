import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { createReport } from '../services/reportService';
import { ArrowRight, Heart, Skull, Gift, BarChart3, ArrowLeft } from 'lucide-react';
import client from '../api/client';

const JENIS_LAPORAN = [
  { 
    id: 'Kelahiran', 
    label: 'Laporan Kelahiran', 
    icon: Heart, 
    color: 'bg-green-100 text-green-700 border-green-300',
    description: 'Catat kelahiran anak domba baru dengan data indukan dan kondisi'
  },
  { 
    id: 'Kematian', 
    label: 'Laporan Kematian', 
    icon: Skull, 
    color: 'bg-red-100 text-red-700 border-red-300',
    description: 'Catat kematian ternak beserta penyebab dan tindakan'
  },
  { 
    id: 'Penjualan', 
    label: 'Penjualan', 
    icon: Gift, 
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    description: 'Catat penjualan ternak (Aqiqah, Kurban, Retail)'
  },
  { 
    id: 'Budidaya', 
    label: 'Laporan Budidaya', 
    icon: BarChart3, 
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    description: 'Catat pakan, kandang, dan kesehatan ternak'
  },
];

export default function ClientPilihJenisLaporan() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState('pilih'); // 'pilih', 'budidaya-kategori', atau 'form'
  const [selectedJenis, setSelectedJenis] = useState(null);
  const [selectedSubJenis, setSelectedSubJenis] = useState(null); // For Penjualan sub-types
  const [selectedKategori, setSelectedKategori] = useState(null); // Untuk Budidaya
  const [form, setForm] = useState({ tanggal: '', data: {} });
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [kelompokData, setKelompokData] = useState(null);

  // Fetch kelompok data for header display
  useEffect(() => {
    if (user && user.kelompok_id) {
      (async () => {
        try {
          const res = await client.get(`/api/kelompok/${user.kelompok_id}`);
          if (res.data?.success) {
            setKelompokData(res.data.data);
          }
        } catch (err) {
          console.error('Failed to fetch kelompok data:', err);
        }
      })();
    }
  }, [user]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSelectJenis = (jenisId) => {
    setSelectedJenis(jenisId);
    if (jenisId === 'Budidaya') {
      setStep('budidaya-kategori');
    } else if (jenisId === 'Penjualan') {
      setStep('penjualan-subjenis');
    } else {
      setStep('form');
    }
    setForm({ tanggal: '', data: {} });
  };

  const handleSelectKategori = (kategoriId) => {
    setSelectedKategori(kategoriId);
    setStep('form');
  };

  const handleSelectSubJenis = (subJenisId) => {
    setSelectedSubJenis(subJenisId);
    setStep('form');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'tanggal') {
      setForm({ ...form, tanggal: value });
    } else {
      setForm({ ...form, data: { ...form.data, [name]: value } });
    }
  };

  const validateForm = () => {
    if (!form.tanggal) {
      showNotification('error', 'Tanggal wajib diisi');
      return false;
    }
    
    // Validate that date is not in the future
    const selectedDate = new Date(form.tanggal);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate > today) {
      showNotification('error', 'Tanggal tidak boleh melampaui hari ini');
      return false;
    }

    // Validate required fields for Kelahiran
    if (selectedJenis === 'Kelahiran') {
      const requiredFields = ['nama_anggota', 'register', 'id', 'jenis_kelamin', 'warna', 'ras', 'induk', 'pejantan', 'bobot'];
      for (const field of requiredFields) {
        if (!form.data[field] || form.data[field].toString().trim() === '') {
          const fieldLabels = {
            nama_anggota: 'Nama Anggota',
            register: 'Register',
            id: 'ID',
            jenis_kelamin: 'Jenis Kelamin',
            warna: 'Warna',
            ras: 'Ras',
            induk: 'Induk',
            pejantan: 'Pejantan',
            bobot: 'Bobot'
          };
          showNotification('error', `${fieldLabels[field]} wajib diisi`);
          return false;
        }
      }
      
      // Validate bobot is a positive number
      if (isNaN(parseFloat(form.data.bobot)) || parseFloat(form.data.bobot) <= 0) {
        showNotification('error', 'Bobot harus berupa angka positif');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      let dataToSend = { ...form.data };
      
      // Add kategori for Budidaya
      if (selectedKategori) {
        dataToSend.kategori = selectedKategori;
      }
      
      // Add sub jenis for Penjualan
      if (selectedSubJenis) {
        dataToSend.jenis_penjualan = selectedSubJenis;
      }
      
      const payload = { 
        tanggal: form.tanggal, 
        jenis: selectedJenis, 
        data: dataToSend
      };
      
      const created = await createReport(payload);
      
      if (created && created.id) {
        showNotification('success', 'Laporan berhasil disimpan!');
        setTimeout(() => {
          navigate(`/laporan/${created.id}`);
        }, 1500);
      } else {
        showNotification('error', 'Gagal menyimpan laporan. Silakan coba lagi.');
      }
    } catch (err) {
      console.error('Form submission error:', err);
      showNotification('error', 'Terjadi kesalahan: ' + (err.message || 'Gagal menyimpan laporan'));
    } finally {
      setSaving(false);
    }
  };

  // STEP 1: Pilih Jenis
  if (step === 'pilih') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-12 px-4 sm:px-6 lg:px-8">
        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 left-4 sm:left-auto sm:w-96 p-4 rounded-lg shadow-lg text-white z-50 ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {notification.message}
          </div>
        )}

        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Buat Laporan Baru</h1>
            <p className="text-gray-600">Pilih jenis laporan</p>
          </div>

          {/* Jenis Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {JENIS_LAPORAN.map((jenis) => {
              const Icon = jenis.icon;
              return (
                <button
                  key={jenis.id}
                  onClick={() => handleSelectJenis(jenis.id)}
                  className={`p-6 sm:p-8 rounded-xl border-2 transition-all duration-200 hover:shadow-xl hover:scale-105 text-left ${jenis.color}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-white bg-opacity-40 flex items-center justify-center">
                      <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2">{jenis.label}</h3>
                  <p className="text-xs sm:text-sm opacity-80 mb-4">{jenis.description}</p>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    Buat Laporan <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // STEP 1.4: Pilih Sub Jenis Penjualan
  if (step === 'penjualan-subjenis') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setStep('pilih')}
            className="mb-8 flex items-center gap-2 px-4 py-2 text-emerald-700 hover:bg-emerald-100 rounded-lg transition font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Pilih Jenis Penjualan</h2>
            <p className="text-gray-600 mt-2">Pilih kategori penjualan ternak</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <button
              onClick={() => handleSelectSubJenis('Aqiqah')}
              className="p-8 rounded-xl border-2 border-yellow-300 bg-yellow-100 text-yellow-700 transition-all duration-200 hover:shadow-lg hover:scale-105 text-center"
            >
              <div className="text-4xl mb-3">🎁</div>
              <h3 className="text-xl font-bold">Aqiqah</h3>
            </button>
            <button
              onClick={() => handleSelectSubJenis('Kurban')}
              className="p-8 rounded-xl border-2 border-yellow-300 bg-yellow-100 text-yellow-700 transition-all duration-200 hover:shadow-lg hover:scale-105 text-center"
            >
              <div className="text-4xl mb-3">🕌</div>
              <h3 className="text-xl font-bold">Kurban</h3>
            </button>
            <button
              onClick={() => handleSelectSubJenis('Retail')}
              className="p-8 rounded-xl border-2 border-yellow-300 bg-yellow-100 text-yellow-700 transition-all duration-200 hover:shadow-lg hover:scale-105 text-center"
            >
              <div className="text-4xl mb-3">🛒</div>
              <h3 className="text-xl font-bold">Retail</h3>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 1.5: Pilih Kategori Budidaya
  if (step === 'budidaya-kategori') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => setStep('pilih')}
            className="mb-6 flex items-center gap-2 text-emerald-700 hover:text-emerald-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Kembali</span>
          </button>

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Laporan Budidaya</h1>
            <p className="text-gray-600">Pilih kategori</p>
          </div>

          {/* Kategori Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <button
              onClick={() => handleSelectKategori('Pakan')}
              className="p-8 rounded-xl border-2 border-green-300 bg-green-100 text-green-700 transition-all duration-200 hover:shadow-lg hover:scale-105 text-center"
            >
              <div className="text-4xl mb-3">🌾</div>
              <h3 className="text-xl font-bold">Pakan</h3>
            </button>
            <button
              onClick={() => handleSelectKategori('Kandang')}
              className="p-8 rounded-xl border-2 border-blue-300 bg-blue-100 text-blue-700 transition-all duration-200 hover:shadow-lg hover:scale-105 text-center"
            >
              <div className="text-4xl mb-3">🏠</div>
              <h3 className="text-xl font-bold">Kandang</h3>
            </button>
            <button
              onClick={() => handleSelectKategori('Kesehatan')}
              className="p-8 rounded-xl border-2 border-red-300 bg-red-100 text-red-700 transition-all duration-200 hover:shadow-lg hover:scale-105 text-center"
            >
              <div className="text-4xl mb-3">❤️</div>
              <h3 className="text-xl font-bold">Kesehatan</h3>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: Form sesuai jenis
  const getFormTitle = () => {
    if (selectedJenis === 'Kelahiran') return 'Laporan Kelahiran';
    if (selectedJenis === 'Kematian') return 'Laporan Kematian';
    if (selectedJenis === 'Penjualan') return selectedSubJenis ? `Penjualan - ${selectedSubJenis}` : 'Penjualan';
    return `Laporan Budidaya - ${selectedKategori}`;
  };

  const getBackHandler = () => {
    if (selectedJenis === 'Budidaya') {
      return () => setStep('budidaya-kategori');
    }
    return () => setStep('pilih');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 left-4 sm:left-auto sm:w-96 p-4 rounded-lg shadow-lg text-white z-50 ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {notification.message}
        </div>
      )}
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={getBackHandler()}
          className="mb-6 flex items-center gap-2 text-emerald-700 hover:text-emerald-900 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Kembali</span>
        </button>

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{getFormTitle()}</h2>
          <p className="text-gray-600 mb-6">
            {selectedJenis === 'Kelahiran' && 'Form Data Kelahiran'}
            {selectedJenis === 'Kematian' && 'Form Data Kematian'}
            {selectedJenis === 'Kurban-Aqiqah' && 'Form Data Siap Kurban/Aqiqah'}
            {selectedJenis === 'Budidaya' && `Form Laporan ${selectedKategori}`}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tanggal (Universal) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {selectedJenis === 'Kelahiran' ? 'Tanggal Kelahiran' : 
                 selectedJenis === 'Kematian' ? 'Tanggal Kematian' :
                 selectedJenis === 'Kurban-Aqiqah' ? 'Tanggal Pencatatan' : 
                 'Tanggal'} *
              </label>
              <input
                type="date"
                name="tanggal"
                value={form.tanggal}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Tanggal tidak boleh melampaui hari ini</p>
            </div>

            {/* Form Kelahiran */}
            {selectedJenis === 'Kelahiran' && (
              <>
                {/* Header Information */}
                {kelompokData && (
                  <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4 sm:p-6 mb-6">
                    <h3 className="text-lg font-semibold text-emerald-900 mb-4">Informasi Kelompok</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-emerald-700 font-medium">Nama Kelompok</p>
                        <p className="text-gray-900 font-semibold mt-1">{kelompokData.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-emerald-700 font-medium">Alamat</p>
                        <p className="text-gray-900 font-semibold mt-1">{kelompokData.desa || kelompokData.kecamatan || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-emerald-700 font-medium">Ketua Kelompok</p>
                        <p className="text-gray-900 font-semibold mt-1">{kelompokData.pic1_nama || '-'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Catatan Kelahiran Fields */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Catatan Kelahiran</h3>
                </div>

                {/* Row 1: Nama Anggota, Register, ID */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Anggota *</label>
                    <input
                      type="text"
                      name="nama_anggota"
                      value={form.data.nama_anggota || ''}
                      onChange={handleChange}
                      placeholder="Nama anggota"
                      required
                      className="w-full px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Register *</label>
                    <input
                      type="text"
                      name="register"
                      value={form.data.register || ''}
                      onChange={handleChange}
                      placeholder="Register"
                      required
                      className="w-full px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ID *</label>
                    <input
                      type="text"
                      name="id"
                      value={form.data.id || ''}
                      onChange={handleChange}
                      placeholder="ID"
                      required
                      className="w-full px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Row 2: Jenis Kelamin, Warna, Ras */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Jenis Kelamin *</label>
                    <select
                      name="jenis_kelamin"
                      value={form.data.jenis_kelamin || ''}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="">Pilih</option>
                      <option value="Jantan">Jantan</option>
                      <option value="Betina">Betina</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Warna *</label>
                    <input
                      type="text"
                      name="warna"
                      value={form.data.warna || ''}
                      onChange={handleChange}
                      placeholder="Warna"
                      required
                      className="w-full px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ras *</label>
                    <input
                      type="text"
                      name="ras"
                      value={form.data.ras || ''}
                      onChange={handleChange}
                      placeholder="Ras"
                      required
                      className="w-full px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Row 3: Induk, Pejantan, Bobot */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Induk *</label>
                    <input
                      type="text"
                      name="induk"
                      value={form.data.induk || ''}
                      onChange={handleChange}
                      placeholder="Induk"
                      required
                      className="w-full px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pejantan *</label>
                    <input
                      type="text"
                      name="pejantan"
                      value={form.data.pejantan || ''}
                      onChange={handleChange}
                      placeholder="Pejantan"
                      required
                      className="w-full px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bobot (kg) *</label>
                    <input
                      type="number"
                      step="0.1"
                      name="bobot"
                      value={form.data.bobot || ''}
                      onChange={handleChange}
                      placeholder="Bobot"
                      required
                      className="w-full px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Form Kematian */}
            {selectedJenis === 'Kematian' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor Ternak *</label>
                    <input
                      type="text"
                      name="nomor_ternak"
                      value={form.data.nomor_ternak || ''}
                      onChange={handleChange}
                      placeholder="Masukkan nomor identitas ternak"
                      required
                      className="w-full px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Penyebab Kematian *</label>
                    <select
                      name="penyebab"
                      value={form.data.penyebab || ''}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="">Pilih penyebab</option>
                      <option value="Penyakit">Penyakit</option>
                      <option value="Kelaparan">Kelaparan</option>
                      <option value="Kecelakaan">Kecelakaan</option>
                      <option value="Umur">Umur</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Detail Penyebab</label>
                  <textarea
                    name="detail_penyebab"
                    value={form.data.detail_penyebab || ''}
                    onChange={handleChange}
                    placeholder="Jelaskan detail penyebab..."
                    rows={3}
                    className="w-full px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tindakan yang Diambil</label>
                  <textarea
                    name="tindakan"
                    value={form.data.tindakan || ''}
                    onChange={handleChange}
                    placeholder="Tindakan atau pencegahan yang diambil..."
                    rows={3}
                    className="w-full px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Catatan Tambahan</label>
                  <textarea
                    name="catatan"
                    value={form.data.catatan || ''}
                    onChange={handleChange}
                    placeholder="Catatan tambahan..."
                    rows={2}
                    className="w-full px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none resize-none"
                  />
                </div>
              </>
            )}

            {/* Form Penjualan */}
            {selectedJenis === 'Penjualan' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Jenis Penjualan</label>
                  <input
                    type="text"
                    name="jenis_penjualan"
                    value={selectedSubJenis || ''}
                    disabled
                    className="w-full px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor Ternak *</label>
                    <input
                      type="text"
                      name="nomor_ternak"
                      value={form.data.nomor_ternak || ''}
                      onChange={handleChange}
                      placeholder="Masukkan nomor identitas ternak"
                      required
                      className="w-full px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Umur (Bulan) *</label>
                    <input
                      type="number"
                      name="umur"
                      value={form.data.umur || ''}
                      onChange={handleChange}
                      placeholder="Umur"
                      required
                      className="w-full px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bobot (kg) *</label>
                    <input
                      type="number"
                      step="0.1"
                      name="bobot"
                      value={form.data.bobot || ''}
                      onChange={handleChange}
                      placeholder="Bobot"
                      required
                      className="w-full px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Jenis Kelamin *</label>
                    <select
                      name="jenis_kelamin"
                      value={form.data.jenis_kelamin || ''}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="">Pilih</option>
                      <option value="Jantan">Jantan</option>
                      <option value="Betina">Betina</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Kondisi Kesehatan *</label>
                  <select
                    name="kondisi_kesehatan"
                    value={form.data.kondisi_kesehatan || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">Pilih</option>
                    <option value="Sehat">Sehat</option>
                    <option value="Cacat Minor">Cacat Minor</option>
                    <option value="Tidak Layak">Tidak Layak</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status Kesiapan *</label>
                  <select
                    name="status_siap"
                    value={form.data.status_siap || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">Pilih</option>
                    <option value="Siap">Siap</option>
                    <option value="Persiapan">Persiapan</option>
                    <option value="Belum Siap">Belum Siap</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Catatan Tambahan</label>
                  <textarea
                    name="catatan"
                    value={form.data.catatan || ''}
                    onChange={handleChange}
                    placeholder="Catatan tambahan..."
                    rows={3}
                    className="w-full px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none resize-none"
                  />
                </div>
              </>
            )}

            {/* Form Budidaya - Pakan */}
            {selectedJenis === 'Budidaya' && selectedKategori === 'Pakan' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Jenis Pakan *</label>
                  <input
                    type="text"
                    name="jenis_pakan"
                    value={form.data.jenis_pakan || ''}
                    onChange={handleChange}
                    placeholder="Jenis pakan"
                    required
                    className="w-full px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Jumlah (kg) *</label>
                    <input
                      type="number"
                      step="0.1"
                      name="jumlah"
                      value={form.data.jumlah || ''}
                      onChange={handleChange}
                      placeholder="Jumlah"
                      required
                      className="w-full px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sumber Pakan *</label>
                    <input
                      type="text"
                      name="sumber_pakan"
                      value={form.data.sumber_pakan || ''}
                      onChange={handleChange}
                      placeholder="Sumber pakan"
                      required
                      className="w-full px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Catatan</label>
                  <textarea
                    name="catatan"
                    value={form.data.catatan || ''}
                    onChange={handleChange}
                    placeholder="Catatan tambahan..."
                    rows={3}
                    className="w-full px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none resize-none"
                  />
                </div>
              </>
            )}

            {/* Form Budidaya - Kandang */}
            {selectedJenis === 'Budidaya' && selectedKategori === 'Kandang' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Kondisi Kandang *</label>
                    <select
                      name="kondisi_kandang"
                      value={form.data.kondisi_kandang || ''}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="">Pilih</option>
                      <option value="Baik">Baik</option>
                      <option value="Perlu Perbaikan">Perlu Perbaikan</option>
                      <option value="Buruk">Buruk</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Kebersihan *</label>
                    <select
                      name="kebersihan"
                      value={form.data.kebersihan || ''}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="">Pilih</option>
                      <option value="Bersih">Bersih</option>
                      <option value="Cukup">Cukup</option>
                      <option value="Kotor">Kotor</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Kapasitas (ekor) *</label>
                    <input
                      type="number"
                      name="kapasitas"
                      value={form.data.kapasitas || ''}
                      onChange={handleChange}
                      placeholder="Kapasitas"
                      required
                      className="w-full px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Jumlah Ternak *</label>
                    <input
                      type="number"
                      name="jumlah_ternak"
                      value={form.data.jumlah_ternak || ''}
                      onChange={handleChange}
                      placeholder="Jumlah"
                      required
                      className="w-full px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Catatan</label>
                  <textarea
                    name="catatan"
                    value={form.data.catatan || ''}
                    onChange={handleChange}
                    placeholder="Catatan tambahan..."
                    rows={3}
                    className="w-full px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none resize-none"
                  />
                </div>
              </>
            )}

            {/* Form Budidaya - Kesehatan */}
            {selectedJenis === 'Budidaya' && selectedKategori === 'Kesehatan' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Kondisi Kesehatan *</label>
                    <select
                      name="kondisi_kesehatan"
                      value={form.data.kondisi_kesehatan || ''}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="">Pilih</option>
                      <option value="Sehat">Sehat</option>
                      <option value="Ada yang Sakit">Ada yang Sakit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Program Vaksinasi *</label>
                    <input
                      type="text"
                      name="program_vaksinasi"
                      value={form.data.program_vaksinasi || ''}
                      onChange={handleChange}
                      placeholder="Program vaksinasi"
                      required
                      className="w-full px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Penyakit yang Ditemukan *</label>
                  <input
                    type="text"
                    name="penyakit"
                    value={form.data.penyakit || ''}
                    onChange={handleChange}
                    placeholder="Penyakit (jika ada)"
                    required
                    className="w-full px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tindakan Pengobatan</label>
                  <textarea
                    name="tindakan_pengobatan"
                    value={form.data.tindakan_pengobatan || ''}
                    onChange={handleChange}
                    placeholder="Tindakan pengobatan yang dilakukan..."
                    rows={3}
                    className="w-full px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Catatan</label>
                  <textarea
                    name="catatan"
                    value={form.data.catatan || ''}
                    onChange={handleChange}
                    placeholder="Catatan tambahan..."
                    rows={2}
                    className="w-full px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none resize-none"
                  />
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={getBackHandler()}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                {selectedJenis === 'Budidaya' ? 'Ganti' : 'Batal'}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-emerald-600 rounded-lg font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan Laporan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
