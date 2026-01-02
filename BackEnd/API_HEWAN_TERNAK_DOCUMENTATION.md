# API Documentation: Hewan Ternak Endpoints

**Status:** ✅ Updated December 29, 2025  
**Context:** Perbaikan logic penyaluran - hewan harus input manual dengan data lengkap

---

## 📌 IMPORTANT CHANGE

**SEBELUM (WRONG):** Auto-generate hewan saat create kelompok  
**SESUDAH (CORRECT):** Hewan harus input manual satu-satu dengan data lengkap

---

## 1️⃣ CREATE HEWAN TERNAK (NEW ENDPOINT)

### **Endpoint**
```
POST /api/hewan
Authorization: Bearer <token>
Content-Type: application/json
```

### **Description**
Menambahkan hewan ternak baru ke kelompok. **Hewan wajib punya semua field lengkap**:
- ID unik di kelompok
- Jenis kelamin (JANTAN/BETINA)
- Ras/breed
- Bobot (kg)
- Tanggal lahir

### **Request Body**
```json
{
  "id_hewan": "KT-001",              // ✅ REQUIRED: Unique ID dalam kelompok
  "jenis_kelamin": "JANTAN",         // ✅ REQUIRED: JANTAN or BETINA
  "ras": "Domba Wool",               // ✅ REQUIRED: Breed/type
  "bobot": 25.5,                     // ✅ REQUIRED: Weight in kg (> 0)
  "tanggal_lahir": "2024-12-01",     // ✅ REQUIRED: Birth date (YYYY-MM-DD)
  "source": "Penyaluran",            // ❓ OPTIONAL: Default = "Penyaluran"
  "id_induk": "KT-002",              // ❌ OPTIONAL: Mother ID (jika ada)
  "id_pejantan": "KT-003"            // ❌ OPTIONAL: Father ID (jika ada)
}
```

### **Validation Rules**
✅ **All required fields must be present:**
- `id_hewan`: String, unique per kelompok, max 50 chars
- `jenis_kelamin`: JANTAN or BETINA (case-insensitive)
- `ras`: Non-empty string (max 100 chars)
- `bobot`: Number > 0
- `tanggal_lahir`: Valid date (YYYY-MM-DD), not in future

✅ **Optional fields validation:**
- `source`: String, default = "Penyaluran"
- `id_induk`: Must exist in kelompok if provided
- `id_pejantan`: Must exist in kelompok if provided

❌ **Reject if:**
- Any required field missing
- id_hewan already exists in kelompok
- jenis_kelamin not JANTAN/BETINA
- bobot <= 0
- tanggal_lahir is invalid or in future
- id_induk/id_pejantan doesn't exist in kelompok

### **Response - Success (201/200)**
```json
{
  "success": true,
  "message": "Hewan ternak \"KT-001\" berhasil ditambahkan",
  "data": {
    "id": 1,
    "id_hewan": "KT-001",
    "jenis_kelamin": "JANTAN",
    "ras": "Domba Wool",
    "bobot": 25.5,
    "tanggal_lahir": "2024-12-01",
    "source": "Penyaluran",
    "status": "AKTIF",
    "umur": {
      "hari": 30,
      "bulan": 1,
      "display": "1 bulan"
    }
  }
}
```

### **Response - Errors**

**400 Bad Request - Missing fields**
```json
{
  "success": false,
  "message": "Field wajib: id_hewan, jenis_kelamin, ras, bobot, tanggal_lahir",
  "received": {
    "id_hewan": null,
    "jenis_kelamin": "JANTAN",
    "ras": null,
    "bobot": null,
    "tanggal_lahir": null
  }
}
```

**400 Bad Request - Invalid jenis_kelamin**
```json
{
  "success": false,
  "message": "Jenis kelamin harus JANTAN atau BETINA"
}
```

**400 Bad Request - Invalid bobot**
```json
{
  "success": false,
  "message": "Bobot harus lebih dari 0"
}
```

**400 Bad Request - Invalid date**
```json
{
  "success": false,
  "message": "Format tanggal_lahir tidak valid (gunakan YYYY-MM-DD)"
}
```

**400 Bad Request - Future date**
```json
{
  "success": false,
  "message": "Tanggal lahir tidak boleh di masa depan"
}
```

**400 Bad Request - Duplicate ID**
```json
{
  "success": false,
  "message": "ID hewan \"KT-001\" sudah terdaftar di kelompok ini"
}
```

**404 Not Found - Parent animals**
```json
{
  "success": false,
  "message": "Hewan induk dengan ID \"KT-999\" tidak ditemukan di kelompok ini"
}
```

**500 Server Error**
```json
{
  "success": false,
  "message": "Gagal menambahkan hewan ternak",
  "error": "Database connection error..."
}
```

---

## 2️⃣ GET HEWAN TERNAK LIST

### **Endpoint**
```
GET /api/hewan?page=1&limit=20
Authorization: Bearer <token>
```

### **Response - Success**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "jenis_kelamin": "JANTAN",
      "ras": "Domba Wool",
      "tanggal_lahir": "2024-12-01",
      "status": "AKTIF",
      "bobot": 25.5,
      "umur_hari": 30,
      "umur_bulan": 1,
      "umur_display": "1 bulan"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

---

## 3️⃣ GET HEWAN DETAIL

### **Endpoint**
```
GET /api/hewan/:id
Authorization: Bearer <token>
```

### **Response - Success**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "kelompok_id": 5,
    "jenis_kelamin": "JANTAN",
    "ras": "Domba Wool",
    "tanggal_lahir": "2024-12-01",
    "bobot": 25.5,
    "status": "AKTIF",
    "source": "Penyaluran",
    "id_induk": null,
    "id_pejantan": null,
    "umur": {
      "hari": 30,
      "bulan": 1,
      "display": "1 bulan"
    },
    "induk": null,
    "pejantan": null,
    "riwayatBobot": [
      {
        "bobot": 25.5,
        "tanggal_update": "2025-01-01",
        "keterangan": "Update bobot rutin"
      }
    ]
  }
}
```

---

## 📋 USAGE FLOW (Penyaluran & Bantuan)

### **Step 1: Admin Create Kelompok**
```bash
curl -X POST http://localhost:4000/api/kelompok \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kelompok Ternak Sejahtera",
    "jumlahKandang": 5,
    "jumlahTernak": 10,
    "pakanList": [...],
    "kesehatanList": [...]
  }'
```

**Result:**
- ✅ 1 kelompok record created
- ✅ 1 laporan ringkasan created (laporan_type='penyaluran_dan_bantuan')
- ❌ 0 hewan records created (NOT auto-generated anymore)

### **Step 2: Kelompok User Add Hewan Manually**
Setiap hewan harus di-input satu-satu dengan data lengkap:

```bash
curl -X POST http://localhost:4000/api/hewan \
  -H "Authorization: Bearer $KELOMPOK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id_hewan": "KT-001",
    "jenis_kelamin": "JANTAN",
    "ras": "Domba Wool",
    "bobot": 25,
    "tanggal_lahir": "2024-12-01",
    "source": "Penyaluran"
  }'
```

**Repeat for:** KT-002, KT-003, ... KT-010 (10x untuk 10 hewan)

**Result:**
- ✅ 10 individual hewan records created
- ✅ Each with complete data (ID, gender, breed, weight, birthdate)
- ✅ source='Penyaluran' (tracked automatically)
- ✅ All AKTIF status

### **Step 3: Dashboard Display**
Dashboard menampilkan:
- Kandang: 5
- Hewan: 10
- Pakan: [List]
- Kesehatan: [List]

(Bukan detail hewan satu-satu, tapi RINGKASAN)

---

## 🔒 AUTHORIZATION

- **Create hewan:** Hanya role `kelompok` (milik kelompok tersebut)
- **View hewan list:** Role `kelompok` (milik kelompok) atau `admin`
- **View hewan detail:** Role `kelompok` (milik kelompok) atau `admin`

---

## 🎯 KEY DIFFERENCES: BEFORE vs AFTER

| Aspect | Before (WRONG) | After (CORRECT) |
|--------|---|---|
| Hewan creation trigger | Auto-create saat kelompok dibuat | Manual via form/API |
| Number of hewan created | Otomatis N hewan (sesuai jumlahTernak) | 0 hewan (user input sendiri) |
| Hewan field values | Default hardcoded | User input per-hewan |
| Data quality | Invalid (defaults) | Valid (complete user input) |
| Validation | Minimal | Comprehensive (semua field wajib) |
| User control | None (auto-generated) | Full (manual input per-hewan) |
| Time to setup | Fast (auto) | Slower (manual input) |

---

## 📊 DATABASE IMPACT

**Table: hewan_ternak**

New records created via:
- ✅ `POST /api/hewan` (manual input with validation)
- ❌ NOT created from `POST /api/kelompok` anymore

**Fields populated:**
- ✅ `id`: User input
- ✅ `jenis_kelamin`: User input (JANTAN/BETINA)
- ✅ `ras`: User input
- ✅ `bobot`: User input (kg)
- ✅ `tanggal_lahir`: User input (date)
- ✅ `source`: System set to "Penyaluran" (for penyaluran kelompok)
- ✅ `status`: Default AKTIF
- ✅ `created_at`: System timestamp
- ✅ `updated_at`: System timestamp

**No defaults:**
- ❌ jenis_kelamin NOT alternating JANTAN/BETINA
- ❌ ras NOT hardcoded "Domba"
- ❌ tanggal_lahir NOT NOW() (user input)
- ❌ bobot NOT NULL/0

---

## 🧪 TESTING

### Test 1: Create with all required fields
```bash
curl -X POST http://localhost:4000/api/hewan \
  -H "Authorization: Bearer <token>" \
  -d '{
    "id_hewan": "TEST-001",
    "jenis_kelamin": "JANTAN",
    "ras": "Kambing Boer",
    "bobot": 30,
    "tanggal_lahir": "2024-10-01"
  }' | jq
```
Expected: ✅ Success 200

### Test 2: Missing required field (id_hewan)
```bash
curl -X POST http://localhost:4000/api/hewan \
  -H "Authorization: Bearer <token>" \
  -d '{
    "jenis_kelamin": "JANTAN",
    "ras": "Kambing Boer",
    "bobot": 30,
    "tanggal_lahir": "2024-10-01"
  }' | jq
```
Expected: ❌ 400 Bad Request - "Field wajib..."

### Test 3: Invalid jenis_kelamin
```bash
curl -X POST http://localhost:4000/api/hewan \
  -H "Authorization: Bearer <token>" \
  -d '{
    "id_hewan": "TEST-002",
    "jenis_kelamin": "LAINNYA",
    "ras": "Kambing Boer",
    "bobot": 30,
    "tanggal_lahir": "2024-10-01"
  }' | jq
```
Expected: ❌ 400 Bad Request - "Jenis kelamin harus JANTAN atau BETINA"

### Test 4: Duplicate ID
```bash
# Create first
curl -X POST http://localhost:4000/api/hewan \
  -H "Authorization: Bearer <token>" \
  -d '{"id_hewan": "DUP-001", ...}'

# Try create again with same ID
curl -X POST http://localhost:4000/api/hewan \
  -H "Authorization: Bearer <token>" \
  -d '{"id_hewan": "DUP-001", ...}'
```
Expected: ❌ 400 Bad Request - "ID hewan ... sudah terdaftar"

### Test 5: Invalid bobot (negative)
```bash
curl -X POST http://localhost:4000/api/hewan \
  -H "Authorization: Bearer <token>" \
  -d '{
    "id_hewan": "TEST-005",
    "jenis_kelamin": "BETINA",
    "ras": "Domba",
    "bobot": -10,
    "tanggal_lahir": "2024-10-01"
  }' | jq
```
Expected: ❌ 400 Bad Request - "Bobot harus lebih dari 0"

### Test 6: Future birthdate
```bash
curl -X POST http://localhost:4000/api/hewan \
  -H "Authorization: Bearer <token>" \
  -d '{
    "id_hewan": "TEST-006",
    "jenis_kelamin": "JANTAN",
    "ras": "Domba",
    "bobot": 25,
    "tanggal_lahir": "2025-12-31"
  }' | jq
```
Expected: ❌ 400 Bad Request - "Tanggal lahir tidak boleh di masa depan"

---

## ✅ SUMMARY

**New approach:**
- ✅ Hewan NO LONGER auto-generated
- ✅ Full validation on all required fields
- ✅ User input control (not default values)
- ✅ Data integrity (complete records only)
- ✅ Clear error messages
- ✅ source field auto-set for penyaluran hewan

**Next steps:**
- Frontend: Create form untuk input hewan dengan validation
- Frontend: Show clear messages if hewan data incomplete
- Backend: Monitor logs for validation failures
- Testing: Verify no hewan auto-creation in new kelompok
