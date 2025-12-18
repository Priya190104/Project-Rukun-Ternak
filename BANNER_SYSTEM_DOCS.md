# Banner Management System - Rukun Ternak

## Overview

Sistem manajemen banner dinamis untuk halaman landing Rukun Ternak. Banner dapat diupload oleh admin, ditampilkan sebagai slider di halaman landing dengan navigasi otomatis dan manual.

## Fitur Utama

### 1. **Banner Slider di Landing Page**
- Menampilkan banner aktif sebagai carousel/slider
- Navigasi otomatis dengan interval 5 detik
- Tombol navigasi (prev/next) untuk kontrol manual
- Swipe gesture support untuk mobile
- Pagination indicator (bullets)
- Fallback UI yang rapi jika belum ada banner

### 2. **Halaman Admin - Kelola Banner**
- Upload gambar banner (JPG/JPEG only, max 5MB)
- Preview gambar sebelum menyimpan
- Daftar semua banner dengan thumbnail
- Toggle aktif/nonaktif banner
- Hapus banner dengan konfirmasi
- Responsive design untuk desktop & mobile

### 3. **API Endpoints**

#### Public Endpoints
- `GET /api/banners` - Ambil semua banner aktif
- `GET /api/banners/:id` - Ambil banner spesifik

#### Admin Endpoints (Require Authentication & Admin Role)
- `GET /api/banners/admin/all` - Ambil semua banner (termasuk nonaktif)
- `POST /api/banners` - Upload banner baru (multipart/form-data)
- `PUT /api/banners/:id` - Update status banner (isActive)
- `DELETE /api/banners/:id` - Hapus banner

## Struktur Database

### Banner Model (Prisma)
```prisma
model Banner {
  id        Int       @id @default(autoincrement())
  imageUrl  String    @map("image_url")
  createdAt DateTime  @default(now()) @map("created_at")
  isActive  Boolean   @default(true) @map("is_active")

  @@map("banners")
}
```

## File Structure

### Backend
- `/BackEnd/src/controllers/bannerController.js` - Controller logic
- `/BackEnd/src/routes/banners.js` - API routes
- `/BackEnd/prisma/migrations/20251218020909_add_banner/` - Migration file
- `/BackEnd/uploads/` - Folder untuk menyimpan gambar

### Frontend
- `/FrontEnd/src/components/banners/BannerSlider.jsx` - Komponen slider
- `/FrontEnd/src/components/banners/BannerForm.jsx` - Form upload banner
- `/FrontEnd/src/components/banners/BannerList.jsx` - Daftar banner untuk admin
- `/FrontEnd/src/pages/KelolaBanner.jsx` - Halaman admin manajemen banner
- `/FrontEnd/src/services/bannerService.js` - Service/API calls
- `/FrontEnd/src/pages/Landing.jsx` - Landing page dengan banner slider (updated)

## Penggunaan

### Untuk End Users (Landing Page)
1. Buka halaman landing (`/`)
2. Lihat banner slider yang menampilkan informasi institusi
3. Gunakan tombol navigasi atau swipe untuk mengubah banner
4. Jika belum ada banner, akan menampilkan placeholder yang rapi

### Untuk Admin
1. Login dengan role admin
2. Klik tombol "Kelola Banner" di Quick Actions dashboard
3. Upload gambar banner (format JPG/JPEG)
4. Preview gambar sebelum menyimpan
5. Kelola status banner (aktif/nonaktif)
6. Hapus banner yang tidak diperlukan

**URL Admin Page**: `/kelola-banner` (Protected by admin role)

## Teknologi yang Digunakan

### Frontend
- **Swiper.js** - Library untuk slider/carousel
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Hooks** - State management

### Backend
- **Node.js + Express.js** - Server
- **Prisma ORM** - Database management
- **Multer** - File upload handling
- **PostgreSQL** - Database

## Rules & Constraints

1. **File Upload**
   - Format: JPG/JPEG only
   - Max size: 5MB (dapat dikonfigurasi di multer)
   - Disimpan di folder `/uploads`

2. **Banner Status**
   - `isActive = true`: Banner ditampilkan di landing
   - `isActive = false`: Banner disembunyikan (non-aktif)

3. **Jumlah Banner**
   - Tidak ada batasan jumlah banner
   - Minimal 1 banner untuk slider yang berfungsi optimal
   - Jika 0 banner, menampilkan placeholder

4. **Pengurutan**
   - Banner diurutkan berdasarkan `createdAt DESC` (terbaru pertama)
   - Slider menampilkan urutan sesuai database order

## Aturan yang Dihapus

✅ **Profil Program** - Dihapus dari Landing Page  
✅ **Tujuan Utama** - Dihapus dari Landing Page  
✅ **Bentuk Kegiatan** - Dihapus dari Landing Page  

Section-section lama ini telah sepenuhnya dihapus dan digantikan dengan Banner Slider dinamis.

## Tips Manajemen

1. **Upload Banner Berkualitas**: Pastikan gambar memiliki kualitas tinggi dan representatif
2. **Konsistensi Aspek Ratio**: Gunakan gambar dengan ukuran yang konsisten untuk hasil visual optimal
3. **Aktifkan/Nonaktifkan**: Gunakan toggle nonaktif untuk menyembunyikan banner tanpa menghapusnya
4. **Reguler Update**: Update banner secara berkala untuk konten yang fresh dan engaging

## Troubleshooting

### Banner tidak muncul di landing
- Pastikan minimal ada 1 banner dengan status `isActive = true`
- Check network tab di browser dev tools untuk melihat API response
- Verifikasi folder `/uploads` sudah ada dan accessible

### Upload gagal
- Pastikan file adalah JPG/JPEG
- Pastikan ukuran file < 5MB
- Check console untuk error message

### Slider tidak berjalan
- Pastikan Swiper.js sudah diinstall: `npm install swiper`
- Pastikan ada lebih dari 1 banner untuk autoplay & loop
- Check browser console untuk error

## Future Enhancements

- [ ] Drag-drop untuk reorder banner
- [ ] Bulk upload multiple images
- [ ] Advanced filtering & search di admin panel
- [ ] Banner analytics (views, clicks)
- [ ] Scheduled publish/unpublish
- [ ] Banner descriptions/alt text (optional)

## Contact & Support

Untuk pertanyaan atau masalah, hubungi tim development.
