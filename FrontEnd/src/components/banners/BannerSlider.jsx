import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import client from '../../api/client';
import { AlertCircle } from 'lucide-react';

// Custom styles for banner slider
const bannerStyles = `
  .banner-slider .swiper-pagination-bullet {
    background-color: #059669;
    opacity: 0.5;
  }
  .banner-slider .swiper-pagination-bullet-active {
    opacity: 1;
  }
  .banner-slider .swiper-button-next,
  .banner-slider .swiper-button-prev {
    color: #059669;
    background-color: rgba(255, 255, 255, 0.8);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }
  .banner-slider .swiper-button-next:hover,
  .banner-slider .swiper-button-prev:hover {
    background-color: rgba(255, 255, 255, 1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
  .banner-slider .swiper-button-next::after,
  .banner-slider .swiper-button-prev::after {
    font-size: 18px;
  }
`;

export default function BannerSlider() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to construct full image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    // If already a full URL, return as is
    if (imageUrl.startsWith('http')) return imageUrl;
    // If relative path, construct full URL
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
    return `${baseUrl}${imageUrl}`;
  };

  useEffect(() => {
    // Add inline styles
    const styleElement = document.createElement('style');
    styleElement.innerHTML = bannerStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchBanners = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await client.get('/api/banners');
        if (!mounted) return;
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        console.log('Fetched banners:', data); // DEBUG
        setBanners(data);
      } catch (err) {
        console.error('Error fetching banners:', err);
        if (mounted) {
          setError('Failed to load banners');
          setBanners([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchBanners();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="w-full h-64 sm:h-80 lg:h-96 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl animate-pulse flex items-center justify-center">
        <div className="text-gray-600 font-medium">Loading banners...</div>
      </div>
    );
  }

  // Show placeholder if no banners
  if (!banners || banners.length === 0) {
    return (
      <div className="w-full h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-emerald-50 to-sky-50 border-2 border-dashed border-emerald-200 rounded-2xl flex flex-col items-center justify-center text-center p-6">
        <AlertCircle className="w-12 h-12 text-emerald-400 mb-3" />
        <p className="text-gray-600 font-medium mb-1">Belum ada banner</p>
        <p className="text-gray-500 text-sm">Banner akan ditampilkan di sini setelah admin menambahkannya</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <Swiper
        modules={[Pagination, Navigation, Autoplay]}
        pagination={{ clickable: true, dynamicBullets: true }}
        navigation={banners.length > 1}
        autoplay={banners.length > 1 ? { delay: 5000, disableOnInteraction: false } : false}
        loop={banners.length > 1}
        className="banner-slider rounded-2xl overflow-hidden shadow-lg"
        style={{
          '--swiper-pagination-color': '#059669',
          '--swiper-navigation-color': '#059669',
        }}
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div className="w-full h-64 sm:h-80 lg:h-96 bg-gray-100 flex items-center justify-center overflow-hidden">
              <img
                src={getImageUrl(banner.imageUrl)}
                alt={`Banner ${banner.id}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.warn(`Banner image load error for ID ${banner.id}:`, banner.imageUrl);
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1600 900%22%3E%3Crect fill=%22%23e5e7eb%22 width=%221600%22 height=%22900%22/%3E%3Ctext x=%22800%22 y=%22450%22 font-size=%2240%22 fill=%22%239ca3af%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3EGambar tidak dapat dimuat%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
