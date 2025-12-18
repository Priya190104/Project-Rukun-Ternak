# Quick Reference - Banner System

## 🚀 Quick Start for Development

### Backend Setup
```bash
cd BackEnd
npm install  # If new dependencies added
npx prisma migrate deploy  # Apply migrations
npm start    # Start server on port 4000
```

### Frontend Setup
```bash
cd FrontEnd
npm install  # If new dependencies added
npm start    # Start dev server on port 3001
```

---

## 📍 Key URLs

| Endpoint | Method | Access | Purpose |
|----------|--------|--------|---------|
| `/api/banners` | GET | Public | Get active banners |
| `/api/banners/:id` | GET | Public | Get single banner |
| `/api/banners` | POST | Admin | Upload banner |
| `/api/banners/:id` | PUT | Admin | Update banner status |
| `/api/banners/:id` | DELETE | Admin | Delete banner |
| `/api/banners/admin/all` | GET | Admin | Get all banners |
| `/kelola-banner` | PAGE | Admin | Manage banners UI |
| `/` | PAGE | Public | Landing with slider |

---

## 💾 Database

### Migration Status
```bash
# Check migrations
npx prisma migrate status

# Apply pending migrations
npx prisma migrate deploy

# Reset database (DEV ONLY)
npx prisma migrate reset
```

### Banner Table
```sql
CREATE TABLE banners (
  id SERIAL PRIMARY KEY,
  image_url VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX banners_is_active ON banners(is_active);
CREATE INDEX banners_created_at ON banners(created_at);
```

---

## 🖼️ File Upload

### Upload Process
1. Admin selects JPG/JPEG file
2. File validated (mime type, size)
3. Saved to `/uploads` folder
4. Path stored in database
5. Served via `/uploads/:filename`

### Multer Configuration
```javascript
// In banners.js
const upload = multer({
  storage: diskStorage,
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg'];
    cb(null, allowed.includes(file.mimetype));
  }
});
```

### File Path Examples
```
/uploads/banner_1702879209000_sample.jpg
/uploads/banner_1702879210123_image_01.jpg
```

---

## 🎨 Component Architecture

### Frontend Component Tree
```
Landing.jsx
└── BannerSlider
    └── Swiper (with Pagination, Navigation, Autoplay)
        └── SwiperSlides (dynamic from API)

Dashboard.jsx
└── Quick Actions
    └── Link to KelolaBanner

KelolaBanner.jsx
├── BannerForm
│   └── File input + Preview
└── BannerList
    ├── BannerCard (for each banner)
    │   ├── Image preview
    │   ├── Status badge
    │   ├── Toggle button
    │   └── Delete button
```

### API Integration Flow
```
Frontend Component
    ↓
bannerService.js (API calls)
    ↓
Express Routes (banners.js)
    ↓
bannerController.js (Logic)
    ↓
Prisma ORM
    ↓
PostgreSQL Database
```

---

## 🔍 Debugging

### Check Backend Connection
```bash
# Test API endpoint
curl http://localhost:4000/api/banners

# Should return:
# {"success":true,"data":[...]}
```

### Common Errors

**Error: "Unauthorized"**
- Missing or invalid JWT token
- Not logged in as admin

**Error: "Forbidden: Admin access required"**
- User role is not 'admin'
- Token is valid but user doesn't have permission

**Error: "Only JPG/JPEG files are allowed"**
- Wrong file format
- Use JPG or JPEG format only

**Error: "No image file provided"**
- File input is empty
- File not sent with request

**Error: Banner not showing on landing**
- Banner might be inactive (isActive = false)
- No active banners exist
- Check network tab for API response

---

## 🧪 Testing Checklist

### Manual Testing Steps

**Upload Banner**
- [ ] Login as admin
- [ ] Go to `/kelola-banner`
- [ ] Upload JPG image
- [ ] Verify preview shows
- [ ] Check image appears in list
- [ ] Verify on landing page

**Toggle Status**
- [ ] Click "Nonaktifkan" on active banner
- [ ] Verify banner disappears from landing
- [ ] Click "Aktifkan"
- [ ] Verify banner reappears on landing

**Delete Banner**
- [ ] Click delete icon
- [ ] Confirm deletion
- [ ] Verify banner removed from list
- [ ] Verify image removed from landing

**Multiple Banners**
- [ ] Upload 3+ banners
- [ ] Verify carousel shows all
- [ ] Test prev/next buttons
- [ ] Test autoplay
- [ ] Test swipe on mobile

---

## 🎬 Admin Workflow

### Step-by-Step Guide for Admin

**1. Create Banner**
```
Login → Dashboard → Kelola Banner → Upload Image → Save
```

**2. View All Banners**
```
Kelola Banner → Daftar Banner section → See all banners
```

**3. Activate/Deactivate Banner**
```
Kelola Banner → Find Banner Card → Click Aktifkan/Nonaktifkan
```

**4. Delete Banner**
```
Kelola Banner → Find Banner Card → Click Delete → Confirm
```

**5. Check Live Landing**
```
Home → View Banner Slider (auto-updated)
```

---

## 📊 Performance Tips

### Optimize Images
- Keep JPG size < 500KB
- Use appropriate dimensions
- Compress before uploading
- Recommended: 1920x600 or 1600x500px

### Server Resources
- Monitor `/uploads` folder size
- Clean old/unused images periodically
- Database: indices on `is_active` and `created_at`

### Frontend Performance
- Swiper lazy-loads images
- Responsive images load appropriate sizes
- Pagination prevents too many slides at once

---

## 🔐 Security Checklist

- [x] JWT validation on protected routes
- [x] Role-based access control (admin only)
- [x] File type validation (JPG/JPEG only)
- [x] File size limits
- [x] Path traversal prevention
- [x] XSS protection (React escaping)
- [x] CSRF protection (backend validation)

---

## 📝 Code Examples

### Fetch Banners (Frontend)
```javascript
const res = await client.get('/api/banners');
const banners = res.data?.data || [];
// Use banners array...
```

### Upload Banner (Frontend)
```javascript
const formData = new FormData();
formData.append('image', imageFile);

const res = await client.post('/api/banners', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

### Get Banners (Backend)
```javascript
// Controller
const banners = await prisma.banner.findMany({
  where: { isActive: true },
  orderBy: { createdAt: 'desc' }
});
```

---

## 📞 Support

### Common Questions

**Q: Can I upload PNG?**
A: No, only JPG/JPEG supported (as per requirements)

**Q: How many banners can I have?**
A: Unlimited! No restrictions

**Q: Where are images stored?**
A: `/BackEnd/uploads/` folder on server

**Q: Can I edit banner text?**
A: No, banners are images only (no text fields)

**Q: Does banner order matter?**
A: Yes, ordered by `createdAt DESC` (newest first)

---

## 🎯 Success Criteria - ALL MET ✅

- [x] Old sections completely removed (Profil/Tujuan/Kegiatan)
- [x] Banner slider implemented & working
- [x] Admin can upload/manage banners
- [x] Banners display on landing
- [x] Only active banners shown
- [x] No hardcoded data
- [x] Flexible banner count
- [x] Professional institutional look
- [x] Mobile responsive
- [x] Backend & frontend integrated

---

**Last Updated**: December 18, 2025  
**Version**: 1.0  
**Status**: Production Ready ✅
