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

## What's in Phase 2

- **Property CRUD**: landlords create/edit/delete listings; every create or content edit resets status to `PENDING` for re-review (toggling availability alone does not, so "no vacancy" doesn't need re-approval). Images upload through `upload.service.ts`, a thin wrapper around Cloudinary — swapping storage providers later means editing one file.
- **Public search**: `GET /properties` filters by price range, distance from campus, gender, room type, amenities, and availability, with pagination. Only `APPROVED` listings are ever returned publicly — `PENDING`/`REJECTED`/`SUSPENDED` listings are invisible outside the owning landlord's and admin's views.
- **Favourites**: students can save/unsave listings (`POST /properties/:id/favourite`), backed by the `Favourite` join table from Phase 1.
- **Student dashboard**: saved favourites grid, with a link out to full search.
- **Landlord dashboard**: listings table with status badges, occupancy stats (occupied / total / rate), inline availability toggle, edit and delete.
- **Frontend**: `PropertyCard`, `PropertyFiltersBar`, listing/detail pages wired to TanStack Query, a shared `AppNav`, and a create/edit listing form that base64-encodes selected images client-side before posting.

## What's in Phase 3

- **Booking system**: students send a booking request (move-in date + optional message) on approved, available properties. Landlords approve or reject from their dashboard. Approving a request automatically marks the property unavailable and auto-rejects any other pending requests for that same property (in a single DB transaction, so it can't half-apply). Students can cancel their own pending requests; both sides see live status.
- **Roommate matching**: students fill out a lifestyle profile (budget, gender preference, sleep schedule, cleanliness, smoking, noise tolerance) and get ranked matches against every other active profile at their university. The scoring in `roommate.service.ts` is a weighted sum (budget overlap 25%, gender fit 20%, sleep schedule 15%, cleanliness 15%, smoking 15%, noise tolerance 10%) producing a 0–100 compatibility score — weights are named constants so they're easy to tune later.
- **Notifications**: every booking status change and listing moderation decision creates a `Notification` row through one shared `notification.service.ts`, so a future email/push channel is a single integration point rather than scattered `sendEmail()` calls. The nav bar's bell shows unread count and marks-as-read on open.

## Suggested next steps (Phase 4)

- Admin dashboard: stats endpoint already exists (`/admin/stats` from Phase 1) — build the UI, plus a pending-listings moderation queue backed by the already-built `/properties/pending/all` and `/properties/:id/moderate` endpoints.
- Testing: no automated tests yet. Prioritize the booking transaction (approve/auto-reject) and roommate scoring function — both have the most business-logic surface area.
- Known gap: `Student` has no `gender` field, so roommate gender-preference matching currently compares preference-to-preference rather than preference-to-actual-gender (documented in `roommate.service.ts`). Worth a schema migration if this MVP moves toward a real launch.
- Optimization pass: add indexes/pagination review, and a stricter rate limit on `POST /properties` and `POST /bookings` (the two most abuse-prone write endpoints).

## A note on this codebase specifically

Initialize git and push to GitHub before you start layering Phase 2 on top — this project has a lot of moving parts (schema, services, routes, frontend store) and losing uncommitted work here would cost more than usual to rebuild.
