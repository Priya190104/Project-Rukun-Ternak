# Email Requirement for Password Reset Feature

## Overview
Untuk mendukung fitur **reset password**, setiap user **WAJIB** memiliki email address yang valid.

## ✅ Perubahan yang Dilakukan

### 1. Database Migration
**File**: `BackEnd/migrations/20260217_add_email_to_users.sql`

Menambahkan kolom `email` ke tabel `users`:
- Type: `VARCHAR(255)`
- Nullable: `YES` (untuk backward compatibility)
- Unique: `YES` (tidak boleh duplikat)
- Indexed: `YES` (untuk performa lookup)

### 2. Prisma Schema Update
 **File**: `BackEnd/prisma/schema.prisma`

```prisma
model User {
  id         Int       @id @default(autoincrement())
  username   String    @unique
  email      String?   @unique  // ← ADDED
  password   String
  fullName   String?   @map("full_name")
  role       String
  kelompokId Int?      @map("kelompok_id")
  ...
}
```

### 3. Backend Controller Update
**File**: `BackEnd/src/controllers/usersController.js`

**getUsers()**: Return field `email`
```javascript
SELECT id, username, email, full_name, role, kelompok_id FROM users
```

**createUser()**: Require dan validate email
- Email wajib diisi
- Validasi format email dengan regex
- Handle error jika email sudah digunakan
- Store email ke database

### 4. Frontend Updates

#### a. AddUserModal
**File**: `FrontEnd/src/components/user/AddUserModal.jsx`

- Tambah input field `email` (required)
- Validasi format email
- Info tooltip: "📧 Required untuk fitur reset password"

#### b. KelolaUser Page
**File**: `FrontEnd/src/pages/KelolaUser.jsx`

- Kolom "Email" menampilkan email user (bukan username)
- Jika email kosong, tampilkan "Belum diset" (italic)

## 📋 Setup Instructions

### 1. Jalankan Database Migration

```bash
cd BackEnd
psql -U postgres -d rukunternak -f migrations/20260217_add_email_to_users.sql
```

Atau via pgAdmin:
1. Buka Query Tool
2. Load file `migrations/20260217_add_email_to_users.sql`
3. Execute

### 2. Update Existing Users

❗ **PENTING**: User yang sudah ada belum memiliki email. Mereka **TIDAK BISA** menggunakan fitur reset password sampai email diisi.

**Cara update email existing users**:

```sql
-- Update email untuk user tertentu
UPDATE users 
SET email = 'admin@example.com' 
WHERE username = 'admin';

-- Cek users tanpa email
SELECT id, username, full_name, email 
FROM users 
WHERE email IS NULL;
```

### 3. Restart Backend Server

```bash
cd BackEnd
npm run dev
```

### 4. Test User Creation

1. Login sebagai admin
2. Buka "Kelola Pengguna"
3. Klik "Tambah Pengguna"
4. Isi semua field termasuk **Email** (required)
5. Submit

## 🔍 Validation Rules

### Email Field:
- ✅ **Required**: Wajib diisi
- ✅ **Unique**: Tidak boleh duplikat
- ✅ **Format**: Harus valid email format (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- ✅ **Case Insensitive**: Email disimpan as-is tapi lookup case-insensitive

### Error Messages:
- "Email wajib diisi untuk fitur reset password"
- "Format email tidak valid"
- "Email sudah digunakan"

## 🚨 Important Notes

### Untuk Existing Users:
1. **Users tanpa email TIDAK BISA reset password**
2. Admin harus update email mereka secara manual via database
3. UI akan menampilkan "Belum diset" untuk user tanpa email

### Untuk New Users:
1. **Email wajib diisi** saat create user
2. Form validation akan mencegah submit jika email kosong atau invalid
3. Backend akan reject jika email tidak ada

## 🔄 Backwards Compatibility

Kolom `email` bersifat **NULLABLE** untuk:
- Existing users yang belum punya email
- Backward compatibility dengan data lama

Namun **REQUIRED** untuk:
- User baru (enforced di backend)
- Fitur reset password (enforced di application logic)

## 📊 Database Query Examples

```sql
-- Check users without email
SELECT COUNT(*) as users_without_email 
FROM users 
WHERE email IS NULL;

-- List alluser emails
SELECT id, username, email, role 
FROM users 
ORDER BY id;

-- Update batch emails (example)
UPDATE users 
SET email = CONCAT(LOWER(username), '@rukunternak.local')
WHERE email IS NULL;
```

## ✅ Testing Checklist

- [ ] Migration berhasil dijalankan
- [ ] Tabel users memiliki kolom `email`
- [ ] Index dan constraint terbuat
- [ ] Backend return email di GET /api/users
- [ ] Form "Tambah Pengguna" punya field email (required)
- [ ] Validation email format berjalan
- [ ] Error message jika email duplikat
- [ ] Tabel KelolaUser menampilkan email
- [ ] User baru bisa dibuat dengan email
- [ ] Fitur forgot password bisa mencari user by email

## 📞 Support

Jika ada user existing yang perlu update email secara bulk, hubungi database administrator untuk menjalankan update query.
