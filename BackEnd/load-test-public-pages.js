import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const landingPageDuration = new Trend('landing_page_duration');
const loginPageDuration = new Trend('login_page_duration');
const requestCounter = new Counter('requests_total');
const successCounter = new Counter('requests_success');
const failureCounter = new Counter('requests_failed');
const activeVUs = new Gauge('active_vus');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  scenarios: {
    // Scenario 1: 100 user concurrent untuk 3 menit
    scenario_100_users_public: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 100 },
        { duration: '180s', target: 100 },
        { duration: '30s', target: 0 },
      ],
      tags: { scenario: '100_users_public' },
    },
    // Scenario 2: 200 user concurrent untuk 3 menit
    scenario_200_users_public: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '45s', target: 200 },
        { duration: '180s', target: 200 },
        { duration: '45s', target: 0 },
      ],
      tags: { scenario: '200_users_public' },
    },
    // Scenario 3: 500 user concurrent untuk 3 menit (capacity test)
    scenario_500_users_public: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '60s', target: 500 },
        { duration: '180s', target: 500 },
        { duration: '60s', target: 0 },
      ],
      tags: { scenario: '500_users_public' },
    },
    // Scenario 4: 1000 user concurrent untuk 2 menit (stress test)
    scenario_1000_users_stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '90s', target: 1000 },
        { duration: '120s', target: 1000 },
        { duration: '90s', target: 0 },
      ],
      tags: { scenario: '1000_users_stress' },
    },
  },
  thresholds: {
    'http_req_duration{scenario:100_users_public}': ['p(95)<1500', 'p(99)<3000', 'avg<500'],
    'http_req_duration{scenario:200_users_public}': ['p(95)<2000', 'p(99)<4000', 'avg<800'],
    'http_req_duration{scenario:500_users_public}': ['p(95)<3000', 'p(99)<5000', 'avg<1000'],
    'http_req_duration{scenario:1000_users_stress}': ['p(95)<4000', 'p(99)<6000'],
    'http_req_failed': ['rate<0.05'],
    errors: ['rate<0.05'],
  },
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(50)', 'p(90)', 'p(95)', 'p(99)'],
};

export default function () {
  activeVUs.add(__VU);

  // ===== GROUP 1: LANDING PAGE =====
  group('01_Landing_Page', () => {
    const params = {
      timeout: '10s',
      tags: { name: 'LandingPage', endpoint: '/' },
    };

    const landingResp = http.get(`${BASE_URL}/`, params);

    const isSuccess = landingResp.status === 200;

    check(landingResp, {
      'landing page status 200': (r) => r.status === 200,
      'landing page time < 1.5s': (r) => r.timings.duration < 1500,
      'landing page time < 500ms': (r) => r.timings.duration < 500,
      'landing page response valid': (r) => r.body && r.body.length > 100,
    });

    landingPageDuration.add(landingResp.timings.duration);
    errorRate.add(isSuccess ? 0 : 1);
    requestCounter.add(1);
    if (isSuccess) successCounter.add(1);
    else failureCounter.add(1);

    sleep(0.5);
  });

  // ===== GROUP 2: LOGIN PAGE =====
  group('02_Login_Page', () => {
    const params = {
      timeout: '10s',
      tags: { name: 'LoginPage', endpoint: '/login' },
    };

    const loginResp = http.get(`${BASE_URL}/login`, params);

    const isSuccess = loginResp.status === 200;

    check(loginResp, {
      'login page status 200': (r) => r.status === 200,
      'login page time < 1.5s': (r) => r.timings.duration < 1500,
      'login page time < 500ms': (r) => r.timings.duration < 500,
      'login page response valid': (r) => r.body && r.body.length > 100,
    });

    loginPageDuration.add(loginResp.timings.duration);
    errorRate.add(isSuccess ? 0 : 1);
    requestCounter.add(1);
    if (isSuccess) successCounter.add(1);
    else failureCounter.add(1);

    sleep(0.5);
  });

  // ===== GROUP 3: PROFIL PAGE =====
  group('03_Profil_Page', () => {
    const params = {
      timeout: '10s',
      tags: { name: 'ProfilPage', endpoint: '/profil' },
    };

    const profilResp = http.get(`${BASE_URL}/profil`, params);

    const isSuccess = profilResp.status === 200;

    check(profilResp, {
      'profil page status 200': (r) => r.status === 200,
      'profil page time < 2s': (r) => r.timings.duration < 2000,
      'profil page response valid': (r) => r.body && r.body.length > 100,
    });

    errorRate.add(isSuccess ? 0 : 1);
    requestCounter.add(1);
    if (isSuccess) successCounter.add(1);
    else failureCounter.add(1);

    sleep(0.3);
  });

  // Think time
  sleep(1);
}
