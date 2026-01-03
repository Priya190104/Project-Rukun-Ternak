# Script untuk menjalankan Load Test
# Prerequisites: k6 harus sudah terinstall

# Function untuk check apakah port aktif
function Test-Port {
    param(
        [int]$Port = 4000,
        [string]$Computer = "127.0.0.1",
        [int]$Timeout = 3000
    )
    
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $asyncResult = $tcpClient.BeginConnect($Computer, $Port, $null, $null)
    
    $isSuccess = $asyncResult.AsyncWaitHandle.WaitOne($Timeout)
    $tcpClient.Close()
    
    return $isSuccess
}

# Function untuk check apakah k6 terinstall
function Test-K6Installation {
    try {
        $k6Version = k6 version 2>&1
        Write-Host "✅ k6 terdeteksi: $k6Version" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ k6 tidak terinstall atau tidak ditemukan di PATH" -ForegroundColor Red
        Write-Host "Install k6 dari: https://github.com/grafana/k6/releases" -ForegroundColor Yellow
        return $false
    }
}

# Main script
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Load Test Script - Rukun Ternak" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check k6
Write-Host "📋 Checking k6 installation..." -ForegroundColor Yellow
if (-not (Test-K6Installation)) {
    exit 1
}

# Check backend server
Write-Host ""
Write-Host "📋 Checking backend server (port 4000)..." -ForegroundColor Yellow
$isServerRunning = Test-Port -Port 4000 -Computer "127.0.0.1"

if (-not $isServerRunning) {
    Write-Host "❌ Backend server tidak berjalan pada port 4000" -ForegroundColor Red
    Write-Host ""
    Write-Host "Pastikan:" -ForegroundColor Yellow
    Write-Host "1. Cd ke folder BackEnd"
    Write-Host "2. Jalankan: npm start atau npm run dev"
    Write-Host "3. Tunggu sampai server siap"
    exit 1
}

Write-Host "✅ Backend server siap di port 4000" -ForegroundColor Green

# Menu pilihan
Write-Host ""
Write-Host "Pilih skenario test:" -ForegroundColor Cyan
Write-Host "1. Test 100 User + 200 User (Recommended)" -ForegroundColor White
Write-Host "2. Test 100 User saja" -ForegroundColor White
Write-Host "3. Test 200 User saja" -ForegroundColor White
Write-Host "4. Exit" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "Pilih nomor (1-4)"

$backendPath = Get-Location
$testFile = Join-Path $backendPath "load-test-scenarios.js"

# Verifikasi file test ada
if (-not (Test-Path $testFile)) {
    Write-Host "❌ File test tidak ditemukan: $testFile" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Starting load test..." -ForegroundColor Green
Write-Host "Test file: $testFile" -ForegroundColor Gray
Write-Host ""

# Run test sesuai pilihan
switch ($choice) {
    "1" {
        Write-Host "Testing 100 dan 200 User..." -ForegroundColor Cyan
        Write-Host "⏱️  Estimasi durasi: ~9 menit" -ForegroundColor Yellow
        Write-Host ""
        k6 run $testFile
    }
    "2" {
        Write-Host "Testing 100 User saja..." -ForegroundColor Cyan
        Write-Host "⏱️  Estimasi durasi: ~4 menit" -ForegroundColor Yellow
        Write-Host ""
        # Jalankan hanya scenario 100 user
        k6 run --scenario-only=scenario_100_users $testFile
    }
    "3" {
        Write-Host "Testing 200 User saja..." -ForegroundColor Cyan
        Write-Host "⏱️  Estimasi durasi: ~4.5 menit" -ForegroundColor Yellow
        Write-Host ""
        # Jalankan hanya scenario 200 user
        k6 run --scenario-only=scenario_200_users $testFile
    }
    "4" {
        Write-Host "Exit." -ForegroundColor Yellow
        exit 0
    }
    default {
        Write-Host "Pilihan tidak valid" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✅ Load test selesai!" -ForegroundColor Green
Write-Host ""
Write-Host "Lihat LOAD_TEST_GUIDE.md untuk interpretasi hasil" -ForegroundColor Cyan
