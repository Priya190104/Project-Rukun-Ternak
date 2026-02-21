# Password Reset Feature - Setup Instructions

## Overview
Fitur reset password terintegrasi dengan Gmail untuk mengirim email reset password kepada user yang lupa password mereka.

## Setup Backend

### 1. Install Dependencies
Pastikan package `nodemailer` sudah terinstall:
```bash
cd BackEnd
npm install nodemailer
```

### 2. Konfigurasi Email (Gmail)

#### a. Dapatkan App Password Gmail
1. Login ke akun Gmail Anda
2. Buka [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Jika diminta, login kembali
4. Pilih "Select app" → "Other (Custom name)"
5. Ketik nama aplikasi (contoh: "Rukun Ternak")
6. Klik "Generate"
7. Salin kode 16 karakter yang muncul (format: xxxx xxxx xxxx xxxx)

**Catatan:** Jika menu App Passwords tidak muncul, aktifkan 2-Step Verification terlebih dahulu:
- Buka [https://myaccount.google.com/security](https://myaccount.google.com/security)
- Cari "2-Step Verification" dan aktifkan
- Setelah itu, menu App Passwords akan tersedia

#### b. Update File .env
Edit file `BackEnd/.env` dan tambahkan konfigurasi email:

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx  # App Password dari step sebelumnya (tanpa spasi)
EMAIL_FROM=Rukun Ternak <your-email@gmail.com>
FRONTEND_URL=http://localhost:3000
```

**Ganti:**
- `your-email@gmail.com` dengan email Gmail Anda
- `xxxx-xxxx-xxxx-xxxx` dengan App Password yang sudah di-generate (hapus spasi)

### 3. Jalankan Migration Database
Jalankan migration untuk membuat table `password_reset_tokens`:

```bash
cd BackEnd
psql -U postgres -d rukunternak -f migrations/20260217_add_password_reset_tokens.sql
```

Atau jika menggunakan pgAdmin, buka Query Tool dan jalankan isi file `migrations/20260217_add_password_reset_tokens.sql`

### 4. Restart Server Backend
```bash
cd BackEnd
npm run dev
```

## Setup Frontend

Frontend sudah siap digunakan. Tidak perlu konfigurasi tambahan.

## Cara Menggunakan

### User Flow

1. **Forgot Password**
   - User mengklik "Lupa Password?" di halaman login
   - User memasukkan username atau email
   - Sistem mencari user di database
   - Email reset password dikirim ke email user (jika ditemukan)
   - User melihat konfirmasi bahwa email telah dikirim

2. **Reset Password**
   - User membuka email dan klik link reset password
   - User diarahkan ke halaman reset password dengan token di URL
   - Sistem memverifikasi token (validitas, expiry, usage)
   - User memasukkan password baru (minimal 6 karakter)
   - Password lama diganti dengan password baru
   - User diarahkan ke halaman login

### Security Features

- **Token expiry**: Token kadaluarsa setelah 1 jam
- **One-time use**: Token hanya bisa digunakan sekali
- **Email masking**: Email di-mask untuk keamanan (contoh: us***@example.com)
- **Password hashing**: Password di-hash menggunakan bcrypt sebelum disimpan
- **Anti-enumeration**: Response yang sama untuk username/email yang tidak ditemukan

## API Endpoints

### 1. Request Password Reset
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "usernameOrEmail": "username or email"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email reset password telah dikirim.",
  "email": "us***@example.com"
}
```

### 2. Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password berhasil direset. Silakan login dengan password baru Anda."
}
```

### 3. Verify Reset Token
```http
GET /api/auth/verify-reset-token/:token
```

**Response:**
```json
{
  "success": true,
  "valid": true,
  "message": "Token valid"
}
```

## Testing

### Test Email Configuration
Buat file test di `BackEnd/test-email.js`:

```javascript
const { sendTestEmail } = require('./src/services/emailService');

(async () => {
  try {
    await sendTestEmail('your-test-email@example.com');
    console.log('✅ Test email sent successfully!');
  } catch (error) {
    console.error('❌ Failed to send test email:', error.message);
  }
})();
```

Jalankan:
```bash
node test-email.js
```

### Test Flow
1. Buka frontend: `http://localhost:3000/login`
2. Klik "Lupa Password?"
3. Masukkan username atau email yang terdaftar
4. Cek inbox email (dan folder spam)
5. Klik link di email
6. Masukkan password baru
7. Login dengan password baru

## Troubleshooting

### Email tidak terkirim
1. **Cek App Password**
   - Pastikan sudah di-copy dengan benar
   - Hapus semua spasi di App Password
   - Pastikan 2-Step Verification sudah aktif

2. **Cek konfigurasi .env**
   - Pastikan `EMAIL_USER` dan `EMAIL_PASSWORD` sudah benar
   - Pastikan tidak ada spasi di awal/akhir

3. **Cek log server**
   - Lihat error message di terminal server
   - Error umum: "Invalid login" = App Password salah

4. **Cek firewall/antivirus**
   - Beberapa firewall memblock koneksi SMTP
   - Coba disable sementara untuk testing

### Token tidak valid
1. Token sudah kadaluarsa (> 1 jam) → Minta link baru
2. Token sudah digunakan → Minta link baru
3. Database migration belum dijalankan → Jalankan migration

### Email masuk ke Spam
- Tambahkan sender email ke whitelist
- Ini normal untuk first-time sender
- Email production sebaiknya menggunakan domain sendiri dengan SPF/DKIM

## Production Deployment

Untuk production, pertimbangkan:

1. **Gunakan SMTP provider profesional**
   - SendGrid
   - Amazon SES
   - Mailgun
   - Email service dengan reputation baik

2. **Setup domain email**
   - Gunakan domain sendiri (contoh: noreply@rukunternak.com)
   - Setup SPF, DKIM, DMARC records

3. **Rate limiting**
   - Batasi jumlah request forgot password per IP
   - Batasi jumlah email per user per hari

4. **Monitoring**
   - Log semua email yang dikirim
   - Monitor delivery rate
   - Setup alert untuk failed emails

## Database Schema

Table: `password_reset_tokens`
```sql
CREATE TABLE password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP NULL
);
```

## Files Modified/Created

### Backend
- `BackEnd/.env` - Email configuration
- `BackEnd/package.json` - Added nodemailer dependency
- `BackEnd/src/services/emailService.js` - Email sending service
- `BackEnd/src/controllers/passwordResetController.js` - Password reset controllers
- `BackEnd/src/routes/auth.js` - Added password reset routes
- `BackEnd/migrations/20260217_add_password_reset_tokens.sql` - Database migration

### Frontend
- `FrontEnd/src/pages/ForgotPassword.jsx` - Forgot password page
- `FrontEnd/src/pages/ResetPassword.jsx` - Reset password page
- `FrontEnd/src/pages/Login.jsx` - Added "Lupa Password?" link
- `FrontEnd/src/routes/AppRouter.jsx` - Added routes for forgot/reset password

## Support

Jika ada masalah atau pertanyaan, hubungi tim development.
