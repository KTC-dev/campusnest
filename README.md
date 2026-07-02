# CampusHaven — Phase 1

Student accommodation platform for Federal University Otuoke, built to expand to more universities later.

## What's in Phase 1

- **Monorepo**: `backend/` (Express + TypeScript + Prisma) and `frontend/` (Vite + React + TypeScript + Tailwind).
- **Database**: full normalized Prisma schema — universities, users, students, landlords, admins, properties, images, amenities, bookings, reviews, favourites, roommate profiles, messages, notifications. Every tenant-scoped model (`Student`, `Property`) carries a `universityId` so onboarding a second university is a data change, not a schema change.
- **Auth**: email/password registration (student and landlord flows), JWT access + refresh tokens with rotation, role-based middleware (`STUDENT` / `LANDLORD` / `ADMIN`), bcrypt password hashing, Zod request validation.
- **Frontend**: routing shell, Zustand auth store (persisted, decodes the JWT to populate the user), Axios client with automatic token refresh on 401, protected/role-guarded routes, Landing/Login/Register pages wired to the real API.

## Getting started

### Backend
```
cd backend
cp .env.example .env      # fill in DATABASE_URL and JWT secrets
npm install
npm run prisma:migrate    # creates tables from schema.prisma
npx prisma db seed        # seeds FUO + amenity list
npm run dev                # http://localhost:4000
```

### Frontend
```
cd frontend
cp .env.example .env
npm install
npm run dev                # http://localhost:5173
```

## Key design decisions

- **Service layer separates business logic from HTTP.** Controllers in `backend/src/controllers` stay thin; all decision-making (uniqueness checks, token issuance, rotation) lives in `backend/src/services`. This is what makes Phase 2's property/booking logic straightforward to add without touching the auth code.
- **Refresh token rotation**: every refresh issues a new token pair and revokes the old one, stored in the `RefreshToken` table. Limits damage if a token leaks and lets you revoke sessions server-side (e.g. "log out everywhere").
- **Multi-university from day one**: rather than hardcoding FUO, `University` is a first-class model. The seed script creates FUO as the first row; adding a second university later is one `prisma.university.create()` call, not a migration.
- **Validation at the edge**: Zod schemas in `backend/src/utils/validation` run before any controller code, so bad input never reaches business logic.
- **Explicit join table for amenities** (`PropertyAmenity`) instead of an implicit Prisma many-to-many, so it's extensible later (e.g. per-property amenity notes) without a breaking migration.

## Suggested next steps (Phase 2)

- Property CRUD (landlord create/edit/delete, image upload via Cloudinary, admin approval workflow) and public search/filter endpoints.
- Student dashboard (browse, save favourites, view booking status) and Landlord dashboard (listings, booking requests, occupancy).
- Wire the `role` chosen at register-time through to a proper university picker once a second university exists.

## A note on this codebase specifically

Initialize git and push to GitHub before you start layering Phase 2 on top — this project has a lot of moving parts (schema, services, routes, frontend store) and losing uncommitted work here would cost more than usual to rebuild.
