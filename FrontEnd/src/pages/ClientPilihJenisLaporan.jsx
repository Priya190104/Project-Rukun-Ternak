import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { createReport } from '../services/reportService';

export default function ClientPilihJenisLaporan() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ tanggal: '', jenis: '', jumlah: '', keterangan: '' });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tanggal || !form.jenis || !form.jumlah) return alert('Isi semua field wajib');
    setSaving(true);
    try {
      const created = await createReport({ ...form, createdBy: user.id });
      navigate(`/laporan/${created.id}`);
    } catch (err) {
      console.error(err);
      alert('Gagal membuat laporan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-emerald-50 flex items-start justify-center">
      <div className="w-full max-w-lg bg-white rounded shadow p-6">
        <h2 className="text-2xl font-semibold text-emerald-900 mb-4">Buat Laporan Ternak</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600">Tanggal</label>
            <input name="tanggal" type="date" value={form.tanggal} onChange={handleChange} className="mt-1 w-full p-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Jenis Laporan</label>
            <select name="jenis" value={form.jenis} onChange={handleChange} className="mt-1 w-full p-2 border rounded">
              <option value="">-- Pilih jenis --</option>
              <option value="Kelahiran">Kelahiran</option>
              <option value="Kematian">Kematian</option>
              <option value="Kesehatan">Kesehatan</option>
              <option value="Budidaya">Budidaya</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600">Jumlah Ternak</label>
            <input name="jumlah" type="number" value={form.jumlah} onChange={handleChange} className="mt-1 w-full p-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Keterangan</label>
            <textarea name="keterangan" value={form.keterangan} onChange={handleChange} className="mt-1 w-full p-2 border rounded" rows={3} />
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-emerald-600 text-white rounded">
              {saving ? 'Menyimpan...' : 'Buat Laporan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
