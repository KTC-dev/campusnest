# Environment Variables

This document lists every environment variable referenced in the Edurus codebase.

## Backend (`backend/.env`)

### Required

| Variable | Purpose | Used By | Example Format |
|----------|---------|---------|----------------|
| `DATABASE_URL` | PostgreSQL connection string | `backend/src/config/env.ts`, Prisma | `postgresql://postgres:password@localhost:5432/campusnest?schema=public` |

### Required for Production Auth

| Variable | Purpose | Used By | Example Format |
|----------|---------|---------|----------------|
| `JWT_ACCESS_SECRET` | Secret for signing access tokens (min 16 chars) | `backend/src/utils/jwt.ts` | `replace_with_long_random_string` |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens (min 16 chars, must differ from access secret) | `backend/src/utils/jwt.ts` | `replace_with_a_different_long_random_string` |

### Optional

| Variable | Purpose | Used By | Example Format | Default |
|----------|---------|---------|----------------|---------|
| `NODE_ENV` | Runtime environment | `backend/src/config/env.ts` | `development` / `production` / `test` | `development` |
| `PORT` | Backend listen port | `backend/src/server.ts` | `4000` | `4000` |
| `TRUST_PROXY` | Trust proxy count for Express | `backend/src/app.ts` | `1` | `1` |
| `APP_VERSION` | App version string | `backend/src/app.ts` | `1.0.0` | `1.0.0` |
| `JWT_ACCESS_EXPIRES_IN` | Access token TTL | `backend/src/utils/jwt.ts` | `15m` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL | `backend/src/utils/jwt.ts` | `7d` | `7d` |
| `CORS_ORIGIN` | Comma-separated allowed origins | `backend/src/app.ts`, `backend/src/server.ts` | `http://localhost:5173` | `http://localhost:5173,http://127.0.0.1:5173` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `backend/src/services/upload.service.ts` | `my-cloud` | — |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `backend/src/services/upload.service.ts` | `123456789012345` | — |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `backend/src/services/upload.service.ts` | `abcdef123456` | — |
| `SMTP_HOST` | SMTP server hostname | `backend/src/services/email.service.ts` | `smtp.gmail.com` | — |
| `SMTP_PORT` | SMTP server port | `backend/src/services/email.service.ts` | `587` | — |
| `SMTP_USER` | SMTP authentication username | `backend/src/services/email.service.ts` | `notifications@edurus.com` | — |
| `SMTP_PASS` | SMTP authentication password | `backend/src/services/email.service.ts` | `app-password` | — |
| `SMTP_FROM` | From address for outgoing emails | `backend/src/services/email.service.ts` | `Edurus <notifications@edurus.com>` | — |
| `FCM_SERVER_KEY` | Firebase Cloud Messaging server key | `backend/src/services/push.service.ts` | `AAAA...` | — |
| `CURRENT_TERMS_VERSION` | Current terms version for enforcement | `backend/src/middleware/authenticate.ts` | `1.0` | `1.0` |

## Frontend (`frontend/.env`)

| Variable | Purpose | Used By | Example Format |
|----------|---------|---------|----------------|
| `VITE_API_URL` | Backend API base URL | `frontend/src/services/api.ts` | `http://localhost:4000/api/v1` |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps JavaScript API key | `frontend/src/components/LocationPicker.tsx` | `AIzaSy...` |

## Notes

- Backend validates required variables at startup using Zod in `backend/src/config/env.ts`. The process exits if required variables are missing or malformed.
- Frontend uses Vite's `import.meta.env` for environment variables. Only `VITE_*` variables are exposed to the browser.
- Do not commit real secrets. Use `.env` locally and provide values via your hosting platform's environment variable UI in production.
