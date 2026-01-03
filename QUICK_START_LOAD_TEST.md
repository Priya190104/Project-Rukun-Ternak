# 🎯 Load Testing - Quick Start Guide

## Apa itu Load Testing?
Load testing adalah proses untuk mengukur performa aplikasi ketika menerima traffic tinggi dari banyak user secara bersamaan.

**Tujuan**:
- Measure seberapa banyak user yang bisa handle aplikasi
- Identify bottlenecks dan performance issues
- Ensure reliability under load
- Plan infrastructure scaling

---

## Test Scenarios

### Skenario 1: 100 User Concurrent
- **Duration**: 3 menit pada load penuh
- **Ramp Up**: 30 detik (gradually increase dari 0 → 100)
- **Ramp Down**: 30 detik (gradually decrease dari 100 → 0)
- **Total Duration**: ~4 menit 20 detik
- **Target**: avg response < 1000ms, p(95) < 2000ms

### Skenario 2: 200 User Concurrent  
- **Duration**: 3 menit pada load penuh
- **Ramp Up**: 45 detik (gradually increase dari 0 → 200)
- **Ramp Down**: 45 detik (gradually decrease dari 200 → 0)
- **Total Duration**: ~4 menit 30 detik
- **Target**: avg response < 1500ms, p(95) < 3000ms

---

## Setup (5 menit)

### 1. Install k6

**Windows (Recommended)**:
```powershell
choco install k6
```

**Windows (Manual)**:
1. Download: https://github.com/grafana/k6/releases
2. Extract to `C:\k6`
3. Add `C:\k6` to PATH environment variable
4. Restart terminal

**Verify**:
```bash
k6 version
# Output: k6 v0.xx.x
```

### 2. Start Backend Server

Open terminal di BackEnd folder:
```bash
npm start
# Tunggu sampai: "Server running on port 4000"
```

---

## Run Load Test (5 menit)

### Opsi 1: PowerShell Script (Easiest)

```powershell
cd BackEnd
.\run-load-test.ps1
```

Pilih opsi:
1. Test both 100 & 200 user (recommended)
2. Test 100 user only
3. Test 200 user only
4. Exit

### Opsi 2: Command Line

#### Test both:
```bash
cd BackEnd
k6 run load-test-scenarios.js
```

#### Test 100 user only:
```bash
k6 run --only-scenario scenario_100_users load-test-scenarios.js
```

#### Test 200 user only:
```bash
k6 run --only-scenario scenario_200_users load-test-scenarios.js
```

#### Test dengan HTML report:
```bash
k6 run load-test-with-report.js
# Output: results_YYYY-MM-DD.html (buka di browser)
```

---

## Read Results (3 menit)

### Hasil akan berbentuk:

```
scenarios: (100.00%) 1 scenario, 200 max VUs, 9m20s max duration

✓ checks.........................: 85.5%   10500 out of 12282
  errors..........................: 0       0/s
  http_req_duration..............: avg=850ms min=45ms med=320ms max=5.2s p(95)=2.1s p(99)=3.8s
  http_req_failed................: 4.5%    540 out of 12000
  http_reqs.......................: 12000   20/s

PASSED [100%] 200 VUs in 10m0s
```

### Key Numbers to Watch:

| Metric | What It Means | Target | Status |
|--------|--------------|--------|--------|
| `avg=850ms` | Average response time | < 1000ms | ✓ GOOD |
| `p(95)=2.1s` | 95% requests done in this time | < 2000ms | ✓ GOOD |
| `p(99)=3.8s` | 99% requests done in this time | < 4000ms | ✓ GOOD |
| `http_req_failed: 4.5%` | Error rate | < 10% | ✓ GOOD |
| `PASSED` | Overall result | PASSED | ✓ GOOD |

### Interpretation:

```
✓ PASSED = Aplikasi siap handle load
- avg < 1000ms → Response time acceptable
- p(95) < 2000ms → 95% user satisfied
- error rate < 10% → Reliability good
```

---

## Troubleshooting (10 menit)

### ❌ k6 command not found
```
Solution: k6 belum terinstall atau belum di PATH
1. Install k6 dulu (lihat Setup section)
2. Restart terminal/PowerShell
3. Test: k6 version
```

### ❌ Connection refused (127.0.0.1:4000)
```
Solution: Backend server tidak berjalan
1. Cd BackEnd folder
2. npm start
3. Tunggu: "Server running on port 4000"
4. Run test di terminal baru
```

### ⚠️ High response time (avg > 2000ms)
```
Possible causes:
1. Database slow queries
2. Insufficient CPU/Memory
3. Network latency

Check:
1. Open Task Manager → Performance
2. Monitor CPU & Memory usage
3. Check BackEnd console for errors
```

### ⚠️ High error rate (> 15%)
```
Possible causes:
1. Server overloaded
2. Database connection limit reached
3. Memory exhausted

Check:
1. Restart server: npm start
2. Check available memory: Get-Process | Measure-Object WorkingSet -Sum
3. Monitor during test
```

---

## Files Created

### Main Test Scripts:
- `BackEnd/load-test-scenarios.js` - Base test (100 & 200 user)
- `BackEnd/load-test-with-report.js` - Test dengan HTML report
- `BackEnd/run-load-test.ps1` - PowerShell runner

### Documentation:
- `LOAD_TESTING_INSTRUCTIONS.md` - Comprehensive guide
- `LOAD_TEST_GUIDE.md` - Result interpretation guide
- `QUICK_START_GUIDE.md` - This file

---

## Expected Results

### 100 User:
```
✓ Response time: 500-800ms
✓ P95: 1000-1500ms
✓ Error rate: 2-5%
✓ Result: PASSED ✓
```

### 200 User:
```
✓ Response time: 800-1200ms
✓ P95: 1500-2500ms
✓ Error rate: 3-8%
✓ Result: PASSED ✓
```

---

## Next Steps

### Jika PASSED:
1. ✓ Dokumentasikan hasil
2. ✓ Monitor metrics di production
3. ✓ Plan scaling jika traffic tumbuh

### Jika ada issues:
1. Identify bottleneck (database/application/network)
2. Optimize based on hasil
3. Re-run test untuk verify improvement

---

## Additional Resources

- k6 Official Docs: https://k6.io/docs
- k6 Best Practices: https://k6.io/docs/testing-guides
- PostgreSQL Query Optimization: https://wiki.postgresql.org/wiki/Performance_Optimization

---

**Ready to test?** ➜ Run: `.\BackEnd\run-load-test.ps1`

Time to complete: ~10 minutes
Estimated results: 5 minutes after test starts
