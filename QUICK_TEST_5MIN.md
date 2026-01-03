# 🚀 Quick Start Testing - 5 Minutes

**Instruksi:** Ikuti langkah-langkah ini untuk quick verify semua 4 tasks.

---

## ⚡ 1-Minute Setup
```
✓ Frontend: Already running? Just refresh (F5)
✓ Backend: Already running? No restart needed
✓ Database: Migration ready to run when needed
```

---

## 📝 Quick Test Scenarios (5 minutes total)

### Test 1: Number-Only Validation (1 min)
```
1. Go to: Daftar Kelompok → Tambah Kelompok
2. Scroll to: "Data Penanggung Jawab"
3. In NIK field, type: "123abc456"
4. Expected: Only "123456" shows (letters removed)
✓ PASS: Non-numeric characters filtered out
✓ FAIL: Letters appear in field
```

### Test 2: Create Success Alert (1 min)
```
1. Complete form with valid data:
   - Nama: "Test Kelompok"
   - Email: "test@test.com"
   - Kecamatan: Any
   - Desa: Any
   - Lokasi: Click on map
   - NIK: "123456789"
   - No HP: "081234567890"
2. Click: "Tambah"
3. Expected:
   ✓ Green alert with title "✓ Kelompok Ditambahkan"
   ✓ Message shows kelompok name
   ✓ Auto-closes in ~2 seconds
   ✓ Modal closes
   ✓ Data appears in list
```

### Test 3: Update Success Alert (1 min)
```
1. Click: Edit icon on any kelompok
2. Change: Any field (e.g., Nama)
3. Click: "Perbarui"
4. Expected:
   ✓ Green alert with title "✓ Kelompok Diperbarui"
   ✓ Auto-closes in ~2 seconds
   ✓ Modal closes
   ✓ Changes reflected in list
```

### Test 4: Delete with Alert (1 min)
```
1. Click: Trash icon on any kelompok
2. Confirmation dialog appears:
   ✓ "Hapus Kelompok X?" shown
3. Click: "Hapus Kelompok"
4. Expected:
   ✓ Red/green alert with title "✓ Data Dihapus"
   ✓ Kelompok name shown in message
   ✓ Auto-closes in ~2 seconds
   ✓ Kelompok removed from list
```

### Test 5: Error Validation (1 min)
```
1. Click: Tambah Kelompok
2. Try to submit WITHOUT filling required fields
3. Expected:
   ✓ Error alert appears (red)
   ✓ Title: "Validasi Gagal"
   ✓ Modal stays open
   ✓ Can fix and retry
```

---

## 🔍 Console & Network Check (1 min)

```
1. Open: DevTools (F12)
2. Go to: Console tab
3. Perform: One create operation
4. Check:
   ✓ No red errors
   ✓ No warnings (old ones OK)
5. Go to: Network tab
6. Check:
   ✓ POST /api/kelompok → Status 2xx (success)
   ✓ No 4xx/5xx errors
```

---

## ✅ Quick Verification Checklist

| Test | Expected | Status |
|------|----------|--------|
| NIK accepts only numbers | "123abc" → "123" | [ ] |
| No HP accepts only numbers | "081a2b3" → "08123" | [ ] |
| Create shows success alert | Green, auto-close | [ ] |
| Create error shows alert | Red, stays open | [ ] |
| Update shows success alert | Green, auto-close | [ ] |
| Delete shows confirm dialog | 2-step confirm | [ ] |
| Delete shows success alert | Green, auto-close | [ ] |
| Modal closes after success | Auto-close modal | [ ] |
| List refreshes after ops | Auto-refresh data | [ ] |
| No console errors | Clean console | [ ] |
| No network errors | All 2xx status | [ ] |

---

## 🎯 Pass/Fail Criteria

### ✅ PASS if:
- All 5 test scenarios work as expected
- No console errors appear
- No network errors appear
- Alerts show appropriate titles & messages
- Data persists correctly in database

### ❌ FAIL if:
- Number validation doesn't work (allows letters)
- Alerts don't appear
- Modal doesn't close after success
- Data not saved to database
- Console shows red errors

---

## 🐛 Troubleshooting

**Problem:** Alerts not showing
```
Solution:
1. Clear browser cache (Ctrl+Shift+R)
2. Check console for errors
3. Ensure AlertModal component imported correctly
```

**Problem:** Numbers not filtered in NIK/NoHP
```
Solution:
1. Check input event binding in form
2. Verify handleChange function logic
3. Look at console for JS errors
```

**Problem:** Alert shows but data not saved
```
Solution:
1. Check backend logs
2. Verify database connection
3. Check migration ran successfully
4. Look at Network tab → API response
```

**Problem:** Migration failed
```
Solution:
1. Ensure PostgreSQL is running
2. Check database connection string
3. Run: npx prisma migrate deploy
4. Check migration folder for status
```

---

## 📱 Mobile Testing

Also test on mobile:
```
1. Open app on iPhone/Android
2. Run same 5 test scenarios
3. Check responsive design
4. Verify alerts appear properly
5. Test landscape/portrait rotation
```

---

## 🎬 Next Steps

After verification:
1. ✅ All tests pass → Ready for production
2. ✅ Review code changes → All good
3. ✅ Check documentation → Complete
4. ✅ Notify team → Implementation done!

---

**Estimated Time:** 5-10 minutes  
**Difficulty:** Easy (just click & verify)  
**Result:** All features working ✅
