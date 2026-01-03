# 🚀 Load Testing Guide - Rukun Ternak

## Daftar Isi
1. [Setup & Prerequisites](#setup--prerequisites)
2. [Menjalankan Test](#menjalankan-test)
3. [Memahami Results](#memahami-results)
4. [Analisis & Troubleshooting](#analisis--troubleshooting)

---

## Setup & Prerequisites

### 1. Install k6

#### Windows (Menggunakan Chocolatey):
```powershell
choco install k6
```

#### Windows (Manual):
- Download dari: https://github.com/grafana/k6/releases
- Extract ke folder (misal: `C:\k6`)
- Add ke PATH:
  1. Win + Pause Break → Advanced System Settings
  2. Environment Variables
  3. Path → New → `C:\k6`
  4. Restart terminal

#### Verify Installation:
```bash
k6 version
```

### 2. Backend Setup

Pastikan backend server berjalan:
```bash
cd BackEnd
npm start
# atau
npm run dev
```

Server harus ready di: `http://localhost:4000`

### 3. Database Preparation (Optional)

Untuk test yang lebih realistis, persiapkan test data:
```bash
npm run seed  # Jika ada seed script
```

---

## Menjalankan Test

### Opsi 1: Menggunakan PowerShell Script (Recommended)

```powershell
# Navigate ke BackEnd folder
cd BackEnd

# Jalankan script
.\run-load-test.ps1
```

Script ini akan:
- ✅ Check apakah k6 terinstall
- ✅ Verify backend server running
- ✅ Tawarkan menu pilihan test
- ✅ Execute test secara otomatis

### Opsi 2: Jalankan Test Manual

#### Test 100 & 200 User (Recommended):
```bash
k6 run load-test-scenarios.js
```

#### Test hanya 100 User:
```bash
k6 run --only-scenario scenario_100_users load-test-scenarios.js
```

#### Test hanya 200 User:
```bash
k6 run --only-scenario scenario_200_users load-test-scenarios.js
```

#### Dengan JSON Output:
```bash
k6 run --out json=results.json load-test-scenarios.js
```

#### Dengan HTML Report:
```bash
k6 run load-test-with-report.js
```
Report akan generate file `results_YYYY-MM-DD.html`

#### Custom Base URL:
```bash
$env:BASE_URL = "http://your-server:4000/api"
k6 run load-test-with-report.js
```

---

## Memahami Results

### Output Format Standar

```
scenarios: (100.00%) 1 scenario, 200 max VUs, 9m20s max duration (includes 45s graceful stop)
...

     checks.........................: 85.5%   10500 out of 12282
     data_received..................: 2.5 MB  2800 B/s
     data_sent......................: 1.2 MB  2400 B/s
   ✓ errors..........................: 0       0/s
     http_req_blocked...............: avg=5ms   min=1ms  med=2ms  max=120ms p(90)=10ms p(95)=15ms p(99)=50ms
     http_req_connecting............: avg=2ms   min=0s   med=0s   max=100ms p(90)=5ms  p(95)=8ms  p(99)=20ms
     http_req_duration..............: avg=850ms min=45ms med=320ms max=5.2s  p(90)=1.5s p(95)=2.1s p(99)=3.8s
     http_req_failed................: 4.5%    540 out of 12000
     http_req_receiving.............: avg=25ms  min=5ms  med=10ms max=500ms p(90)=50ms p(95)=100ms p(99)=200ms
     http_req_sending...............: avg=10ms  min=1ms  med=5ms  max=100ms p(90)=20ms p(95)=30ms p(99)=50ms
     http_req_tls_handshaking.......: avg=0s    min=0s   med=0s   max=0s    p(90)=0s   p(95)=0s   p(99)=0s
     http_req_waiting...............: avg=815ms min=20ms med=290ms max=4.8s  p(90)=1.4s p(95)=2.0s p(99)=3.6s
     http_reqs.......................: 12000   20/s
   ✓ login status 200................: 95%    1140 out of 1200
     requests_failed................: 540
     requests_success...............: 11460
     requests_total.................: 12000
     vus............................: 200    max=200
     vus_max........................: 200    max=200

PASSED [100%] 200 VUs in 10m0s
```

### Key Metrics Explained

#### 1. **http_req_duration** (Response Time)
```
avg=850ms    → Average response time: 850ms
min=45ms     → Fastest response: 45ms
med=320ms    → Median (50%) response time: 320ms
max=5.2s     → Slowest response: 5.2 seconds
p(90)=1.5s   → 90% request selesai dalam 1.5s
p(95)=2.1s   → 95% request selesai dalam 2.1s (TARGET: 2000ms ✓)
p(99)=3.8s   → 99% request selesai dalam 3.8s (TARGET: 4000ms ✓)
```

#### 2. **http_req_failed** (Error Rate)
```
4.5%         → 4.5% request gagal
540 / 12000  → 540 request gagal dari 12000 total
TARGET: < 10% (PASSED ✓)
```

#### 3. **http_reqs** (Throughput)
```
12000   20/s → Total 12000 request, rate 20 request/second
```

#### 4. **checks** (Test Assertions)
```
85.5%        → 85.5% dari semua assertion pass
10500 / 12282 → 10500 assertion pass dari 12282 total
```

#### 5. **data_received / sent**
```
2.5 MB  2800 B/s → Total 2.5 MB data received, rate 2800 B/s
```

### Endpoint-Specific Metrics

```
     login_duration.................: avg=250ms  p(95)=500ms
     dashboard_duration.............: avg=400ms  p(95)=800ms
     hewan_duration.................: avg=500ms  p(95)=1000ms
     laporan_duration...............: avg=450ms  p(95)=900ms
     kelompok_duration..............: avg=380ms  p(95)=750ms
     analysis_duration..............: avg=600ms  p(95)=1200ms
```

---

## Analisis & Troubleshooting

### ✅ PASSED TEST

Jika output menunjukkan "PASSED" dan metrics dalam target:
```
✓ 100 User scenario:
  - avg < 1000ms → GOOD
  - p(95) < 2000ms → GOOD
  - error rate < 10% → GOOD

✓ 200 User scenario:
  - avg < 1500ms → GOOD
  - p(95) < 3000ms → GOOD
  - error rate < 10% → GOOD
```

**Artinya**: Aplikasi siap handle traffic tersebut

### ⚠️ WARNING / ISSUES

#### Issue 1: Response Time Tinggi
```
http_req_duration: avg=3000ms p(95)=6000ms (Expected: avg<1500ms)
```

**Penyebab**:
- Database query slow
- Insufficient connection pool
- Network latency
- CPU/Memory bottleneck

**Solusi**:
```sql
-- 1. Check slow queries
SELECT * FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- 2. Add index jika diperlukan
CREATE INDEX idx_laporan_status ON laporan(status);

-- 3. Check connection pool
-- Edit .env: DATABASE_CONNECTION_POOL_SIZE=20
```

#### Issue 2: Error Rate Tinggi
```
http_req_failed: 25%   (Expected: < 10%)
```

**Penyebab**:
- Server overload
- Database connection timeout
- Memory exhausted
- Concurrent request limit reached

**Troubleshooting**:
```bash
# 1. Check server logs
npm run dev  # Lihat error messages

# 2. Monitor resource
Task Manager → Performance tab

# 3. Check database connections
psql -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';"

# 4. Increase connection pool
# Edit BackEnd/.env
DATABASE_CONNECTION_POOL_SIZE=50
```

#### Issue 3: Specific Endpoint Slow
```
dashboard_duration: avg=2000ms (Expected: < 1000ms)
```

**Penyebab**:
- Dashboard endpoint melakukan 11 parallel queries
- Salah satu query slow

**Troubleshooting**:
```bash
# 1. Check dashboard endpoint response
curl -H "Authorization: Bearer TOKEN" http://localhost:4000/api/stats/admin/dashboard

# 2. Enable query logging
# Edit src/controllers/statsController.js
console.time('getAllHewan');
const hewan = await prisma.hewan_ternak.findMany();
console.timeEnd('getAllHewan');

# 3. Implement caching jika belum ada
// Add Redis caching untuk stats endpoint
```

#### Issue 4: Timeout Errors
```
http_req_failed: 10% with errors like "connection refused"
```

**Penyebab**:
- Server crashed
- Port 4000 tidak accessible
- Connection limit reached

**Solusi**:
```bash
# 1. Verify server running
netstat -ano | findstr :4000

# 2. Check server logs
# Lihat console saat npm start

# 3. Restart server
npm start
```

---

## Performance Baseline

### Expected Results (Typical)

#### 100 User Concurrent:
```
✓ Ramp up time: 30s
✓ Load duration: 3min
✓ Avg response: 500-800ms
✓ p(95): 1000-1500ms
✓ Error rate: 2-5%
✓ Status: ✓ PASS
```

#### 200 User Concurrent:
```
✓ Ramp up time: 45s
✓ Load duration: 3min
✓ Avg response: 800-1200ms
✓ p(95): 1500-2500ms
✓ Error rate: 3-8%
✓ Status: ✓ PASS
```

### Optimization Recommendations

Berdasarkan hasil, prioritaskan optimasi:

#### Priority 1 (Critical):
- Response time avg > 2000ms
- Error rate > 15%
- Memory leak detected

**Action**: Database optimization, connection pooling

#### Priority 2 (High):
- Response time avg 1000-2000ms
- Error rate 10-15%
- Occasional timeouts

**Action**: Query optimization, caching strategy

#### Priority 3 (Medium):
- Response time avg 500-1000ms
- Error rate < 10%
- No timeouts

**Action**: Fine-tuning, monitoring setup

#### Priority 4 (Low):
- Response time avg < 500ms
- Error rate < 2%
- All thresholds passed

**Action**: Load balancing, CDN, additional features

---

## Advanced Testing

### Load Test dengan Custom Scenarios

Edit `load-test-scenarios.js` untuk:
- Menambah/kurangi jumlah VU
- Mengubah endpoint yang di-test
- Menambah payload/body untuk POST requests
- Menambah delay/think time

### Contoh: POST Request (Create Laporan)

```javascript
group('07_Create_Laporan', () => {
  const payload = JSON.stringify({
    jenis: 'pakan',
    kelompok_id: 1,
    tanggal: new Date().toISOString().split('T')[0],
    data: { jumlah: 100 }
  });

  const createResp = http.post(`${BASE_URL}/laporan`, payload, {
    headers: { 
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
  });

  check(createResp, {
    'create status 201': (r) => r.status === 201,
    'create time < 2s': (r) => r.timings.duration < 2000,
  });

  sleep(0.3);
});
```

---

## Tips & Best Practices

### 1. **Test pada jam sepi**
- Hindari test saat ada production traffic
- Pastikan environment khusus untuk testing

### 2. **Isolasi test dari production**
```bash
# Gunakan environment variable
export BASE_URL=http://test-server:4000/api
k6 run load-test-scenarios.js
```

### 3. **Monitor selama test**
Buka terminal kedua untuk monitor:
```bash
# Monitor resource
Get-Process | Where-Object {$_.Name -match 'node'} | Format-Table Name, WorkingSet

# Monitor database
Watch -Seconds 5 'psql -c "SELECT count(*) FROM pg_stat_activity;"'
```

### 4. **Save results untuk comparison**
```bash
k6 run --out json=results_before.json load-test-scenarios.js
# Lakukan optimasi
k6 run --out json=results_after.json load-test-scenarios.js
# Compare results
```

### 5. **Ramp up gradually**
- Jangan langsung 200 user
- Start dari 50 → 100 → 150 → 200
- Observe behavior at each level

---

## Dokumentasi Lengkap

Lihat file-file terkait:
- `load-test-scenarios.js` - Main test script
- `load-test-with-report.js` - Test dengan HTML report
- `LOAD_TEST_GUIDE.md` - Comprehensive guide ini

---

**Created**: January 4, 2026
**Updated**: Latest
**Status**: Ready for Testing
