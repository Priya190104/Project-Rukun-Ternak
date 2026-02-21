import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AdminPageHeader from '../components/admin/AdminPageHeader';
import client from '../api/client';
import { useCachedData, useInvalidateCache } from '../hooks/useCachedData';
import { ArrowRight } from 'lucide-react';

// Import form components
import FormPakan from '../components/laporan-forms/FormPakan';
import FormKandang from '../components/laporan-forms/FormKandang';
import FormKesehatan from '../components/laporan-forms/FormKesehatan';
import FormKelahiran from '../components/laporan-forms/FormKelahiran';
import FormPenjualan from '../components/laporan-forms/FormPenjualan';

const JENIS_LAPORAN_LIST = [
  { 
    id: 'pakan', 
    label: 'Pakan', 
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
    description: 'Catat jenis pakan dan sumbernya'
  },
  { 
    id: 'kandang', 
    label: 'Kandang', 
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-warning-50 border-warning-100',
    description: 'Catat perkembangan kandang'
  },
  { 
    id: 'kesehatan', 
    label: 'Kesehatan', 
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-danger-50 border-danger-100',
    description: 'Catat vaksinasi, obat, dan status kesehatan'
  },
  { 
    id: 'kelahiran', 
    label: 'Kelahiran', 
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-50 border-pink-200',
    description: 'Catat kelahiran anak dengan jenis kelamin'
  },
  { 
    id: 'penjualan', 
    label: 'Penjualan', 
    color: 'from-primary-500 to-primary-600',
    bgColor: 'bg-primary-50 border-primary-200',
    description: 'Catat penjualan ternak dan pembeli'
  },
  { 
    id: 'pengolahan_pupuk', 
    label: 'Pengolahan Pupuk', 
    color: 'from-primary-500 to-primary-600',
    bgColor: 'bg-primary-50 border-primary-200',
    description: 'Catat pengolahan dan penjualan pupuk',
    isPlaceholder: true
  },
];

export default function ClientPilihJenisLaporan() {
  const navigate = useNavigate();
  useAuth();
  const invalidate = useInvalidateCache();
  
  // Fetch hewan candidates dengan caching (15 menit TTL)
  const { data: cachedPejantanCandidates, loading: loadingPejantanCache } = useCachedData(
    '/api/candidates/pejantan',
    ['/api/candidates/pejantan'],
    { ttl: 15 * 60 * 1000 }
  );
  
  const { data: cachedIndukCandidates, loading: loadingIndukCache } = useCachedData(
    '/api/candidates/induk',
    ['/api/candidates/induk'],
    { ttl: 15 * 60 * 1000 }
  );
  
  // Fetch hewan ternak dengan caching (5 menit TTL)
  const { data: cachedHewanTernak, loading: loadingHewanCache } = useCachedData(
    '/api/hewan',
    ['/api/hewan'],
    { ttl: 5 * 60 * 1000 }
  );
  
  const { data: cachedHewanAktif, loading: loadingHewanAktifCache } = useCachedData(
    '/api/hewan-aktif',
    ['/api/hewan-aktif'],
    { ttl: 5 * 60 * 1000 }
  );
  
  const [step, setStep] = useState('select'); // 'select' or 'form'
  const [selectedJenis, setSelectedJenis] = useState(null);
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    data: {}
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // State untuk dropdown candidates
  const [pejantanCandidates, setPejantanCandidates] = useState([]);
  const [indukCandidates, setIndukCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [hewanTernakList, setHewanTernakList] = useState([]);
  const [loadingHewanTernak, setLoadingHewanTernak] = useState(false);
  const [showPupukModal, setShowPupukModal] = useState(false);
  const [duplicateIDModal, setDuplicateIDModal] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  // State untuk penjualan candidates berdasarkan jenis hewan
  const [penjualanCandidates, setPenjualanCandidates] = useState({
    'Pejantan': [],
    'Indukan': [],
    'Calon Indukan': [],
    'Calon Pejantan': [],
    'Jantan Potong': [],
    'Betina Potong': []
  });
  const [loadingPenjualanCandidates] = useState(false);

  // Get today's date as max
  const today = new Date().toISOString().split('T')[0];

  // Sync cached candidates data
  useEffect(() => {
    if (cachedPejantanCandidates) {
      const data = cachedPejantanCandidates?.data || cachedPejantanCandidates || [];
      setPejantanCandidates(Array.isArray(data) ? data : []);
    }
  }, [cachedPejantanCandidates]);

  useEffect(() => {
    if (cachedIndukCandidates) {
      const data = cachedIndukCandidates?.data || cachedIndukCandidates || [];
      setIndukCandidates(Array.isArray(data) ? data : []);
    }
  }, [cachedIndukCandidates]);

  // Sync hewan ternak data
  useEffect(() => {
    if (selectedJenis === 'kesehatan' && cachedHewanAktif) {
      const data = cachedHewanAktif?.data || cachedHewanAktif || [];
      setHewanTernakList(Array.isArray(data) ? data : []);
    } else if (selectedJenis === 'penjualan' && cachedHewanTernak) {
      const data = cachedHewanTernak?.data || cachedHewanTernak || [];
      const allHewan = Array.isArray(data) ? data : [];
      
      // Filter berdasarkan jenis hewan penjualan
      const filtered = {
        'Pejantan': allHewan.filter(h => h.jenis_kelamin === 'JANTAN' && (h.umur_bulan || 0) > 11 && h.status === 'AKTIF'),
        'Indukan': allHewan.filter(h => h.jenis_kelamin === 'BETINA' && (h.umur_bulan || 0) > 11 && h.status === 'AKTIF'),
        'Calon Indukan': allHewan.filter(h => h.jenis_kelamin === 'BETINA' && (h.umur_bulan || 0) >= 8 && (h.umur_bulan || 0) <= 11 && h.status === 'AKTIF'),
        'Calon Pejantan': allHewan.filter(h => h.jenis_kelamin === 'JANTAN' && (h.umur_bulan || 0) >= 8 && (h.umur_bulan || 0) <= 11 && h.status === 'AKTIF'),
        'Jantan Potong': allHewan.filter(h => h.jenis_kelamin === 'JANTAN' && h.status === 'AKTIF'),
        'Betina Potong': allHewan.filter(h => h.jenis_kelamin === 'BETINA' && h.status === 'AKTIF')
      };
      setPenjualanCandidates(filtered);
      setHewanTernakList(allHewan);
    }
  }, [selectedJenis, cachedHewanTernak, cachedHewanAktif]);

  // Update loading states based on cached data
  useEffect(() => {
    setLoadingCandidates(loadingPejantanCache || loadingIndukCache);
  }, [loadingPejantanCache, loadingIndukCache]);

  useEffect(() => {
    if (selectedJenis === 'kesehatan') {
      setLoadingHewanTernak(loadingHewanAktifCache);
    } else if (selectedJenis === 'penjualan') {
      setLoadingHewanTernak(loadingHewanCache);
    }
  }, [selectedJenis, loadingHewanAktifCache, loadingHewanCache]);

  const fetchCandidates = useCallback(async () => {
    // Caching is now handled automatically by useCachedData hooks
    console.log('[ClientPilihJenisLaporan] Candidates loaded from cache');
  }, []);

  const fetchHewanTernak = useCallback(async () => {
    // Caching is now handled automatically by useCachedData hooks
    console.log('[ClientPilihJenisLaporan] Hewan ternak loaded from cache');
  }, []);

  const fetchPenjualanCandidates = useCallback(async () => {
    // Caching is now handled automatically by useCachedData hooks
    console.log('[ClientPilihJenisLaporan] Penjualan candidates loaded from cache');
  }, []);

  // Fetch candidates saat form kelahiran dibuka, dan fetch penjualan saat form penjualan dibuka
  useEffect(() => {
    if (selectedJenis === 'kelahiran') {
      fetchCandidates();
    }
    // Fetch hewan ternak saat form kesehatan dan penjualan dibuka
    if (selectedJenis === 'kesehatan' || selectedJenis === 'penjualan') {
      fetchHewanTernak();
      if (selectedJenis === 'penjualan') {
        fetchPenjualanCandidates();
      }
    }
  }, [selectedJenis, fetchCandidates, fetchHewanTernak, fetchPenjualanCandidates]);

  const handleSelectJenis = (jenisId) => {
    // Check if it's a placeholder feature
    if (jenisId === 'pengolahan_pupuk') {
      setShowPupukModal(true);
      return;
    }
    
    setSelectedJenis(jenisId);
    setFormData({
      tanggal: new Date().toISOString().split('T')[0],
      data: {}
    });
    setError(null);
    setStep('form');
  };

  const handleFormChange = (field, value) => {
    const newData = { ...formData.data, [field]: value };
    
    // Auto-clear jenis_tindakan and detail fields when status = 'mati'
    if (field === 'status_kesehatan_ternak' && value === 'mati') {
      newData.jenis_tindakan = null;
      newData.jenis_pencegahan = null;
      newData.jenis_pengobatan = null;
      newData.jenis_perawatan = null;
    }
    
    // Clear detail fields when jenis_tindakan changes to different value
    if (field === 'jenis_tindakan') {
      newData.jenis_pencegahan = null;
      newData.jenis_pengobatan = null;
      newData.jenis_perawatan = null;
    }
    
    setFormData(prev => ({
      ...prev,
      data: newData
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
        if (!formData.data.sumber) {
          setError('Sumber pakan wajib diisi');
          return false;
        }
        break;
      case 'kandang':
        if (!formData.data.pengembangan_kandang) {
          setError('Pengembangan kandang wajib diisi');
          return false;
        }
        if (formData.data.pengembangan_kandang > 0) {
          // Check if all luas kandang are filled
          if (!formData.data.luas_kandang_list || formData.data.luas_kandang_list.length !== formData.data.pengembangan_kandang) {
            setError('Semua luas kandang harus diisi');
            return false;
          }
          // Check if any value is empty
          for (let i = 0; i < formData.data.luas_kandang_list.length; i++) {
            if (!formData.data.luas_kandang_list[i] || formData.data.luas_kandang_list[i] === '') {
              setError(`Luas kandang ${i + 1} harus diisi`);
              return false;
            }
          }
        }
        break;
      case 'kesehatan':
        if (!formData.data.id_ternak) {
          setError('ID Ternak wajib diisi');
          return false;
        }
        if (!formData.data.status_kesehatan_ternak) {
          setError('Status kesehatan ternak wajib diisi');
          return false;
        }
        // Jika status bukan "mati", jenis_tindakan wajib diisi
        if (formData.data.status_kesehatan_ternak !== 'mati' && !formData.data.jenis_tindakan) {
          setError('Jenis tindakan wajib diisi');
          return false;
        }
        break;
      case 'kelahiran':
        if (!formData.data.tanggal_kelahiran) {
          setError('Tanggal kelahiran wajib diisi');
          return false;
        }
        if (!formData.data.jenis_kelamin_anak) {
          setError('Jenis kelamin anak wajib diisi');
          return false;
        }
        if (!formData.data.pejantan_id) {
          setError('Pejantan wajib dipilih');
          return false;
        }
        if (!formData.data.induk_id) {
          setError('Induk wajib dipilih');
          return false;
        }
        break;
      case 'penjualan':
        if (!formData.data.jumlah_hewan) {
          setError('Jumlah hewan wajib diisi');
          return false;
        }
        // Validate setiap item penjualan
        const penjualanList = formData.data.penjualan_list || [];
        for (let i = 0; i < formData.data.jumlah_hewan; i++) {
          const item = penjualanList[i];
          if (!item || !item.jenis_penjualan) {
            setError(`Jenis penjualan untuk hewan #${i + 1} wajib diisi`);
            return false;
          }
          if (!item.jenis_hewan) {
            setError(`Jenis hewan untuk hewan #${i + 1} wajib diisi`);
            return false;
          }
          if (!item.id_hewan) {
            setError(`ID hewan untuk hewan #${i + 1} wajib diisi`);
            return false;
          }
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

    // Tampilkan konfirmasi dialog
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmation(false);

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
        // Invalidate cache for laporan
        invalidate('/api/laporan');
        
        // Trigger refetch for HewanTernakPage and other pages
        console.log('[ClientTambahLaporan] Laporan submitted successfully, triggering refetch event');
        localStorage.setItem('hewanDataRefetchTrigger', JSON.stringify({
          timestamp: Date.now(),
          jenis: selectedJenis,
          message: 'Laporan baru telah dibuat'
        }));
        
        setSuccess(true);
        setTimeout(() => {
          navigate('/klg-laporan');
        }, 1500);
      } else {
        // Handle specific error codes
        if (res.data?.error_code === 'DUPLICATE_ID_BISNIS') {
          const idBisnis = formData.data?.id || 'unknown';
          setDuplicateIDModal(idBisnis);
        } else {
          setError(res.data?.message || 'Gagal menyimpan laporan');
        }
      }
    } catch (err) {
      console.error('Submit error:', err);
      const errorMessage = err.response?.data?.message || 'Terjadi kesalahan saat menyimpan';
      const errorCode = err.response?.data?.error_code;
      
      // Handle specific error codes
      if (errorCode === 'DUPLICATE_ID_BISNIS') {
        const idBisnis = formData.data?.id || 'unknown';
        setDuplicateIDModal(idBisnis);
      } else {
        setError(errorMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  const selectedConfig = JENIS_LAPORAN_LIST.find(j => j.id === selectedJenis);

  return (
    <div className="space-y-8 pb-12">
      <AdminPageHeader
        title={step === 'select' ? 'Tambah Laporan Baru' : `Form ${selectedConfig?.label || ''}`}
        subtitle={step === 'select' 
            ? 'Pilih jenis laporan yang ingin Anda buat'
            : selectedConfig?.description || ''}
      />

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-danger-50 border border-danger-100 text-danger px-4 py-3 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="bg-primary-50 border border-primary-200 text-primary-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <span className="text-lg">✓</span>
          Laporan berhasil disimpan! Mengalihkan...
        </div>
      )}

      {/* STEP 1: Select Jenis */}
      {step === 'select' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {JENIS_LAPORAN_LIST.map((jenis) => {
            return (
              <button
                key={jenis.id}
                onClick={() => handleSelectJenis(jenis.id)}
                className={`p-6 rounded-lg border-2 transition-all text-left hover:shadow-lg hover:scale-105 ${jenis.bgColor}`}
              >
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

      {/* STEP 2: Form Components */}
      {step === 'form' && selectedConfig && (
        <>
          {selectedJenis === 'pakan' && (
            <FormPakan
              formData={formData}
              onFormChange={handleFormChange}
              onDateChange={handleDateChange}
              onSubmit={handleSubmit}
              onBack={() => setStep('select')}
              saving={saving}
              today={today}
              selectedConfig={selectedConfig}
            />
          )}

          {selectedJenis === 'kandang' && (
            <FormKandang
              formData={formData}
              onFormChange={handleFormChange}
              onDateChange={handleDateChange}
              onSubmit={handleSubmit}
              onBack={() => setStep('select')}
              saving={saving}
              today={today}
              selectedConfig={selectedConfig}
            />
          )}

          {selectedJenis === 'kesehatan' && (
            <FormKesehatan
              formData={formData}
              onFormChange={handleFormChange}
              onDateChange={handleDateChange}
              onSubmit={handleSubmit}
              onBack={() => setStep('select')}
              saving={saving}
              today={today}
              selectedConfig={selectedConfig}
              hewanTernakList={hewanTernakList}
              loadingHewanTernak={loadingHewanTernak}
            />
          )}

          {selectedJenis === 'kelahiran' && (
            <FormKelahiran
              formData={formData}
              onFormChange={handleFormChange}
              onDateChange={handleDateChange}
              onSubmit={handleSubmit}
              onBack={() => setStep('select')}
              saving={saving}
              today={today}
              selectedConfig={selectedConfig}
              pejantanCandidates={pejantanCandidates}
              indukCandidates={indukCandidates}
              loadingCandidates={loadingCandidates}
            />
          )}

          {selectedJenis === 'penjualan' && (
            <FormPenjualan
              formData={formData}
              onFormChange={handleFormChange}
              onDateChange={handleDateChange}
              onSubmit={handleSubmit}
              onBack={() => setStep('select')}
              saving={saving}
              today={today}
              selectedConfig={selectedConfig}
              penjualanCandidates={penjualanCandidates}
              loadingPenjualanCandidates={loadingPenjualanCandidates}
            />
          )}
        </>
      )}

      {/* Modal Pengolahan Pupuk */}
      {showPupukModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-8 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100">
              <span className="text-2xl">🌱</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Pengolahan Pupuk</h2>
              <p className="text-gray-700">Fitur akan segera hadir</p>
            </div>
            <button
              onClick={() => setShowPupukModal(false)}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Modal ID Bisnis Duplikat */}
      {duplicateIDModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-orange-50 border-b border-orange-200 px-6 py-4">
              <h3 className="text-lg font-bold text-orange-900">
                ⚠ ID Bisnis Sudah Terdaftar
              </h3>
            </div>
            
            <div className="px-6 py-4 space-y-3">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-800">
                  ID Bisnis <span className="font-bold">"{duplicateIDModal}"</span> sudah terdaftar di kelompok ini.
                </p>
              </div>
              
              <p className="text-sm text-gray-700">
                Silakan gunakan ID Bisnis yang berbeda untuk hewan ini.
              </p>
            </div>

            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
              <button
                onClick={() => setDuplicateIDModal(null)}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Submit Laporan */}
      {showConfirmation && selectedConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              Konfirmasi Simpan Laporan
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Apakah Anda yakin ingin menyimpan laporan <span className="font-bold">{selectedConfig.label}</span> dengan data berikut?
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2 text-sm">
              <div><span className="font-semibold">Jenis Laporan:</span> {selectedConfig.label}</div>
              <div><span className="font-semibold">Tanggal:</span> {new Date(formData.tanggal).toLocaleDateString('id-ID', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}</div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmSubmit}
                className={`flex-1 px-4 py-2 bg-gradient-to-r ${selectedConfig.color} text-white rounded-lg font-medium hover:shadow-lg transition`}
              >
                Ya, Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
