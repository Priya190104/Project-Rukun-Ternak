# 🧪 Testing Guide - Rukun Ternak New Features

**Last Updated:** 3 Januari 2026  
**Status:** Ready for Testing ✅

---

## 📌 Prerequisite
- Frontend sudah running: `npm start` (di folder FrontEnd)
- Backend sudah running: `npm start` (di folder BackEnd)
- Browser: Chrome, Firefox, Safari, atau Edge (terbaru)
- Account Admin sudah ada di database

---

## 🔬 Test Case 1: Login Page - Show/Hide Password

### Scenario: Fitur toggle password visibility

**Steps:**
1. Buka browser → navigate ke `http://localhost:3000/login` (atau sesuai port config)
2. Lihat halaman login dengan form username & password
3. **Observasi:** Field password menampilkan placeholder "Masukkan password"

**Test A: Default State (Hidden)**
4. Ketik password di field password (misal: "testpassword123")
5. Lihat bahwa text di field password masih *tersembunyi* (bintang/dots)
6. **Expected:** Icon mata (close) terlihat di sebelah kanan field password
7. **Result:** ✅ PASS / ❌ FAIL

**Test B: Toggle to Visible**
8. Klik icon mata di sebelah kanan field password
9. Lihat bahwa text password sekarang *terlihat* (actual characters)
10. **Expected:** Icon berubah menjadi mata (open)
11. **Result:** ✅ PASS / ❌ FAIL

**Test C: Toggle back to Hidden**
12. Klik icon mata lagi
13. Lihat bahwa text password kembali *tersembunyi*
14. **Expected:** Icon kembali ke mata (close)
15. **Result:** ✅ PASS / ❌ FAIL

**Test D: Login Flow (end-to-end)**
16. Ketik username (misal: "admin")
17. Ketik password (misal: "password123")
18. Klik button "🔐 Login"
19. **Expected:** Login berhasil → redirect ke dashboard
20. **Result:** ✅ PASS / ❌ FAIL

**Test E: Console Errors**
21. Buka DevTools (F12) → Tab Console
22. Cek apakah ada error messages setelah toggle password
23. **Expected:** Tidak ada error (console bersih)
24. **Result:** ✅ PASS / ❌ FAIL

**Summary Test Case 1:** ___________ / ❌ FAIL

---

## 🔬 Test Case 2: Admin Dashboard - Analisis Menu Alert

### Scenario: Admin klik menu Analisis → muncul alert modal

**Prerequisite:**
- Sudah login sebagai admin
- Dashboard admin visible dengan sidebar

**Steps:**

**Test A: Cek keberadaan menu Analisis**
1. Lihat sidebar di sebelah kiri
2. Cari menu "Analisis" dengan icon chart (BarChart3)
3. **Expected:** Menu Analisis ada di sidebar (bukan dihapus)
4. **Result:** ✅ PASS / ❌ FAIL

**Test B: Klik menu Analisis**
5. Klik pada menu "Analisis"
6. Tunggu 1-2 detik
7. **Expected:** Modal popup muncul di tengah screen
8. **Result:** ✅ PASS / ❌ FAIL

**Test C: Cek isi modal**
9. Lihat modal yang muncul:
   - Harus ada icon 🔧 (tools icon) di atas
   - Harus ada heading "Fitur akan segera hadir"
   - Harus ada text "Menu Analisis sedang dalam pengembangan. Kami akan menghadirkan fitur ini segera."
   - Harus ada button "Mengerti"
10. **Expected:** Semua elemen modal terpenuhi
11. **Result:** ✅ PASS / ❌ FAIL

**Test D: Tutup modal dengan button**
12. Klik button "Mengerti"
13. Modal hilang (fade out)
14. Tetap di halaman dashboard (tidak di-redirect)
15. **Expected:** Modal tertutup, tetap di dashboard
16. **Result:** ✅ PASS / ❌ FAIL

**Test E: Klik Analisis lagi (repeat)**
17. Klik menu Analisis lagi untuk verifikasi konsistensi
18. Modal muncul lagi
19. **Expected:** Modal muncul kembali (konsisten)
20. **Result:** ✅ PASS / ❌ FAIL

**Test F: Menu lain tetap normal**
21. Tutup modal (klik Mengerti)
22. Klik menu lain (misal: Dashboard, Hewan Ternak, Laporan, dll)
23. **Expected:** Menu lain berfungsi normal (navigate tanpa modal)
24. **Result:** ✅ PASS / ❌ FAIL

**Test G: Console & Network**
25. Buka DevTools → Tab Console
26. Cek tidak ada error messages
27. Tab Network: pastikan tidak ada 4xx/5xx responses
28. **Expected:** Console bersih, network OK
29. **Result:** ✅ PASS / ❌ FAIL

**Summary Test Case 2:** ___________ / ❌ FAIL

---

## 🔬 Test Case 3: Admin Dashboard - Notifikasi Hidden

### Scenario: Admin tidak melihat icon notifikasi

**Prerequisite:**
- Sudah login sebagai admin
- Dashboard admin visible dengan header di atas

**Steps:**

**Test A: Cek header admin**
1. Lihat bagian header (atas page)
2. Di sebelah kanan ada user info (nama user)
3. **Expected:** Tidak ada icon notifikasi (bell icon) di header
4. **Result:** ✅ PASS / ❌ FAIL

**Test B: Verifikasi user info tetap ada**
5. Lihat user info card tetap ada di header
6. Menampilkan nama user dan username
7. Menampilkan role "Admin"
8. **Expected:** User info intact
9. **Result:** ✅ PASS / ❌ FAIL

**Test C: Logout button tetap ada**
10. Lihat bagian logout button di sidebar
11. Button "Logout" masih visible
12. **Expected:** Logout button intact
13. **Result:** ✅ PASS / ❌ FAIL

**Test D: Compare dengan role lain (Optional)**
14. Logout dari admin
15. Login dengan role "viewer" atau "kelompok" (jika ada)
16. Lihat header mereka
17. **Expected:** Icon notifikasi (bell) VISIBLE untuk role non-admin
18. **Result:** ✅ PASS / ❌ FAIL

**Test E: Console**
19. Buka DevTools → Tab Console
20. Tidak ada error atau warning
21. **Expected:** Console bersih
22. **Result:** ✅ PASS / ❌ FAIL

**Summary Test Case 3:** ___________ / ❌ FAIL

---

## 🔬 Test Case 4: Full Regression - Semua fitur lama tetap normal

### Scenario: Memastikan tidak ada breaking changes

**Prerequisite:**
- Frontend & backend berjalan normal
- Database intact

**Steps:**

**Test A: Login flow normal**
1. Logout jika sudah login
2. Login dengan credentials admin yang valid
3. **Expected:** Login berhasil, redirect ke dashboard
4. **Result:** ✅ PASS / ❌ FAIL

**Test B: Dashboard visible**
5. Di dashboard, lihat semua widget & data normal
6. **Expected:** Dashboard render dengan baik
7. **Result:** ✅ PASS / ❌ FAIL

**Test C: Navigasi menu normal**
8. Klik berbagai menu (Dashboard, Hewan Ternak, Laporan, Kelompok, dll)
9. Setiap klik harus navigate ke page yang sesuai
10. **Expected:** Semua menu navigate normal (kecuali Analisis)
11. **Result:** ✅ PASS / ❌ FAIL

**Test D: Data loading**
12. Tunggu data di-load (tables, charts, dll)
13. **Expected:** Data loading normal, tidak ada missing data
14. **Result:** ✅ PASS / ❌ FAIL

**Test E: CRUD operations (sample)**
15. Coba CRUD operation di salah satu page (misal: tambah user, edit, delete)
16. **Expected:** CRUD operations berfungsi normal
17. **Result:** ✅ PASS / ❌ FAIL

**Test F: Mobile responsive (Optional)**
18. Resize browser ke ukuran mobile (375px width)
19. Cek layout responsive
20. Sidebar dapat di-toggle
21. **Expected:** Mobile layout intact
22. **Result:** ✅ PASS / ❌ FAIL

**Summary Test Case 4:** ___________ / ❌ FAIL

---

## 📊 Final Test Result Summary

| Test Case | Status | Notes |
|-----------|--------|-------|
| 1. Show/Hide Password | _____ | |
| 2. Analisis Menu Alert | _____ | |
| 3. Notifikasi Hidden | _____ | |
| 4. Regression Test | _____ | |
| **OVERALL** | _____ | |

---

## 🐛 Troubleshooting

### Problem: Icon mata tidak muncul di login page
**Solution:**
1. Check apakah lucide-react library ter-install: `npm list lucide-react`
2. Coba restart dev server: Ctrl+C, lalu `npm start`
3. Clear browser cache (Ctrl+Shift+Delete)

### Problem: Modal Analisis tidak muncul
**Solution:**
1. Check apakah user role adalah 'admin' (lihat header user info)
2. Open DevTools Console, cek ada error messages
3. Verify AppLayout.jsx file sudah ter-modify dengan benar

### Problem: Notifikasi masih muncul untuk admin
**Solution:**
1. Hard refresh browser: Ctrl+Shift+R (atau Cmd+Shift+R di Mac)
2. Check kondisional di AppLayout.jsx line ~151: `{isAdmin && appRole !== 'admin' && <NotificationBell />}`
3. Restart dev server

### Problem: Console error tentang imports
**Solution:**
1. Check imports di atas file:
   - Login.jsx: `import { Eye, EyeOff } from 'lucide-react';`
   - AppLayout.jsx: sudah ada import
2. Pastikan lucide-react ter-install dengan benar
3. Run `npm install` di folder FrontEnd

---

## ✅ Sign-off Checklist

- [ ] Test Case 1 PASS
- [ ] Test Case 2 PASS
- [ ] Test Case 3 PASS
- [ ] Test Case 4 PASS
- [ ] No console errors
- [ ] No network errors (4xx/5xx)
- [ ] Frontend responsive
- [ ] Backend logs clean
- [ ] Ready for production

---

## 📞 Questions or Issues?

Jika menemukan issue saat testing:
1. Screenshot the error
2. Check browser console (F12)
3. Check backend logs
4. Review the summary document: `IMPLEMENTATION_SUMMARY.md`
5. Restart both servers (frontend & backend)

---

**Test Guide Version:** 1.0  
**Last Updated:** 3 Januari 2026
