import React, { useEffect, useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import client from '../../api/client';
import AlertModal from '../common/AlertModal';

const KECAMATAN_OPTIONS = [
  { value: 'Adipala', label: 'Adipala' },
  { value: 'Bantarsari', label: 'Bantarsari' },
  { value: 'Binangun', label: 'Binangun' },
  { value: 'Camplong', label: 'Camplong' },
  { value: 'Cilacap Selatan', label: 'Cilacap Selatan' },
  { value: 'Cilacap Tengah', label: 'Cilacap Tengah' },
  { value: 'Cilacap Utara', label: 'Cilacap Utara' },
  { value: 'Cimanggu', label: 'Cimanggu' },
  { value: 'Cipari', label: 'Cipari' },
  { value: 'Dayeuhluhur', label: 'Dayeuhluhur' },
  { value: 'Gandrungmangu', label: 'Gandrungmangu' },
  { value: 'Jeruklegi', label: 'Jeruklegi' },
  { value: 'Kampung Laut', label: 'Kampung Laut' },
  { value: 'Karangpucung', label: 'Karangpucung' },
  { value: 'Kawunganten', label: 'Kawunganten' },
  { value: 'Kedungreja', label: 'Kedungreja' },
  { value: 'Kesugihan', label: 'Kesugihan' },
  { value: 'Kroya', label: 'Kroya' },
  { value: 'Majenang', label: 'Majenang' },
  { value: 'Maos', label: 'Maos' },
  { value: 'Nusawungu', label: 'Nusawungu' },
  { value: 'Patimuan', label: 'Patimuan' },
  { value: 'Sampang', label: 'Sampang' },
  { value: 'Sidareja', label: 'Sidareja' },
  { value: 'Wanareja', label: 'Wanareja' },
];

const DESA_BY_KECAMATAN = {
  'Adipala': ['Adipala', 'Karanganyar', 'Tegalanom', 'Kedawung', 'Danawarih', 'Lengkong', 'Cilimus', 'Kemiri', 'Adiarsa Wetan', 'Adiarsa Kulon', 'Karangsembung', 'Karangtengah', 'Kalimanah', 'Legokhandil', 'Jatimulya', 'Jatibarang'],
  'Bantarsari': ['Bantarsari', 'Bojongbata', 'Bojongsari', 'Sidamulih', 'Banjar', 'Cingebul', 'Candiwulan'],
  'Binangun': ['Binangun', 'Kemukus', 'Karangasem', 'Sumur', 'Cipaku', 'Sidakarya', 'Jambe', 'Bonjok', 'Tanjungsari', 'Tanjungwangi', 'Babakan', 'Karangbenda', 'Pamijen', 'Karangasri', 'Kebonsari'],
  'Camplong': ['Camplong', 'Candilangit', 'Kembaran', 'Jepara'],
  'Cilacap Selatan': ['Sidakaya', 'Cilacap', 'Tambakreja', 'Tegalkamulyan', 'Tegalrejo'],
  'Cilacap Tengah': ['Lomanis', 'Gunungsimping', 'Sidanegara', 'Donan', 'Kutawaru'],
  'Cilacap Utara': ['Mertasinga', 'Gumilir', 'Karangtalun', 'Tritih Kulon', 'Kebonmanis'],
  'Cimanggu': ['Cimanggu', 'Baturaden', 'Banyugede', 'Sigambiran', 'Kedung', 'Tajug', 'Plembutan', 'Cikondang', 'Karanganyar', 'Kabud', 'Karangrandu', 'Karangbenda', 'Cigugur', 'Kalisari', 'Kutamandala'],
  'Cipari': ['Cipari', 'Karangtalun', 'Jagatpura', 'Purbalingga', 'Jatimulya', 'Selorejo', 'Bukateja', 'Desa Bawah', 'Karangduwur', 'Lekok', 'Sunyaragi'],
  'Dayeuhluhur': ['Dayeuhluhur', 'Karangtalun', 'Tanggulwulung', 'Bojongsari', 'Kemranjen', 'Panjorenan', 'Tembuku', 'Cigugur', 'Mandirancan', 'Danasari', 'Gunungpati', 'Karangduwur', 'Pelabuhan Ratu', 'Pameungpeuk'],
  'Gandrungmangu': ['Gandrungmangu', 'Kedunggudel', 'Bojongsari', 'Sugihwaras', 'Jeguran', 'Buwaran', 'Sindurejo', 'Kandang', 'Siding', 'Kebondalem', 'Gunungwarno', 'Bangsri', 'Tanjungsari', 'Jeruk'],
  'Jeruklegi': ['Jeruklegi Wetan', 'Jeruklegi Kulon', 'Kampung Laut', 'Cihara', 'Depeha', 'Gondang', 'Kumpulrejo', 'Karangganyar', 'Widarapayung', 'Gombang', 'Bangsri', 'Kalianget', 'Margaasih'],
  'Kampung Laut': ['Klaces', 'Karanggayam', 'Margajaya', 'Purwodadi'],
  'Karangpucung': ['Karangpucung', 'Sindang', 'Tajugsari', 'Tamansari', 'Kembang', 'Palayon', 'Banjarsari', 'Benteng', 'Karangsari', 'Kedung Lali', 'Karangtalun', 'Sumingkir', 'Bojongsari', 'Ciwaru'],
  'Kawunganten': ['Kawunganten', 'Karangsari', 'Bojanegara', 'Tanjung', 'Kedung', 'Banjarsari', 'Karangtalun', 'Karangnongko', 'Karangwano', 'Pasirwangi', 'Karangwulung', 'Tanjungsari'],
  'Kedungreja': ['Ciklapa', 'Kedungreja', 'Bukateja', 'Bangsri', 'Karangjati', 'Karangrejo', 'Sukarame', 'Kembangsari', 'Banyadana', 'Tegalkamulyan', 'Sumpiuh'],
  'Kesugihan': ['Kesugihan Kidul', 'Kesugihan Lor', 'Sindangagung', 'Sindang', 'Karangasem', 'Cipari', 'Kedungwringin', 'Karyasari', 'Dukuh Rata', 'Kemancaran', 'Pageruyuk', 'Karanggude', 'Karangsambung', 'Bangsari', 'Kedunglali', 'Kebondalem'],
  'Kroya': ['Kroya', 'Bukateja', 'Karangduwur', 'Siledug', 'Bangsri', 'Tambakrejo', 'Karangmulya', 'Kedunglali', 'Kedungwuni', 'Karanggayam', 'Babakan', 'Gunung', 'Kebonsari', 'Karangkunci', 'Tangkisan', 'Gombang', 'Kraton'],
  'Majenang': ['Jenang', 'Majenang', 'Bantarwulung', 'Karangayu', 'Bojongsari', 'Sidem', 'Karangsari', 'Bandung', 'Karangtalun', 'Kalitengah', 'Karangmulya', 'Karangrejo', 'Karangan', 'Karangdalem', 'Tanjungsari', 'Panyabrayan', 'Tambakrejo'],
  'Maos': ['Klapagada', 'Maos', 'Cijelekong', 'Karangsambung', 'Baladewa', 'Suko', 'Wlingi', 'Bangsri', 'Karangnangka', 'Karanggebang'],
  'Nusawungu': ['Nusawungu', 'Banjarsari', 'Karangasem', 'Karanggawang', 'Bojongsari', 'Banyumeneng', 'Karangduwur', 'Karangmulya', 'Karangtalun', 'Ledok Bareng', 'Karangsari', 'Sindang', 'Mandiraja', 'Tajug', 'Kedalon', 'Pangkalan', 'Nusagede'],
  'Patimuan': ['Patimuan', 'Parakan', 'Balanegara', 'Cisayong', 'Tangkilan', 'Karangtalun', 'Sukamulya'],
  'Sampang': ['Sampang', 'Candiwulan', 'Karangtalun', 'Muara', 'Purwadadi', 'Ujung Alur', 'Bangsari', 'Bandrek', 'Bejalen', 'Karangduwur'],
  'Sidareja': ['Sidareja', 'Sitanala', 'Karanganyar', 'Cikarang', 'Langensari', 'Purwodadi', 'Wanalaya', 'Sari Asih', 'Bangsri', 'Baladewa'],
  'Wanareja': ['Wanareja', 'Randegan', 'Danawarih', 'Karangduwur', 'Karangmulya', 'Merta Sari', 'Suweng', 'Bangsri', 'Banjarsari', 'Jipang', 'Jatirejo', 'Tanjungharjo', 'Karangkudi', 'Karangtalun', 'Kemiri', 'Tegalanom'],
};

export default function AddKelompokModalWithMap({
  isOpen,
  onClose,
  onKelompokAdded,
  mode = 'add',
  initialData = null,
}) {
  const [form, setForm] = useState({
    namaKelompok: '',
    emailKelompok: '',
    kecamatan: '',
    desa: '',
    latitude: null,
    longitude: null,
    pic1_nik: '',
    pic1_nama: '',
    pic1_alamat: '',
    pic1_noHp: '',
    pic1_email: '',
    // Penyaluran
    jumlahKandang: '',
    jumlahTernak: '',
    ternakDetails: [],
    peralatanList: [{ jenisPeralatan: '', jumlahPeralatan: '' }],
    kesehatanList: [{ jenisKesehatan: '', jumlah: '' }],
  });

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [errors, setErrors] = useState({});
  const [desaOptions, setDesaOptions] = useState([]);
  const [kecamatanFilter, setKecamatanFilter] = useState('');
  const [desaFilter, setDesaFilter] = useState('');
  const [showKecamatanDropdown, setShowKecamatanDropdown] = useState(false);
  const [showDesaDropdown, setShowDesaDropdown] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, type: 'success', title: '', message: '' });

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setForm({
          namaKelompok: initialData.name || '',
          emailKelompok: initialData.email || '',
          kecamatan: initialData.kecamatan || '',
          desa: initialData.desa || '',
          latitude: initialData.latitude || null,
          longitude: initialData.longitude || null,
          pic1_nik: initialData.pic1_nik || '',
          pic1_nama: initialData.pic1_nama || '',
          pic1_alamat: initialData.pic1_alamat || '',
          pic1_noHp: initialData.pic1_noHp || '',
          pic1_email: initialData.pic1_email || '',
          jumlahKandang: '',
          jumlahTernak: '',
          ternakDetails: [],
          peralatanList: [{ jenisPeralatan: '', jumlahPeralatan: '' }],
          kesehatanList: [{ jenisKesehatan: '', jumlah: '' }],
        });
        if (initialData.kecamatan) {
          setDesaOptions(DESA_BY_KECAMATAN[initialData.kecamatan] || []);
          setKecamatanFilter(initialData.kecamatan);
          setDesaFilter(initialData.desa || '');
        }
      } else {
        setForm({
          namaKelompok: '',
          emailKelompok: '',
          kecamatan: '',
          desa: '',
          latitude: null,
          longitude: null,
          pic1_nik: '',
          pic1_nama: '',
          pic1_alamat: '',
          pic1_noHp: '',
          pic1_email: '',
          jumlahKandang: '',
          jumlahTernak: '',
          ternakDetails: [],
          peralatanList: [{ jenisPeralatan: '', jumlahPeralatan: '' }],
          kesehatanList: [{ jenisKesehatan: '', jumlah: '' }],
        });
        setKecamatanFilter('');
        setDesaFilter('');        setDesaOptions([]);
      }
      setErrors({});
      setNotification(null);
    }
  }, [isOpen, mode, initialData]);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.namaKelompok.trim()) newErrors.namaKelompok = 'Wajib diisi';
    if (!form.emailKelompok.trim()) newErrors.emailKelompok = 'Wajib diisi';
    else if (!validateEmail(form.emailKelompok)) newErrors.emailKelompok = 'Format email salah';

    if (!form.kecamatan) newErrors.kecamatan = 'Wajib dipilih';
    if (!form.desa) newErrors.desa = 'Wajib dipilih';

    // Validasi lokasi - WAJIB dipilih
    if (!form.latitude || !form.longitude) {
      newErrors.location = 'Lokasi kelompok WAJIB dipilih di peta';
    }

    // PIC 1 validasi email jika diisi
    if (form.pic1_email && !validateEmail(form.pic1_email)) newErrors.pic1_email = 'Format email salah';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      if (firstErrorField !== 'location') {
        document.getElementsByName(firstErrorField)[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for NIK and No HP - only allow digits
    if (name === 'pic1_nik' || name === 'pic1_noHp') {
      // Only keep digits
      const digitOnly = value.replace(/\D/g, '');
      setForm(prev => ({ ...prev, [name]: digitOnly }));
      
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
      return;
    }
    
    // Special handling for jumlahTernak
    if (name === 'jumlahTernak') {
      const newJumlah = parseInt(value) || 0;
      const currentJumlah = form.ternakDetails.length;
      
      let newTernakDetails = [...form.ternakDetails];
      
      // If increasing, add new ternak objects
      if (newJumlah > currentJumlah) {
        for (let i = currentJumlah; i < newJumlah; i++) {
          newTernakDetails.push({
            idTernak: '',
            jenisKelamin: '',
            ras: '',
            bobot: '',
            umur: '',
            catatan: ''
          });
        }
      } 
      // If decreasing, remove from the end
      else if (newJumlah < currentJumlah) {
        newTernakDetails = newTernakDetails.slice(0, newJumlah);
      }
      
      setForm(prev => ({
        ...prev,
        [name]: value,
        ternakDetails: newTernakDetails
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (name === 'kecamatan') {
      setDesaOptions(DESA_BY_KECAMATAN[value] || []);
      setForm(prev => ({ ...prev, desa: '' }));
      setKecamatanFilter('');
      setDesaFilter('');
      setShowKecamatanDropdown(false);
    }
  };

  const handleKecamatanFilterChange = (value) => {
    setKecamatanFilter(value);
    if (value) {
      setShowKecamatanDropdown(true);
    }
  };

  const handleKecamatanSelect = (value) => {
    setForm(prev => ({ ...prev, kecamatan: value }));
    setDesaOptions(DESA_BY_KECAMATAN[value] || []);
    setForm(prev => ({ ...prev, desa: '' }));
    setKecamatanFilter(value);
    setDesaFilter('');
    setShowKecamatanDropdown(false);
  };

  const handleDesaFilterChange = (value) => {
    setDesaFilter(value);
    if (value) {
      setShowDesaDropdown(true);
    }
  };

  const handleDesaSelect = (value) => {
    setForm(prev => ({ ...prev, desa: value }));
    setDesaFilter(value);
    setShowDesaDropdown(false);
  };

  const getFilteredKecamatan = () => {
    if (!kecamatanFilter) return KECAMATAN_OPTIONS;
    return KECAMATAN_OPTIONS.filter(opt =>
      opt.label.toLowerCase().includes(kecamatanFilter.toLowerCase())
    );
  };

  const getFilteredDesa = () => {
    if (!desaFilter) return desaOptions;
    return desaOptions.filter(desa =>
      desa.toLowerCase().includes(desaFilter.toLowerCase())
    );
  };

  const handleTernakChange = (index, field, value) => {
    const newTernakDetails = [...form.ternakDetails];
    newTernakDetails[index] = {
      ...newTernakDetails[index],
      [field]: value
    };
    setForm(prev => ({
      ...prev,
      ternakDetails: newTernakDetails
    }));
  };

  const handlePeralatanChange = (index, field, value) => {
    const newList = [...form.peralatanList];
    newList[index] = { ...newList[index], [field]: value };
    setForm(prev => ({ ...prev, peralatanList: newList }));
  };

  const handleKesehatanChange = (index, field, value) => {
    const newList = [...form.kesehatanList];
    newList[index] = { ...newList[index], [field]: value };
    setForm(prev => ({ ...prev, kesehatanList: newList }));
  };

  const addPeralatanRow = () => {
    setForm(prev => ({
      ...prev,
      peralatanList: [...prev.peralatanList, { jenisPeralatan: '', jumlahPeralatan: '' }]
    }));
  };

  const removePeralatanRow = (index) => {
    setForm(prev => ({
      ...prev,
      peralatanList: prev.peralatanList.filter((_, i) => i !== index)
    }));
  };

  const addKesehatanRow = () => {
    setForm(prev => ({
      ...prev,
      kesehatanList: [...prev.kesehatanList, { jenisKesehatan: '', jumlah: '' }]
    }));
  };

  const removeKesehatanRow = (index) => {
    setForm(prev => ({
      ...prev,
      kesehatanList: prev.kesehatanList.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Validasi Gagal',
        message: 'Mohon lengkapi form dengan benar'
      });
      return;
    }

    setLoading(true);
    try {
      // Filter and normalize ternakDetails - remove empty rows and convert jenisKelamin to uppercase
      const normalizedTernakDetails = form.ternakDetails
        .filter(t => t.jenisKelamin && t.ras && t.bobot)  // Must have jenis kelamin, ras, and bobot
        .map(t => ({
          ...t,
          idHewan: t.idTernak || null,  // Map idTernak from form to idHewan for backend
          jenisKelamin: (t.jenisKelamin === 'Jantan' ? 'JANTAN' : t.jenisKelamin === 'Betina' ? 'BETINA' : t.jenisKelamin).toUpperCase(),
          bobot: parseFloat(t.bobot) || 0,
          umur: t.umur ? parseInt(t.umur) : null,
          tanggalLahir: t.tanggalLahir || null
        }));
      
      const payload = {
        name: form.namaKelompok.trim(),
        email: form.emailKelompok.trim(),
        kecamatan: form.kecamatan,
        desa: form.desa,
        latitude: form.latitude,
        longitude: form.longitude,
        pic1_nik: form.pic1_nik.trim() || null,
        pic1_nama: form.pic1_nama.trim() || null,
        pic1_alamat: form.pic1_alamat.trim() || null,
        pic1_noHp: form.pic1_noHp.trim() || null,
        pic1_email: form.pic1_email.trim() || null,
        // Penyaluran & Bantuan
        jumlahKandang: form.jumlahKandang ? parseInt(form.jumlahKandang) : null,
        jumlahTernak: form.jumlahTernak ? parseInt(form.jumlahTernak) : null,
        ternakDetails: normalizedTernakDetails,
        pakanList: form.peralatanList.filter(p => p.jenisPeralatan && p.jumlahPeralatan),
        kesehatanList: form.kesehatanList.filter(k => k.jenisKesehatan && k.jumlah),
      };

      const response =
        mode === 'edit' && initialData?.id
          ? await client.put(`/api/kelompok/${initialData.id}`, payload)
          : await client.post('/api/kelompok', payload);

      if (response.data?.success) {
        const isEdit = mode === 'edit';
        setAlert({
          isOpen: true,
          type: 'success',
          title: isEdit ? '✓ Kelompok Diperbarui' : '✓ Kelompok Ditambahkan',
          message: isEdit 
            ? `Kelompok "${form.namaKelompok}" berhasil diperbarui. Anda akan dialihkan dalam beberapa detik.`
            : `Kelompok "${form.namaKelompok}" berhasil ditambahkan. Anda akan dialihkan dalam beberapa detik.`,
          autoCloseMs: 2000
        });
        setTimeout(() => {
          onClose();
          if (onKelompokAdded) onKelompokAdded();
        }, 2000);
      } else {
        setAlert({
          isOpen: true,
          type: 'error',
          title: '✗ Gagal Menyimpan',
          message: response.data?.message || 'Gagal menyimpan kelompok'
        });
      }
    } catch (err) {
      console.error('Error saving kelompok:', err);
      const errorMessage = err.response?.data?.message || 'Terjadi kesalahan saat menyimpan kelompok';
      setAlert({
        isOpen: true,
        type: 'error',
        title: '✗ Kesalahan',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            {mode === 'edit' ? 'Edit Kelompok' : 'Tambah Kelompok Baru'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition disabled:opacity-50"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {notification && (
          <div
            className={`p-3 border-l-4 flex items-start gap-2 text-sm ${
              notification.type === 'success'
                ? 'bg-success-50 border-green-400 text-green-800'
                : 'bg-danger-50 border-red-400 text-red-800'
            }`}
          >
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <p className="font-medium">{notification.message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Informasi Dasar */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Informasi Kelompok</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Kelompok <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="namaKelompok"
                  value={form.namaKelompok}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.namaKelompok ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.namaKelompok && <p className="text-danger text-xs mt-1">{errors.namaKelompok}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Kelompok <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="emailKelompok"
                  value={form.emailKelompok}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.emailKelompok ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.emailKelompok && <p className="text-danger text-xs mt-1">{errors.emailKelompok}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kecamatan <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari atau ketik kecamatan"
                    value={kecamatanFilter}
                    onChange={(e) => handleKecamatanFilterChange(e.target.value)}
                    onFocus={() => setShowKecamatanDropdown(true)}
                    disabled={loading}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.kecamatan ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {showKecamatanDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {getFilteredKecamatan().length > 0 ? (
                        getFilteredKecamatan().map(opt => (
                          <div
                            key={opt.value}
                            onClick={() => handleKecamatanSelect(opt.value)}
                            className={`px-3 py-2 cursor-pointer hover:bg-primary-50 ${
                              form.kecamatan === opt.value ? 'bg-primary-100 font-semibold' : ''
                            }`}
                          >
                            {opt.label}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-500 text-sm">Tidak ada hasil</div>
                      )}
                    </div>
                  )}
                </div>
                {errors.kecamatan && <p className="text-danger text-xs mt-1">{errors.kecamatan}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Desa <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari atau ketik desa"
                    value={desaFilter}
                    onChange={(e) => handleDesaFilterChange(e.target.value)}
                    onFocus={() => setShowDesaDropdown(true)}
                    disabled={loading || !form.kecamatan}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.desa ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {showDesaDropdown && form.kecamatan && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {getFilteredDesa().length > 0 ? (
                        getFilteredDesa().map(desa => (
                          <div
                            key={desa}
                            onClick={() => handleDesaSelect(desa)}
                            className={`px-3 py-2 cursor-pointer hover:bg-primary-50 ${
                              form.desa === desa ? 'bg-primary-100 font-semibold' : ''
                            }`}
                          >
                            {desa}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-500 text-sm">Tidak ada hasil</div>
                      )}
                    </div>
                  )}
                </div>
                {errors.desa && <p className="text-danger text-xs mt-1">{errors.desa}</p>}
              </div>
            </div>
          </div>

          {/* Input Koordinat */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Koordinat Lokasi</h3>
            {errors.location && (
              <div className="mb-3 p-3 bg-danger-50 border border-danger-100 rounded-lg text-red-800 text-sm flex items-start gap-2">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <p>{errors.location}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.000001"
                  placeholder="Contoh: -7.7338"
                  value={form.latitude || ''}
                  onChange={(e) => {
                    const lat = e.target.value ? parseFloat(e.target.value) : null;
                    setForm(prev => ({ ...prev, latitude: lat }));
                    if (errors.location) {
                      setErrors(prev => ({ ...prev, location: '' }));
                    }
                  }}
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.000001"
                  placeholder="Contoh: 109.0199"
                  value={form.longitude || ''}
                  onChange={(e) => {
                    const lng = e.target.value ? parseFloat(e.target.value) : null;
                    setForm(prev => ({ ...prev, longitude: lng }));
                    if (errors.location) {
                      setErrors(prev => ({ ...prev, location: '' }));
                    }
                  }}
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Masukkan koordinat latitude dan longitude lokasi kelompok ternak
            </p>
          </div>

          {/* PIC 1 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Data Penanggung Jawab</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIK</label>
                <input
                  type="text"
                  name="pic1_nik"
                  value={form.pic1_nik}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                <input
                  type="text"
                  name="pic1_nama"
                  value={form.pic1_nama}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                <textarea
                  name="pic1_alamat"
                  value={form.pic1_alamat}
                  onChange={handleChange}
                  disabled={loading}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No HP</label>
                <input
                  type="tel"
                  name="pic1_noHp"
                  value={form.pic1_noHp}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="pic1_email"
                  value={form.pic1_email}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.pic1_email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.pic1_email && <p className="text-danger text-xs mt-1">{errors.pic1_email}</p>}
              </div>
            </div>
          </div>

          {/* Penyaluran & Bantuan */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Penyaluran & Bantuan</h3>

            {/* Kandang dan Ternak */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Kandang</label>
                <input
                  type="number"
                  name="jumlahKandang"
                  value={form.jumlahKandang}
                  onChange={handleChange}
                  disabled={loading}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Hewan Ternak</label>
                <input
                  type="number"
                  name="jumlahTernak"
                  value={form.jumlahTernak}
                  onChange={handleChange}
                  disabled={loading}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Hewan Ternak - Dynamic */}
            {parseInt(form.jumlahTernak) > 0 && (
              <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
                <h4 className="text-sm font-semibold text-gray-800 mb-4">Detail Hewan Ternak</h4>
                <div className="space-y-5">
                  {form.ternakDetails.map((ternak, index) => (
                    <div key={index} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <h5 className="text-xs font-bold text-primary-600 uppercase mb-3">Hewan Ternak {index + 1}</h5>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* ID Ternak */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">ID Ternak</label>
                          <input
                            type="text"
                            placeholder="Contoh: T001"
                            value={ternak.idTernak}
                            onChange={(e) => handleTernakChange(index, 'idTernak', e.target.value)}
                            disabled={loading}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* Jenis Kelamin */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                          <select
                            value={ternak.jenisKelamin}
                            onChange={(e) => handleTernakChange(index, 'jenisKelamin', e.target.value)}
                            disabled={loading}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">- Pilih -</option>
                            <option value="Jantan">Jantan</option>
                            <option value="Betina">Betina</option>
                          </select>
                        </div>

                        {/* Ras */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Ras</label>
                          <input
                            type="text"
                            placeholder="Contoh: Limousin"
                            value={ternak.ras}
                            onChange={(e) => handleTernakChange(index, 'ras', e.target.value)}
                            disabled={loading}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* Bobot */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Bobot (kg)</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={ternak.bobot}
                            onChange={(e) => handleTernakChange(index, 'bobot', e.target.value)}
                            disabled={loading}
                            min="0"
                            step="0.1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* Umur */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Umur (bulan)</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={ternak.umur}
                            onChange={(e) => handleTernakChange(index, 'umur', e.target.value)}
                            disabled={loading}
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* Catatan */}
                        <div className="md:col-span-2 lg:col-span-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
                          <textarea
                            placeholder="Catatan tambahan untuk hewan ini"
                            value={ternak.catatan || ''}
                            onChange={(e) => handleTernakChange(index, 'catatan', e.target.value)}
                            disabled={loading}
                            rows="2"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Peralatan Pendukung */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-700">Peralatan Pendukung</label>
                <button
                  type="button"
                  onClick={addPeralatanRow}
                  disabled={loading}
                  className="px-3 py-1 text-xs bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50"
                >
                  + Tambah Peralatan
                </button>
              </div>
              <div className="space-y-3">
                {form.peralatanList.map((peralatan, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Jenis peralatan (contoh: Sekop, Tempat Minum, dll)"
                        value={peralatan.jenisPeralatan}
                        onChange={(e) => handlePeralatanChange(index, 'jenisPeralatan', e.target.value)}
                        disabled={loading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        placeholder="Jumlah (unit)"
                        value={peralatan.jumlahPeralatan}
                        onChange={(e) => handlePeralatanChange(index, 'jumlahPeralatan', e.target.value)}
                        disabled={loading}
                        min="0"
                        step="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {form.peralatanList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePeralatanRow(index)}
                        disabled={loading}
                        className="px-3 py-2 text-xs bg-danger-500 text-white rounded-lg hover:bg-danger transition disabled:opacity-50"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Kesehatan */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-700">Program Kesehatan</label>
                <button
                  type="button"
                  onClick={addKesehatanRow}
                  disabled={loading}
                  className="px-3 py-1 text-xs bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50"
                >
                  + Tambah Program
                </button>
              </div>
              <div className="space-y-3">
                {form.kesehatanList.map((kesehatan, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Jenis program (contoh: Vaksinasi, Perawatan, dll)"
                        value={kesehatan.jenisKesehatan}
                        onChange={(e) => handleKesehatanChange(index, 'jenisKesehatan', e.target.value)}
                        disabled={loading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        placeholder="Jumlah"
                        value={kesehatan.jumlah}
                        onChange={(e) => handleKesehatanChange(index, 'jumlah', e.target.value)}
                        disabled={loading}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {form.kesehatanList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeKesehatanRow(index)}
                        disabled={loading}
                        className="px-3 py-2 text-xs bg-danger-500 text-white rounded-lg hover:bg-danger transition disabled:opacity-50"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 font-medium hover:bg-gray-50 transition disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : mode === 'edit' ? (
                'Perbarui'
              ) : (
                'Tambah'
              )}
            </button>
          </div>
        </form>

        {/* Alert Modal */}
        <AlertModal
          isOpen={alert.isOpen}
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert({ ...alert, isOpen: false })}
          autoCloseMs={alert.autoCloseMs || 3000}
        />
      </div>
    </div>
  );
}

