import client from '../api/client';

/**
 * Fetch next ID bisnis hewan ternak dari backend.
 * @param {string|null} year  - 2 digit tahun, e.g. "26" (opsional, default: tahun sekarang)
 * @param {string|null} month - 2 digit bulan, e.g. "01" (opsional, default: bulan sekarang)
 * @returns {Promise<{ next_id: string, prefix: string, year_month: string, sequence: string }>}
 */
export async function fetchNextBisnisId(year = null, month = null) {
  const params = new URLSearchParams();
  if (year)  params.set('year', year);
  if (month) params.set('month', month);

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await client.get(`/api/hewan/next-bisnis-id${query}`);

  if (!res.data?.success) {
    throw new Error(res.data?.message || 'Gagal generate ID bisnis');
  }

  return res.data.data;
}

/**
 * Susun ID bisnis dari bagian-bagiannya.
 * @param {string} prefix     - e.g. "RT.NB"
 * @param {string} yearMonth  - e.g. "26.01"
 * @param {string} sequence   - e.g. "001"
 */
export function buildBisnisId(prefix, yearMonth, sequence) {
  return `${prefix}.${yearMonth}.${sequence}`;
}
