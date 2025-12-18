import React, { useState } from 'react';
import { Trash2, Edit2, AlertCircle, Calendar } from 'lucide-react';
import { getBeritaDisplayDate } from '../../utils/dateFormatter';

export default function BeritaList({ berita, onEdit, onDelete, loading }) {
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  const handleDeleteClick = (id) => {
    setDeleteConfirm(id);
  };

  const handleConfirmDelete = async (id) => {
    try {
      await onDelete(id);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting berita:', error);
    }
  };

  const handleImageError = (id) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  if (berita.length === 0) {
    return (
      <div className="w-full bg-white rounded-2xl shadow-lg p-8 border border-emerald-100 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">Belum ada berita yang ditambahkan</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {berita.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-2xl shadow-md border border-emerald-100 overflow-hidden hover:shadow-lg transition"
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
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{getBeritaDisplayDate(item)}</span>
                  {item.updatedAt !== item.createdAt && (
                    <span className="text-gray-400 ml-2">
                      (diubah {new Date(item.updatedAt).toLocaleDateString('id-ID')})
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => onEdit(item)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
                  disabled={loading}
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(item.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition disabled:opacity-50"
                  disabled={loading || deleteConfirm === item.id}
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus
                </button>
              </div>
            </div>
          </div>

          {/* Delete Confirmation */}
          {deleteConfirm === item.id && (
            <div className="border-t border-gray-200 bg-red-50 p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">Yakin ingin menghapus berita ini?</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-3 py-1 bg-gray-300 text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-400 transition"
                  disabled={loading}
                >
                  Batal
                </button>
                <button
                  onClick={() => handleConfirmDelete(item.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Menghapus...' : 'Ya, Hapus'}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
