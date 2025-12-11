import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-emerald-25 to-emerald-100 text-gray-900 flex items-center justify-center p-4">
      <main className="max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-3xl mb-6 shadow-lg">RT</div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">Rukun Ternak</h1>
          <p className="text-xl md:text-2xl text-emerald-700 font-medium mb-2">Platform Pelaporan Ternak Terpadu</p>
          <p className="text-gray-600 text-lg">Kelola data ternak dengan mudah, cepat, dan transparan</p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 text-center hover:shadow-lg transition">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">Pelaporan Mudah</h3>
            <p className="text-gray-600 text-sm">Buat laporan ternak dengan form yang intuitif dan cepat</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 text-center hover:shadow-lg transition">
            <div className="text-4xl mb-3">📈</div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">Analitik Data</h3>
            <p className="text-gray-600 text-sm">Pantau pertumbuhan dan kesehatan ternak secara real-time</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 text-center hover:shadow-lg transition">
            <div className="text-4xl mb-3">🔐</div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">Aman & Terpercaya</h3>
            <p className="text-gray-600 text-sm">Semua data dilindungi dengan sistem keamanan modern</p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Link
            to="/login"
            className="inline-block px-8 py-4 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition shadow-lg text-lg"
          >
            🚀 Mulai Sekarang
          </Link>
          <p className="text-gray-600 mt-4 text-sm">Atau lihat dokumentasi untuk informasi lebih lanjut</p>
        </div>
      </main>
    </div>
  );
}
