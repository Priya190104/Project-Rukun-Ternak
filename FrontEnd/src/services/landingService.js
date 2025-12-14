import client from '../api/client';

export async function fetchLandingStats() {
  try {
    const { data } = await client.get('/api/public/landing-stats');
    return data?.data || {
      births: { count: 0, percent: 0 },
      deaths: { count: 0, percent: 0 },
      population: { current: 0, initial: 0 },
      lastUpdated: null,
    };
  } catch (err) {
    console.error('Failed to fetch landing stats:', err.message);
    return {
      births: { count: 0, percent: 0 },
      deaths: { count: 0, percent: 0 },
      population: { current: 0, initial: 0 },
      lastUpdated: null,
    };
  }
}
