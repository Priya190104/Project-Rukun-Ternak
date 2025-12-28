import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, AlertCircle } from 'lucide-react';
import client from '../api/client';
import Footer from '../components/layout/Footer';

export default function DetailBerita() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [berita, setBerita] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadBerita = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await client.get(`/api/berita/slug/${slug}`);
        if (data.success) {
          setBerita(data.data);
        } else {
          setError('Berita tidak ditemukan');
        }
      } catch (err) {
        console.error('Error loading berita:', err);
        setError('Gagal memuat berita');
      } finally {
        setLoading(false);
      }
    };

    loadBerita();
  }, [slug]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat berita...</p>
        </div>
      </div>
    );
  }

  if (error || !berita) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Beranda
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Berita Tidak Ditemukan</h3>
              <p className="text-red-700 mt-2">{error || 'Berita yang Anda cari tidak tersedia.'}</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Beranda
          </button>
        </div>
      </div>

      {/* Main Content */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {berita.caption}
          </h1>

          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{formatDate(berita.publishedAt || berita.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {!imageError && berita.imageUrl && (
          <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
            <img
              src={berita.imageUrl}
              alt={berita.caption}
              onError={() => setImageError(true)}
              className="w-full h-96 object-cover"
            />
          </div>
        )}

        {/* Content */}
        {berita.content ? (
          <div className="bg-white rounded-lg p-8 shadow-sm prose prose-sm max-w-none">
            <div
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: berita.content }}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {berita.caption}
            </p>
          </div>
        )}

        {/* Meta Info */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-200">
            <h3 className="font-semibold text-emerald-900 mb-2">Informasi Berita</h3>
            <div className="text-sm text-emerald-700">
              <p>Dipublikasikan: {formatDate(berita.publishedAt || berita.createdAt)}</p>
              {berita.updatedAt && (
                <p>Diperbarui: {formatDate(berita.updatedAt)}</p>
              )}
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
