# Features

## 1. Authentication & Authorization

**Purpose:** User registration, login, token-based auth, role enforcement.

**Who uses it:** All users (students, agents, admins).

**Status:** IMPLEMENTED

**Frontend implementation:**
- `LoginPage`, `RegisterPage` with role selection
- `authStore` (Zustand) persists tokens to localStorage as `edurus-auth`
- Axios interceptor auto-attaches Bearer token and refreshes on 401
- `ProtectedRoute` component guards authenticated routes by role
- Terms acceptance banner/flow

**Backend implementation:**
- `POST /auth/register/student`
- `POST /auth/register/agent`
- `POST /auth/login` (rate limited: 10 attempts per 15 minutes)
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/accept-terms`
- `GET /auth/me`
- `GET /universities` (public)
- JWT access tokens (15m default) + refresh tokens (7d default) with rotation
- bcrypt password hashing (12 salt rounds)
- Terms version enforcement in `authenticate` middleware

**API endpoints:**
- `POST /api/v1/auth/register/student`
- `POST /api/v1/auth/register/agent`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/accept-terms`
- `GET /api/v1/auth/me`
- `GET /api/v1/universities`

**Database models:** `User`, `Student`, `Agent`, `Admin`, `RefreshToken`, `University`

**Dependencies:** jsonwebtoken, bcryptjs, zod

**Known limitations:**
- No email verification on registration
- No password reset flow
- Two-factor field exists in schema but no UI or enforcement
- Refresh tokens are stored client-side in localStorage, not httpOnly cookies

**TODOs:**
- Add email verification
- Add password reset
- Implement 2FA UI and enforcement

---

## 2. Property Listings

**Purpose:** Agents create, edit, and manage property listings. Students browse and search.

**Who uses it:** Agents (CRUD), Students (read), Admins (moderation).

**Status:** IMPLEMENTED

**Frontend implementation:**
- `PropertyListingPage` with filters, search, favourites
- `PropertyDetailsPage` with full property info, reviews, agent card
- `ListingFormPage` for create/edit with image upload and location picker
- `MyPropertiesPage` for agent property management
- `PropertyFiltersBar` with price, distance, gender, room type, amenities, verified-only, utilities, bedrooms
- `PropertyCard`, `AgentPropertyCard` components

**Backend implementation:**
- `GET /properties` — public listing with filters and pagination
- `GET /properties/:id` — public detail
- `GET /properties/amenities` — public amenity list
- `GET /properties/public-stats` — public stats for landing page
- `POST /properties` — agent create (rate limited: 20/hour)
- `PATCH /properties/:id` — agent update
- `DELETE /properties/:id` — agent delete
- `GET /properties/mine` — agent own listings
- `GET /properties/favourites` — student favourites
- `POST /properties/:id/favourite` — student toggle favourite
- `GET /properties/pending/all` — admin pending listings
- `PATCH /properties/:id/moderate` — admin approve/reject/suspend

**API endpoints:**
- `GET /api/v1/properties`
- `GET /api/v1/properties/:id`
- `GET /api/v1/properties/amenities`
- `GET /api/v1/properties/public-stats`
- `POST /api/v1/properties`
- `PATCH /api/v1/properties/:id`
- `DELETE /api/v1/properties/:id`
- `GET /api/v1/properties/mine`
- `GET /api/v1/properties/favourites`
- `POST /api/v1/properties/:id/favourite`
- `GET /api/v1/properties/pending/all`
- `PATCH /api/v1/properties/:id/moderate`

**Database models:** `Property`, `PropertyImage`, `Amenity`, `PropertyAmenity`, `Favourite`

**Dependencies:** Cloudinary (image uploads), zod (validation)

**Known limitations:**
- Property creation defaults to first university in DB; multi-university UI not fully implemented
- No map view for browsing (map only on detail page for agents during creation)
- Image upload uses base64 encoding client-side before sending

**TODOs:**
- Add university selector to listing form
- Add map-based browsing

---

## 3. Booking System

**Purpose:** Students request to book properties. Agents approve or reject. Auto-reject other pending requests on approval.

**Who uses it:** Students (create, cancel), Agents (respond).

**Status:** IMPLEMENTED

**Frontend implementation:**
- `BookingRequestModal` on property detail page
- Student dashboard shows booking status cards with cancel action
- Agent dashboard shows pending inquiries with approve/reject actions

**Backend implementation:**
- `POST /bookings` — student create (rate limited: 30/hour)
- `GET /bookings/mine` — student own bookings
- `PATCH /bookings/:id/cancel` — student cancel pending
- `GET /bookings/agent` — agent property bookings
- `PATCH /bookings/:id/respond` — agent approve/reject
- Approval transaction: marks property unavailable and rejects other pending requests

**API endpoints:**
- `POST /api/v1/bookings`
- `GET /api/v1/bookings/mine`
- `PATCH /api/v1/bookings/:id/cancel`
- `GET /api/v1/bookings/agent`
- `PATCH /api/v1/bookings/:id/respond`

**Database models:** `Booking`

**Dependencies:** zod (validation)

**Known limitations:**
- No payment integration (mocked service layer exists but no provider wired)
- No calendar/scheduling UI beyond date selection

**TODOs:**
- Integrate payment provider
- Add booking timeline/status history

---

## 4. Reviews & Reputation

**Purpose:** Students leave reviews after completed bookings. Agents can respond. Admins can moderate.

**Who uses it:** Students (create, update, vote), Agents (respond), Admins (moderate).

**Status:** IMPLEMENTED

**Frontend implementation:**
- `StarRating` component
- `ReviewForm` on property details page
- `ReviewList` on property details page
- Review CTA on student dashboard
- Admin `ReviewsTab` in admin dashboard

**Backend implementation:**
- `POST /properties/:propertyId/reviews` — create review
- `GET /properties/:propertyId/reviews` — list approved reviews for property
- `GET /reviews/my` — current student's review for a property
- `PATCH /reviews/reviews/:id` — update review or agent response
- `DELETE /reviews/reviews/:id` — delete review
- `POST /reviews/reviews/:id/helpful` — vote helpful/unhelpful
- `GET /reviews/admin/flagged` — admin flagged reviews

**API endpoints:**
- `POST /api/v1/properties/:propertyId/reviews`
- `GET /api/v1/properties/:propertyId/reviews`
- `GET /api/v1/reviews/my`
- `PATCH /api/v1/reviews/reviews/:id`
- `DELETE /api/v1/reviews/reviews/:id`
- `POST /api/v1/reviews/reviews/:id/helpful`
- `GET /api/v1/reviews/admin/flagged`

**Database models:** `Review`

**Dependencies:** zod (validation)

**Known limitations:**
- Average rating recalculation is currently a no-op stub (`updatePropertyAverageRating` returns without updating)

**TODOs:**
- Implement average rating recalculation
- Add review reporting workflow

---

## 5. Roommate Matching

**Purpose:** Students create lifestyle profiles and get compatibility-ranked matches. Send match requests, save profiles, and chat.

**Who uses it:** Students only.

**Status:** IMPLEMENTED

**Frontend implementation:**
- `RoommateMatchesPage` with tabs: Recommended, New, Active, Saved, Sent, Received
- `RoommateProfilePage` for creating/editing profile
- `RoommateProfileViewPage` for viewing another student's profile and starting chat
- `RoommateMatchCard` with score, breakdown tags, connect/save actions
- `RoommateMatchRequestCard` for sent/received requests

**Backend implementation:**
- `GET /roommates/profile` — get own profile
- `PUT /roommates/profile` — upsert own profile
- `GET /roommates/profile/:id` — view another student's profile
- `GET /roommates/matches` — get ranked matches with optional filters
- `POST /roommates/match-requests` — send match request
- `PATCH /roommates/match-requests/:requestId` — accept/decline request
- `GET /roommates/match-requests/sent` — sent requests
- `GET /roommates/match-requests/received` — received requests
- `GET /roommates/saved` — saved matches
- Weighted compatibility scoring (budget 25%, gender 20%, sleep 15%, cleanliness 15%, smoking 15%, noise 10%)

**API endpoints:**
- `GET /api/v1/roommates/profile`
- `PUT /api/v1/roommates/profile`
- `GET /api/v1/roommates/profile/:id`
- `GET /api/v1/roommates/matches`
- `POST /api/v1/roommates/match-requests`
- `PATCH /api/v1/roommates/match-requests/:requestId`
- `GET /api/v1/roommates/match-requests/sent`
- `GET /api/v1/roommates/match-requests/received`
- `GET /api/v1/roommates/saved`

**Database models:** `RoommateProfile`, `RoommateMatch`, `RoommateMatchRequest`, `RoommateMatchFavourite`

**Dependencies:** zod (validation)

**Known limitations:**
- Matching requires both students to have profiles before chat can start
- Gender matching uses preference-to-preference, not actual student gender (flagged in Phase 3)

**TODOs:**
- Use `Student.gender` for actual gender fit enforcement

---

## 6. Accommodation Request Board

**Purpose:** Students post accommodation requests when no listing fits their needs. Agents and admins can browse and respond.

**Who uses it:** Students (create, update, delete, view own), Agents (view open), Admins (view all).

**Status:** IMPLEMENTED

**Frontend implementation:**
- `CreateAccommodationRequestPage` — form for students to post requests
- `MyAccommodationRequestsPage` — student's own requests with status
- `AgentRequestsPage` — agent view of open requests

**Backend implementation:**
- `POST /accommodation-requests` — student create
- `GET /accommodation-requests/mine` — student own requests
- `GET /accommodation-requests/open` — agent/admin open requests with filters
- `GET /accommodation-requests/:id` — view single request
- `PATCH /accommodation-requests/:id` — update request or status
- `DELETE /accommodation-requests/:id` — delete request

**API endpoints:**
- `POST /api/v1/accommodation-requests`
- `GET /api/v1/accommodation-requests/mine`
- `GET /api/v1/accommodation-requests/open`
- `GET /api/v1/accommodation-requests/:id`
- `PATCH /api/v1/accommodation-requests/:id`
- `DELETE /api/v1/accommodation-requests/:id`

**Database models:** `AccommodationRequest`

**Dependencies:** zod (validation), notificationService

**Known limitations:**
- No direct messaging from request board (must use conversation system separately)

**TODOs:**
- Add agent response/offer workflow tied to requests

---

## 7. Messaging & Conversations

**Purpose:** Real-time chat between students and agents (property inquiries) and between students (roommate matches).

**Who uses it:** Students and agents.

**Status:** IMPLEMENTED

**Frontend implementation:**
- `ConversationsPage` with conversation list and message view
- Socket.IO client for real-time message delivery
- Message input with attachment support (images, PDFs)
- Typing indicators
- Conversation context cards (property/roommate info)
- File upload component

**Backend implementation:**
- `POST /conversations` — create property or roommate conversation
- `GET /conversations` — list user's conversations
- `GET /conversations/:id` — get conversation detail
- `GET /conversations/:id/messages` — paginated messages
- `POST /conversations/:id/messages` — send message
- `POST /conversations/messages/upload` — upload attachment
- `PATCH /conversations/messages/:id/read` — mark message read
- `DELETE /conversations/:id` — archive conversation
- Socket.IO events: `join_conversation`, `send_message`, `typing`, `stop_typing`

**API endpoints:**
- `POST /api/v1/conversations`
- `GET /api/v1/conversations`
- `GET /api/v1/conversations/:id`
- `GET /api/v1/conversations/:id/messages`
- `POST /api/v1/conversations/:id/messages`
- `POST /api/v1/conversations/messages/upload`
- `PATCH /api/v1/conversations/messages/:id/read`
- `DELETE /api/v1/conversations/:id`

**Database models:** `Conversation`, `Message`, `MessageAttachment`

**Dependencies:** Socket.IO, Cloudinary (attachments)

**Known limitations:**
- No group conversations
- No message search
- No message editing/deletion (soft delete via `deletedAt` exists but no UI)

**TODOs:**
- Add message search
- Add message edit/delete UI

---

## 8. Notifications

**Purpose:** In-app, email, and push notifications for platform events.

**Who uses it:** All authenticated users.

**Status:** IMPLEMENTED

**Frontend implementation:**
- `NotificationBell` component in nav bar
- Dropdown with unread count, mark-as-read on open
- Navigate to relevant page on notification click
- `NotificationsPage` for full notification list
- Notification preferences in settings

**Backend implementation:**
- `GET /notifications` — list notifications with unread count
- `PATCH /notifications/:id/read` — mark single read
- `PATCH /notifications/read-all` — mark all read
- `DELETE /notifications/:id` — delete notification
- Notification types: BOOKING_UPDATE, MESSAGE, LISTING_STATUS, ROOMMATE_MATCH, ROOMMATE_MATCH_REQUEST, ROOMMATE_MATCH_ACCEPTED, ROOMMATE_MATCH_DECLINED, SYSTEM, PROPERTY_INQUIRY, INSPECTION_CONFIRMED, VERIFICATION_APPROVED, PROPERTY_APPROVED, SECURITY_ALERT, ACCOUNT_WARNING, REQUEST_CREATED, REQUEST_RESPONSE, REVIEW_SUBMITTED
- Dispatches to in-app (always), email (via Nodemailer), and push (via FCM) based on user preferences

**API endpoints:**
- `GET /api/v1/notifications`
- `PATCH /api/v1/notifications/:id/read`
- `PATCH /api/v1/notifications/read-all`
- `DELETE /api/v1/notifications/:id`

**Database models:** `Notification`, `UserPreference`

**Dependencies:** nodemailer (email), FCM HTTP v1 (push), Cloudinary

**Known limitations:**
- Email and push are best-effort (failures are caught and logged, not retried)
- FCM server key integration uses legacy HTTP endpoint, not modern FCM v1 API
- No notification grouping or smart sorting

**TODOs:**
- Migrate to FCM v1 API
- Add notification grouping
- Add email templates

---

## 9. Agent Verification

**Purpose:** Agents submit identity documents for admin review. Verified agents receive a badge.

**Who uses it:** Agents (submit), Admins (review).

**Status:** IMPLEMENTED

**Frontend implementation:**
- `VerificationPage` for agents to upload ID, selfie, proof of ownership
- Verification status display in profile and admin dashboard
- Verified badge component

**Backend implementation:**
- `POST /agents/verification` — submit verification
- `GET /agents/verification/my` — agent's own verification
- `GET /admin/verifications` — admin list all
- `GET /admin/verifications/:id` — admin view single
- `PATCH /admin/verifications/:id/approve` — admin approve
- `PATCH /admin/verifications/:id/reject` — admin reject

**API endpoints:**
- `POST /api/v1/agents/verification`
- `GET /api/v1/agents/verification/my`
- `GET /api/v1/admin/verifications`
- `GET /api/v1/admin/verifications/:id`
- `PATCH /api/v1/admin/verifications/:id/approve`
- `PATCH /api/v1/admin/verifications/:id/reject`

**Database models:** `AgentVerification`

**Dependencies:** Cloudinary (document uploads), zod (validation)

**Known limitations:**
- No automated document verification (manual admin review only)
- No expiration/re-verification workflow

**TODOs:**
- Add document expiry and re-verification reminders

---

## 10. Admin Dashboard

**Purpose:** Platform oversight, moderation, and analytics.

**Who uses it:** Admins only.

**Status:** IMPLEMENTED

**Frontend implementation:**
- `AdminDashboard` with tabs: Overview, Moderation, Students, Agents, Bookings, Verifications
- Stats cards and 30-day trend charts (Recharts)
- Paginated tables for students, agents, bookings
- Pending listings moderation queue with approve/reject/remove actions
- User active/deactivate toggle
- Verification review with approve/reject

**Backend implementation:**
- `GET /admin/stats` — platform stats
- `GET /admin/analytics` — 30-day listings and bookings trends
- `GET /admin/students` — paginated student list
- `GET /admin/agents` — paginated agent list
- `GET /admin/bookings` — paginated booking list
- `GET /admin/properties/pending` — pending listings
- `PATCH /admin/users/:userId/active` — activate/deactivate user
- `DELETE /admin/properties/:id` — remove fraudulent listing

**API endpoints:**
- `GET /api/v1/admin/stats`
- `GET /api/v1/admin/analytics`
- `GET /api/v1/admin/students`
- `GET /api/v1/admin/agents`
- `GET /api/v1/admin/bookings`
- `GET /api/v1/admin/properties/pending`
- `PATCH /api/v1/admin/users/:userId/active`
- `DELETE /api/v1/admin/properties/:id`
- `GET /api/v1/admin/verifications`
- `GET /api/v1/admin/verifications/:id`
- `PATCH /api/v1/admin/verifications/:id/approve`
- `PATCH /api/v1/admin/verifications/:id/reject`
- `GET /api/v1/reviews/admin/flagged`

**Database models:** `User`, `Student`, `Agent`, `Property`, `Booking`, `AgentVerification`, `Review`

**Dependencies:** Recharts (frontend charts), zod (validation)

**Known limitations:**
- Revenue is hardcoded to 0 (no payment integration)
- No audit log for admin actions

**TODOs:**
- Add audit logging for admin actions
- Integrate payment data for revenue metrics

---

## 11. Session Management

**Purpose:** Users can view and revoke their active sessions (refresh tokens).

**Who uses it:** All authenticated users.

**Status:** IMPLEMENTED

**Frontend implementation:**
- Settings page shows session management
- Revoke individual session or all other sessions

**Backend implementation:**
- `GET /sessions/` — list active refresh tokens
- `DELETE /sessions/:id` — revoke single session
- `POST /sessions/revoke-others` — revoke all except current

**API endpoints:**
- `GET /api/v1/sessions/`
- `DELETE /api/v1/sessions/:id`
- `POST /api/v1/sessions/revoke-others`

**Database models:** `RefreshToken`

**Known limitations:**
- Sessions are identified by refresh token ID, not device info or IP

---

## 12. User Preferences

**Purpose:** Manage notification delivery preferences.

**Who uses it:** All authenticated users.

**Status:** IMPLEMENTED

**Frontend implementation:**
- Settings page toggles for in-app, email, push, and security notifications

**Backend implementation:**
- `GET /preferences/notifications` — get preferences
- `PATCH /preferences/notifications` — update preferences
- Security notifications cannot be disabled

**API endpoints:**
- `GET /api/v1/preferences/notifications`
- `PATCH /api/v1/preferences/notifications`

**Database models:** `UserPreference`

---

## 13. Landing Page & Marketing

**Purpose:** Public-facing marketing and conversion pages.

**Who uses it:** Visitors and unauthenticated users.

**Status:** IMPLEMENTED

**Frontend implementation:**
- `LandingPage` with sections: hero with live search, featured properties, why-choose, how-it-works, roommate matching, become-an-agent, animated stats, testimonials, FAQ, footer
- `AboutPage`, `ContactPage`, `PrivacyPage`, `TermsPage`, `HelpPage`

**Backend implementation:**
- `GET /properties/public-stats` — stats for animated counters
- `GET /properties` — featured properties data

**Known limitations:**
- Testimonials are placeholder content
- Contact form is static (no backend endpoint)

**TODOs:**
- Replace placeholder testimonials with real content
- Add contact form backend

---

## 14. File Uploads

**Purpose:** Upload property images, verification documents, and message attachments.

**Who uses it:** Agents (property images, verification), All users (message attachments).

**Status:** IMPLEMENTED

**Frontend implementation:**
- `Upload` component with drag-and-drop, base64 encoding, preview, progress
- `PropertyImageUploader` for listing form
- Message attachment upload in conversations

**Backend implementation:**
- `upload.service.ts` wraps Cloudinary SDK
- Folders: `edurus/properties`, `edurus/verification`, `edurus/messages`
- `uploadImage`, `uploadFile`, `deleteImage`, `deleteFile` methods

**Dependencies:** Cloudinary v2

**Known limitations:**
- Requires Cloudinary credentials to be configured
- No virus scanning on uploads

---

## 15. Google Maps/Location

**Purpose:** Capture and display property locations.

**Who uses it:** Agents (set location), Students (view map on property detail).

**Status:** IMPLEMENTED

**Frontend implementation:**
- `LocationPicker` component for agent listing form
- Read-only map on `PropertyDetailsPage`
- Environment variable `VITE_GOOGLE_MAPS_API_KEY`

**Backend implementation:**
- Property model stores `latitude`, `longitude`, `formattedAddress`, `placeId`, `locationVisibility`
- Prisma migration applied

**Known limitations:**
- No routing/directions
- No street view
- Location visibility levels (public/approximate/private) stored but not enforced in UI

**TODOs:**
- Enforce location visibility levels
- Add distance calculation from campus

---

## 16. Security

**Purpose:** Application and data protection.

**Status:** PARTIALLY IMPLEMENTED

See `docs/SECURITY.md` for full details.

**Known limitations:**
- No CSRF tokens
- No rate limiting on refresh endpoint
- No email verification
- No password reset
- 2FA schema exists but no implementation

---

## 17. Real-Time Infrastructure

**Purpose:** Socket.IO server for live messaging.

**Who uses it:** Students and agents in conversations.

**Status:** IMPLEMENTED

**Backend implementation:**
- `server.ts` creates HTTP server and attaches Socket.IO
- JWT-based socket authentication
- Room-based conversation joining (`conversation:{id}`)
- User-specific room (`user:{id}`)
- Events: `join_conversation`, `send_message`, `typing`, `stop_typing`

**Frontend implementation:**
- `ConversationsPage` connects to Socket.IO with auth token
- Joins conversation rooms
- Emits typing events
- Listens for incoming messages

**Dependencies:** Socket.IO

**Known limitations:**
- No presence/online status tracking
- No message read receipts over socket (read is via REST)

---

## 18. Cookie Consent

**Purpose:** GDPR-style cookie consent banner.

**Who uses it:** All visitors.

**Status:** IMPLEMENTED

**Frontend implementation:**
- `CookieConsentBanner` component shown on all pages
- Consent state stored in localStorage

**Known limitations:**
- No actual cookie categorization or granular consent