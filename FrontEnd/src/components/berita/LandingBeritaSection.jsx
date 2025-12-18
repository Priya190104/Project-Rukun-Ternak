import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { getBeritaDisplayDate } from '../../utils/dateFormatter';

export default function LandingBeritaSection({ berita, loading }) {
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (id) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };
  if (loading) {
    return (
      <section className="mt-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-xl font-bold">📰</div>
          <div>
            <h2 className="text-3xl font-bold">BERITA TERKINI</h2>
            <p className="text-gray-600 mt-1">Update terbaru dari program Rukun Ternak</p>
          </div>
        </div>
        <div className="text-center py-10 text-gray-500">Memuat berita...</div>
      </section>
    );
  }

  if (!berita || berita.length === 0) {
    return null;
  }

  return (
    <section className="mt-20">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-xl font-bold">📰</div>
        <div>
          <h2 className="text-3xl font-bold">BERITA TERKINI</h2>
          <p className="text-gray-600 mt-1">Update terbaru dari program Rukun Ternak</p>
        </div>
      </div>

      <div className="space-y-6">
        {berita.map((item, idx) => (
          <div
            key={item.id || idx}
            className="bg-white rounded-2xl shadow-md border border-purple-100 overflow-hidden hover:shadow-lg transition"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4">
              {/* Image - Left side on desktop, top on mobile */}
              <div className="md:col-span-4">
                {imageErrors[item.id] ? (
                  <div className="w-full h-40 md:h-48 bg-gray-200 rounded-xl flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Gambar tidak tersedia</span>
                  </div>
                ) : (
                  <img
                    src={item.imageUrl}
                    alt={item.caption}
                    onError={() => handleImageError(item.id)}
                    className="w-full h-40 md:h-48 object-cover rounded-xl"
                  />
                )}
              </div>

              {/* Content - Right side on desktop, bottom on mobile */}
              <div className="md:col-span-8 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Berita Terkini</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">{item.caption}</p>

                  {/* Timestamp */}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{getBeritaDisplayDate(item)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
