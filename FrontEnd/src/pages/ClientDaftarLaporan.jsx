import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import client from '../api/client';
import { Calendar, Filter, ChevronRight, Plus, Heart, Droplet, Home, TrendingUp, Baby, ShoppingCart, Sprout, Weight } from 'lucide-react';

const JENIS_LAPORAN = [
  { id: 'pakan', label: 'Pakan', icon: Droplet, color: 'bg-orange-50 border-orange-200' },
  { id: 'kandang', label: 'Kandang', icon: Home, color: 'bg-amber-50 border-amber-200' },
  { id: 'kesehatan', label: 'Kesehatan', icon: Heart, color: 'bg-red-50 border-red-200' },
  { id: 'populasi', label: 'Populasi', icon: TrendingUp, color: 'bg-green-50 border-green-200' },
  { id: 'kelahiran', label: 'Kelahiran', icon: Baby, color: 'bg-pink-50 border-pink-200' },
  { id: 'penjualan', label: 'Penjualan', icon: ShoppingCart, color: 'bg-blue-50 border-blue-200' },
  { id: 'pengembangan', label: 'Pengembangan', icon: Sprout, color: 'bg-emerald-50 border-emerald-200' },
  { id: 'update', label: 'Update Ternak', icon: Weight, color: 'bg-purple-50 border-purple-200' },
];

export default function ClientDaftarLaporan() {
  useAuth();
  const [laporan, setLaporan] = useState([]);
  const [filteredLaporan, setFilteredLaporan] = useState([]);
  const [selectedJenis, setSelectedJenis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLaporan();
  }, []);

  const loadLaporan = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await client.get('/api/laporan');
      if (res.data?.success) {
        const data = res.data.data || [];
        setLaporan(data);
        setFilteredLaporan(data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat laporan');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterJenis = (jenis) => {
    setSelectedJenis(selectedJenis === jenis ? null : jenis);
    if (selectedJenis === jenis) {
      setFilteredLaporan(laporan);
    } else {
      setFilteredLaporan(laporan.filter(l => l.jenis && l.jenis.toLowerCase() === jenis.toLowerCase()));
    }
  };

  const formatTanggal = (tanggal) => {
    return new Date(tanggal).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getJenisConfig = (jenis) => {
    return JENIS_LAPORAN.find(j => j.id === (jenis ? jenis.toLowerCase() : '')) || 
           { label: jenis || 'Tidak diketahui', icon: Filter, color: 'bg-gray-50 border-gray-200' };
  };

  return (
    <div className="space-y-6 pt-8 sm:pt-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg sm:rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Daftar Laporan</h1>
        <p className="text-blue-100">Kelola dan lihat semua laporan ternak kelompok Anda</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      {/* Filter Buttons */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filter Jenis Laporan</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
          {JENIS_LAPORAN.map(({ id, label, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => handleFilterJenis(id)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all
                ${selectedJenis === id 
                  ? 'ring-2 ring-emerald-500 ' + color + ' scale-105'
                  : color + ' hover:shadow-md'
                }
              `}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
        {selectedJenis && (
          <div className="mt-3">
            <button
              onClick={() => {
                setSelectedJenis(null);
                setFilteredLaporan(laporan);
              }}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              ✕ Hapus Filter
            </button>
          </div>
        )}
      </div>

      {/* Add New Report Button */}
      <Link
        to="/klg-tambah-laporan"
        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        <Plus size={20} />
        Tambah Laporan Baru
      </Link>

      {/* Laporan List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-gray-600">Loading...</div>
        </div>
      ) : filteredLaporan.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">
            {laporan.length === 0
              ? 'Belum ada laporan. Mulai dengan menambah laporan baru.'
              : 'Tidak ada laporan untuk filter yang dipilih.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLaporan.map((lap) => {
            const config = getJenisConfig(lap.jenis);
            return (
              <Link
                key={lap.id}
                to={`/laporan/${lap.id}`}
                className={`block p-4 sm:p-5 rounded-lg border-2 transition-all hover:shadow-md hover:scale-102 ${config.color} hover:border-emerald-400`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-2 rounded-lg bg-white border ${config.color}`}>
                      <config.icon size={20} className="text-gray-700" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-900">{config.label}</h3>
                        <span className="text-xs text-gray-500">#{lap.id}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                        <Calendar size={14} />
                        {formatTanggal(lap.tanggal)}
                      </div>
                      {lap.data && typeof lap.data === 'object' && (
                        <div className="mt-2 text-sm text-gray-700">
                          {Object.entries(lap.data)
                            .slice(0, 2)
                            .map(([key, value]) => (
                              <div key={key} className="text-xs text-gray-600">
                                {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value).substring(0, 50)}
                              </div>
                            ))
                          }
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="text-gray-400 flex-shrink-0 mt-1" size={20} />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Stats */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <div className="text-gray-600 text-sm font-semibold">Total Laporan</div>
            <div className="text-2xl font-bold text-emerald-600">{laporan.length}</div>
          </div>
          <div>
            <div className="text-gray-600 text-sm font-semibold">Ditampilkan</div>
            <div className="text-2xl font-bold text-blue-600">{filteredLaporan.length}</div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <div className="text-gray-600 text-sm font-semibold">Terakhir Update</div>
            <div className="text-sm font-semibold text-gray-900">
              {laporan.length > 0
                ? formatTanggal(laporan[0].tanggal)
                : '-'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
