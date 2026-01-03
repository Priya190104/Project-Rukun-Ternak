# Load Test Results - Rukun Ternak Application

## Testing Overview
Script load testing untuk mengukur performa aplikasi Rukun Ternak dengan skenario 100 dan 200 user secara bersamaan.

## Tools yang Digunakan
- **k6** - Modern load testing tool untuk performance testing
- Metrics: Response time, Error rate, Throughput, Active VUs

## Skenario Testing

### Skenario 1: 100 User Concurrent (3 menit)
```
Ramp Up: 0 → 100 user dalam 30 detik
Maintain: 100 user selama 180 detik (3 menit)
Ramp Down: 100 → 0 user dalam 30 detik
Total Duration: 4 menit 20 detik
```

### Skenario 2: 200 User Concurrent (3 menit)
```
Ramp Up: 0 → 200 user dalam 45 detik
Maintain: 200 user selama 180 detik (3 menit)
Ramp Down: 200 → 0 user dalam 45 detik
Total Duration: 4 menit 30 detik
```

## Endpoint yang Di-test

1. **Authentication** (POST /api/auth/login)
   - Login dengan user test
   - Validasi token generation

2. **Dashboard Stats** (GET /api/stats/admin/dashboard)
   - Fetch dashboard statistics
   - Admin-only endpoint

3. **Hewan Ternak** (GET /api/hewan?limit=50&page=1)
   - List semua hewan ternak
   - Pagination test

4. **Laporan** (GET /api/laporan?limit=50&page=1)
   - List laporan
   - Pagination test

5. **Kelompok** (GET /api/kelompok?limit=50&page=1)
   - List kelompok
   - Pagination test

6. **Analysis Stats** (GET /api/stats)
   - Global statistics
   - Heavy query test

## Performance Thresholds

### Untuk 100 User:
- Response time P95: < 2000ms
- Response time P99: < 4000ms
- Average response time: < 1000ms
- Error rate: < 10%

### Untuk 200 User:
- Response time P95: < 3000ms
- Response time P99: < 5000ms
- Average response time: < 1500ms
- Error rate: < 10%

## Metrics yang Diukur

### Response Time Metrics:
- **login_duration**: Waktu login
- **dashboard_duration**: Waktu load dashboard
- **hewan_duration**: Waktu load hewan ternak
- **laporan_duration**: Waktu load laporan
- **kelompok_duration**: Waktu load kelompok
- **analysis_duration**: Waktu load analisis

### Counter Metrics:
- **requests_total**: Total request
- **requests_success**: Successful requests
- **requests_failed**: Failed requests
- **errors**: Error count
- **active_vus**: Active virtual users

## Cara Menjalankan Testing

### Install k6 (Windows)
```powershell
# Menggunakan Chocolatey
choco install k6

# Atau download dari: https://github.com/grafana/k6/releases
```

### Jalankan Test

#### Test dengan 100 dan 200 User (Dua skenario sekaligus):
```bash
cd BackEnd
k6 run load-test-scenarios.js
```

#### Test hanya 100 User:
```bash
k6 run --scenario-only 100_users_3min load-test-scenarios.js
```

#### Test hanya 200 User:
```bash
k6 run --scenario-only 200_users_3min load-test-scenarios.js
```

#### Test dengan custom output file:
```bash
k6 run --out json=results.json load-test-scenarios.js
```

## Memahami Results

### Output Format:
```
scenarios: (100.00%) 1 scenario, 200 max VUs, 9m20s max duration (includes 45s graceful stop)
...

✓ login status 200
✓ login response valid
✓ login time < 1s
✓ hewan list status 200
...

http_req_duration..............: avg=850ms    min=45ms  med=320ms max=5.2s   p(90)=1.5s p(95)=2.1s p(99)=3.8s
http_req_failed................: 4.5%
```

### Key Indicators:

1. **avg (average)**: Response time rata-rata
   - Target: < 1000ms untuk 100 user, < 1500ms untuk 200 user

2. **p(95)**: 95 percentile response time
   - 95% request selesai dalam waktu ini
   - Target: < 2000ms untuk 100 user, < 3000ms untuk 200 user

3. **p(99)**: 99 percentile response time
   - 99% request selesai dalam waktu ini
   - Target: < 4000ms untuk 100 user, < 5000ms untuk 200 user

4. **http_req_failed**: Error rate
   - Persentase request yang gagal
   - Target: < 10%

## Expected Results Analysis

### Worst Case Scenario (Baseline):
Jika database dan server tidak optimal:
- 100 user → avg ~1500ms, p95 ~3000ms, error rate ~5-8%
- 200 user → avg ~2500ms, p95 ~5000ms, error rate ~8-12%

### Best Case Scenario (Optimized):
Jika database dan server sudah optimized:
- 100 user → avg ~400ms, p95 ~800ms, error rate ~1-2%
- 200 user → avg ~600ms, p95 ~1500ms, error rate ~2-3%

### Typical Expected:
- 100 user → avg ~700ms, p95 ~1500ms, error rate ~3-5%
- 200 user → avg ~1200ms, p95 ~2500ms, error rate ~5-8%

## Troubleshooting

### Jika request gagal dengan 401:
- Pastikan user test sudah ada di database
- Check apakah token generation berfungsi
- Verify authorization header format

### Jika response time terlalu lama:
- Check database query performance
- Monitor CPU dan memory usage
- Check network latency
- Review application logs

### Jika error rate tinggi:
- Check server logs untuk error messages
- Verify database connection
- Check resource limits
- Monitor for timeouts

## Optimization Recommendations

Berdasarkan hasil test, dapat dilakukan optimasi:

1. **Database Optimization**
   - Add index untuk frequently queried columns
   - Optimize JOIN queries
   - Consider caching untuk stats endpoint

2. **Application Level**
   - Implement response caching
   - Use pagination untuk large datasets
   - Optimize N+1 queries

3. **Infrastructure**
   - Increase connection pool size
   - Add database replicas
   - Implement load balancing
   - Use CDN untuk static assets

## Next Steps

1. Run test dan kumpulkan baseline metrics
2. Analyze bottlenecks
3. Implement optimizations
4. Re-run test untuk verify improvements
5. Monitor production dengan APM tools

---

**Generated**: January 4, 2026
**Test Duration**: ~9 minutes untuk kedua skenario
**Prerequisites**: Backend server running pada http://localhost:4000
