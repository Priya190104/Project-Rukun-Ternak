import React from 'react';
import { BookOpen, Leaf, BarChart3, Zap, Heart, TrendingUp } from 'lucide-react';

export default function ProfilPage() {

  // Static content untuk Rukun Ternak
  const articles = [
    {
      id: 1,
      title: 'Apa itu Rukun Ternak?',
      icon: BookOpen,
      content: `Rukun Ternak adalah konsep sistem pertanian berkelanjutan yang menggabungkan berbagai jenis ternak (domba, kambing, sapi, ayam, dll) dalam satu ekosistem pertanian yang terintegrasi. Sistem ini dirancang untuk:

• Meningkatkan produktivitas lahan
• Mengurangi limbah pertanian
• Menciptakan sinergi ekonomi antara berbagai jenis ternak
• Memperkuat ketahanan pangan lokal

Melalui Rukun Ternak, peternak dapat mengelola berbagai jenis ternak dengan lebih efisien dan menguntungkan, karena satu jenis ternak dapat memanfaatkan limbah jenis lainnya.`,
      color: 'from-primary-500 to-primary-600'
    },
    {
      id: 2,
      title: 'Keberlanjutan dan Lingkungan',
      icon: Leaf,
      content: `Rukun Ternak dirancang dengan prinsip keberlanjutan lingkungan:

MANFAAT LINGKUNGAN:
• Mengurangi penggunaan pupuk kimia (limbah ternak jadi pupuk organik)
• Meningkatkan kesuburan tanah secara alami
• Mengurangi emisi gas rumah kaca
• Konservasi air melalui pengolahan limbah

INTEGRASI DENGAN PERTANIAN:
• Limbah pertanian digunakan sebagai pakan ternak
• Limbah ternak diproses menjadi kompos dan biogas
• Ternak membantu pengendalian hama alami
• Diversifikasi penggunaan lahan meningkat`,
      color: 'from-primary-500 to-primary-600'
    },
    {
      id: 3,
      title: 'Manfaat Ekonomi untuk Peternak',
      icon: TrendingUp,
      content: `Sistem Rukun Ternak memberikan manfaat ekonomi jangka panjang:

PENINGKATAN PENDAPATAN:
• Diversifikasi sumber pendapatan dari berbagai jenis ternak
• Nilai tambah dari produk samping (pupuk organik, biogas)
• Penurunan biaya operasional melalui efisiensi limbah
• Akses pasar lebih luas untuk berbagai produk

KEAMANAN FINANSIAL:
• Resiko usaha berkurang karena diversifikasi
• Arus kas lebih stabil sepanjang tahun
• Investasi awal diimbangi penghematan jangka panjang
• Dukungan dari program Baznas untuk pengembangan`,
      color: 'from-primary-500 to-primary-600'
    },
    {
      id: 4,
      title: 'Kesehatan dan Gizi Ternak',
      icon: Heart,
      content: `Dalam sistem Rukun Ternak, kesehatan ternak adalah prioritas utama:

NUTRISI OPTIMAL:
â€¢ Pakan berkualitas dari berbagai sumber
â€¢ Pengendalian penyakit melalui sistem yang terukur
â€¢ Program vaksinasi dan kesehatan preventif
â€¢ Monitoring kesehatan hewan secara berkala

PRAKTIK MANAJEMEN:
â€¢ Kandang yang higienis dan nyaman
â€¢ Rotasi lahan untuk mencegah penyakit
â€¢ Catat semua kegiatan kesehatan dan pakan
â€¢ Laporan rutin untuk evaluasi kesejahteraan ternak`,
      color: 'from-red-500 to-pink-600'
    },
    {
      id: 5,
      title: 'Budaya dan Komunitas',
      icon: Zap,
      content: `Rukun Ternak adalah gerakan komunitas yang kuat:

NILAI BUDAYA:
â€¢ Memperkuat gotong royong antar peternak
â€¢ Berbagi pengetahuan dan pengalaman
â€¢ Menciptakan solidaritas kelompok ternak
â€¢ Pemberdayaan ekonomi lokal

JARINGAN DUKUNGAN:
â€¢ Pelatihan dan pendampingan berkelanjutan
â€¢ Akses ke teknologi dan informasi terbaru
â€¢ Kerjasama dengan program pemerintah
â€¢ Sertifikasi dan pengakuan kualitas produk`,
      color: 'from-amber-500 to-orange-600'
    },
  ];

  const statistics = [
    { label: 'Kelompok Ternak', value: '1,200+', description: 'Kelompok di seluruh Indonesia' },
    { label: 'Peternak Aktif', value: '8,500+', description: 'Anggota dalam program' },
    { label: 'Ternak Terpelihara', value: '45,000+', description: 'Populasi ternak' },
    { label: 'Desa Binaan', value: '400+', description: 'Desa mendapat manfaat' },
  ];

  return (
    <div className="space-y-8 sm:space-y-12 pt-8 sm:pt-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-lg sm:rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '50px 50px'}}></div>
        </div>
        <div className="relative p-8 sm:p-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Rukun Ternak</h1>
          <p className="text-lg sm:text-xl text-primary-100 mb-4">
            Program Pemberdayaan Ekonomi Peternak Berbasis Kebersamaan dan Keberlanjutan
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="bg-white/20 px-4 py-2 rounded-lg">
              <div className="text-sm font-semibold">Program</div>
              <div className="text-2xl font-bold">Baznas Cilacap</div>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-lg">
              <div className="text-sm font-semibold">Fokus</div>
              <div className="text-2xl font-bold">Zakat Produktif</div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <section>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Statistik Program</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statistics.map((stat, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-primary-50 to-primary-50 border border-primary-200 rounded-lg p-6 text-center hover:shadow-md transition-shadow"
            >
              <div className="text-3xl sm:text-4xl font-bold text-primary-600 mb-2">
                {stat.value}
              </div>
              <div className="font-semibold text-gray-900">{stat.label}</div>
              <div className="text-sm text-gray-700 mt-1">{stat.description}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Articles Section */}
      <section>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Artikel Rukun Ternak</h2>
        <div className="space-y-4">
          {articles.map((article) => {
            const Icon = article.icon;
            return (
              <details
                key={article.id}
                className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <summary className={`
                  flex items-start gap-4 p-6 cursor-pointer
                  bg-gradient-to-r ${article.color} text-white
                  group-open:rounded-b-none
                `}>
                  <Icon size={24} className="flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{article.title}</h3>
                    <p className="text-sm opacity-90 mt-1">
                      Klik untuk membaca selengkapnya
                    </p>
                  </div>
                  <div className="text-2xl flex-shrink-0 group-open:rotate-180 transition-transform">
                    â–¼
                  </div>
                </summary>
                <div className="p-6 bg-gray-50 border-t border-gray-200 whitespace-pre-wrap text-gray-800 text-sm leading-relaxed">
                  {article.content}
                </div>
              </details>
            );
          })}
        </div>
      </section>

      {/* Penyebaran Ternak Section */}
      <section className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-primary-600 to-primary-500 text-white p-6 sm:p-8">
          <BarChart3 size={32} className="mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold">Penyebaran Ternak</h2>
          <p className="text-primary-100 mt-2">Komposisi jenis ternak dalam program Rukun Ternak</p>
        </div>
        
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Chart Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 rounded bg-primary-500"></div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Domba</div>
                  <div className="text-sm text-gray-700">35% dari total ternak</div>
                </div>
                <div className="text-2xl font-bold text-primary-600">35%</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 rounded bg-primary-500"></div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Kambing</div>
                  <div className="text-sm text-gray-700">30% dari total ternak</div>
                </div>
                <div className="text-2xl font-bold text-primary-600">30%</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 rounded bg-warning-500"></div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Sapi</div>
                  <div className="text-sm text-gray-700">20% dari total ternak</div>
                </div>
                <div className="text-2xl font-bold text-warning">20%</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 rounded bg-orange-500"></div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Ayam</div>
                  <div className="text-sm text-gray-700">15% dari total ternak</div>
                </div>
                <div className="text-2xl font-bold text-orange-600">15%</div>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900">Manfaat Penyebaran</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold flex-shrink-0">âœ“</span>
                  <span>Mengurangi risiko kegagalan usaha karena diversifikasi</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold flex-shrink-0">âœ“</span>
                  <span>Memanfaatkan limbah satu jenis ternak untuk jenis lain</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold flex-shrink-0">âœ“</span>
                  <span>Meningkatkan pendapatan dari berbagai sumber</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold flex-shrink-0">âœ“</span>
                  <span>Menjaga keseimbangan ekosistem pertanian lokal</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Global Analysis Section */}
      <section className="bg-gradient-to-br from-purple-50 to-primary-50 border border-info-100 rounded-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Analisis Global Rukun Ternak</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary-500"></div>
              Dampak Ekonomi
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>â€¢ Peningkatan pendapatan peternak 40-60% per tahun</li>
              <li>â€¢ Penciptaan lapangan kerja lokal</li>
              <li>â€¢ Pengurangan impor daging nasional</li>
              <li>â€¢ Stabilitas harga produk ternak lokal</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary-500"></div>
              Dampak Sosial
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>â€¢ Pemberdayaan masyarakat pedesaan</li>
              <li>â€¢ Peningkatan status gizi keluarga peternak</li>
              <li>â€¢ Penguatan kohesi sosial dalam kelompok</li>
              <li>â€¢ Transfer pengetahuan antar peternak</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary-500"></div>
              Dampak Lingkungan
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>â€¢ Pengurangan penggunaan pupuk sintetis</li>
              <li>â€¢ Pengendalian limbah pertanian yang lebih baik</li>
              <li>â€¢ Peningkatan kualitas tanah</li>
              <li>â€¢ Konservasi keanekaragaman hayati</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              Target Pengembangan
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>â€¢ Ekspansi ke 50 desa baru dalam 2 tahun</li>
              <li>â€¢ Peningkatan populasi ternak 30%</li>
              <li>â€¢ Sertifikasi organik untuk 80% kelompok</li>
              <li>â€¢ Akses pasar digital untuk semua produk</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-600 rounded-lg p-6 sm:p-8 text-white text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Bergabunglah dengan Rukun Ternak</h2>
        <p className="text-lg mb-6 max-w-2xl mx-auto">
          Jadilah bagian dari gerakan pemberdayaan ekonomi yang berkelanjutan dan menguntungkan untuk masyarakat desa
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/klg-dashboard"
            className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-bold hover:bg-primary-50 transition-colors">
          >
            Akses Dashboard Saya
          </a>
          <button
            className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white/10 transition-colors"
          >
            Hubungi Baznas
          </button>
        </div>
      </section>
    </div>
  );
}


