# Performance Testing & Validation Guide

## Overview

Dokumen ini berisi panduan lengkap untuk mengukur performance improvements dari Priority 3: Image Optimization dan semua prioritas sebelumnya.

---

## 1. Pre-Testing Setup

### 1.1 Start Development Server

```bash
cd FrontEnd
npm start
```

Server akan berjalan di `http://localhost:3000`

### 1.2 Production Build (Recommended)

Untuk testing yang akurat, build production version terlebih dahulu:

```bash
npm run build
```

Ini akan menghasilkan optimized bundle di `FrontEnd/build/`

### 1.3 Serve Production Build Locally

```bash
# Install serve globally (if not already)
npm install -g serve

# Serve production build
serve -s build
```

Akses di `http://localhost:3000`

---

## 2. Lighthouse Audit

### 2.1 Using Chrome DevTools

**Desktop:**
1. Open `http://localhost:3000` di Chrome
2. Press `F12` untuk buka DevTools
3. Klik tab **Lighthouse**
4. Select categories:
   - ✅ Performance
   - ✅ Accessibility
   - ✅ Best Practices
   - ✅ SEO
   - ✅ PWA
5. Klik **Analyze page load**
6. Tunggu scan selesai (~1-2 menit)

**Mobile:**
1. Same as above, tapi pilih **Mobile** di device dropdown
2. Akan test dengan simulated 4G network

### 2.2 Lighthouse Report Interpretation

**Performance Score (0-100):**
- **90-100:** Excellent
- **50-89:** Needs improvement
- **0-49:** Poor

**Key Metrics:**

| Metric | Abbreviation | Target | Ideal |
|--------|--------------|--------|-------|
| First Contentful Paint | FCP | < 1.8s | < 0.8s |
| Largest Contentful Paint | LCP | < 2.5s | < 1.2s |
| Cumulative Layout Shift | CLS | < 0.1 | < 0.05 |
| First Input Delay | FID | < 100ms | < 50ms |
| Time to Interactive | TTI | < 3.8s | < 2s |
| Total Blocking Time | TBT | < 200ms | < 50ms |

### 2.3 Run Multiple Times

Test minimal 3 kali untuk consistency:

```
Run 1: [Score]
Run 2: [Score]
Run 3: [Score]
Average: [Score]
```

---

## 3. Bundle Size Analysis

### 3.1 Using webpack-bundle-analyzer

```bash
# Install (if not already)
npm install --save-dev webpack-bundle-analyzer

# Create custom script
```

**In `FrontEnd/package.json`, tambahkan:**

```json
{
  "scripts": {
    "analyze": "source-map-explorer 'build/static/js/*.js'"
  }
}
```

**Or menggunakan build-in:**

```bash
# Build dengan analyze flag
npm run build -- --analyze
```

### 3.2 Check Bundle Sizes

```bash
# Check total build size
du -sh build/

# Check individual bundle sizes
ls -lh build/static/js/

# Example output:
# main.12345.js        245KB (minified)
# 2.67890.chunk.js     156KB (minified)
```

**Metrics to Track:**

| File | Before | After | Reduction |
|------|--------|-------|-----------|
| main.js | XXX KB | XXX KB | XX% ↓ |
| Total JS | XXX KB | XXX KB | XX% ↓ |
| Total CSS | XX KB | XX KB | X% ↓ |
| Total Build | XXX KB | XXX KB | XX% ↓ |

### 3.3 Size-Limit Script (Optional)

Create `size-limit.json`:

```json
[
  {
    "path": "build/static/js/main.*.js",
    "limit": "250 KB"
  },
  {
    "path": "build/static/js/*.chunk.js",
    "limit": "150 KB"
  }
]
```

---

## 4. Web Vitals Monitoring

### 4.1 Using Chrome DevTools

**Steps:**
1. Open DevTools (F12)
2. Klik **Performance** tab
3. Klik **Record** (record icon)
4. Refresh page
5. Klik **Stop** setelah page fully loaded
6. Analyze timeline

**Look for:**
- Long tasks (>50ms blocking)
- Layout shifts
- Render time
- Scripting time

### 4.2 Using web-vitals Library

**Install:**

```bash
npm install web-vitals
```

**Create monitoring component** (`src/utils/performanceMonitor.js`):

```javascript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export function initPerformanceMonitoring() {
  getCLS(metric => console.log('CLS:', metric));
  getFID(metric => console.log('FID:', metric));
  getFCP(metric => console.log('FCP:', metric));
  getLCP(metric => console.log('LCP:', metric));
  getTTFB(metric => console.log('TTFB:', metric));
}
```

**Use in App.jsx:**

```javascript
import { initPerformanceMonitoring } from './utils/performanceMonitor';

useEffect(() => {
  initPerformanceMonitoring();
}, []);
```

### 4.3 Expected Web Vitals

**Before Optimization:**
- LCP: ~2.5-3.5s
- FID: ~100-200ms
- CLS: ~0.15-0.25

**After Priority 1-3 Optimizations:**
- LCP: ~1.2-1.8s (40-50% improvement)
- FID: ~50-100ms (50% improvement)
- CLS: ~0.05-0.10 (50-60% improvement)

---

## 5. Network Analysis

### 5.1 Using Chrome DevTools Network Tab

**Steps:**
1. Open DevTools (F12)
2. Klik **Network** tab
3. Refresh page
4. Wait untuk loading selesai

**Metrics to Check:**

| Metric | Normal | Good |
|--------|--------|------|
| Total Requests | < 100 | < 50 |
| Total Size | < 5 MB | < 2 MB |
| Main Document | < 100 KB | < 50 KB |
| Images | < 2 MB | < 500 KB |
| JS | < 1 MB | < 400 KB |
| CSS | < 500 KB | < 100 KB |
| Load Time | < 5s | < 2s |
| DOMContentLoaded | < 3s | < 1.5s |

### 5.2 Check Code Splitting

**Expected after Priority 1 (Code Splitting):**

```
main.js          ~100 KB (core app)
pages/[name].js  ~20-50 KB (lazy-loaded pages)
```

Should see multiple chunk files, not one large bundle.

### 5.3 Check Caching

**Expected after Priority 2 (Caching):**

- Repeat visits should show:
  - Fewer network requests
  - Faster load times
  - More "(from cache)" entries in Network tab

---

## 6. Performance Testing Checklist

### 6.1 Pre-Optimization Baseline

- [ ] Run Lighthouse 3x (mobile & desktop)
  - Mobile score: ___
  - Desktop score: ___
- [ ] Measure bundle sizes
  - main.js: ___ KB
  - Total JS: ___ KB
  - Total build: ___ KB
- [ ] Check Web Vitals
  - LCP: ___ ms
  - FID: ___ ms
  - CLS: ___
- [ ] Network analysis
  - Total requests: ___
  - Total size: ___ KB
  - Load time: ___ s

### 6.2 Test Each Page

**Admin Pages:**
- [ ] Dashboard.jsx
  - Lighthouse score: ___
  - Load time: ___ s
  - Interaction ready: ___ s

- [ ] AdminHewanTernakPage.jsx
  - Lighthouse score: ___
  - Load time: ___ s
  - Images loading: ___ s

- [ ] AdminAnalisis.jsx
  - Lighthouse score: ___
  - Load time: ___ s

**Client Pages:**
- [ ] ClientDashboard.jsx
  - Lighthouse score: ___
  - Load time: ___ s
  - Kelompok data loading: ___ s

- [ ] HewanTernakPage.jsx
  - Lighthouse score: ___
  - Load time: ___ s

- [ ] ClientPilihJenisLaporan.jsx
  - Lighthouse score: ___
  - Load time: ___ s

**Public Pages:**
- [ ] Login.jsx
  - Lighthouse score: ___
  - Load time: ___ s

### 6.3 Cache Effectiveness Testing

In browser console:

```javascript
// Check cache stats
import { cacheStats } from '../hooks/useApiCache';
console.log('Cache hits:', cacheStats.hits);
console.log('Cache misses:', cacheStats.misses);
console.log('Hit rate:', (cacheStats.hits / (cacheStats.hits + cacheStats.misses) * 100).toFixed(2) + '%');
```

Expected:
- First visit cache hit rate: 0%
- Subsequent visits: 80-95%

### 6.4 Image Optimization Testing

In browser console:

```javascript
// Check images using picture element
console.log('Optimized images:', document.querySelectorAll('picture').length);

// Check WebP support
const canvas = document.createElement('canvas');
console.log('WebP supported:', canvas.toDataURL('image/webp') !== canvas.toDataURL('image/png'));

// Check image loading
performance.getEntriesByType('resource')
  .filter(r => r.name.includes('logo') || r.name.includes('image'))
  .forEach(r => console.log(r.name, r.duration.toFixed(2) + 'ms'));
```

---

## 7. Performance Regression Testing

### 7.1 Automated Testing Script

Create `scripts/performance-test.js`:

```javascript
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = {
    logLevel: 'info',
    output: 'json',
    port: chrome.port,
  };
  
  const runnerResult = await lighthouse(url, options);
  const scores = runnerResult.lhr.categories;
  
  console.log('Performance Score:', scores.performance.score * 100);
  console.log('Accessibility Score:', scores.accessibility.score * 100);
  console.log('Best Practices Score:', scores['best-practices'].score * 100);
  console.log('SEO Score:', scores.seo.score * 100);
  
  await chrome.kill();
}

runLighthouse('http://localhost:3000');
```

### 7.2 Set Performance Budget

In `package.json`:

```json
{
  "performance": {
    "maxEntrypointSize": 250000,
    "maxAssetSize": 150000
  }
}
```

---

## 8. Expected Results

### After Priority 1 (Code Splitting)

- Bundle size: **40-50% reduction**
- FCP: **20-30% faster**
- TTI: **30-40% faster**

### After Priority 2 (Client-side Caching)

- Repeat page loads: **60-80% faster**
- API calls: **70-80% reduction** on repeat visits
- Cache hit rate: **80-95%**

### After Priority 3 (Image Optimization)

- Logo size: **30-40% reduction**
- Total image size: **40-50% reduction**
- LCP: **10-20% improvement** (if images above fold)
- CLS: **Improved** with placeholder strategy

### Combined Impact

**Expected improvements from all 3 priorities:**

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Lighthouse Score | 60-70 | 85-95 | +20-25 |
| Page Load (First) | 3-4s | 1.5-2s | 50-60% ↓ |
| Page Load (Repeat) | 2-3s | 0.5-1s | 70-80% ↓ |
| JS Bundle | 400KB | 200-240KB | 40-50% ↓ |
| Total Assets | 2-3MB | 1-1.5MB | 40-50% ↓ |
| LCP | 2.5-3.5s | 1.2-1.8s | 40-50% ↓ |
| FID | 100-200ms | 50-100ms | 50% ↓ |
| CLS | 0.15-0.25 | 0.05-0.10 | 50-60% ↓ |
| TTI | 3.5-4.5s | 1.5-2.5s | 50-60% ↓ |

---

## 9. Real Device Testing

### 9.1 Test on Mobile

Use Google's Mobile-Friendly Test:
1. Go to https://search.google.com/test/mobile-friendly
2. Enter `http://your-domain.com`
3. Check results

### 9.2 Test on Slow Network

**In Chrome DevTools Network tab:**
1. Click "No throttling" dropdown
2. Select "Slow 3G" or "Fast 3G"
3. Reload page
4. Check performance

**Expected times on Slow 3G:**
- Load time: < 5s
- TTI: < 8s

---

## 10. Continuous Monitoring

### 10.1 Setup Performance Monitoring in Production

Use services like:
- **Google Analytics** (free)
- **Web Vitals** (free)
- **Sentry** (error tracking + perf)
- **Datadog** (enterprise)

### 10.2 Key Metrics to Monitor

```javascript
// In production (using Google Analytics)
export function logWebVitals(metric) {
  if (window.gtag) {
    window.gtag.event(metric.name, {
      'value': Math.round(metric.value),
      'event_category': 'web_vitals',
      'event_label': metric.id,
      'non_interaction': true,
    });
  }
}
```

### 10.3 Set Up Alerts

- Alert if Lighthouse score drops below 80
- Alert if LCP exceeds 2.5s
- Alert if CLS exceeds 0.1
- Alert if TTI exceeds 3.8s

---

## 11. Testing Commands Summary

```bash
# Start development server
npm start

# Build for production
npm run build

# Serve production build
serve -s build

# Run Lighthouse CLI (if installed)
lighthouse http://localhost:3000 --view

# Check bundle size
npm run build && du -sh build/

# Test performance budget
npm run test -- --coverage
```

---

## 12. Report Template

### Performance Test Report
**Date:** ___  
**Environment:** Development / Production / Staging  
**Network:** WiFi / 4G / 3G / Slow 3G  

**Lighthouse Scores:**
- Mobile: ___ / 100
- Desktop: ___ / 100

**Web Vitals:**
- FCP: ___ ms
- LCP: ___ ms
- FID: ___ ms
- CLS: ___
- TTI: ___ ms

**Bundle Metrics:**
- main.js: ___ KB
- Total JS: ___ KB
- Total CSS: ___ KB
- Build size: ___ KB

**Network:**
- Total requests: ___
- Total size: ___ KB
- Load time: ___ s
- DOMContentLoaded: ___ s

**Notes:**
- [Any observations]
- [Issues found]
- [Recommendations]

---

## Summary

Performance testing adalah bagian crucial dari optimization. Dengan mengikuti guide ini:

✅ Anda bisa mengukur improvements dari Priority 1-3  
✅ Set baseline untuk future optimizations  
✅ Monitor regression dengan automated testing  
✅ Validate bahwa optimizations benar-benar working  

**Next steps:**
1. Run Lighthouse audit sekarang
2. Document baseline scores
3. Compare dengan expected results
4. Set up continuous monitoring
