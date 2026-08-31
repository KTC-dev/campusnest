# Setup Guide

## Requirements

- Node.js 18+ (tested on Node 20)
- PostgreSQL (local or remote)
- npm (comes with Node.js)
- Git
- Cloudinary account (for image/file uploads in production)
- SMTP provider (for email notifications in production)
- FCM server key (for push notifications in production)
- Google Maps API key (for location picker in production)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd campusnest
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd frontend
npm install
```

## Environment Configuration

### Backend

Copy the example environment file:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and fill in:

| Variable | Required | Purpose |
|----------|----------|---------|
| `NODE_ENV` | No | `development`, `test`, or `production`. Default: `development` |
| `PORT` | No | Backend port. Default: `4000` |
| `TRUST_PROXY` | No | Trust proxy count. Default: `1` |
| `APP_VERSION` | No | App version string. Default: `1.0.0` |
| `DATABASE_URL` | **Yes** | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | **Yes** | Secret for signing access tokens (min 16 chars) |
| `JWT_REFRESH_SECRET` | **Yes** | Secret for signing refresh tokens (min 16 chars, different from access secret) |
| `JWT_ACCESS_EXPIRES_IN` | No | Access token expiry. Default: `15m` |
| `JWT_REFRESH_EXPIRES_IN` | No | Refresh token expiry. Default: `7d` |
| `CORS_ORIGIN` | No | Comma-separated allowed origins. Default: `http://localhost:5173,http://127.0.0.1:5173` |
| `CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | No | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No | Cloudinary API secret |
| `SMTP_HOST` | No | SMTP server host |
| `SMTP_PORT` | No | SMTP server port |
| `SMTP_USER` | No | SMTP username |
| `SMTP_PASS` | No | SMTP password |
| `SMTP_FROM` | No | From email address |
| `FCM_SERVER_KEY` | No | Firebase Cloud Messaging server key |
| `CURRENT_TERMS_VERSION` | No | Current terms version string. Default: `1.0` |

### Frontend

Copy the example environment file:

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_API_URL` | **Yes** | Backend API base URL (e.g., `http://localhost:4000/api/v1`) |
| `VITE_GOOGLE_MAPS_API_KEY` | No | Google Maps JavaScript API key for location picker |

## Database Setup

### Create the database

```bash
createdb campusnest
```

Or use your preferred PostgreSQL client to create a database named `campusnest`.

### Run Prisma migrations

```bash
cd backend
npx prisma migrate dev
```

This creates all tables from `prisma/schema.prisma` and applies existing migrations.

### Seed the database

```bash
cd backend
npx prisma db seed
```

This seeds the `University` table with Federal University Otuoke (FUO).

### Open Prisma Studio (optional)

```bash
cd backend
npx prisma studio
```

## Running Development

### Start backend

```bash
cd backend
npm run dev
```

Backend runs on `http://localhost:4000`.

### Start frontend (in a new terminal)

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173`.

### Verify installation

1. Open `http://localhost:5173`
2. Click "Sign up" and create a student or agent account
3. Log in and verify the dashboard loads
4. Create a property listing (agent) or browse properties (student)

## Building for Production

### Backend

```bash
cd backend
npm run build
```

This runs `prisma generate` then `tsc -p tsconfig.json`, outputting to `backend/dist/`.

### Frontend

```bash
cd frontend
npm run build
```

This runs `tsc -b` then `vite build`, outputting to `frontend/dist/`.

### Production start

```bash
cd backend
npm run start
```

This runs `prisma migrate deploy && npm run seed && node dist/server.js`.

## Docker

Build and run with Docker:

```bash
docker build -t edurus .
docker run -p 4000:4000 edurus
```

The `Dockerfile` uses Node 20 Alpine, builds the backend, and runs `npm run start`.

## Troubleshooting

### Database connection errors

- Verify PostgreSQL is running: `pg_isready` or `psql -U postgres`
- Check `DATABASE_URL` in `backend/.env`
- Ensure the database `campusnest` exists

### Prisma generate fails with file lock error

- Stop any running Node processes that might hold the Prisma query engine DLL
- On Windows, check Task Manager for `node.exe` processes

### Port already in use

- Backend default: 4000. Change `PORT` in `backend/.env`.
- Frontend default: 5173. Change `server.port` in `frontend/vite.config.ts`.

### CORS errors in development

- Ensure `CORS_ORIGIN` in `backend/.env` includes the frontend origin
- Default includes `http://localhost:5173` and `http://127.0.0.1:5173`

### TypeScript build errors

- Run `npx tsc -b` from the project root to check both frontend and backend
- Frontend: `cd frontend && npx tsc -b`
- Backend: `cd backend && npx tsc -p tsconfig.json --noEmit`

### Image uploads not working

- Verify Cloudinary credentials in `backend/.env`
- Check that `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are all set
- Without Cloudinary config, uploads return a "not configured" error

### Socket.IO connection fails

- Ensure the backend server is running
- Check that the frontend `VITE_API_URL` matches the backend origin
- Socket.IO uses the same CORS config as the REST API
