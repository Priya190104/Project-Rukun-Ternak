import React, { useEffect, useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import client from '../../api/client';
import MapPickerKelompok from './MapPickerKelompok';

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
    pic2_nik: '',
    pic2_nama: '',
    pic2_alamat: '',
    pic2_noHp: '',
    pic2_email: '',
  });

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [errors, setErrors] = useState({});
  const [desaOptions, setDesaOptions] = useState([]);

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
          pic2_nik: initialData.pic2_nik || '',
          pic2_nama: initialData.pic2_nama || '',
          pic2_alamat: initialData.pic2_alamat || '',
          pic2_noHp: initialData.pic2_noHp || '',
          pic2_email: initialData.pic2_email || '',
        });
        if (initialData.kecamatan) {
          setDesaOptions(DESA_BY_KECAMATAN[initialData.kecamatan] || []);
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
          pic2_nik: '',
          pic2_nama: '',
          pic2_alamat: '',
          pic2_noHp: '',
          pic2_email: '',
        });
        setDesaOptions([]);
      }
      setErrors({});
      setNotification(null);
    }
  }, [isOpen, mode, initialData]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

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

    // PIC 2 validasi email jika diisi
    if (form.pic2_email && !validateEmail(form.pic2_email)) newErrors.pic2_email = 'Format email salah';

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
    setForm(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (name === 'kecamatan') {
      setDesaOptions(DESA_BY_KECAMATAN[value] || []);
      setForm(prev => ({ ...prev, desa: '' }));
    }
  };

  const handleLocationChange = ({ latitude, longitude }) => {
    setForm(prev => ({ ...prev, latitude, longitude }));
    if (errors.location) {
      setErrors(prev => ({ ...prev, location: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showNotification('error', 'Mohon lengkapi form dengan benar');
      return;
    }

    setLoading(true);
    try {
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
        pic2_nik: form.pic2_nik.trim() || null,
        pic2_nama: form.pic2_nama.trim() || null,
        pic2_alamat: form.pic2_alamat.trim() || null,
        pic2_noHp: form.pic2_noHp.trim() || null,
        pic2_email: form.pic2_email.trim() || null,
      };

      const response =
        mode === 'edit' && initialData?.id
          ? await client.put(`/api/kelompok/${initialData.id}`, payload)
          : await client.post('/api/kelompok', payload);

      if (response.data?.success) {
        showNotification('success', mode === 'edit' ? 'Kelompok berhasil diperbarui!' : 'Kelompok berhasil ditambahkan!');
        setTimeout(() => {
          onClose();
          if (onKelompokAdded) onKelompokAdded();
        }, 1000);
      } else {
        showNotification('error', 'Gagal menyimpan kelompok');
      }
    } catch (err) {
      console.error('Error saving kelompok:', err);
      showNotification('error', err.response?.data?.message || 'Terjadi kesalahan saat menyimpan');
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
            className="text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {notification && (
          <div
            className={`p-3 border-l-4 flex items-start gap-2 text-sm ${
              notification.type === 'success'
                ? 'bg-green-50 border-green-400 text-green-800'
                : 'bg-red-50 border-red-400 text-red-800'
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
                {errors.namaKelompok && <p className="text-red-600 text-xs mt-1">{errors.namaKelompok}</p>}
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
                {errors.emailKelompok && <p className="text-red-600 text-xs mt-1">{errors.emailKelompok}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kecamatan <span className="text-red-500">*</span>
                </label>
                <select
                  name="kecamatan"
                  value={form.kecamatan}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.kecamatan ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">- Pilih Kecamatan -</option>
                  {KECAMATAN_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.kecamatan && <p className="text-red-600 text-xs mt-1">{errors.kecamatan}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Desa <span className="text-red-500">*</span>
                </label>
                <select
                  name="desa"
                  value={form.desa}
                  onChange={handleChange}
                  disabled={loading || !form.kecamatan}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.desa ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">- Pilih Desa -</option>
                  {desaOptions.map(desa => (
                    <option key={desa} value={desa}>
                      {desa}
                    </option>
                  ))}
                </select>
                {errors.desa && <p className="text-red-600 text-xs mt-1">{errors.desa}</p>}
              </div>
            </div>
          </div>

          {/* Pilih Lokasi di Peta */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Pilih Lokasi di Peta</h3>
            {errors.location && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm flex items-start gap-2">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <p>{errors.location}</p>
              </div>
            )}
            <div className="rounded-lg overflow-hidden border border-gray-300">
              <MapPickerKelompok
                latitude={form.latitude}
                longitude={form.longitude}
                onLocationChange={handleLocationChange}
              />
            </div>
          </div>

          {/* PIC 1 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Data Penanggung Jawab (PIC 1)</h3>
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
                {errors.pic1_email && <p className="text-red-600 text-xs mt-1">{errors.pic1_email}</p>}
              </div>
            </div>
          </div>

          {/* PIC 2 (Optional) */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">
              Data Penanggung Jawab (PIC 2) - Opsional
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIK</label>
                <input
                  type="text"
                  name="pic2_nik"
                  value={form.pic2_nik}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                <input
                  type="text"
                  name="pic2_nama"
                  value={form.pic2_nama}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                <textarea
                  name="pic2_alamat"
                  value={form.pic2_alamat}
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
                  name="pic2_noHp"
                  value={form.pic2_noHp}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="pic2_email"
                  value={form.pic2_email}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.pic2_email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.pic2_email && <p className="text-red-600 text-xs mt-1">{errors.pic2_email}</p>}
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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
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
      </div>
    </div>
  );
}
