# 🌾 Rukun Ternak - Sistem Manajemen Laporan Budidaya Ternak

Aplikasi web manajemen laporan budidaya ternak (domba) berbasis React + Express.js + PostgreSQL dengan autentikasi JWT dan role-based access control.

## ✨ NEW: Professional Banner Management System

Kami telah mengimplementasikan **Admin Dashboard untuk Banner Management** yang professional! 🎉

**Features:**
- 📊 Professional CMS-like admin interface
- 🖼️ Responsive banner gallery dengan 16:9 aspect ratio
- 📱 Mobile-friendly responsive design
- 🔄 Full CRUD operations (Create, Read, Update, Delete)
- ✅ Smart image URL handling & fallbacks
- 🎯 Admin access control & role protection

**Documentation:**
- [BANNER_FINAL_STATUS.md](./BANNER_FINAL_STATUS.md) - Final implementation report
- [BANNER_IMAGE_FIX_DEBUG.md](./BANNER_IMAGE_FIX_DEBUG.md) - Image display fixes
- [BANNER_MANAGEMENT_CHECKLIST.md](./BANNER_MANAGEMENT_CHECKLIST.md) - Testing checklist
- [BANNER_UI_IMPROVEMENTS.md](./BANNER_UI_IMPROVEMENTS.md) - UI design details

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm

### Setup Backend

```powershell
cd "BackEnd"
npm install
npx prisma migrate dev --name init
npm run seed
npm start
```
Server runs on `http://localhost:4000`

### Setup Frontend

```powershell
cd "FrontEnd"
npm install
npm start
```
App runs on `http://localhost:3001`

---

## 📚 DOKUMENTASI

Untuk setup, development, dan deployment lengkap, lihat dokumentasi:

1. **[DOCS_INDEX.md](./DOCS_INDEX.md)** ⭐ **START HERE**
   - Index lengkap semua dokumentasi
   - Panduan memilih doc yang tepat
   - Quick links

2. **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** 🚀
   - Step-by-step setup instructions
   - Database configuration
   - Troubleshooting

3. **[BANNER_SYSTEM_DOCS.md](./BANNER_SYSTEM_DOCS.md)** 📖
   - Technical documentation
   - API endpoints
   - Architecture details

4. **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** ⚡
   - Quick commands & tips
   - Testing checklist
   - Common errors

5. **[REFACTOR_SUMMARY.md](./REFACTOR_SUMMARY.md)** 📝
   - Detailed changelog
   - What's new
   - Implementation details

6. **[FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)** ✅
   - Project completion status
   - Verification results

---

## 📋 Test Accounts

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `adminpass` |
| Kelompok | `client1` | `clientpass` |

## 📚 Documentation

- **Integration Guide:** See [INTEGRATION.md](./INTEGRATION.md) for detailed frontend-backend integration
- **Backend Setup:** See [BackEnd/README.md](./BackEnd/README.md) for backend configuration
- **API Reference:** Endpoints documented in backend README

## 🏗️ Project Structure

```
Rukun Ternak Project/
├── FrontEnd/              # React 19 application
│   ├── src/
│   │   ├── pages/        # Page components (Dashboard, Login, Reports)
│   │   ├── components/   # Reusable components
│   │   ├── hooks/        # Custom hooks (useAuth)
│   │   ├── api/          # API client configuration
│   │   └── routes/       # Route definitions
│   └── package.json
├── BackEnd/              # Express.js application
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── controllers/ # Business logic
│   │   ├── middleware/  # Auth, validation
│   │   └── db.js       # Database connection
│   ├── prisma/         # Database schema & migrations
│   ├── server.js       # Entry point
│   └── package.json
└── INTEGRATION.md       # Frontend-Backend integration guide
```

## 🔐 Authentication

- **Type:** JWT (JSON Web Tokens)
- **Storage:** localStorage (`rukun_token`, `rukun_user`)
- **Expiry:** 7 days
- **Header Format:** `Authorization: Bearer <token>`

## 👥 Role-Based Access

### Admin
- View all reports (laporan)
- Create/edit/delete any report
- Manage users
- View notifications

### Kelompok
- View only own reports
- Create/edit/delete own reports
- View kelompok list

## 📊 Database Models

- **users** — Admin and kelompok accounts
- **kelompok** — Livestock group definitions
- **laporan** — Reports (budidaya, kelahiran, kematian, kurban-aqiqah)
- **notifikasi** — System notifications

## 🌐 API Endpoints

### Auth
- `POST /api/auth/login` — Login with credentials
- `GET /api/auth/me` — Get current user (requires auth)

### Reports (Laporan)
- `GET /api/laporan` — List reports (filtered by role)
- `POST /api/laporan` — Create report
- `PUT /api/laporan/:id` — Update report
- `DELETE /api/laporan/:id` — Delete report

### Other
- `GET /api/users` — List users (admin only)
- `GET /api/kelompok` — List kelompok
- `GET /api/notifikasi` — Get notifications (admin only)
- `GET /api/health` — Server health check

## ⚙️ Technology Stack

### Frontend
- React 19.2.1
- React Router 6.30
- Axios for HTTP requests
- Tailwind CSS for styling
- Lucide React for icons

### Backend
- Express.js 5.2.1
- PostgreSQL 15+
- Prisma 7.1.0 (migrations)
- node-postgres (pg) for queries
- JWT for authentication
- bcrypt for password hashing

## 🔗 Integration

Frontend and backend are fully integrated:
- ✅ Login form connects to backend
- ✅ JWT token automatically included in requests
- ✅ Role-based UI rendering matches backend permissions
- ✅ Token persistence across sessions
- ✅ Auto-logout on token expiration

See [INTEGRATION.md](./INTEGRATION.md) for detailed integration steps.

## 📝 Running Locally

### Terminal 1 - Backend
```powershell
cd BackEnd
npm start
# Running on http://localhost:4000
```

### Terminal 2 - Frontend
```powershell
cd FrontEnd
npm start
# Running on http://localhost:3000
```

### Terminal 3 - PostgreSQL (if not running as service)
```powershell
psql -U postgres -h localhost
# Must have 'rukunternak' database created
```

## 🐛 Troubleshooting

**Backend won't start:**
- Check PostgreSQL is running: `psql -U postgres -h localhost`
- Verify DATABASE_URL in `BackEnd/.env`
- Run migrations: `npx prisma migrate dev`

**Frontend can't login:**
- Verify backend is running on port 4000
- Check browser console for CORS errors
- Confirm test credentials: admin/adminpass

**Port conflicts:**
- Backend: 4000 - Check `netstat -ano | findstr :4000`
- Frontend: 3000 - Check `netstat -ano | findstr :3000`

## 📞 Support

Detailed documentation:
- Backend setup: [BackEnd/README.md](./BackEnd/README.md)
- Integration guide: [INTEGRATION.md](./INTEGRATION.md)
- API examples: Backend README

---

**Status:** ✅ Production Ready  
**Last Updated:** December 11, 2025  
**Version:** 1.0.0
