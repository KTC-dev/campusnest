# System Architecture

## High-level flow

```
User (browser/mobile)
    ↓ HTTPS / WSS
Frontend (Vite + React, port 5173 dev, static in production)
    ↓ Axios API calls + Socket.IO
Backend (Express + TypeScript, port 4000)
    ↓ Prisma ORM
PostgreSQL database
    ↓
External services: Cloudinary, Nodemailer/SMTP, FCM
```

## Frontend

### Framework
- React 18 with TypeScript
- Vite for bundling and dev server
- Tailwind CSS for styling
- React Router v6 for routing

### State management
- **Zustand**: `authStore` (persisted to localStorage as `edurus-auth`) stores `user`, `accessToken`, `refreshToken`
- **Zustand**: `toastStore` manages toast notifications
- **TanStack Query**: server state, caching, background refetching for all API data

### Networking
- Single Axios instance (`src/services/api.ts`)
- Base URL from `import.meta.env.VITE_API_URL`
- Request interceptor: attaches `Bearer {accessToken}`
- Response interceptor: on 401, attempts refresh token flow; on failure, clears auth and redirects to login
- Socket.IO client for real-time messaging

### Routing
- Public routes: `/`, `/login`, `/register`, `/properties`, `/properties/:id`, `/about`, `/contact`, `/privacy`, `/terms`, `/help`
- Protected routes wrapped in `ProtectedRoute` component
- Role-guarded routes:
  - `/dashboard`, `/profile`, `/settings`, `/notifications`, `/conversations`, `/dashboard/listings/*` — any authenticated user
  - `/roommates`, `/roommates/profile`, `/roommates/:id`, `/accommodation-requests/*` — STUDENT only
  - `/dashboard/properties`, `/verification`, `/dashboard/requests` — AGENT only
  - `/admin` — ADMIN only

### Mobile shells
- `StudentMobileShell`: max-width container, gradient header, bottom nav with Home, Browse, Roommates, Messages, Settings, Profile
- `AgentMobileShell`: gradient header, bottom nav with Home, Properties, Add Property, Messages, Settings, Profile
- Desktop uses `AppNav` with full header navigation

## Backend

### Framework
- Express.js with TypeScript
- HTTP server created via `node:http` module
- Socket.IO attached to same HTTP server

### Middleware stack (order of execution)
1. `sanitizeInput` — strips null bytes, trims strings from `req.body`, `req.query`, `req.params`
2. `helmet` — security headers
3. `cors` — origin validation (allows `CORS_ORIGIN` env + `.edurus.pages.dev`)
4. `compression` — gzip responses
5. `express.json({ limit: "15mb" })` — parse JSON bodies
6. `cookie-parser`
7. Global `rateLimit` — 300 requests per 15 minutes per IP
8. Named rate limiters:
   - `loginRateLimit`: 10 attempts per 15 minutes
   - `createPropertyRateLimit`: 20 creations per hour
   - `createBookingRateLimit`: 30 bookings per hour
9. `validate(schema)` — Zod schema validation for body/query/params
10. `authenticate` — JWT access token verification, user active check, terms acceptance check
11. `requireRole(...roles)` — role-based authorization
12. `catchAsync` — wraps async handlers to forward rejections to error handler
13. `errorHandler` — final error formatting and logging

### Service layer
All business logic lives in `backend/src/services/`. Controllers are thin wrappers that call services and shape responses.

- `auth.service.ts` — registration, login, refresh, logout, terms acceptance
- `property.service.ts` — property CRUD, search, favourites, moderation, public stats
- `booking.service.ts` — booking creation, response, cancellation
- `conversation.service.ts` — conversation and message CRUD, real-time message creation
- `roommate.service.ts` — profile management, match scoring, match requests, saved matches
- `accommodation-request.service.ts` — student request board
- `review.service.ts` — review CRUD, helpful voting, flagged review listing
- `verification.service.ts` — agent document submission and admin review
- `admin.service.ts` — stats, analytics, user management, fraud removal
- `notification.service.ts` — in-app notification creation, email dispatch, push dispatch
- `user.service.ts` — profile get/update with role-specific fields
- `preference.service.ts` — notification preferences
- `session.service.ts` — refresh token session management
- `upload.service.ts` — Cloudinary wrapper for images and files
- `email.service.ts` — Nodemailer wrapper
- `push.service.ts` — FCM HTTP v1 wrapper

### API architecture
- Base path: `/api/v1`
- All success responses: `{ success: true, data: T }`
- All error responses: `{ success: false, message: string }`
- Routes organized by feature in `backend/src/routes/`
- Mounted on router in `backend/src/routes/index.ts`

### Socket.IO architecture
- JWT authentication on handshake via `socket.handshake.auth.token` or `Authorization` header
- User joins personal room: `user:{userId}`
- Conversation rooms: `conversation:{conversationId}`
- Server events emitted:
  - `connected` — on successful connection
  - `conversation:joined` — when user joins a conversation room
  - `conversation:message` — new message broadcast to conversation room
  - `conversation:typing` — typing indicator to other participants
  - `conversation:stop_typing` — typing stop indicator

## Database

### Technology
- PostgreSQL (via Prisma ORM)
- Prisma Client generated from `prisma/schema.prisma`
- Migrations in `prisma/migrations/`

### Multi-university design
- `University` is a first-class model
- `Student` and `Property` carry `universityId`
- Seed script creates FUO as the default university
- Adding a new university requires one `prisma.university.create()` call

### Connection management
- Single shared `PrismaClient` instance in `backend/src/config/prisma.ts`
- Global variable guard prevents duplicate instantiation in development

## External Services

### Cloudinary
- Used for: property images, verification documents, message attachments
- Configuration: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Folders: `edurus/properties`, `edurus/verification`, `edurus/messages`
- Upload service is a thin wrapper; swapping providers only requires changing `upload.service.ts`

### Nodemailer / SMTP
- Used for: notification emails
- Configuration: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- Failures are caught and logged; notification creation still succeeds

### Firebase Cloud Messaging (FCM)
- Used for: push notifications
- Configuration: `FCM_SERVER_KEY`
- Uses legacy HTTP endpoint (`https://fcm.googleapis.com/fcm/send`)
- Device tokens stored on `User.pushToken`

## Deployment

### Current deployment
- Railway (see `railway.toml`)
- Dockerfile builds backend with Node 20 Alpine
- Frontend `.env.production` points to Railway backend URL
- No Cloudflare configuration in repository

### Production start
- Backend: `npm run start` runs `prisma migrate deploy && npm run seed && node dist/server.js`
- Frontend: static build served (not configured in this repo)

## Environment configuration

### Backend env validation
- Zod schema in `backend/src/config/env.ts` validates all required variables at startup
- Process exits with error if required variables are missing

### Frontend env
- Vite exposes `import.meta.env.VITE_*` variables
- `VITE_API_URL` and `VITE_GOOGLE_MAPS_API_KEY` are used
