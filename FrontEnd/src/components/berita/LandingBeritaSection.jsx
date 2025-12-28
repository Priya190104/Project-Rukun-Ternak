import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { getBeritaDisplayDate } from '../../utils/dateFormatter';

export default function LandingBeritaSection({ berita, loading }) {
  const navigate = useNavigate();
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (id) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  const handleBeritaClick = (item) => {
    if (item.slug) {
      navigate(`/berita/${item.slug}`);
    }
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

      {/* Grid layout for news cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {berita.map((item, idx) => (
          <div
            key={item.id || idx}
            onClick={() => handleBeritaClick(item)}
            className="bg-white rounded-2xl shadow-md border border-purple-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition cursor-pointer flex flex-col"
          >
            {/* Image */}
            <div className="overflow-hidden bg-gray-200 h-48">
              {imageErrors[item.id] ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-gray-500 text-sm">Gambar tidak tersedia</span>
                </div>
              ) : (
                <img
                  src={item.imageUrl}
                  alt={item.caption}
                  onError={() => handleImageError(item.id)}
                  className="w-full h-full object-cover hover:scale-105 transition"
                />
              )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-purple-600 transition">
                {item.caption}
              </h3>

              {/* Timestamp */}
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-auto pt-4 border-t border-gray-100">
                <Calendar className="w-4 h-4" />
                <span>{getBeritaDisplayDate(item)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
