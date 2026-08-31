# Edurus

Student accommodation platform for Federal University Otuoke (FUO), built for multi-university expansion.

## What Edurus is

Edurus connects students with verified accommodation agents near campus. Students can search listings, save favourites, request inspections, book properties, find roommates, and message agents. Agents can create listings, manage bookings, and respond to student requests. Admins moderate listings, verify agents, and manage users.

## Problem

Students struggle to find trusted, verified accommodation near campus. Agents lack a dedicated platform to list properties and manage inquiries. Edurus centralizes this flow with verification, reviews, and real-time messaging.

## Target users

- **Students**: browse, favourite, request, book, review, and find roommates
- **Agents**: list properties, manage bookings, respond to requests
- **Admins**: moderate listings, verify agents, manage users, view analytics

## Current MVP

This is a working MVP. Core flows are functional end-to-end: registration, authentication, property search, booking requests, roommate matching, conversations, notifications, agent verification, admin moderation, and a landing page.

## Tech stack

### Frontend
- React 18 + TypeScript + Vite
- Tailwind CSS
- React Router v6
- TanStack Query (React Query)
- Zustand (auth + toast state)
- Socket.IO client
- Recharts (admin analytics)
- Axios

### Backend
- Node.js + Express + TypeScript
- Prisma ORM
- PostgreSQL
- Socket.IO (real-time messaging)
- JWT access + refresh tokens
- bcrypt
- Zod validation
- Winston logging
- Nodemailer (email notifications)
- FCM (push notifications)
- Cloudinary (image/file storage)

## Repository structure

```
campusnest/
+-- backend/
¦   +-- src/
¦   ¦   +-- app.ts                 # Express app setup
¦   ¦   +-- server.ts              # HTTP + Socket.IO server
¦   ¦   +-- config/
¦   ¦   ¦   +-- env.ts             # Environment config (Zod-validated)
¦   ¦   ¦   +-- logger.ts          # Winston logger
¦   ¦   ¦   +-- prisma.ts          # Shared PrismaClient instance
¦   ¦   +-- controllers/           # Thin HTTP handlers
¦   ¦   +-- middleware/
¦   ¦   ¦   +-- authenticate.ts    # JWT access token verification
¦   ¦   ¦   +-- requireRole.ts     # Role-based authorization
¦   ¦   ¦   +-- rateLimiters.ts    # Endpoint-specific rate limits
¦   ¦   ¦   +-- sanitize.ts        # Input sanitization
¦   ¦   ¦   +-- validate.ts        # Zod validation middleware
¦   ¦   ¦   +-- errorHandler.ts    # Global error handler
¦   ¦   +-- routes/                # API route definitions
¦   ¦   +-- services/              # Business logic layer
¦   ¦   +-- utils/                 # JWT, password, validation schemas
¦   +-- prisma/
¦   ¦   +-- schema.prisma          # Database schema
¦   ¦   +-- seed.ts                # Database seed
¦   ¦   +-- migrations/            # Prisma migrations
¦   +-- package.json
+-- frontend/
¦   +-- src/
¦   ¦   +-- main.tsx               # React entry point
¦   ¦   +-- App.tsx                # Routes and protected routes
¦   ¦   +-- components/            # Reusable UI components
¦   ¦   +-- pages/                 # Route pages
¦   ¦   +-- services/              # API service layer
¦   ¦   +-- store/                 # Zustand stores
¦   ¦   +-- types/                 # TypeScript interfaces
¦   ¦   +-- utils/                 # Helpers (JWT decode, error formatting)
¦   +-- vite.config.ts
¦   +-- tailwind.config.js
¦   +-- postcss.config.js
¦   +-- package.json
+-- Dockerfile                     # Production container build
+-- railway.toml                   # Railway deployment config
+-- .gitignore
```

## How frontend and backend communicate

- Frontend uses a single Axios instance (`src/services/api.ts`) with base URL from `VITE_API_URL`.
- Access token is attached to every request via interceptor.
- On 401, the interceptor attempts a refresh using the stored refresh token before logging out.
- Socket.IO is used for real-time messaging (`server.ts` + `socket.io-client`).
- API responses follow the shape: `{ success: boolean, data: T, message?: string }`.

## Quick installation

### Prerequisites
- Node.js 18+
- PostgreSQL
- npm

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env and set DATABASE_URL, JWT secrets, and Cloudinary keys
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Development commands

### Backend (`cd backend`)
- `npm run dev` — start with tsx watch
- `npm run build` — prisma generate + tsc compile
- `npm run start` — migrate deploy + seed + run dist
- `npm run prisma:migrate` — create/apply migrations in development
- `npm run prisma:deploy` — apply migrations in production
- `npm run prisma:generate` — regenerate Prisma client
- `npm run prisma:studio` — open Prisma Studio
- `npm run seed` — run seed script
- `npm run lint` — run ESLint
- `npm test` — run Vitest

### Frontend (`cd frontend`)
- `npm run dev` — start Vite dev server on port 5173
- `npm run build` — TypeScript check + Vite production build
- `npm run preview` — preview production build
- `npm run lint` — run ESLint

## Production build

The repository includes a `Dockerfile` for containerized deployment. Railway configuration is in `railway.toml`.

```bash
docker build -t edurus .
docker run -p 4000:4000 edurus
```

## Documentation

```
Documentation
├── Project Overview
├── Features
├── User Roles
├── System Architecture
├── Setup
├── Environment
├── API Documentation
└── docs/
    ├── Database
    ├── Security
    └── Deployment
```
