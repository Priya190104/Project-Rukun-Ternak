import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const kelompokDuration = new Trend('kelompok_duration');
const laporanDuration = new Trend('laporan_duration');
const requestCounter = new Counter('requests_total');
const activeVUs = new Gauge('active_vus');

const BASE_URL = 'http://localhost:4000/api';
let authToken = '';

export const options = {
  scenarios: {
    scenario_20_1min: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 20 },
        { duration: '50s', target: 20 },
        { duration: '10s', target: 0 },
      ],
      tags: { scenario: '20_users_1min' },
    },
    scenario_50_2min: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 50 },
        { duration: '100s', target: 50 },
        { duration: '20s', target: 0 },
      ],
      tags: { scenario: '50_users_2min' },
    },
    scenario_100_3min: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 100 },
        { duration: '150s', target: 100 },
        { duration: '30s', target: 0 },
      ],
      tags: { scenario: '100_users_3min' },
    },
    scenario_300_4min: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '60s', target: 300 },
        { duration: '200s', target: 300 },
        { duration: '60s', target: 0 },
      ],
      tags: { scenario: '300_users_4min' },
    },
  },
  thresholds: {
    'http_req_duration{scenario:20_users_1min}': ['p(95)<500', 'p(99)<1000'],
    'http_req_duration{scenario:50_users_2min}': ['p(95)<1000', 'p(99)<2000'],
    'http_req_duration{scenario:100_users_3min}': ['p(95)<2000', 'p(99)<3000'],
    'http_req_duration{scenario:300_users_4min}': ['p(95)<5000'],
    'http_req_failed': ['rate<0.1'],
  },
};

export default function () {
  activeVUs.add(__VU);

  group('Login', () => {
    const payload = JSON.stringify({
      username: `user${__VU}@test.com`,
      password: 'password123',
    });

    const loginResp = http.post(`${BASE_URL}/auth/login`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    check(loginResp, {
      'login ok': (r) => r.status === 200 || r.status === 401,
      'login time < 500ms': (r) => r.timings.duration < 500,
    });

    if (loginResp.status === 200) {
      try {
        const data = JSON.parse(loginResp.body);
        authToken = data.data?.token || '';
      } catch (e) {}
    }

    loginDuration.add(loginResp.timings.duration);
    errorRate.add(loginResp.status >= 400);
    requestCounter.add(1);
    sleep(0.5);
  });

  group('Kelompok List', () => {
    const kelResp = http.get(`${BASE_URL}/kelompok`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    check(kelResp, {
      'kelompok ok': (r) => r.status === 200 || r.status === 401,
      'kelompok time < 800ms': (r) => r.timings.duration < 800,
    });

    kelompokDuration.add(kelResp.timings.duration);
    errorRate.add(kelResp.status >= 400);
    requestCounter.add(1);
    sleep(0.5);
  });

  group('Laporan List', () => {
    const lapResp = http.get(`${BASE_URL}/laporan`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    check(lapResp, {
      'laporan ok': (r) => r.status === 200 || r.status === 401,
      'laporan time < 1000ms': (r) => r.timings.duration < 1000,
    });

    laporanDuration.add(lapResp.timings.duration);
    errorRate.add(lapResp.status >= 400);
    requestCounter.add(1);
    sleep(0.5);
  });
}
