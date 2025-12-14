import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchLandingStats } from '../services/landingService';
import LandingBeritaSection from '../components/berita/LandingBeritaSection';
import client from '../api/client';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Heart,
  HeartPulse,
  ShieldCheck,
  Zap,
  Sparkles,
} from 'lucide-react';

function useCountUp(target) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    // Ensure target is a valid number
    const numTarget = typeof target === 'number' && !isNaN(target) ? target : 0;
    const start = performance.now();
    const duration = 700;
    let animationId;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const nextValue = Math.round(progress * numTarget);
      setValue(nextValue);
      if (progress < 1) {
        animationId = requestAnimationFrame(tick);
      }
    };

    animationId = requestAnimationFrame(tick);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [target]);

  return value;
}

export default function Landing() {
  const [stats, setStats] = useState({
    births: { count: 0, percent: 0 },
    deaths: { count: 0, percent: 0 },
    population: { current: 0, initial: 0 },
    lastUpdated: null,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [berita, setBerita] = useState([]);
  const [loadingBerita, setLoadingBerita] = useState(true);

  const birthsAnimated = useCountUp(stats.births.count);
  const deathsAnimated = useCountUp(stats.deaths.count);
  const populationAnimated = useCountUp(stats.population.current);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const statData = await fetchLandingStats();

        if (!isMounted) return;

        setStats(
          (statData && typeof statData === 'object')
            ? statData
            : {
                births: { count: 0, percent: 0 },
                deaths: { count: 0, percent: 0 },
                population: { current: 0, initial: 0 },
                lastUpdated: null,
              }
        );
      } catch (err) {
        console.error('Landing data error', err);
        if (isMounted) {
          setStats({
            births: { count: 0, percent: 0 },
            deaths: { count: 0, percent: 0 },
            population: { current: 0, initial: 0 },
            lastUpdated: null,
          });
        }
      } finally {
        if (isMounted) {
          setLoadingStats(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadBerita = async () => {
      try {
        setLoadingBerita(true);
        const res = await client.get('/api/berita');
        if (!active) return;
        const data = res.data?.data;
        setBerita(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Landing berita error', err);
        if (active) setBerita([]);
      } finally {
        if (active) setLoadingBerita(false);
      }
    };
    loadBerita();
    return () => { active = false; };
  }, []);



  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-sky-50 to-emerald-100 text-gray-900">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-emerald-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white font-black flex items-center justify-center text-xl shadow-md">RT</div>
            <div>
              <div className="text-lg font-bold">Rukun Ternak</div>
              <p className="text-xs text-emerald-700">Cilacap Makmur BAZNAS</p>
            </div>
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 bg-emerald-600 text-white rounded-full font-semibold shadow hover:bg-emerald-700 transition"
          >
            Login
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-20">
        <section className="grid lg:grid-cols-2 gap-10 pt-12 items-center">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow text-emerald-700 text-sm font-semibold">
              <Sparkles className="w-4 h-4" /> Sub Program Cilacap Makmur BAZNAS
            </span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Platform pelaporan ternak yang informatif, real-time, dan siap aksi.
            </h1>
            <p className="text-lg text-gray-700 leading-relaxed">
              Rukun Ternak memberdayakan masyarakat mustahik melalui bantuan ternak domba, pendampingan intensif, dan pengembangan berkelanjutan untuk kemandirian ekonomi.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/login"
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:-translate-y-0.5 transition flex items-center gap-2"
              >
                Login
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#profil" className="px-6 py-3 rounded-xl bg-white/70 border border-emerald-100 text-emerald-800 font-semibold hover:bg-white transition">
                Lihat Profil Program
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-emerald-200/60 via-white to-sky-200/60 rounded-3xl blur-3xl" />
            <div className="relative bg-white rounded-3xl shadow-2xl border border-emerald-100 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Status Sistem</p>
                  <p className="text-lg font-bold text-emerald-700">Real-time & Sinkron</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Activity className="w-6 h-6" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 rounded-2xl p-4">
                  <p className="text-xs text-emerald-700">Kelahiran</p>
                  <p className="text-2xl font-extrabold text-emerald-900">{loadingStats ? '—' : birthsAnimated}</p>
                  <p className="text-xs text-emerald-700">{loadingStats ? '' : `${stats.births.percent}% dari populasi`}</p>
                </div>
                <div className="bg-red-50 rounded-2xl p-4">
                  <p className="text-xs text-red-700">Kematian</p>
                  <p className="text-2xl font-extrabold text-red-900">{loadingStats ? '—' : deathsAnimated}</p>
                  <p className="text-xs text-red-700">{loadingStats ? '' : `${stats.deaths.percent}% dari populasi`}</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-4 text-white">
                <p className="text-xs">Populasi Ternak Saat Ini</p>
                <p className="text-3xl font-extrabold">{loadingStats ? '—' : populationAnimated}</p>
                <p className="text-xs text-emerald-100">Termasuk stok awal {stats.population.initial}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Bagian 1: PROFIL RUKUN TERNAK */}
        <section id="profil" className="mt-16 bg-white/80 border border-emerald-100 rounded-3xl shadow-lg p-8 space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl font-bold">📌</div>
            <div>
              <h2 className="text-3xl font-bold">PROFIL RUKUN TERNAK</h2>
            </div>
          </div>
          <p className="text-gray-700 leading-relaxed text-lg">
            RUKUN TERNAK adalah Sub Program Cilacap Makmur BAZNAS Kabupaten Cilacap yang bertujuan memberdayakan masyarakat mustahik melalui bantuan dan pendampingan dalam usaha peternakan domba. Program ini berfokus pada peningkatan kemandirian ekonomi masyarakat, pelatihan intensif, dan pembangunan berkelanjutan, termasuk potensi pengembangan produk olahan ternak.
          </p>
        </section>

        {/* Bagian 2: TUJUAN UTAMA */}
        <section id="tujuan" className="mt-16 bg-white/80 border border-sky-100 rounded-3xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center text-xl font-bold">🎯</div>
            <h2 className="text-3xl font-bold">TUJUAN UTAMA</h2>
          </div>
          <div className="space-y-4">
            {[
              {
                title: 'Pemberdayaan ekonomi',
                desc: 'Membantu mustahik (penerima zakat) agar mandiri secara ekonomi melalui usaha peternakan.'
              },
              {
                title: 'Peningkatan keterampilan',
                desc: 'Memberikan pelatihan dan pendampingan intensif agar penerima dapat mengelola ternak secara mandiri dan berkelanjutan.'
              },
              {
                title: 'Ketahanan pangan',
                desc: 'Mendukung ketahanan pangan masyarakat dan daerah melalui pengembangan sektor peternakan.'
              }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center flex-shrink-0 font-bold text-sm">✓</div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">{item.title}</p>
                  <p className="text-gray-700 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bagian 3: BENTUK KEGIATAN */}
        <section id="kegiatan" className="mt-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl font-bold">📋</div>
            <div>
              <h2 className="text-3xl font-bold">BENTUK KEGIATAN</h2>
              <p className="text-gray-600 mt-1">Pendampingan menyeluruh dari persiapan hingga pengembangan berkelanjutan</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              {
                title: 'Penyaluran bantuan',
                icon: <Zap className="w-5 h-5" />,
                desc: 'Bantuan ternak domba diberikan kepada kelompok masyarakat yang membutuhkan. Bantuan mencakup domba betina, jantan, obat-obatan, material kandang, serta pendampingan.'
              },
              {
                title: 'Pendampingan dan pelatihan',
                icon: <HeartPulse className="w-5 h-5" />,
                desc: 'Penerima mendapatkan pendampingan mulai dari pengelolaan HMT (Hijauan Makan Ternak), kandang, kesehatan ternak, hingga penjualan untuk meningkatkan pengetahuan dan keterampilan.'
              },
              {
                title: 'Pengembangan potensi',
                icon: <BarChart3 className="w-5 h-5" />,
                desc: 'Program direncanakan untuk mengembangkan potensi lain seperti ternak kambing dan sapi, serta produk olahan ternak.'
              },
              {
                title: 'Sinergi lintas sektor',
                icon: <ShieldCheck className="w-5 h-5" />,
                desc: 'Melibatkan berbagai pihak seperti PT S2P PLTU Cilacap, Perhutani, dan Bank Syariah Indonesia untuk mendukung program.'
              },
              {
                title: 'Fasilitas kesehatan hewan',
                icon: <Heart className="w-5 h-5" />,
                desc: 'Menyediakan pelayanan kesehatan ternak secara terjadwal guna memastikan kesehatan dan kesejahteraan hewan.'
              },
              {
                title: 'Fasilitas Rukun Ternak',
                icon: <Activity className="w-5 h-5" />,
                desc: 'Menyediakan sarana pendukung berupa ruang untuk mengembangkan dan meningkatkan kemampuan setiap kelompok mustahik.'
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-indigo-100 shadow-md p-6 hover:shadow-lg hover:-translate-y-0.5 transition">
                <div className="flex items-start gap-4">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex-shrink-0 mt-0.5">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-700 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Berita di bagian paling bawah */}
        <LandingBeritaSection berita={berita} loading={loadingBerita} />
      </main>
    </div>
  );
}
