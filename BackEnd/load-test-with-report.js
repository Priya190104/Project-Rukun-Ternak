import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.3/index.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

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

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000/api';
let authToken = '';
let userId = '';

console.log(`🔗 Base URL: ${BASE_URL}`);

// Configuration untuk skenario
export const options = {
  scenarios: {
    scenario_100_users: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 100 },
        { duration: '180s', target: 100 },
        { duration: '30s', target: 0 },
      ],
      tags: { scenario: '100_users_3min', load_level: '100' },
    },
    scenario_200_users: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '45s', target: 200 },
        { duration: '180s', target: 200 },
        { duration: '45s', target: 0 },
      ],
      tags: { scenario: '200_users_3min', load_level: '200' },
    },
  },
  thresholds: {
    'http_req_duration{scenario:100_users_3min}': ['p(95)<2000', 'p(99)<4000', 'avg<1000'],
    'http_req_duration{scenario:200_users_3min}': ['p(95)<3000', 'p(99)<5000', 'avg<1500'],
    'http_req_failed': ['rate<0.1'],
    errors: ['rate<0.1'],
  },
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
};

// Test data
const testUsers = [
  { username: 'admin@rukun.id', password: 'password123' },
  { username: 'test_user1', password: 'password123' },
  { username: 'test_user2', password: 'password123' },
  { username: 'kelompok1', password: 'password123' },
  { username: 'kelompok2', password: 'password123' },
];

export default function () {
  const vusId = __VU;
  activeVUs.add(__VU);

  // ===== GROUP 1: LOGIN =====
  group('01_Login', () => {
    const testUser = testUsers[(__VU - 1) % testUsers.length];

    const payload = JSON.stringify({
      username: testUser.username,
      password: testUser.password,
    });

    const params = {
      headers: { 'Content-Type': 'application/json' },
      timeout: '5s',
      tags: { name: 'Login', endpoint: '/auth/login' },
    };

    const loginResp = http.post(`${BASE_URL}/auth/login`, payload, params);

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
      'login time < 500ms': (r) => r.timings.duration < 500,
    });

    if (isSuccess) {
      try {
        const data = JSON.parse(loginResp.body);
        authToken = data.data?.token || '';
        userId = data.data?.user?.id || '';
      } catch (e) {
        authToken = '';
      }
    }

    loginDuration.add(loginResp.timings.duration);
    errorRate.add(loginResp.status >= 400 ? 1 : 0);
    requestCounter.add(1);
    if (isSuccess) successCounter.add(1);
    else failureCounter.add(1);

    sleep(0.5);
  });

  // Skip if login gagal
  if (!authToken) {
    sleep(1);
    return;
  }

  // ===== GROUP 2: DASHBOARD =====
  group('02_Dashboard_Stats', () => {
    const params = {
      headers: { Authorization: `Bearer ${authToken}` },
      timeout: '5s',
      tags: { name: 'Dashboard', endpoint: '/stats/admin/dashboard' },
    };

    const dashResp = http.get(`${BASE_URL}/stats/admin/dashboard`, params);

    check(dashResp, {
      'dashboard status 200 or 401': (r) => r.status === 200 || r.status === 401,
      'dashboard time < 2s': (r) => r.timings.duration < 2000,
      'dashboard time < 1s': (r) => r.timings.duration < 1000,
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
    const params = {
      headers: { Authorization: `Bearer ${authToken}` },
      timeout: '5s',
      tags: { name: 'Hewan', endpoint: '/hewan' },
    };

    const hewanResp = http.get(`${BASE_URL}/hewan?limit=50&page=1`, params);

    check(hewanResp, {
      'hewan list status 200 or 401': (r) => r.status === 200 || r.status === 401,
      'hewan list time < 2s': (r) => r.timings.duration < 2000,
      'hewan list time < 1s': (r) => r.timings.duration < 1000,
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
    const params = {
      headers: { Authorization: `Bearer ${authToken}` },
      timeout: '5s',
      tags: { name: 'Laporan', endpoint: '/laporan' },
    };

    const lapResp = http.get(`${BASE_URL}/laporan?limit=50&page=1`, params);

    check(lapResp, {
      'laporan list status 200 or 401': (r) => r.status === 200 || r.status === 401,
      'laporan list time < 2s': (r) => r.timings.duration < 2000,
      'laporan list time < 1s': (r) => r.timings.duration < 1000,
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
    const params = {
      headers: { Authorization: `Bearer ${authToken}` },
      timeout: '5s',
      tags: { name: 'Kelompok', endpoint: '/kelompok' },
    };

    const kelResp = http.get(`${BASE_URL}/kelompok?limit=50&page=1`, params);

    check(kelResp, {
      'kelompok list status 200 or 401': (r) => r.status === 200 || r.status === 401,
      'kelompok list time < 2s': (r) => r.timings.duration < 2000,
      'kelompok list time < 1s': (r) => r.timings.duration < 1000,
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
    const params = {
      headers: { Authorization: `Bearer ${authToken}` },
      timeout: '5s',
      tags: { name: 'Analysis', endpoint: '/stats' },
    };

    const analysisResp = http.get(`${BASE_URL}/stats`, params);

    check(analysisResp, {
      'analysis status 200 or 401': (r) => r.status === 200 || r.status === 401,
      'analysis time < 2s': (r) => r.timings.duration < 2000,
      'analysis time < 1.5s': (r) => r.timings.duration < 1500,
    });

    analysisDuration.add(analysisResp.timings.duration);
    errorRate.add(analysisResp.status >= 400 ? 1 : 0);
    requestCounter.add(1);
    if (analysisResp.status < 400) successCounter.add(1);
    else failureCounter.add(1);

    sleep(0.3);
  });

  // Think time
  sleep(1);
}

// Handle results
export function handleSummary(data) {
  const timestamp = new Date().toISOString().split('T')[0];
  const htmlFile = `results_${timestamp}.html`;
  const jsonFile = `results_${timestamp}.json`;

  return {
    [htmlFile]: htmlReport(data),
    [jsonFile]: JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
