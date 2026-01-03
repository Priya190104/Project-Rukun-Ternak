import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const dashboardDuration = new Trend('dashboard_duration');
const hewan_duration = new Trend('hewan_duration');
const laporanDuration = new Trend('laporan_duration');
const kelompokDuration = new Trend('kelompok_duration');
const analysisDuration = new Trend('analysis_duration');
const requestCounter = new Counter('requests_total');
const successCounter = new Counter('requests_success');
const failureCounter = new Counter('requests_failed');
const activeVUs = new Gauge('active_vus');

const BASE_URL = 'http://localhost:4000/api';
let authToken = '';
let userId = '';

// Configuration untuk skenario
export const options = {
  scenarios: {
    // Skenario 100 User - Concurrent untuk 3 menit
    scenario_100_users: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 100 }, // Ramp up 30s
        { duration: '180s', target: 100 }, // Maintain 100 user selama 3 menit
        { duration: '30s', target: 0 },    // Ramp down 30s
      ],
      tags: { scenario: '100_users_3min' },
    },
    // Skenario 200 User - Concurrent untuk 3 menit
    scenario_200_users: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '45s', target: 200 }, // Ramp up 45s
        { duration: '180s', target: 200 }, // Maintain 200 user selama 3 menit
        { duration: '45s', target: 0 },    // Ramp down 45s
      ],
      tags: { scenario: '200_users_3min' },
    },
  },
  // Thresholds untuk menentukan apakah test LULUS atau GAGAL
  thresholds: {
    'http_req_duration{scenario:100_users_3min}': ['p(95)<2000', 'p(99)<4000', 'avg<1000'],
    'http_req_duration{scenario:200_users_3min}': ['p(95)<3000', 'p(99)<5000', 'avg<1500'],
    'http_req_failed': ['rate<0.1'], // Fail rate < 10%
    errors: ['rate<0.1'],
  },
  // Konfigurasi global
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
};

export default function () {
  const vusId = `${__VU}_${__ITER}`;
  activeVUs.add(__VU);

  // ===== GROUP 1: LOGIN =====
  group('01_Login', () => {
    // Menggunakan user yang sudah ada atau buat simulasi
    const username = `test_${__VU}`;
    const password = 'Password123!';

    const payload = JSON.stringify({
      username: username,
      password: password,
    });

    const loginResp = http.post(`${BASE_URL}/auth/login`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    const isSuccess = loginResp.status === 200;

    check(loginResp, {
      'login status 200': (r) => r.status === 200,
      'login response valid': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.success === true && body.data?.token;
        } catch {
          return false;
        }
      },
      'login time < 1s': (r) => r.timings.duration < 1000,
    });

    if (isSuccess) {
      try {
        const data = JSON.parse(loginResp.body);
        authToken = data.data?.token || '';
        userId = data.data?.user?.id || '';
      } catch (e) {
        console.log('Failed to parse login response');
      }
    }

    loginDuration.add(loginResp.timings.duration);
    errorRate.add(loginResp.status >= 400 ? 1 : 0);
    requestCounter.add(1);
    if (isSuccess) successCounter.add(1);
    else failureCounter.add(1);

    sleep(0.5);
  });

  // Jika login gagal, skip endpoint lainnya
  if (!authToken) {
    sleep(1);
    return;
  }

  // ===== GROUP 2: DASHBOARD =====
  group('02_Dashboard_Stats', () => {
    const dashResp = http.get(`${BASE_URL}/stats/admin/dashboard`, {
      headers: { Authorization: `Bearer ${authToken}` },
      tags: { name: 'AdminDashboard' },
    });

    check(dashResp, {
      'dashboard status 200': (r) => r.status === 200,
      'dashboard time < 2s': (r) => r.timings.duration < 2000,
      'dashboard response valid': (r) => r.status === 200 && r.body.length > 0,
    });

    dashboardDuration.add(dashResp.timings.duration);
    errorRate.add(dashResp.status >= 400 ? 1 : 0);
    requestCounter.add(1);
    if (dashResp.status < 400) successCounter.add(1);
    else failureCounter.add(1);

    sleep(0.3);
  });

  // ===== GROUP 3: HEWAN TERNAK LIST =====
  group('03_Hewan_Ternak_List', () => {
    const hewanResp = http.get(`${BASE_URL}/hewan?limit=50&page=1`, {
      headers: { Authorization: `Bearer ${authToken}` },
      tags: { name: 'HewanList' },
    });

    check(hewanResp, {
      'hewan list status 200': (r) => r.status === 200,
      'hewan list time < 2s': (r) => r.timings.duration < 2000,
      'hewan list response valid': (r) => r.status === 200 && r.body.length > 0,
    });

    hewan_duration.add(hewanResp.timings.duration);
    errorRate.add(hewanResp.status >= 400 ? 1 : 0);
    requestCounter.add(1);
    if (hewanResp.status < 400) successCounter.add(1);
    else failureCounter.add(1);

    sleep(0.3);
  });

  // ===== GROUP 4: LAPORAN LIST =====
  group('04_Laporan_List', () => {
    const lapResp = http.get(`${BASE_URL}/laporan?limit=50&page=1`, {
      headers: { Authorization: `Bearer ${authToken}` },
      tags: { name: 'LaporanList' },
    });

    check(lapResp, {
      'laporan list status 200': (r) => r.status === 200,
      'laporan list time < 2s': (r) => r.timings.duration < 2000,
      'laporan list response valid': (r) => r.status === 200 && r.body.length > 0,
    });

    laporanDuration.add(lapResp.timings.duration);
    errorRate.add(lapResp.status >= 400 ? 1 : 0);
    requestCounter.add(1);
    if (lapResp.status < 400) successCounter.add(1);
    else failureCounter.add(1);

    sleep(0.3);
  });

  // ===== GROUP 5: KELOMPOK LIST =====
  group('05_Kelompok_List', () => {
    const kelResp = http.get(`${BASE_URL}/kelompok?limit=50&page=1`, {
      headers: { Authorization: `Bearer ${authToken}` },
      tags: { name: 'KelompokList' },
    });

    check(kelResp, {
      'kelompok list status 200': (r) => r.status === 200,
      'kelompok list time < 2s': (r) => r.timings.duration < 2000,
      'kelompok list response valid': (r) => r.status === 200 && r.body.length > 0,
    });

    kelompokDuration.add(kelResp.timings.duration);
    errorRate.add(kelResp.status >= 400 ? 1 : 0);
    requestCounter.add(1);
    if (kelResp.status < 400) successCounter.add(1);
    else failureCounter.add(1);

    sleep(0.3);
  });

  // ===== GROUP 6: ANALISIS/STATS =====
  group('06_Analysis_Stats', () => {
    const analysisResp = http.get(`${BASE_URL}/stats`, {
      headers: { Authorization: `Bearer ${authToken}` },
      tags: { name: 'Analysis' },
    });

    check(analysisResp, {
      'analysis status 200': (r) => r.status === 200,
      'analysis time < 2s': (r) => r.timings.duration < 2000,
      'analysis response valid': (r) => r.status === 200 && r.body.length > 0,
    });

    analysisDuration.add(analysisResp.timings.duration);
    errorRate.add(analysisResp.status >= 400 ? 1 : 0);
    requestCounter.add(1);
    if (analysisResp.status < 400) successCounter.add(1);
    else failureCounter.add(1);

    sleep(0.3);
  });

  // Think time antar iterasi
  sleep(1);
}
