# User Roles

## STUDENT

### What they can access
- Public property listings (`GET /properties`)
- Property details (`GET /properties/:id`)
- Landing page, About, Contact, Privacy, Terms, Help pages
- Registration and login
- Profile and settings
- Notifications
- Conversations (property and roommate chats)
- Roommate matching features
- Accommodation request board

### What they can create
- Account (`POST /auth/register/student`)
- Booking requests (`POST /bookings`)
- Reviews (`POST /properties/:propertyId/reviews`)
- Roommate profile (`PUT /roommates/profile`)
- Match requests (`POST /roommates/match-requests`)
- Accommodation requests (`POST /accommodation-requests`)
- Conversations (`POST /conversations`)
- Messages (`POST /conversations/:id/messages`)

### What they can edit
- Own profile (`PATCH /users`)
- Own booking (cancel only: `PATCH /bookings/:id/cancel`)
- Own review (`PATCH /reviews/reviews/:id`)
- Own accommodation request (`PATCH /accommodation-requests/:id`)
- Own roommate profile (`PUT /roommates/profile`)
- Notification preferences (`PATCH /preferences/notifications`)

### What they can delete
- Own review (`DELETE /reviews/reviews/:id`)
- Own accommodation request (`DELETE /accommodation-requests/:id`)
- Own conversation (archive: `DELETE /conversations/:id`)
- Own notifications (`DELETE /notifications/:id`)

### What they can view
- Own bookings (`GET /bookings/mine`)
- Own favourites (`GET /properties/favourites`)
- Own reviews (`GET /reviews/my`)
- Sent/received match requests (`GET /roommates/match-requests/sent`, `/received`)
- Saved matches (`GET /roommates/saved`)
- Own accommodation requests (`GET /accommodation-requests/mine`)
- Own sessions (`GET /sessions/`)
- Own verification (`GET /agents/verification/my`) — only if they have an agent account

### What they cannot access
- Agent dashboard
- Admin dashboard
- Agent property management routes
- Admin moderation routes
- Other users' private data

### Frontend restrictions
- Protected routes redirect unauthenticated users to `/login`
- Role-guarded routes (`/roommates`, `/accommodation-requests`, `/verification`) redirect non-students/agents
- Admin route (`/admin`) is restricted to ADMIN role
- Bottom navigation shows: Home, Browse, Roommates, Messages, Settings, Profile

---

## AGENT

### What they can access
- Public property listings and details
- Agent dashboard (`/dashboard`)
- Property management pages
- Verification page
- Agent requests page
- Conversations
- Profile and settings
- Notifications

### What they can create
- Account (`POST /auth/register/agent`)
- Property listings (`POST /properties`)
- Verification submissions (`POST /agents/verification`)

### What they can edit
- Own profile (`PATCH /users`)
- Own properties (`PATCH /properties/:id`)
- Booking responses (`PATCH /bookings/:id/respond`)
- Accommodation request status (`PATCH /accommodation-requests/:id`) — for open requests

### What they can delete
- Own properties (`DELETE /properties/:id`)

### What they can view
- Own properties (`GET /properties/mine`)
- Property bookings (`GET /bookings/agent`)
- Open accommodation requests (`GET /accommodation-requests/open`)
- Own verification (`GET /agents/verification/my`)
- Own sessions (`GET /sessions/`)

### What they cannot access
- Student-only features (roommate matching, accommodation request creation as student)
- Admin dashboard and moderation routes
- Other agents' properties

### Frontend restrictions
- Protected routes redirect unauthenticated users to `/login`
- Agent-only routes: `/dashboard/properties`, `/verification`, `/dashboard/requests`
- Bottom navigation shows: Home, Properties, Add Property, Messages, Settings, Profile

---

## ADMIN

### What they can access
- Admin dashboard (`/admin`)
- All public pages

### What they can create
- Admin actions: approve/reject verifications, moderate listings, manage users — via PATCH/DELETE routes

### What they can edit
- User active status (`PATCH /admin/users/:userId/active`)
- Verification decisions (`PATCH /admin/verifications/:id/approve`, `/reject`)
- Property moderation (`PATCH /properties/:id/moderate`)

### What they can delete
- Fraudulent listings (`DELETE /admin/properties/:id`)

### What they can view
- Admin stats (`GET /admin/stats`)
- Admin analytics (`GET /admin/analytics`)
- All students (`GET /admin/students`)
- All agents (`GET /admin/agents`)
- All bookings (`GET /admin/bookings`)
- Pending properties (`GET /admin/properties/pending`)
- All verifications (`GET /admin/verifications`, `/admin/verifications/:id`)
- Flagged reviews (`GET /reviews/admin/flagged`)
- All notifications (`GET /notifications/`)

### What they cannot access
- Agent property creation/editing (uses admin routes instead)
- Student-specific features

### Frontend restrictions
- Admin dashboard is protected by `allowedRoles={['ADMIN']}`
- Admin routes redirect non-admin users to `/`

---

## Unauthenticated

### What they can access
- Landing page
- Login and registration pages
- Public property listings (`/properties`)
- Property details (`/properties/:id`)
- About, Contact, Privacy, Terms, Help pages

### What they cannot access
- Any authenticated route
- Dashboard, profile, settings, notifications, conversations
- Roommate features
- Accommodation request features
- Agent dashboard
- Admin dashboard
