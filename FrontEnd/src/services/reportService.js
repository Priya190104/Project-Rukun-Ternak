import client from '../api/client';

// reportService: localStorage-backed mock service for laporan
const STORAGE_KEY = 'rukun_reports_v1';

function readAll() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeAll(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

const hasApi = Boolean(process.env.REACT_APP_API_URL);

export async function getReports({ userId = null, role = null } = {}) {
  // If API is configured, call backend
  if (hasApi) {
    try {
      const res = await client.get('/reports');
      const all = res.data || [];
      if (role === 'admin') return all;
      if (role === 'kelompok' && userId) return all.filter((r) => r.createdBy === userId);
      return [];
    } catch (err) {
      // fallback to localStorage
      // eslint-disable-next-line no-console
      console.warn('API reports fetch failed, falling back to localStorage', err.message || err);
    }
  }

  const all = readAll();
  if (role === 'admin') return all;
  if (role === 'kelompok' && userId) return all.filter((r) => r.createdBy === userId);
  return [];
}

export async function getReportById(id) {
  if (hasApi) {
    try {
      const res = await client.get(`/reports/${id}`);
      return res.data || null;
    } catch (err) {
      // fallback
      // eslint-disable-next-line no-console
      console.warn('API getReportById failed, falling back to localStorage', err.message || err);
    }
  }

  const all = readAll();
  const found = all.find((r) => r.id === id) || null;
  return found;
}

export async function createReport({ tanggal, jenis, jumlah, keterangan, createdBy }) {
  if (hasApi) {
    try {
      const payload = { tanggal, jenis, jumlah: Number(jumlah), keterangan, createdBy };
      const res = await client.post('/reports', payload);
      return res.data;
    } catch (err) {
      // fallback to local
      // eslint-disable-next-line no-console
      console.warn('API createReport failed, falling back to localStorage', err.message || err);
    }
  }

  const all = readAll();
  const newReport = {
    id: generateId(),
    tanggal,
    jenis,
    jumlah: Number(jumlah),
    keterangan: keterangan || '',
    createdBy,
    createdAt: new Date().toISOString(),
  };
  all.unshift(newReport);
  writeAll(all);
  return newReport;
}
