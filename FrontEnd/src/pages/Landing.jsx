import React from 'react';
import { Link } from 'react-router-dom';
import AppLogo from '../components/branding/AppLogo';
import SupportedByLogo from '../components/branding/SupportedByLogo';
import LandingMapSection from '../components/layout/LandingMapSection';
import Footer from '../components/layout/Footer';
import {
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-50 to-primary-100 text-gray-900">
      {/* Navigation Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-primary-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <AppLogo size="2xl" variant="icon" />
            <div>
              <div className="text-xl font-bold">Rukun Ternak</div>
              <p className="text-xs text-primary-700">Program Cilacap Makmur</p>
            </div>
            {/* Divider and Supported By Logo */}
            <div className="flex items-center gap-2 ml-3 pl-3 border-l-2 border-gray-300 max-w-[150px]">
              <SupportedByLogo size="md"/>
            </div>
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 bg-primary-600 text-white rounded-full font-semibold shadow hover:bg-primary-700 transition"
          >
            Login
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-20">
        {/* Hero Section */}
        <section className="py-12">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow text-primary-700 text-sm font-semibold">
              <Sparkles className="w-4 h-4" /> Sub Program Cilacap Makmur BAZNAS Kabupaten Cilacap
            </span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Platform monitoring & evaluasi ternak yang informatif, real-time, dan siap aksi.
            </h1>
            <p className="text-lg text-gray-700 leading-relaxed">
              Rukun Ternak memberdayakan masyarakat penerima manfaat melalui bantuan ternak domba, pendampingan intensif, dan pengembangan berkelanjutan untuk kemandirian ekonomi.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/login"
                className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold shadow-lg hover:-translate-y-0.5 transition flex items-center gap-2"> 
                Login
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <LandingMapSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
