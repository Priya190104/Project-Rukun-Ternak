# Rukun Ternak Backend Setup Guide

## Overview
Backend Express.js + PostgreSQL untuk aplikasi Rukun Ternak. Sudah siap dijalankan dan terintegrasi dengan frontend React.

## Technology Stack
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Auth**: JWT (JSON Web Tokens)
- **Client**: node-postgres (pg)

## Prerequisites
- Node.js 18+ (verified working on v24.11.1)
- PostgreSQL 12+ (tested with PostgreSQL 15)
- npm

## Installation

### 1. Setup Database
```powershell
# Create database (if not exists)
createdb -U postgres -h localhost rukunternak

# Or using psql
psql -U postgres -h localhost -c "CREATE DATABASE rukunternak;"
```

### 2. Install Dependencies
```powershell
cd "d:\Priya\Projek\Rukun Ternak Project\BackEnd"
npm install
```

### 3. Configure Environment
Copy `.env.example` to `.env` and update values:
```bash
PORT=4000
DATABASE_URL=postgresql://postgres:admin123@localhost:5432/rukunternak
JWT_SECRET=rukunternak_super_secret
JWT_EXPIRES_IN=7d
PRISMA_CLIENT_ENGINE_TYPE=binary
```

### 4. Run Migrations
```powershell
npx prisma migrate dev --name init
```

### 5. Seed Sample Data
```powershell
npm run seed
```

This creates:
- Kelompok: `KLP1`
- Admin user: `admin` / `adminpass`
- Client user: `client1` / `clientpass`
- Sample laporan and notifikasi

### 6. Start Server
```powershell
npm run dev    # Development mode (with nodemon)
# or
npm start      # Production mode
```

Server listens on `PORT` (default 4000).

## API Endpoints

### Auth
- `POST /api/auth/login` — Login with username/password
  - Request: `{ "username": "admin", "password": "adminpass" }`
  - Response: `{ "success": true, "data": { "token": "...", "user": {...} } }`

- `GET /api/auth/me` — Get current user (requires Authorization header)
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ "success": true, "data": { "id": 1, "username": "admin", ... } }`

### Laporan (Reports)
- `GET /api/laporan` — List all laporan (admin sees all, kelompok sees own)
- `POST /api/laporan` — Create new laporan
- `PUT /api/laporan/:id` — Update laporan (if owner or admin)
- `DELETE /api/laporan/:id` — Delete laporan (if owner or admin)

### Users (Admin Only)
- `GET /api/users` — List all users (admin only)

### Kelompok
- `GET /api/kelompok` — List all kelompok groups

### Notifikasi (Admin Only)
- `GET /api/notifikasi` — Get notifications (admin only)

### Health
- `GET /api/health` — Server health check

## Example Requests

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"adminpass"}'
```

### Get Current User
```bash
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOi..."
```

### Get Laporan
```bash
curl http://localhost:4000/api/laporan \
  -H "Authorization: Bearer eyJhbGciOi..."
```

## Project Structure
```
BackEnd/
├── server.js                    # Express server entry point
├── src/
│   ├── db.js                   # PostgreSQL connection pool
│   ├── middleware/
│   │   └── auth.js             # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js
│   │   ├── laporan.js
│   │   ├── users.js
│   │   ├── kelompok.js
│   │   └── notifikasi.js
│   └── controllers/
│       ├── authController.js
│       ├── laporanController.js
│       ├── usersController.js
│       ├── kelompokController.js
│       └── notifikasiController.js
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Migration files
├── seed.js                      # Database seed script
├── package.json
└── .env                         # Environment configuration
```

## Role-Based Access Control

### Admin Role
- View all laporan
- Create/update/delete any laporan
- View all users
- Access notifications

### Kelompok Role
- View only own laporan (by kelompok field)
- Create/update/delete own laporan
- View kelompok list

## Response Format
All API responses follow this format:
```json
{
  "success": true,
  "data": { ... }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description"
}
```

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running: `psql -U postgres -h localhost`
- Check DATABASE_URL in `.env`
- Ensure database `rukunternak` exists

### Server won't start
- Check if port 4000 is in use: `netstat -ano | findstr :4000`
- Review server logs for error messages
- Ensure all dependencies are installed: `npm install`

### JWT Token Error
- Verify JWT_SECRET is set in `.env`
- Ensure Authorization header format: `Bearer <token>`

## Production Deployment
```powershell
npm install --production
npm start
```

Use a process manager (PM2, systemd, etc.) to keep server running.

## Testing
A test script is included:
```powershell
node test_endpoints.js
```

This tests health and login endpoints.

## License
MIT

## Support
For issues or questions, check backend logs or database connectivity.
