#!/bin/bash

# Test script untuk field catatan
# Menggunakan curl untuk test API

echo "=== Testing Catatan Field Integration ==="
echo ""

# 1. Login
echo "1. Login as admin..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token // empty')

if [ -z "$TOKEN" ]; then
  echo "   ✗ Login failed"
  echo "   Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "   ✓ Login successful"
echo ""

# 2. Create kelompok with catatan
echo "2. Creating kelompok with hewan catatan..."

KELOMPOK_RESPONSE=$(curl -s -X POST http://localhost:4000/api/kelompok \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Catatan '$(date +%s)'",
    "email": "test'$(date +%s)'@test.com",
    "kecamatan": "Cilacap Selatan",
    "desa": "Sidakaya",
    "latitude": -7.7,
    "longitude": 108.8,
    "pic1_nik": "1234567890123456",
    "pic1_nama": "Test User",
    "pic1_alamat": "Test Address",
    "pic1_noHp": "081234567890",
    "pic1_email": "admin'$(date +%s)'@test.com",
    "jumlahKandang": 1,
    "jumlahTernak": 2,
    "ternakDetails": [
      {
        "idTernak": "TEST-001",
        "jenisKelamin": "JANTAN",
        "ras": "Limousin",
        "bobot": 150,
        "umur": 18,
        "catatan": "Hewan sehat dan kuat"
      },
      {
        "idTernak": "TEST-002",
        "jenisKelamin": "BETINA",
        "ras": "Brahman",
        "bobot": 120,
        "umur": 16,
        "catatan": "Siap untuk kawin"
      }
    ],
    "pakanList": [],
    "kesehatanList": []
  }')

echo "   Response status: $(echo $KELOMPOK_RESPONSE | jq -r '.success // "error"')"

if [ "$(echo $KELOMPOK_RESPONSE | jq -r '.success')" != "true" ]; then
  echo "   ✗ Create kelompok failed"
  echo "   $KELOMPOK_RESPONSE"
  exit 1
fi

echo "   ✓ Kelompok created"
echo ""

# 3. Get hewan list
echo "3. Getting hewan list..."

HEWAN_RESPONSE=$(curl -s -X GET "http://localhost:4000/api/hewan?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN")

HEWAN_ID=$(echo $HEWAN_RESPONSE | jq -r '.data[0].id // empty')
HEWAN_CATATAN=$(echo $HEWAN_RESPONSE | jq -r '.data[0].catatan // empty')

if [ -z "$HEWAN_ID" ]; then
  echo "   ✗ No hewan found"
  exit 1
fi

echo "   ✓ Found hewan ID: $HEWAN_ID"
echo "   Catatan in list: ${HEWAN_CATATAN:-'(empty)'}"
echo ""

# 4. Get hewan detail
echo "4. Getting hewan detail..."

DETAIL_RESPONSE=$(curl -s -X GET "http://localhost:4000/api/hewan/$HEWAN_ID" \
  -H "Authorization: Bearer $TOKEN")

DETAIL_CATATAN=$(echo $DETAIL_RESPONSE | jq -r '.data.catatan // empty')

echo "   ✓ Detail retrieved"
echo "   ID: $(echo $DETAIL_RESPONSE | jq -r '.data.id')"
echo "   ID Hewan: $(echo $DETAIL_RESPONSE | jq -r '.data.id_hewan')"
echo "   Ras: $(echo $DETAIL_RESPONSE | jq -r '.data.ras')"
echo "   Catatan: \"${DETAIL_CATATAN:-'(empty)'}\""
echo ""

# 5. Verify test result
if [ -n "$DETAIL_CATATAN" ] && [ "$DETAIL_CATATAN" != "null" ]; then
  echo "✓ TEST PASSED: Catatan field working end-to-end!"
  exit 0
else
  echo "✗ TEST FAILED: Catatan not found in detail"
  exit 1
fi
