# 🔧 CARA MENJALANKAN DATABASE MIGRATIONS

## ⚠️ WAJIB DIJALANKAN SEBELUM FITUR PASSWORD RESET BISA DIGUNAKAN!

Fitur **Reset Password** membutuhkan 2 tabel baru di database:
1. `password_reset_tokens` - Menyimpan token reset password
2. Kolom `email` di tabel `users` - Untuk mengirim email reset

---

## Method 1: Via pgAdmin (RECOMMENDED)

### Step 1: Buka pgAdmin
1. Buka **pgAdmin 4**
2. Connect ke server PostgreSQL
3. Expand **Servers** → **PostgreSQL** → **Databases**
4. Klik kanan database **rukunternak** → **Query Tool**

### Step 2: Jalankan Migration 1 (Password Reset Tokens)
1. Di Query Tool, klik **File** → **Open**
2. Pilih file: `BackEnd/migrations/20260217_add_password_reset_tokens.sql`
3. Klik tombol **▶ Execute/Refresh** (atau tekan F5)
4. Lihat output panel - harus muncul **"CREATE TABLE"** dan **"CREATE INDEX"**

### Step 3: Jalankan Migration 2 (Email Column)
1. Di Query Tool, klik **File** → **Open**
2. Pilih file: `BackEnd/migrations/20260217_add_email_to_users.sql`
3. Klik tombol **▶ Execute/Refresh** (atau tekan F5)
4. Lihat output panel - harus muncul **"ALTER TABLE"** dan **"CREATE INDEX"**

### Step 4: Verifikasi
Jalankan query ini untuk cek hasil:

```sql
-- Cek tabel password_reset_tokens
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'password_reset_tokens';

-- Cek kolom email di tabel users
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'email';
```

Harus tampil:
- Tabel `password_reset_tokens` dengan 7 kolom (id, user_id, token, expires_at, used, created_at, used_at)
- Kolom `email` di tabel `users` dengan type `character varying`

---

## Method 2: Via psql Command Line

### Windows:
```bash
cd "d:\Priya\Projek\Rukun Ternak Project\BackEnd"

# Migration 1
psql -U postgres -d rukunternak -f migrations/20260217_add_password_reset_tokens.sql

# Migration 2
psql -U postgres -d rukunternak -f migrations/20260217_add_email_to_users.sql
```

### Linux/Mac:
```bash
cd /path/to/BackEnd

# Migration 1
psql -U postgres -d rukunternak -f migrations/20260217_add_password_reset_tokens.sql

# Migration 2
psql -U postgres -d rukunternak -f migrations/20260217_add_email_to_users.sql
```

**Note**: Ganti `-U postgres` dengan username PostgreSQL Anda jika berbeda.

---

## Method 3: Copy-Paste Manual (jika pgAdmin sulit)

### Migration 1: Password Reset Tokens

Copy semua isi dari file `20260217_add_password_reset_tokens.sql` dan paste ke Query Tool pgAdmin, lalu Execute:

```sql
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP NULL
);

CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

COMMENT ON TABLE password_reset_tokens IS 'Stores password reset tokens for users';
COMMENT ON COLUMN password_reset_tokens.token IS 'Unique token for password reset';
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Token expiration timestamp';
COMMENT ON COLUMN password_reset_tokens.used IS 'Whether the token has been used';
```

### Migration 2: Email Column

Copy semua isi dari file `20260217_add_email_to_users.sql` dan paste ke Query Tool pgAdmin, lalu Execute:

```sql
-- Add email column to users table (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'email'
  ) THEN
    ALTER TABLE users ADD COLUMN email VARCHAR(255);
  END IF;
END $$;

-- Add unique constraint
ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);

-- Add index for faster email lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Add comment
COMMENT ON COLUMN users.email IS 'User email address for password reset and notifications';
```

---

## ✅ Setelah Migration Berhasil

### 1. Restart Backend Server
```bash
cd BackEnd
npm run dev
```

### 2. Update Email Users yang Sudah Ada

Users yang **sudah ada** belum punya email. Mereka **TIDAK BISA** reset password sampai email diisi!

**Cara update via pgAdmin:**
```sql
-- Update email untuk admin
UPDATE users SET email = 'admin@rukunternak.com' WHERE username = 'admin';

-- Lihat users tanpa email
SELECT id, username, full_name, email 
FROM users 
WHERE email IS NULL;

-- Update manual satu-satu
UPDATE users SET email = 'user1@example.com' WHERE id = 1;
UPDATE users SET email = 'user2@example.com' WHERE id = 2;
```

### 3. Test Fitur Reset Password

1. Buka `http://localhost:3000/forgot-password`
2. Masukkan username/email yang **SUDAH PUNYA EMAIL**
3. Kalau berhasil, akan muncul "Email terkirim"
4. Cek database: `SELECT * FROM password_reset_tokens ORDER BY id DESC LIMIT 5;`

---

## 🚨 Troubleshooting

### Error: "relation password_reset_tokens does not exist"
**Solusi**: Migration 1 belum dijalankan. Jalankan ulang file `20260217_add_password_reset_tokens.sql`

### Error: "column users.email does not exist"
**Solusi**: Migration 2 belum dijalankan. Jalankan ulang file `20260217_add_email_to_users.sql`

### Error: "duplicate key value violates unique constraint users_email_key"
**Solusi**: Email yang diinput sudah dipakai user lain. Gunakan email yang berbeda.

### Error: "Akun ini tidak memiliki email terdaftar"
**Solusi**: User tersebut belum punya email di database. Update manual via SQL:
```sql
UPDATE users SET email = 'user@example.com' WHERE username = 'username_user';
```

### Token tidak terkirim ke email
**Cek**:
1. Apakah `EMAIL_USER` dan `EMAIL_PASSWORD` sudah diisi di `.env`?
2. Apakah Gmail App Password sudah dibuat?
3. Cek console backend untuk error email
4. Cek spam folder email

---

## 📧 Setup Gmail (Diperlukan Setelah Migration)

Setelah migration berhasil, setup Gmail untuk kirim email:

1. Buka: https://myaccount.google.com/apppasswords
2. Enable **2-Step Verification** (jika belum)
3. Generate **App Password** untuk "Rukun Ternak"
4. Copy 16-digit password (format: xxxx-xxxx-xxxx-xxxx)
5. Edit file `BackEnd/.env`:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx
   EMAIL_FROM=Rukun Ternak Cilacap <your-email@gmail.com>
   FRONTEND_URL=http://localhost:3000
   ```
6. Restart backend server
7. Test kirim email

---

## 📝 Summary Checklist

- [ ] Migration 1 dijalankan (`password_reset_tokens` table created)
- [ ] Migration 2 dijalankan (`email` column added to `users`)
- [ ] Backend server di-restart
- [ ] Email credential di-setup di `.env`
- [ ] Existing users di-update emailnya
- [ ] Test forgot password berhasil
- [ ] Email reset terkirim

**Jika semua checklist ☑️, fitur reset password siap digunakan!** 🎉
