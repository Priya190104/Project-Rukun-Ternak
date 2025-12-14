import client from '../api/client';

export async function getReports() {
  try {
    const res = await client.get('/api/laporan');
    return res.data?.data || [];
  } catch (err) {
    // If API unreachable, return empty list (no demo data)
    // eslint-disable-next-line no-console
    console.warn('Failed to fetch reports from API', err.message || err);
    return [];
  }
}

export async function getReportById(id) {
  try {
    const res = await client.get(`/api/laporan/${id}`);
    return res.data?.data || null;
  } catch (err) {
    console.warn('Failed to fetch report by id', err.message || err);
    return null;
  }
}

export async function createReport(payload) {
  try {
    const res = await client.post('/api/laporan', payload);
    return res.data?.data || null;
  } catch (err) {
    console.warn('Failed to create report', err.message || err);
    return null;
  }
}
