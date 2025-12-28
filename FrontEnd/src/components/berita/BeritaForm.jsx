import React, { useState, useEffect } from 'react';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { Editor } from '@tinymce/tinymce-react';
import './berita-editor.css';

export default function BeritaForm({ onSubmit, loading, initialData = null, isEditing = false }) {
  const [caption, setCaption] = useState('');
  const [content, setContent] = useState('');
  const [publishedAt, setPublishedAt] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialData) {
      setCaption(initialData.caption || '');
      setContent(initialData.content || '');
      setImagePreview(initialData.imageUrl || '');
      if (initialData.publishedAt) {
        // Convert ISO datetime to datetime-local format (YYYY-MM-DDTHH:mm)
        const date = new Date(initialData.publishedAt);
        const localString = date.toISOString().slice(0, 16);
        setPublishedAt(localString);
      }
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
      newErrors.caption = 'Judul berita tidak boleh kosong';
    }

    // Check if content is empty
    const stripHtml = (html) => html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    if (!content || stripHtml(content) === '') {
      newErrors.content = 'Isi berita tidak boleh kosong';
    }

    if (!publishedAt) {
      newErrors.publishedAt = 'Tanggal & waktu publikasi wajib diisi';
    }

    if (!imageFile && !isEditing) {
      newErrors.image = 'Gambar tidak boleh kosong';
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
        caption: caption.trim(),
        content: content.trim(),
        imageFile,
        publishedAt,
      });
      setSuccess(true);
      if (!isEditing) {
        setCaption('');
        setContent('');
        setPublishedAt('');
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

      <form onSubmit={handleSubmit} className="space-y-6">
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

        {/* Judul Berita */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Judul Berita <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Masukkan judul berita..."
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
          />
          {errors.caption && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.caption}
            </p>
          )}
        </div>

        {/* Isi Berita dengan TinyMCE */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Isi Berita <span className="text-red-500">*</span>
          </label>
          <div className="tinymce-editor-wrapper">
            <Editor
              apiKey="z59cmj4ywa2wo0d0tu2muqi7f7677vj84i853lhfgvavct91"
              init={{
                height: 400,
                menubar: false,
                plugins: ['lists', 'link', 'preview'],
                toolbar: 'bold italic underline | bullist numlist | link preview | undo redo',
                placeholder: 'Tulis isi berita di sini...',
                content_style: `
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    font-size: 0.95rem;
                    line-height: 1.6;
                    color: #111827;
                  }
                `,
              }}
              value={content}
              onEditorChange={(newContent) => setContent(newContent)}
            />
          </div>
          {errors.content && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.content}
            </p>
          )}
        </div>

        {/* Tanggal & Waktu Publikasi */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tanggal & Waktu Publikasi <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
          />
          {errors.publishedAt && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.publishedAt}
            </p>
          )}
          <p className="text-gray-500 text-xs mt-1">Format: DD/MM/YYYY HH:mm (Zona Waktu: WIB)</p>
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
