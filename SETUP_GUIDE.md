# Setup Guide - Rukun Ternak Banner System

## 🎯 Overview
Guide lengkap untuk setup dan menjalankan Rukun Ternak dengan Banner System.

---

## 📋 Prerequisites

### System Requirements
- Node.js v18+ (check: `node --version`)
- npm v8+ (check: `npm --version`)
- PostgreSQL 12+ (check: `psql --version`)
- Git

### IDE/Editor
- Visual Studio Code (recommended)
- Any code editor will work

### Accounts/Credentials
- PostgreSQL credentials
- Database URL (format: `postgresql://user:password@host:port/database`)

---

## 🚀 Initial Setup

### 1. Clone Repository
```bash
# Clone the project
git clone <repository-url>
cd "d:\Priya\Projek\Rukun Ternak Project"
```

### 2. Backend Setup

#### 2a. Install Dependencies
```bash
cd BackEnd
npm install
```

#### 2b. Configure Environment
Create `.env` file in BackEnd folder:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/rukunternak
JWT_SECRET=your_secret_key_here
PORT=4000
BACKEND_URL=http://localhost:4000
NODE_ENV=development
```

#### 2c. Apply Database Migrations
```bash
npx prisma migrate deploy
```

#### 2d. Generate Prisma Client
```bash
npx prisma generate
```

#### 2e. Start Backend Server
```bash
npm start
```

Expected output:
```
Backend listening on 4000
```

### 3. Frontend Setup

#### 3a. Install Dependencies
```bash
cd FrontEnd
npm install
```

#### 3b. Configure Environment (if needed)
Create `.env` file in FrontEnd folder (optional):
```env
REACT_APP_API_URL=http://localhost:4000
```

#### 3c. Start Frontend Dev Server
```bash
npm start
```

Expected output:
```
You can now view testingrukunternak in the browser.
Local: http://localhost:3001
```

---

## 🗄️ Database Setup

### First Time Setup

#### 1. Create PostgreSQL Database
```bash
psql -U postgres

# In psql:
CREATE DATABASE rukunternak;
\q
```

#### 2. Run Migrations
```bash
cd BackEnd
npx prisma migrate deploy
```

#### 3. Verify Setup
```bash
npx prisma studio  # Opens Prisma Studio GUI
```

### Reset Database (Development Only)
```bash
# WARNING: This will delete all data!
npx prisma migrate reset
```

### Check Migration Status
```bash
npx prisma migrate status
```

---

## 📁 Project Structure

```
d:\Priya\Projek\Rukun Ternak Project\
├── BackEnd/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── bannerController.js          ← BANNER LOGIC
│   │   │   └── [other controllers]
│   │   ├── routes/
│   │   │   ├── banners.js                   ← BANNER ROUTES
│   │   │   └── [other routes]
│   │   ├── middleware/
│   │   ├── data/
│   │   └── db.js
│   ├── prisma/
│   │   ├── schema.prisma                    ← UPDATED
│   │   └── migrations/
│   │       └── 20251218020909_add_banner/   ← NEW
│   ├── uploads/                             ← BANNER IMAGES
│   ├── server.js                            ← UPDATED
│   ├── .env                                 ← CREATE THIS
│   └── package.json
│
├── FrontEnd/
│   ├── src/
│   │   ├── components/
│   │   │   ├── banners/
│   │   │   │   ├── BannerSlider.jsx         ← NEW
│   │   │   │   ├── BannerForm.jsx           ← NEW
│   │   │   │   └── BannerList.jsx           ← NEW
│   │   │   └── [other components]
│   │   ├── pages/
│   │   │   ├── KelolaBanner.jsx             ← NEW
│   │   │   ├── Dashboard.jsx                ← UPDATED
│   │   │   ├── Landing.jsx                  ← UPDATED
│   │   │   └── [other pages]
│   │   ├── services/
│   │   │   ├── bannerService.js             ← NEW
│   │   │   └── [other services]
│   │   ├── routes/
│   │   │   └── AppRouter.jsx                ← UPDATED
│   │   └── App.jsx
│   ├── public/
│   ├── .env                                 ← OPTIONAL
│   └── package.json
│
├── BANNER_SYSTEM_DOCS.md                    ← DOCUMENTATION
├── REFACTOR_SUMMARY.md                      ← CHANGELOG
├── QUICK_REFERENCE.md                       ← QUICK GUIDE
├── FINAL_CHECKLIST.md                       ← CHECKLIST
├── SETUP_GUIDE.md                           ← THIS FILE
└── README.md
```

---

## ✅ Verification Checklist

### Backend
- [ ] Node.js version is 18+
- [ ] npm dependencies installed (`npm install` completed)
- [ ] `.env` file created with DATABASE_URL
- [ ] PostgreSQL database created
- [ ] Migrations applied (`npx prisma migrate deploy` successful)
- [ ] Prisma client generated
- [ ] Backend starts without errors (`npm start`)
- [ ] Server listens on port 4000
- [ ] API responds to requests (test with curl/Postman)

### Frontend
- [ ] npm dependencies installed (`npm install` completed)
- [ ] No compilation errors
- [ ] Dev server starts (`npm start`)
- [ ] App loads on http://localhost:3001
- [ ] Can navigate pages
- [ ] No console errors

### Integration
- [ ] Backend and frontend communicate
- [ ] API calls successful
- [ ] Banner slider appears on landing page
- [ ] Admin can access `/kelola-banner`
- [ ] Can upload banners
- [ ] Banners display correctly

---

## 🔧 Common Setup Issues

### Issue 1: "Cannot find module '@prisma/client'"
**Solution**:
```bash
cd BackEnd
npm install
npx prisma generate
```

### Issue 2: "connect ECONNREFUSED 127.0.0.1:5432"
**Solution**: PostgreSQL not running
```bash
# Windows
pg_ctl -D "C:\Program Files\PostgreSQL\data" start

# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

### Issue 3: "Database does not exist"
**Solution**:
```bash
psql -U postgres -c "CREATE DATABASE rukunternak;"
npx prisma migrate deploy
```

### Issue 4: "Port 4000 already in use"
**Solution**:
```bash
# Find and kill process on port 4000
lsof -i :4000
kill -9 <PID>

# Or use different port in .env:
PORT=4001
```

### Issue 5: "CORS errors"
**Solution**: Backend CORS already configured, usually not an issue
```bash
# Verify cors is enabled in server.js
app.use(cors());
```

### Issue 6: "Image upload fails"
**Solution**: Check uploads folder
```bash
# Create uploads folder if missing
mkdir -p BackEnd/uploads

# Verify permissions
ls -la BackEnd/uploads
```

---

## 🔑 Default Credentials

For testing purposes (should be changed in production):

**Admin User**:
- Username: `admin`
- Password: `admin123` (or check seed.js)
- Role: `admin`

**Test User**:
- Username: `testuser`
- Password: `testuser123`
- Role: `kelompok`

**To Add Users**:
```bash
cd BackEnd
node tmp_set_admin_pwd.js  # If script exists
# OR use dashboard admin UI
```

---

## 📊 Database Schema

### Tables Overview
```sql
-- Users
users (id, username, password, full_name, role, kelompok_id)

-- Kelompok (Groups)
kelompok (id, name, email, kecamatan, desa, ...)

-- Reports
laporan (id, jenis, kelompok, data, userId, kelompokId, tanggal, ...)

-- News/Berita
berita (id, caption, image_url, published_at, created_at, updated_at)

-- Banners [NEW]
banners (id, image_url, created_at, is_active)

-- Notifications
notifikasi (id, message, created_at)
```

---

## 🧪 Testing the Setup

### Test Backend API
```bash
# Test basic endpoint
curl http://localhost:4000/api/health

# Expected response:
# {"success":true,"data":"ok"}

# Test banners endpoint (empty initially)
curl http://localhost:4000/api/banners

# Expected response:
# {"success":true,"data":[]}
```

### Test Frontend
1. Open http://localhost:3001
2. You should see landing page
3. Navigate to `/login`
4. Use default credentials to login
5. Go to dashboard
6. Click "Kelola Banner" button
7. Try uploading an image

---

## 📱 Testing Features

### Manual Feature Testing

**1. Test Banner Slider**
- [ ] Go to landing page (`/`)
- [ ] Scroll to banner section
- [ ] Verify slider displays (or placeholder if no banners)
- [ ] Test prev/next buttons (if multiple banners)
- [ ] Test pagination dots
- [ ] Test swipe on mobile

**2. Test Admin Upload**
- [ ] Login as admin
- [ ] Go to `/kelola-banner`
- [ ] Upload JPG/JPEG file
- [ ] Verify preview shows
- [ ] Verify image in list
- [ ] Go back to landing - should see banner

**3. Test Toggle Status**
- [ ] In banner list, click "Nonaktifkan"
- [ ] Check landing page - banner should disappear
- [ ] Click "Aktifkan"
- [ ] Check landing page - banner should reappear

**4. Test Delete**
- [ ] Click delete button
- [ ] Confirm deletion
- [ ] Verify removed from list
- [ ] Verify removed from landing

---

## 🚀 Running in Production

### Build Frontend
```bash
cd FrontEnd
npm run build
```

### Environment Variables Production
```env
# Backend
DATABASE_URL=postgresql://prod_user:prod_pass@prod_host:5432/rukunternak_prod
JWT_SECRET=your_very_secret_key
PORT=4000
BACKEND_URL=https://your-domain.com
NODE_ENV=production

# Frontend
REACT_APP_API_URL=https://your-domain.com
```

### Deploy Steps
1. Build frontend: `npm run build`
2. Upload `build/` folder to server
3. Start backend: `npm start`
4. Serve frontend with web server (Nginx/Apache)
5. Configure HTTPS
6. Setup database backups

---

## 📞 Support & Help

### Check Logs
```bash
# Backend logs
# Check server.js console output

# Frontend logs
# Check browser console (F12 > Console tab)

# Database logs
# Check PostgreSQL logs location
```

### Useful Commands
```bash
# View Prisma schema
cat prisma/schema.prisma

# View migrations
ls prisma/migrations/

# Generate Prisma types
npx prisma generate

# Open Prisma Studio (GUI)
npx prisma studio

# Reset database (DEV ONLY)
npx prisma migrate reset

# Check npm packages
npm list

# Update packages
npm update
```

### Useful URLs
| URL | Purpose |
|-----|---------|
| http://localhost:3001 | Frontend |
| http://localhost:4000/api/health | Backend health |
| http://localhost:4000/api/banners | Get banners |
| http://localhost:3001/kelola-banner | Admin panel |

---

## ✨ Next Steps

1. **Complete Setup**
   - [ ] Install all dependencies
   - [ ] Configure environment
   - [ ] Run migrations
   - [ ] Start servers

2. **Test Everything**
   - [ ] Run feature tests
   - [ ] Test on mobile
   - [ ] Check responsiveness

3. **Customize (Optional)**
   - [ ] Update banner dimensions
   - [ ] Change slider settings
   - [ ] Customize styling
   - [ ] Add more features

4. **Deploy**
   - [ ] Build for production
   - [ ] Setup server
   - [ ] Configure domain
   - [ ] Setup SSL
   - [ ] Deploy!

---

**Last Updated**: December 18, 2025  
**Version**: 1.0  
**Status**: Ready for Use ✅

For more details, see:
- `BANNER_SYSTEM_DOCS.md` - Technical documentation
- `QUICK_REFERENCE.md` - Quick reference guide
- `REFACTOR_SUMMARY.md` - Detailed changelog
