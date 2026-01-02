import React from 'react';
import { Users, MapPin, Phone, Mail } from 'lucide-react';

export default function KelompokDashboardCard({ kelompok, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-100 rounded"></div>
          <div className="h-4 bg-gray-100 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!kelompok) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <p className="text-gray-500 text-center py-8">Data kelompok tidak tersedia</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-5 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">{kelompok.name || '-'}</h2>
        <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
          <MapPin size={16} className="text-emerald-600" />
          {kelompok.desa || '-'}, {kelompok.kecamatan || '-'}
        </p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        
        {/* Section A: Profil Kelompok */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-emerald-200">Profil Kelompok</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Column 1 */}
            <div className="space-y-4">
              <div className="flex">
                <span className="w-32 text-sm font-semibold text-gray-700">Nama Kelompok</span>
                <span className="text-sm text-gray-900">{kelompok.name || '-'}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-sm font-semibold text-gray-700">Email</span>
                <span className="text-sm text-gray-900 break-all">{kelompok.email || '-'}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-sm font-semibold text-gray-700">Desa</span>
                <span className="text-sm text-gray-900">{kelompok.desa || '-'}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-sm font-semibold text-gray-700">Kecamatan</span>
                <span className="text-sm text-gray-900">{kelompok.kecamatan || '-'}</span>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 bg-emerald-50 rounded-lg p-3">
                <Users size={20} className="text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-600">Total Anggota</p>
                  <p className="text-2xl font-bold text-emerald-600">{kelompok.anggota_count || 0}</p>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Catatan</p>
                <p className="text-sm text-gray-900 line-clamp-3">{kelompok.catatan || 'Tidak ada catatan'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section B: Penanggung Jawab Kelompok */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-emerald-200">Penanggung Jawab</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* PIC 1 */}
            {(kelompok.pic1_nama || kelompok.pic1_nik) && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <p className="text-sm font-bold text-blue-900 mb-3">Penanggung Jawab 1</p>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="w-24 text-gray-700 font-medium">Nama</span>
                    <span className="text-gray-900">{kelompok.pic1_nama || '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-gray-700 font-medium">NIK</span>
                    <span className="text-gray-900">{kelompok.pic1_nik || '-'}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-24 text-gray-700 font-medium">Alamat</span>
                    <span className="text-gray-900">{kelompok.pic1_alamat || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-blue-600 flex-shrink-0" />
                    <span className="text-gray-900 text-sm">{kelompok.pic1_no_hp || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-blue-600 flex-shrink-0" />
                    <span className="text-gray-900 text-sm break-all">{kelompok.pic1_email || '-'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
