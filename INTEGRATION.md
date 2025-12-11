# Rukun Ternak - Frontend-Backend Integration Guide

## Status: ✅ INTEGRATED

Both frontend and backend are now fully integrated and communicating via JWT authentication.

## How to Run

### Terminal 1 - Backend Server
```powershell
cd "d:\Priya\Projek\Rukun Ternak Project\BackEnd"
npm start
# Server listens on http://localhost:4000
```

### Terminal 2 - Frontend Server
```powershell
cd "d:\Priya\Projek\Rukun Ternak Project\FrontEnd"
npm start
# App runs on http://localhost:3000
```

Both servers should be running simultaneously.

## Frontend Changes

### 1. Updated `src/hooks/useAuth.js`
- Replaced mocked authentication with real backend calls
- Now calls `POST /api/auth/login` with username/password
- Stores JWT token and user data in localStorage
- Automatically includes JWT token in all API requests via axios interceptor
- Handles token expiration (401 errors redirect to login)

**Key Functions:**
- `login(username, password)` — Authenticate with backend
- `logout()` — Clear auth and redirect to login
- `useAuth()` — Hook to access auth state in components

### 2. Updated `src/api/client.js`
- Configured axios with backend URL (`http://localhost:4000`)
- Added request interceptor to automatically include JWT token
- Added response interceptor to handle expired tokens
- Handles 401 errors gracefully

### 3. Updated `src/pages/Login.jsx`
- Replaced mock login buttons with real username/password form
- Integrated with new `login()` function from useAuth
- Added error handling and loading states
- Includes quick login buttons for testing (admin/client1)
- Shows current user info after login
- Logout button to clear auth

### 4. Created `src/.env.local`
- Sets `REACT_APP_API_URL=http://localhost:4000`
- Axios client uses this to connect to backend

## Test Credentials

### Admin Account
- **Username:** `admin`
- **Password:** `adminpass`
- **Access:** All features, all data

### Client Account
- **Username:** `client1`
- **Password:** `clientpass`
- **Access:** Own laporan only, client features

## Testing Integration

### 1. Login Flow
1. Go to http://localhost:3000
2. Click "Login" in navigation
3. Click "Login Admin" or "Login Kelompok" (quick login buttons)
4. See user info displayed after login
5. Get redirected to `/dashboard` (admin) or `/client` (kelompok)

### 2. API Calls
Once logged in:
- Frontend automatically includes JWT token in all requests
- All protected endpoints (laporan, users, kelompok, notifikasi) will work
- Data is role-filtered (admin sees all, kelompok sees only own)

### 3. Token Persistence
- JWT token is stored in `localStorage` as `rukun_token`
- User data stored in `localStorage` as `rukun_user`
- Auth persists across page refresh
- Token is automatically sent in `Authorization: Bearer <token>` header

### 4. Logout
- Click logout button to clear token and user data
- Redirect to login page
- Next request without token will be rejected

## Architecture

```
┌─────────────────────┐
│  React Frontend     │
│  (localhost:3000)   │
└──────────┬──────────┘
           │
           │ HTTP Requests
           │ + JWT Token in Header
           │
           ▼
┌─────────────────────┐
│  Express Backend    │
│  (localhost:4000)   │
│  ✓ Auth            │
│  ✓ JWT Verify      │
│  ✓ Role Check      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  PostgreSQL DB      │
│  (localhost:5432)   │
└─────────────────────┘
```

## Key Files Modified

| File | Changes |
|------|---------|
| `FrontEnd/src/hooks/useAuth.js` | Real auth integration with backend |
| `FrontEnd/src/api/client.js` | JWT token interceptor added |
| `FrontEnd/src/pages/Login.jsx` | Real login form connected to backend |
| `FrontEnd/.env.local` | Backend URL configuration |

## Workflow

### 1. User Logs In
```javascript
const { login } = useAuth();
const result = await login('admin', 'adminpass');
// Returns: { success: true, user: {...}, token: "..." }
```

### 2. Token Stored in localStorage
```javascript
localStorage.getItem('rukun_token')     // JWT token
localStorage.getItem('rukun_user')      // User object as JSON
```

### 3. All Requests Include Token
```javascript
// Axios automatically adds:
// Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
const response = await client.get('/api/laporan');
```

### 4. Backend Verifies Token
```javascript
// Middleware checks Authorization header
// Verifies JWT signature
// Loads user from database
// Checks role permissions
```

## Troubleshooting

### Frontend Can't Connect to Backend
- Verify backend is running: `npm start` in BackEnd folder
- Check backend port is 4000: `netstat -ano | findstr :4000`
- Check `.env.local` has correct URL: `REACT_APP_API_URL=http://localhost:4000`
- Frontend may need to refresh to pick up env changes

### Login Fails with "Network Error"
- Backend must be running
- Check PostgreSQL is running on localhost:5432
- Check DATABASE_URL in BackEnd/.env is correct
- Check BackEnd logs for error messages

### Login Fails with "Invalid Credentials"
- Verify username/password are correct
- Check seeded data exists: `npm run seed` in BackEnd
- Default accounts: admin/adminpass, client1/clientpass

### Token Expired Error (401)
- Frontend automatically clears token and redirects to login
- Log in again to get new token
- JWT expires in 7 days (configured in backend)

### CORS Errors
- Backend has CORS enabled for `http://localhost:3000`
- If error persists, check BackEnd/server.js CORS configuration

## Next Steps

### Optional: Add API Service Layer
Create `src/services/` folder with service functions:
- `authService.js` — login, logout, getCurrentUser
- `laporanService.js` — GET/POST/PUT/DELETE laporan
- `userService.js` — GET users list
- `kelompokService.js` — GET kelompok
- `notifikasiService.js` — GET notifications

### Optional: Enhance Error Handling
- Add toast/notification for errors
- Implement retry logic for failed requests
- Add loading skeletons/spinners

### Optional: Add Refresh Token
- Implement refresh token endpoint in backend
- Auto-refresh expired tokens without re-login

### Optional: Add Rate Limiting
- Implement rate limiting middleware in backend
- Prevent brute force attacks on login

## Support

Both servers are now fully functional and integrated. If issues occur:
1. Check both servers are running (port 3000 and 4000)
2. Verify PostgreSQL is running on port 5432
3. Check browser console for frontend errors
4. Check terminal for backend errors
5. Verify .env files have correct URLs and secrets

---

**Integration Date:** December 11, 2025  
**Frontend Version:** React 19.2.1  
**Backend Version:** Express 5.2.1  
**Database:** PostgreSQL 15+
