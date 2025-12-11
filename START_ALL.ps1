#!/usr/bin/env powershell
# Rukun Ternak - Quick Start Script
# Run this to start all servers at once

Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🌾 Rukun Ternak - Multi-Server Startup Script     ║" -ForegroundColor Cyan
Write-Host "║  Backend + Frontend + Database                     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Cyan

$ProjectRoot = "d:\Priya\Projek\Rukun Ternak Project"

Write-Host ""
Write-Host "Starting services..." -ForegroundColor Yellow

# Check PostgreSQL is running (optional warning)
Write-Host ""
Write-Host "Prerequisites Check:" -ForegroundColor Yellow
Write-Host "  [⚠️ ] PostgreSQL must be running on localhost:5432"
Write-Host "       Database: rukunternak"
Write-Host "       User: postgres"
Write-Host "       Password: admin123"

Write-Host ""
Write-Host "Starting Backend Server..." -ForegroundColor Green
Write-Host "  Command: npm start"
Write-Host "  Location: $ProjectRoot\BackEnd"
Write-Host "  URL: http://localhost:4000"

$BackendProcess = Start-Process -FilePath "powershell" -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$ProjectRoot\BackEnd'; npm start"
) -WindowStyle Normal -PassThru

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Starting Frontend Server..." -ForegroundColor Green
Write-Host "  Command: npm start"
Write-Host "  Location: $ProjectRoot\FrontEnd"
Write-Host "  URL: http://localhost:3000"

$FrontendProcess = Start-Process -FilePath "powershell" -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$ProjectRoot\FrontEnd'; npm start"
) -WindowStyle Normal -PassThru

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                  ✅ STARTUP COMPLETE               ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host ""
Write-Host "Services Running:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:  http://localhost:4000" -ForegroundColor White
Write-Host "  Database: localhost:5432/rukunternak" -ForegroundColor White

Write-Host ""
Write-Host "Test Accounts:" -ForegroundColor Cyan
Write-Host "  Admin:    admin / adminpass" -ForegroundColor White
Write-Host "  Client:   client1 / clientpass" -ForegroundColor White

Write-Host ""
Write-Host "Process IDs:" -ForegroundColor Cyan
Write-Host "  Backend:  $($BackendProcess.Id)" -ForegroundColor White
Write-Host "  Frontend: $($FrontendProcess.Id)" -ForegroundColor White

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Wait for both servers to fully start (1-2 minutes)"
Write-Host "  2. Open browser to http://localhost:3000"
Write-Host "  3. Click 'Login' and use quick login buttons"
Write-Host "  4. Or manually enter username and password"

Write-Host ""
Write-Host "To Stop Servers:" -ForegroundColor Yellow
Write-Host "  Close both terminal windows or press Ctrl+C in each"

Write-Host ""
Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "  Main Guide:      README.md" -ForegroundColor Gray
Write-Host "  Integration:     INTEGRATION.md" -ForegroundColor Gray
Write-Host "  Backend Setup:   BackEnd/README.md" -ForegroundColor Gray
Write-Host "  Status Report:   INTEGRATION_COMPLETE.md" -ForegroundColor Gray

Write-Host ""
Read-Host "Press Enter to continue..."
