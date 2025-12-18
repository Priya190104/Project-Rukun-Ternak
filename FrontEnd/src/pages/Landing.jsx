import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLogo from '../components/branding/AppLogo';
import { fetchLandingStats } from '../services/landingService';
import LandingBeritaSection from '../components/berita/LandingBeritaSection';
import LandingMapSection from '../components/layout/LandingMapSection';
import BannerSlider from '../components/banners/BannerSlider';
import client from '../api/client';
import {
  Activity,
  ArrowRight,
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
            <AppLogo size="2xl" variant="icon" />
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

        {/* Banner Slider Section */}
        <section className="mt-16 mb-16">
          <BannerSlider />
        </section>

        {/* Berita di bagian paling bawah */}
        <LandingMapSection />
        <LandingBeritaSection berita={berita} loading={loadingBerita} />
      </main>
    </div>
  );
}
