# ⚡ Quick Reference Guide

## 🚀 Start Everything

### One-Command Startup
```powershell
cd "d:\Priya\Projek\Rukun Ternak Project"; .\START_ALL.ps1
```

### Or Manual Startup (Two Windows)

**Window 1:**
```powershell
cd BackEnd; npm start
# Runs on http://localhost:4000
```

**Window 2:**
```powershell
cd FrontEnd; npm start
# Runs on http://localhost:3000
```

---

## 🔐 Quick Login

Go to **http://localhost:3000** → Click **Login** → Use quick buttons:

### Admin Account
- **User:** admin
- **Pass:** adminpass
- **Role:** Full access

### Client Account
- **User:** client1
- **Pass:** clientpass
- **Role:** Own data only

---

## 📍 Important URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | React app |
| Backend API | http://localhost:4000 | REST API |
| Health Check | http://localhost:4000/api/health | Server status |

---

## 📂 Key Files

| File | Purpose |
|------|---------|
| `FrontEnd/src/hooks/useAuth.js` | Authentication hook |
| `FrontEnd/src/api/client.js` | Axios configuration |
| `FrontEnd/.env.local` | Frontend config |
| `BackEnd/.env` | Backend config |
| `BackEnd/server.js` | Express app |
| `BackEnd/src/db.js` | Database connection |

---

## 🔄 Common Tasks

### Check if backend is running
```powershell
curl http://localhost:4000/api/health
# Should return: {"success":true,"data":"ok"}
```

### Check database
```powershell
psql -U postgres -h localhost -d rukunternak -c "SELECT COUNT(*) FROM users;"
```

### Reset database (if needed)
```powershell
cd BackEnd
npm run seed
```

### Check if ports are in use
```powershell
netstat -ano | findstr :3000
netstat -ano | findstr :4000
netstat -ano | findstr :5432
```

---

## ⚙️ Configuration Changes

### Change API URL
Edit `FrontEnd/.env.local`:
```env
REACT_APP_API_URL=http://your-backend-url:4000
```

### Change Backend Port
Edit `BackEnd/.env`:
```env
PORT=5000
```

### Change Database URL
Edit `BackEnd/.env`:
```env
DATABASE_URL=postgresql://user:pass@host:port/db
```

Then run migrations:
```powershell
npx prisma migrate dev
```

---

## 🧪 Test API Endpoints

### Login & Get Token
```powershell
$response = Invoke-WebRequest -Uri 'http://localhost:4000/api/auth/login' `
  -Method Post -ContentType 'application/json' `
  -Body '{"username":"admin","password":"adminpass"}' -UseBasicParsing

$token = ($response.Content | ConvertFrom-Json).data.token
Write-Host "Token: $token"
```

### Use Token in Request
```powershell
$headers = @{ Authorization = "Bearer $token" }
Invoke-WebRequest -Uri 'http://localhost:4000/api/auth/me' `
  -Headers $headers -UseBasicParsing
```

---

## 🐛 Troubleshooting

### Problem: "Port 3000 already in use"
```powershell
# Kill process on port 3000
Get-Process | Where-Object { $_.Port -eq 3000 } | Stop-Process -Force
# Or find what's using it
netstat -ano | findstr :3000
```

### Problem: "Cannot connect to database"
```powershell
# Test connection
psql -U postgres -h localhost -c "SELECT version();"

# Recreate database if needed
createdb -U postgres -h localhost rukunternak
```

### Problem: "npm dependencies missing"
```powershell
# Reinstall
npm install
npm install --production
```

### Problem: "Login gives error"
1. Check backend is running
2. Check database has seeded data: `npm run seed`
3. Check .env.local has correct API URL
4. Check browser console for error messages

---

## 📊 Response Format

All API endpoints return:

### Success
```json
{
  "success": true,
  "data": {
    /* actual data */
  }
}
```

### Error
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 🔑 Environment Variables Quick Reference

### Backend (.env)
```env
PORT=4000
DATABASE_URL=postgresql://postgres:admin123@localhost:5432/rukunternak
JWT_SECRET=rukunternak_super_secret
JWT_EXPIRES_IN=7d
PRISMA_CLIENT_ENGINE_TYPE=binary
NODE_ENV=development
```

### Frontend (.env.local)
```env
REACT_APP_API_URL=http://localhost:4000
```

---

## 📚 Documentation Map

```
Quick Start
    ↓
README.md (overview)
    ├─→ BackEnd/README.md (backend setup & API)
    ├─→ INTEGRATION.md (integration details)
    ├─→ STATUS.md (full status report)
    └─→ This file (quick reference)
```

---

## ✨ Features Summary

- ✅ Real JWT authentication
- ✅ Token storage & persistence
- ✅ Role-based access (admin/kelompok)
- ✅ Automatic token injection
- ✅ Logout & token expiration
- ✅ Database-backed users
- ✅ 7-day token expiry
- ✅ CORS enabled
- ✅ Error handling
- ✅ Complete documentation

---

## 🎯 Next Steps

1. **Start servers** → Run START_ALL.ps1
2. **Login** → admin/adminpass
3. **Test features** → Navigate dashboards
4. **View logs** → Check terminal windows
5. **Create reports** → Test CRUD operations
6. **Try logout** → Verify session clearing

---

## 📞 Need Help?

- **Setup issues?** → See BackEnd/README.md
- **Integration issues?** → See INTEGRATION.md
- **Status report?** → See STATUS.md
- **Main guide?** → See README.md

---

**Last Updated:** December 11, 2025  
**Status:** ✅ ALL SYSTEMS READY
