# API Documentation

Base URL: `/api/v1`

All authenticated routes require a `Bearer` token in the `Authorization` header.
All success responses follow the shape: `{ success: true, data: T }`.
All error responses follow the shape: `{ success: false, message: string }`.

## AUTH

### Register Student
`POST /auth/register/student`

**Authentication:** None

**Request body:**
```json
{
  "email": "string (required, email)",
  "password": "string (required, min 8 chars, uppercase, number)",
  "firstName": "string (required)",
  "lastName": "string (required)",
  "universityId": "string (required)",
  "phone": "string (optional)",
  "acceptedTerms": "boolean (required, must be true)",
  "acceptedTermsVersion": "string (required)",
  "acceptedTermsAt": "string (optional, ISO date)"
}
```

**Response:** `201 Created` — `{ success: true, data: { accessToken, refreshToken } }`

### Register Agent
`POST /auth/register/agent`

**Authentication:** None

**Request body:**
```json
{
  "email": "string (required, email)",
  "password": "string (required, min 8 chars, uppercase, number)",
  "firstName": "string (required)",
  "lastName": "string (required)",
  "phone": "string (required)",
  "businessName": "string (optional)",
  "acceptedTerms": "boolean (required, must be true)",
  "acceptedTermsVersion": "string (required)",
  "acceptedTermsAt": "string (optional, ISO date)"
}
```

**Response:** `201 Created` — `{ success: true, data: { accessToken, refreshToken } }`

### Login
`POST /auth/login`

**Authentication:** None  
**Rate limit:** 10 attempts per 15 minutes

**Request body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response:** `200 OK` — `{ success: true, data: { accessToken, refreshToken } }`

### Refresh
`POST /auth/refresh`

**Authentication:** None

**Request body:**
```json
{
  "refreshToken": "string (required)"
}
```

**Response:** `200 OK` — `{ success: true, data: { accessToken, refreshToken } }`

### Logout
`POST /auth/logout`

**Authentication:** None

**Request body:**
```json
{
  "refreshToken": "string (required)"
}
```

**Response:** `200 OK` — `{ success: true, data: null }`

### Accept Terms
`POST /auth/accept-terms`

**Authentication:** Required (any role)

**Request body:**
```json
{
  "acceptedTermsVersion": "string (required)"
}
```

**Response:** `200 OK` — `{ success: true, data: { acceptedTerms, acceptedTermsVersion, acceptedTermsAt } }`

### Get Me
`GET /auth/me`

**Authentication:** Required (any role)

**Response:** `200 OK` — `{ success: true, data: { id, email, role, isVerified, isActive, student?, agent?, admin? } }`

### List Universities
`GET /universities`

**Authentication:** None

**Response:** `200 OK` — `{ success: true, data: University[] }`

---

## PROPERTIES

### List Properties
`GET /properties`

**Authentication:** None

**Query parameters:**
- `minPrice` — number, optional
- `maxPrice` — number, optional
- `maxDistanceKm` — number, optional
- `gender` — `MALE` | `FEMALE` | `ANY`, optional
- `roomType` — `SELF_CONTAIN` | `SHARED` | `ONE_BEDROOM` | `TWO_BEDROOM` | `HOSTEL`, optional
- `amenityIds` — string or comma-separated strings, optional
- `availableOnly` — boolean, optional
- `page` — number, default 1
- `pageSize` — number, default 12, max 50

**Response:** `200 OK` — `{ success: true, data: { items: Property[], total, page, pageSize, totalPages } }`

**Note:** Only `APPROVED` properties are returned publicly.

### Get Property
`GET /properties/:id`

**Authentication:** None

**Response:** `200 OK` — `{ success: true, data: Property }`

### List Amenities
`GET /properties/amenities`

**Authentication:** None

**Response:** `200 OK` — `{ success: true, data: Amenity[] }`

### Public Stats
`GET /properties/public-stats`

**Authentication:** None

**Response:** `200 OK` — `{ success: true, data: PublicStats }`

### Create Property
`POST /properties`

**Authentication:** Required (AGENT)  
**Rate limit:** 20 requests per hour

**Request body:**
```json
{
  "title": "string (required, 3-120 chars)",
  "description": "string (required, 10-2000 chars)",
  "price": "number (required, positive)",
  "location": "string (required, min 2 chars)",
  "distanceFromCampusKm": "number (required, non-negative)",
  "bedrooms": "number (required, positive int)",
  "bathrooms": "number (required, positive int)",
  "roomType": "RoomType enum (required)",
  "genderRestriction": "Gender enum (required)",
  "amenityIds": "string[] (optional, default [])",
  "images": "string[] (required, 1-10 base64/urls)",
  "ownerConfirmation": "boolean (required, must be true)",
  "estimatedMoveInCost": "number (optional)",
  "agentFee": "number (optional)",
  "legalFee": "number (optional)",
  "cautionFee": "number (optional)",
  "serviceCharge": "number (optional)",
  "electricityNote": "string (optional)",
  "waterNote": "string (optional)",
  "internetNote": "string (optional)",
  "securityNote": "string (optional)",
  "rulesNotes": "string (optional)",
  "furnished": "boolean (optional)",
  "hasGenerator": "boolean (optional)",
  "hasInverter": "boolean (optional)",
  "hasSolar": "boolean (optional)",
  "hasBorehole": "boolean (optional)",
  "hasSecurity": "boolean (optional)",
  "hasGate": "boolean (optional)",
  "hasWifi": "boolean (optional)",
  "allowsCooking": "boolean (optional)",
  "allowsVisitors": "boolean (optional)",
  "allowsGenerator": "boolean (optional)",
  "allowsAppliances": "boolean (optional)",
  "hasCurfew": "boolean (optional)",
  "propertyCondition": "string (optional)"
}
```

**Response:** `201 Created` — `{ success: true, data: Property }`

### Update Property
`PATCH /properties/:id`

**Authentication:** Required (AGENT, must own property)

**Request body:** Same as create but all fields optional.

**Response:** `200 OK` — `{ success: true, data: Property }`

**Note:** Editing a listing resets its status to `PENDING` for re-review, unless only `isAvailable` changed.

### Delete Property
`DELETE /properties/:id`

**Authentication:** Required (AGENT, must own property)

**Response:** `200 OK` — `{ success: true, data: null }`

### List My Properties
`GET /properties/mine`

**Authentication:** Required (AGENT)

**Response:** `200 OK` — `{ success: true, data: Property[] }`

### List Favourites
`GET /properties/favourites`

**Authentication:** Required (STUDENT)

**Response:** `200 OK` — `{ success: true, data: Property[] }`

### Toggle Favourite
`POST /properties/:id/favourite`

**Authentication:** Required (STUDENT)

**Response:** `200 OK` — `{ success: true, data: { favourited: boolean } }`

### List Pending Properties (Admin)
`GET /properties/pending/all`

**Authentication:** Required (ADMIN)

**Response:** `200 OK` — `{ success: true, data: Property[] }`

### Moderate Property (Admin)
`PATCH /properties/:id/moderate`

**Authentication:** Required (ADMIN)

**Request body:**
```json
{
  "status": "APPROVED" | "REJECTED" | "SUSPENDED",
  "rejectionReason": "string (optional)"
}
```

**Response:** `200 OK` — `{ success: true, data: Property }`

---

## BOOKINGS

### Create Booking
`POST /bookings`

**Authentication:** Required (STUDENT)  
**Rate limit:** 30 requests per hour

**Request body:**
```json
{
  "propertyId": "string (required)",
  "moveInDate": "date string (required)",
  "message": "string (optional, max 500 chars)"
}
```

**Response:** `201 Created` — `{ success: true, data: Booking }`

### List My Bookings
`GET /bookings/mine`

**Authentication:** Required (STUDENT)

**Response:** `200 OK` — `{ success: true, data: Booking[] }`

### Cancel Booking
`PATCH /bookings/:id/cancel`

**Authentication:** Required (STUDENT, must own booking)

**Response:** `200 OK` — `{ success: true, data: Booking }`

### List Agent Bookings
`GET /bookings/agent`

**Authentication:** Required (AGENT)

**Response:** `200 OK` — `{ success: true, data: Booking[] }`

### Respond to Booking
`PATCH /bookings/:id/respond`

**Authentication:** Required (AGENT, must own property)

**Request body:**
```json
{
  "status": "APPROVED" | "REJECTED"
}
```

**Response:** `200 OK` — `{ success: true, data: Booking }`

**Note:** Approving auto-marks property unavailable and rejects other pending requests.

---

## ROOMMATES

All roommate routes require STUDENT role.

### Get My Profile
`GET /roommates/profile`

**Authentication:** Required (STUDENT)

**Response:** `200 OK` — `{ success: true, data: RoommateProfile | null }`

### Upsert My Profile
`PUT /roommates/profile`

**Authentication:** Required (STUDENT)

**Request body:**
```json
{
  "budgetMin": "number (required, non-negative)",
  "budgetMax": "number (required, positive)",
  "genderPreference": "MALE | FEMALE | ANY (required)",
  "sleepSchedule": "EARLY_BIRD | NIGHT_OWL | FLEXIBLE (required)",
  "cleanliness": "RELAXED | MODERATE | VERY_CLEAN (required)",
  "isSmoker": "boolean (required)",
  "noiseTolerance": "LOW | MEDIUM | HIGH (required)",
  "bio": "string (optional, max 500 chars)",
  "isActive": "boolean (required)"
}
```

**Response:** `200 OK` — `{ success: true, data: RoommateProfile }`

### Get Profile By ID
`GET /roommates/profile/:id`

**Authentication:** Required (STUDENT)

**Response:** `200 OK` — `{ success: true, data: { student, roommateProfile } }`

### Get Matches
`GET /roommates/matches`

**Authentication:** Required (STUDENT)

**Query parameters:**
- `budgetMin`, `budgetMax`, `genderPreference`, `sleepSchedule`, `cleanliness`, `isSmoker`, `noiseTolerance`, `faculty`, `level`

**Response:** `200 OK` — `{ success: true, data: RoommateMatchCandidate[] }`

### Send Match Request
`POST /roommates/match-requests`

**Authentication:** Required (STUDENT)

**Request body:**
```json
{
  "receiverId": "string (required, cuid)",
  "message": "string (optional, max 500 chars)"
}
```

**Response:** `201 Created` — `{ success: true, data: RoommateMatchRequest }`

### Respond to Match Request
`PATCH /roommates/match-requests/:requestId`

**Authentication:** Required (STUDENT)

**Request body:**
```json
{
  "accept": "boolean (required)"
}
```

**Response:** `200 OK` — `{ success: true, data: { success: boolean, status: string } }`

### Get Sent Match Requests
`GET /roommates/match-requests/sent`

**Authentication:** Required (STUDENT)

**Response:** `200 OK` — `{ success: true, data: RoommateMatchRequest[] }`

### Get Received Match Requests
`GET /roommates/match-requests/received`

**Authentication:** Required (STUDENT)

**Response:** `200 OK` — `{ success: true, data: RoommateMatchRequest[] }`

### Get Saved Matches
`GET /roommates/saved`

**Authentication:** Required (STUDENT)

**Response:** `200 OK` — `{ success: true, data: SavedMatch[] }`

---

## ACCOMMODATION REQUESTS

### Create Request
`POST /accommodation-requests`

**Authentication:** Required

**Request body:**
```json
{
  "universityId": "string (required)",
  "preferredLocation": "string (required, 1-200 chars)",
  "budgetMin": "number (optional, positive)",
  "budgetMax": "number (optional, positive)",
  "roomType": "RoomTypePreference enum (required)",
  "genderPreference": "Gender enum (required)",
  "moveInDate": "string (optional, ISO date)",
  "numberOfOccupants": "number (optional, 1-10)",
  "roommateRequired": "boolean (optional)",
  "preferences": "string (optional, max 1000 chars)",
  "additionalNotes": "string (optional, max 2000 chars)"
}
```

**Response:** `201 Created` — `{ success: true, data: AccommodationRequest }`

### List My Requests
`GET /accommodation-requests/mine`

**Authentication:** Required

**Query parameters:** `page`, `pageSize`, `status`

**Response:** `200 OK` — `{ success: true, data: { requests, total, page, pageSize } }`

### List Open Requests
`GET /accommodation-requests/open`

**Authentication:** Required (AGENT or ADMIN)

**Query parameters:** `universityId`, `roomType`, `minBudget`, `maxBudget`, `status`, `page`, `pageSize`

**Response:** `200 OK` — `{ success: true, data: { requests, total, page, pageSize } }`

### Get Request
`GET /accommodation-requests/:id`

**Authentication:** Required (owner or ADMIN)

**Response:** `200 OK` — `{ success: true, data: AccommodationRequest }`

### Update Request
`PATCH /accommodation-requests/:id`

**Authentication:** Required (owner or ADMIN)

**Request body:** Partial update of creation fields + `status`

**Response:** `200 OK` — `{ success: true, data: AccommodationRequest }`

### Delete Request
`DELETE /accommodation-requests/:id`

**Authentication:** Required (owner or ADMIN)

**Response:** `200 OK` — `{ success: true, data: { success: true } }`

---

## CONVERSATIONS

All conversation routes require authentication.

### Create Conversation
`POST /conversations`

**Authentication:** Required

**Request body (property chat):**
```json
{
  "propertyId": "string (required)",
  "initialMessage": "string (optional)"
}
```

**Request body (roommate chat):**
```json
{
  "roommateStudentId": "string (required)",
  "initialMessage": "string (optional)"
}
```

**Response:** `201 Created` — `{ success: true, data: ConversationSummary }`

### List Conversations
`GET /conversations`

**Authentication:** Required

**Response:** `200 OK` — `{ success: true, data: ConversationSummary[] }`

### Get Conversation
`GET /conversations/:id`

**Authentication:** Required (participant only)

**Response:** `200 OK` — `{ success: true, data: ConversationSummary }`

### List Messages
`GET /conversations/:id/messages`

**Authentication:** Required (participant only)

**Query parameters:** `cursor` (optional), `limit` (optional)

**Response:** `200 OK` — `{ success: true, data: ConversationMessagesPage }`

### Send Message
`POST /conversations/:id/messages`

**Authentication:** Required (participant only)

**Request body:**
```json
{
  "content": "string (optional)",
  "messageType": "TEXT | IMAGE | SYSTEM (optional)",
  "attachments": "Attachment[] (optional, max 5)"
}
```

**Response:** `201 Created` — `{ success: true, data: Message }`

### Upload Message File
`POST /conversations/messages/upload`

**Authentication:** Required

**Request body:**
```json
{
  "file": "string (required, base64 or URL)",
  "fileName": "string (optional)",
  "mimeType": "string (required)"
}
```

**Response:** `201 Created` — `{ success: true, data: ConversationAttachment }`

### Mark Message Read
`PATCH /conversations/messages/:id/read`

**Authentication:** Required

**Response:** `200 OK` — `{ success: true, data: null }`

### Archive Conversation
`DELETE /conversations/:id`

**Authentication:** Required (participant only)

**Response:** `200 OK` — `{ success: true, data: ConversationSummary }`

---

## NOTIFICATIONS

All notification routes require authentication.

### List Notifications
`GET /notifications`

**Authentication:** Required

**Response:** `200 OK` — `{ success: true, data: { notifications: Notification[], unreadCount: number } }`

### Mark Notification Read
`PATCH /notifications/:id/read`

**Authentication:** Required

**Response:** `200 OK` — `{ success: true, data: null }`

### Mark All Notifications Read
`PATCH /notifications/read-all`

**Authentication:** Required

**Response:** `200 OK` — `{ success: true, data: null }`

### Delete Notification
`DELETE /notifications/:id`

**Authentication:** Required

**Response:** `200 OK` — `{ success: true, data: null }`

---

## PREFERENCES

All preference routes require authentication.

### Get Notification Preferences
`GET /preferences/notifications`

**Authentication:** Required

**Response:** `200 OK` — `{ success: true, data: { inApp, email, push, securityNotifEnabled } }`

### Update Notification Preferences
`PATCH /preferences/notifications`

**Authentication:** Required

**Request body:**
```json
{
  "inApp": "boolean (optional)",
  "email": "boolean (optional)",
  "push": "boolean (optional)",
  "securityNotifEnabled": "boolean (optional, cannot be set to false)"
}
```

**Response:** `200 OK` — `{ success: true, data: { inApp, email, push, securityNotifEnabled } }`

---

## SESSIONS

All session routes require authentication.

### List Sessions
`GET /sessions/`

**Authentication:** Required

**Response:** `200 OK` — `{ success: true, data: RefreshToken[] }`

### Revoke Session
`DELETE /sessions/:id`

**Authentication:** Required

**Response:** `200 OK` — `{ success: true, data: null }`

### Revoke All Other Sessions
`POST /sessions/revoke-others`

**Authentication:** Required

**Request body:**
```json
{
  "keepId": "string (optional, session ID to keep)"
}
```

**Response:** `200 OK` — `{ success: true, data: null }`

---

## USERS

### Get Me
`GET /users/me`

**Authentication:** Required

**Response:** `200 OK` — `{ success: true, data: UserProfile }`

### Update Me
`PATCH /users/`

**Authentication:** Required

**Request body:**
```json
{
  "firstName": "string (optional, 2-80 chars)",
  "lastName": "string (optional, 2-80 chars)",
  "phone": "string | null (optional, max 20 chars)",
  "faculty": "string | null (optional, max 120 chars)",
  "level": "string | null (optional, max 40 chars)",
  "avatarUrl": "string | null (optional, URL)",
  "businessName": "string | null (optional, max 120 chars)",
  "universityId": "string (optional)"
}
```

**Response:** `200 OK` — `{ success: true, data: UserProfile }`

---

## AGENT VERIFICATION

### Submit Verification
`POST /agents/verification`

**Authentication:** Required (AGENT)

**Request body:**
```json
{
  "idDocument": "string (required, base64 or URL)",
  "selfie": "string (optional, base64 or URL)",
  "proofOfOwnership": "string (optional, base64 or URL)"
}
```

**Response:** `201 Created` — `{ success: true, data: AgentVerification }`

### Get My Verification
`GET /agents/verification/my`

**Authentication:** Required (AGENT)

**Response:** `200 OK` — `{ success: true, data: AgentVerification }`

### List Verifications (Admin)
`GET /admin/verifications`

**Authentication:** Required (ADMIN)

**Query parameters:** `page`, `pageSize`

**Response:** `200 OK` — `{ success: true, data: AgentVerification[] }`

### Get Verification (Admin)
`GET /admin/verifications/:id`

**Authentication:** Required (ADMIN)

**Response:** `200 OK` — `{ success: true, data: AgentVerification }`

### Approve Verification (Admin)
`PATCH /admin/verifications/:id/approve`

**Authentication:** Required (ADMIN)

**Request body:**
```json
{
  "adminNotes": "string (optional)"
}
```

**Response:** `200 OK` — `{ success: true, data: AgentVerification }`

### Reject Verification (Admin)
`PATCH /admin/verifications/:id/reject`

**Authentication:** Required (ADMIN)

**Request body:**
```json
{
  "adminNotes": "string (optional)"
}
```

**Response:** `200 OK` — `{ success: true, data: AgentVerification }`

---

## REVIEWS

### Create Review
`POST /properties/:propertyId/reviews`

**Authentication:** Required (STUDENT, must have completed booking)

**Request body:**
```json
{
  "rating": "integer (required, 1-5)",
  "comment": "string (optional, max 2000 chars)"
}
```

**Response:** `201 Created` — `{ success: true, data: Review }`

### Get Property Reviews
`GET /properties/:propertyId/reviews`

**Authentication:** None

**Query parameters:** `page`, `pageSize`

**Response:** `200 OK` — `{ success: true, data: { reviews, total, page, pageSize, averageRating } }`

### Get My Review
`GET /reviews/my`

**Authentication:** Required

**Response:** `200 OK` — `{ success: true, data: Review | null }`

### Update Review
`PATCH /reviews/reviews/:id`

**Authentication:** Required (owner or ADMIN)

**Request body:**
```json
{
  "rating": "integer (optional, 1-5)",
  "comment": "string (optional)",
  "isApproved": "boolean (optional, admin only)",
  "isFlagged": "boolean (optional, admin only)",
  "flaggedReason": "string (optional)",
  "agentResponse": "string (optional, max 2000 chars)"
}
```

**Response:** `200 OK` — `{ success: true, data: Review }`

### Delete Review
`DELETE /reviews/reviews/:id`

**Authentication:** Required (owner or ADMIN)

**Response:** `200 OK` — `{ success: true, data: { success: true } }`

### Vote Helpful
`POST /reviews/reviews/:id/helpful`

**Authentication:** Required

**Request body:**
```json
{
  "helpful": "boolean (required)"
}
```

**Response:** `200 OK` — `{ success: true, data: Review }`

### List Flagged Reviews (Admin)
`GET /reviews/admin/flagged`

**Authentication:** Required (ADMIN)

**Query parameters:** `page`, `pageSize`

**Response:** `200 OK` — `{ success: true, data: { reviews, total, page, pageSize } }`

---

## ADMIN

### Get Stats
`GET /admin/stats`

**Authentication:** Required (ADMIN)

**Response:** `200 OK` — `{ success: true, data: AdminStats }`

### Get Analytics
`GET /admin/analytics`

**Authentication:** Required (ADMIN)

**Response:** `200 OK` — `{ success: true, data: { listingsTrend, bookingsTrend } }`

### List Students
`GET /admin/students`

**Authentication:** Required (ADMIN)

**Query parameters:** `page`, `pageSize`

**Response:** `200 OK` — `{ success: true, data: { items, total, page, pageSize, totalPages } }`

### List Agents
`GET /admin/agents`

**Authentication:** Required (ADMIN)

**Query parameters:** `page`, `pageSize`

**Response:** `200 OK` — `{ success: true, data: { items, total, page, pageSize, totalPages } }`

### List Bookings
`GET /admin/bookings`

**Authentication:** Required (ADMIN)

**Query parameters:** `page`, `pageSize`

**Response:** `200 OK` — `{ success: true, data: { items, total, page, pageSize, totalPages } }`

### Set User Active
`PATCH /admin/users/:userId/active`

**Authentication:** Required (ADMIN)

**Request body:**
```json
{
  "isActive": "boolean (required)"
}
```

**Response:** `200 OK` — `{ success: true, data: User }`

**Note:** Cannot deactivate ADMIN accounts.

### Remove Fraudulent Listing
`DELETE /admin/properties/:id`

**Authentication:** Required (ADMIN)

**Response:** `200 OK` — `{ success: true, data: null }`

---

## HEALTH

### Health Check
`GET /health`

**Authentication:** None

**Response:** `200 OK` — `{ status: "ok", version: string, environment: string }`
