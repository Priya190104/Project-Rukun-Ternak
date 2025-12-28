import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';

export default function BannerForm({ onSubmit, loading, onCancel }) {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!['image/jpeg', 'image/jpg'].includes(file.type)) {
        setErrors({ image: 'Hanya file JPG/JPEG yang diizinkan' });
        setImageFile(null);
        setImagePreview('');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ image: 'Ukuran file maksimal 5MB' });
        setImageFile(null);
        setImagePreview('');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setErrors({});
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!imageFile) {
      newErrors.image = 'Pilih gambar banner terlebih dahulu';
    }

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
        imageFile,
      });
      setSuccess(true);
      setImageFile(null);
      setImagePreview('');
      setTimeout(() => {
        setSuccess(false);
        if (onCancel) onCancel();
      }, 1500);
    } catch (error) {
      setErrors({ form: error.message || 'Gagal menyimpan banner' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2.5 rounded-lg flex items-center gap-3 text-sm">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium">✓ Banner berhasil ditambahkan!</span>
        </div>
      )}

      {errors.form && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg flex items-center gap-3 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium">{errors.form}</span>
        </div>
      )}

      {/* Image Upload Input */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
          Pilih Gambar Banner
        </label>
        <input
          type="file"
          accept=".jpg,.jpeg"
          onChange={handleImageChange}
          className="hidden"
          id="image-input"
          disabled={loading}
        />
        <label
          htmlFor="image-input"
          className={`block border rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
            errors.image
              ? 'border-red-300 bg-red-50'
              : imageFile 
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-gray-300 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Upload className={`w-6 h-6 mx-auto mb-1.5 ${
            errors.image ? 'text-red-500' : imageFile ? 'text-emerald-600' : 'text-gray-400'
          }`} />
          <p className="text-xs font-semibold text-gray-800">
            {imageFile ? imageFile.name : 'Pilih atau drag gambar'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            JPG/JPEG • Max 5MB • Rasio 16:9
          </p>
        </label>
        {errors.image && (
          <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {errors.image}
          </p>
        )}
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
            Preview Gambar
          </label>
          <div className="relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
            <div className="aspect-video">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1.5">
            Gambar akan ditampilkan di halaman landing
          </p>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={loading || !imageFile}
          className={`flex-1 py-2.5 px-3 rounded-lg font-semibold text-sm text-white transition-all duration-200 ${
            loading || !imageFile
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
          }`}
        >
          {loading ? 'Menyimpan...' : 'Simpan Banner'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="py-2.5 px-4 rounded-lg font-semibold text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
          >
            Batal
          </button>
        )}
      </div>
    </form>
  );
}
