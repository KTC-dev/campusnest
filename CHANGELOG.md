# Changelog

All notable changes to Edurus are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- Google Maps location picker for property listings
- Property location fields (latitude, longitude, formatted address, place ID)
- Additional property search filters (verified-only, utilities, bedroom count)
- AdMob service layer and banner component for Android packaging
- Profile page UI redesign

### Changed
- Migrated admin backend terminology from "landlord" to "agent"
- Updated all frontend and backend references to use agent terminology

### Fixed
- Roommate match card actions now navigate instead of showing "coming soon" toasts
- Roommate chat now checks for existing profile before creating conversation

---

## [Phase 4] — Reviews & Admin Dashboard

### Added
- Review model with moderation fields (isApproved, isFlagged, flaggedReason, helpfulCount, agentResponse)
- Review API endpoints (create, list, update, delete, voteHelpful, admin flagged)
- Frontend review components (StarRating, ReviewForm, ReviewList)
- Reviews tab in AdminDashboard
- Admin dashboard with stats, 30-day analytics charts, user management
- Admin moderation queue for pending listings
- Admin verification review with approve/reject
- Recharts integration for analytics

### Changed
- Admin dashboard organized into tabs: Overview, Moderation, Students, Agents, Bookings, Verifications

---

## [Phase 3] — Verification & Roommate Matching

### Added
- Agent verification submission flow (ID, selfie, proof of ownership)
- Admin verification approve/reject workflow
- Verified badge display on agent profiles and property cards
- Roommate profile model and API
- Weighted roommate compatibility scoring (budget 25%, gender 20%, sleep 15%, cleanliness 15%, smoking 15%, noise 10%)
- Match request system (send, accept, decline)
- Saved roommate matches
- Accommodation request board (student create, agent/admin browse)
- Notification types for accommodation events (REQUEST_CREATED, REQUEST_RESPONSE)
- Property status-change notifications to agents
- Review submission notifications to agents

### Changed
- Property listing moderation now notifies agents of approve/reject decisions
- Booking approval/rejection sends notifications to students

---

## [Phase 2] — Property Listings & Bookings

### Added
- Property CRUD (create, read, update, delete)
- Image upload via Cloudinary
- Property amenities system with explicit join table
- Property search and filtering (price, distance, gender, room type, amenities)
- Favourites system
- Booking request system with status flow (PENDING → APPROVED/REJECTED/CANCELLED)
- Auto-reject other pending bookings when one is approved
- Agent dashboard with property and booking management
- Student dashboard with favourites and booking status
- Rate limiting on login, property creation, and booking creation
- Public property stats endpoint for landing page

### Changed
- Listings start in PENDING status; only approved listings are publicly visible
- Editing a listing resets status to PENDING (availability-only changes do not)

---

## [Phase 1] — Core Platform

### Added
- Multi-university schema design with University as first-class model
- User registration (student and agent flows)
- JWT access + refresh token authentication with rotation
- Role-based authorization (STUDENT, AGENT, ADMIN)
- Password hashing with bcrypt (12 salt rounds)
- Zod request validation on all endpoints
- Input sanitization middleware
- Winston structured logging
- Error handling middleware with Prisma error translation
- Session management (list and revoke refresh tokens)
- Terms acceptance enforcement with versioning
- Landing page with hero, featured properties, sections, FAQ
- Mobile-first responsive UI with bottom navigation
- Socket.IO real-time messaging infrastructure
- Notification preferences (in-app, email, push)
- Cookie consent banner

### Infrastructure
- Express + TypeScript backend
- Prisma + PostgreSQL database
- React + Vite + Tailwind frontend
- Cloudinary integration for uploads
- Nodemailer for email
- FCM for push notifications
- Docker and Railway deployment config
