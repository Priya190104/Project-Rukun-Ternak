import React, { useState, useEffect } from 'react';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';

export default function BeritaForm({ onSubmit, loading, initialData = null, isEditing = false }) {
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialData) {
      setCaption(initialData.caption || '');
      setImageUrl(initialData.imageUrl || '');
        setImagePreview(initialData.imageUrl || '');
    }
  }, [initialData]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!caption.trim()) {
      newErrors.caption = 'Isi berita tidak boleh kosong';
    }

    if (!imageFile && !isEditing) {
      newErrors.image = 'Gambar tidak boleh kosong';
    }

    // Optional: we could check file.size if needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        caption: caption.trim(),
        imageFile,
      });
      setSuccess(true);
      if (!isEditing) {
        setCaption('');
        setImageUrl('');
        setImageFile(null);
        setImagePreview('');
      }
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setErrors({ form: error.message || 'Gagal menyimpan berita' });
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg p-6 border border-emerald-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditing ? 'Edit Berita' : 'Tambah Berita Baru'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{isEditing ? 'Berita berhasil diperbarui' : 'Berita berhasil ditambahkan'}</span>
          </div>
        )}

        {/* Form Error */}
        {errors.form && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{errors.form}</span>
          </div>
        )}

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Upload Gambar <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="flex items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50 cursor-pointer hover:border-emerald-500 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-6 h-6 text-emerald-600 mb-2" />
                  <p className="text-sm text-emerald-700 font-medium">Klik untuk upload gambar</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {errors.image && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.image}
                </p>
              )}
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-emerald-200">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Deskripsi Berita */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Isi Berita <span className="text-red-500">*</span>
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Tulis isi berita di sini..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition resize-none"
          />
          {errors.caption && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.caption}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Menyimpan...' : isEditing ? 'Perbarui Berita' : 'Tambah Berita'}
          </button>
        </div>
      </form>
    </div>
  );
}
