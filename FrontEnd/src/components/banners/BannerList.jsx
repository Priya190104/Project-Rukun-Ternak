import React from 'react';
import { Trash2, Eye, EyeOff, ImageOff, Check, X } from 'lucide-react';

export default function BannerList({ banners, onDelete, onToggleActive, loading }) {
  // Helper function to construct full image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    // If already a full URL, return as is
    if (imageUrl.startsWith('http')) return imageUrl;
    // If relative path, construct full URL
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
    return `${baseUrl}${imageUrl}`;
  };

  if (!banners || banners.length === 0) {
    return (
      <div className="text-center py-16">
        <ImageOff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600 font-medium text-lg mb-1">Belum ada banner</p>
        <p className="text-sm text-gray-500">Mulai dengan menambahkan banner pertama Anda</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {banners.map((banner) => (
        <div
          key={banner.id}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200 flex flex-col"
        >
          {/* Image Preview Container - Fixed Aspect Ratio 16:9 */}
          <div className="relative bg-gray-100 aspect-video overflow-hidden">
            <img
              src={getImageUrl(banner.imageUrl)}
              alt={`Banner ${banner.id}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.warn(`Image load error for banner ${banner.id}:`, banner.imageUrl);
                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1600 900%22%3E%3Crect fill=%22%23e5e7eb%22 width=%221600%22 height=%22900%22/%3E%3Ctext x=%22800%22 y=%22450%22 font-size=%2240%22 fill=%22%239ca3af%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3EGambar tidak dapat dimuat%3C/text%3E%3C/svg%3E';
              }}
            />
            
            {/* Status Overlay */}
            {!banner.isActive && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                <div className="bg-gray-900 text-white px-4 py-2 rounded-full text-xs font-bold">
                  NONAKTIF
                </div>
              </div>
            )}
          </div>

          {/* Card Content */}
          <div className="p-4 flex flex-col flex-1">
            {/* Status Badge */}
            <div className="mb-3">
              {banner.isActive ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                  <Check className="w-3.5 h-3.5" /> Aktif
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                  <X className="w-3.5 h-3.5" /> Nonaktif
                </div>
              )}
            </div>

            {/* Date Info */}
            <div className="mb-4 flex-1">
              <p className="text-xs text-gray-500 font-medium">Dibuat pada:</p>
              <p className="text-xs text-gray-700 mt-1">
                {new Date(banner.createdAt).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>

            {/* Actions - Full Width Buttons */}
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <button
                onClick={() => onToggleActive(banner.id, !banner.isActive)}
                disabled={loading}
                className={`w-full py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  banner.isActive
                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed'
                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {banner.isActive ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    <span>Nonaktifkan</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>Aktifkan</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onDelete(banner.id)}
                disabled={loading}
                className="w-full py-2.5 px-3 rounded-lg text-sm font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
