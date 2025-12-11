import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReportById } from '../services/reportService';
import { useAuth } from '../hooks/useAuth';

export default function ClientLihatLaporan() {
  const { id } = useParams();
  const { user, appRole } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const r = await getReportById(id);
      if (!mounted) return;
      if (!r) {
        alert('Laporan tidak ditemukan');
        navigate('/');
        return;
      }

      // kelompok may only view own reports
      if (appRole === 'kelompok' && r.createdBy !== user.id) {
        navigate('/menunggu');
        return;
      }

      setReport(r);
    }
    load();
    return () => { mounted = false; };
  }, [id, user, appRole, navigate]);

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-emerald-700">Memuat laporan...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-emerald-50 flex items-start justify-center">
      <div className="w-full max-w-xl bg-white rounded shadow p-6">
        <h2 className="text-2xl font-semibold text-emerald-900 mb-2">Detail Laporan</h2>
        <div className="text-sm text-gray-600 mb-4">ID: {report.id}</div>

        <div className="space-y-2">
          <div>
            <div className="text-sm text-gray-500">Tanggal</div>
            <div className="text-emerald-800">{report.tanggal}</div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Jenis</div>
            <div className="text-emerald-800">{report.jenis}</div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Jumlah</div>
            <div className="text-emerald-800">{report.jumlah}</div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Keterangan</div>
            <div className="text-emerald-800">{report.keterangan || '-'}</div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Dibuat oleh</div>
            <div className="text-emerald-800">{report.createdBy}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
