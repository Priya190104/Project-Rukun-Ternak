import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AdminPageHeader from '../components/admin/AdminPageHeader';
import client from '../api/client';
import { useCachedData, useInvalidateCache } from '../hooks/useCachedData';
import { 
  ArrowRight, ArrowLeft
} from 'lucide-react';

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
          âš ï¸ {error}
        </div>
      )}

      {success && (
        <div className="bg-primary-50 border border-primary-200 text-primary-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <span className="text-lg">âœ“</span>
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

      {/* STEP 2: Form */}
      {step === 'form' && selectedConfig && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
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
                    Sumber Pakan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Petani Lokal, Koperasi, Distributor"
                    value={formData.data.sumber || ''}
                    onChange={(e) => handleFormChange('sumber', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
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
                    Pengembangan Kandang (jumlah penambahan) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Jumlah kandang yang ditambahkan"
                    value={formData.data.pengembangan_kandang || ''}
                    onChange={(e) => handleFormChange('pengembangan_kandang', parseInt(e.target.value) || '')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                
                {/* Render multiple luas_kandang inputs based on pengembangan_kandang */}
                {formData.data.pengembangan_kandang && formData.data.pengembangan_kandang > 0 && (
                  <div className="bg-primary-50 p-4 rounded-lg border border-primary-200">
                    <p className="text-sm font-semibold text-primary-900 mb-3">
                      Masukkan Luas Kandang untuk {formData.data.pengembangan_kandang} kandang yang ditambahkan
                    </p>
                    {Array.from({ length: formData.data.pengembangan_kandang }).map((_, index) => (
                      <div key={index} className="mb-3">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Luas Kandang {index + 1} (mÂ²) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          placeholder={`Kandang ${index + 1}`}
                          value={
                            formData.data.luas_kandang_list && formData.data.luas_kandang_list[index]
                              ? formData.data.luas_kandang_list[index]
                              : ''
                          }
                          onChange={(e) => {
                            const newList = formData.data.luas_kandang_list
                              ? [...formData.data.luas_kandang_list]
                              : [];
                            newList[index] = parseInt(e.target.value) || '';
                            handleFormChange('luas_kandang_list', newList);
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    ))}
                  </div>
                )}

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
                    ID Ternak <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.data.id_ternak || ''}
                    onChange={(e) => handleFormChange('id_ternak', e.target.value)}
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

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Status Kesehatan Ternak <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.data.status_kesehatan_ternak || ''}
                    onChange={(e) => handleFormChange('status_kesehatan_ternak', e.target.value)}
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
                      onChange={(e) => handleFormChange('jenis_tindakan', e.target.value)}
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
                      onChange={(e) => handleFormChange('jenis_pencegahan', e.target.value)}
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
                      onChange={(e) => handleFormChange('jenis_pengobatan', e.target.value)}
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
                      onChange={(e) => handleFormChange('jenis_perawatan', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Keterangan
                  </label>
                  <textarea
                    placeholder="Catatan tambahan tentang kesehatan ternak..."
                    value={formData.data.keterangan || ''}
                    onChange={(e) => handleFormChange('keterangan', e.target.value)}
                    rows="3"
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
                {/* BARIS 1: Tanggal Kelahiran */}
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

                {/* BARIS 2: ID Anakan */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    ID Anakan (ID Bisnis) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Nomor identitas unik untuk anakan"
                    value={formData.data.id || ''}
                    onChange={(e) => handleFormChange('id', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>

                {/* BARIS 3: Jenis Kelamin + Ras + Bobot */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Jenis Kelamin Anak <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.data.jenis_kelamin_anak || ''}
                      onChange={(e) => handleFormChange('jenis_kelamin_anak', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      required
                    >
                      <option value="">Pilih</option>
                      <option value="jantan">Jantan</option>
                      <option value="betina">Betina</option>
                      <option value="keduanya">Keduanya</option>
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
                      onChange={(e) => handleFormChange('ras', e.target.value)}
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
                      onChange={(e) => handleFormChange('bobot', parseFloat(e.target.value) || '')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>

                {/* BARIS 4: Pejantan + Induk */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Pejantan (Ayah) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.data.pejantan_id || ''}
                      onChange={(e) => handleFormChange('pejantan_id', e.target.value || '')}
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
                        âš ï¸ Tidak ada pejantan tersedia (jantan usia {'>'} 8 bulan)
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Induk (Ibu) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.data.induk_id || ''}
                      onChange={(e) => handleFormChange('induk_id', e.target.value || '')}
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
                        âš ï¸ Tidak ada induk tersedia (betina usia {'>'} 8 bulan)
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
                        <h4 className="font-semibold text-primary-900 mb-2">ðŸ“Š Detail Pejantan</h4>
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
                        <h4 className="font-semibold text-purple-900 mb-2">ðŸ“Š Detail Induk</h4>
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
                    onChange={(e) => handleFormChange('catatan', e.target.value)}
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                  />
                </div>
              </>
            )}

            {/* PENJUALAN Form */}
            {selectedJenis === 'penjualan' && (
              <>
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
                      handleFormChange('jumlah_hewan', value);
                      // Initialize penjualan_list if not exists
                      if (value && (!formData.data.penjualan_list || formData.data.penjualan_list.length !== value)) {
                        const newList = Array(value).fill(null).map(() => ({
                          jenis_penjualan: '',
                          jenis_hewan: '',
                          id_hewan: '',
                          catatan: ''
                        }));
                        handleFormChange('penjualan_list', newList);
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
                                handleFormChange('penjualan_list', newList);
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
                                handleFormChange('penjualan_list', newList);
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
                                handleFormChange('penjualan_list', newList);
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
                              <p className="text-xs text-yellow-600 mt-1">âš ï¸ Pilih jenis hewan dulu</p>
                            )}
                            {item.jenis_hewan && penjualanCandidates[item.jenis_hewan]?.length === 0 && (
                              <p className="text-xs text-yellow-600 mt-1">âš ï¸ Tidak ada hewan tersedia untuk jenis ini</p>
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
                                handleFormChange('penjualan_list', newList);
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
                    onChange={(e) => handleFormChange('catatan', e.target.value)}
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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

      {/* Modal Pengolahan Pupuk */}
      {showPupukModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-8 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100">
              <span className="text-2xl">ðŸŒ±</span>
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
                âš ï¸ ID Bisnis Sudah Terdaftar
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
      )}    </div>
  );
}
