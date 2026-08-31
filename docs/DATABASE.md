# Database Documentation

## Technology

- PostgreSQL
- Prisma ORM (v5.20.0)
- Prisma Client generated from `backend/prisma/schema.prisma`

## Prisma Configuration

- **Provider:** `prisma-client-js`
- **Binary targets:** `native`, `linux-musl-openssl-3.0.x`
- **Datasource:** PostgreSQL at `env("DATABASE_URL")`

## Enums

| Enum | Values | Used By |
|------|--------|---------|
| `Role` | `STUDENT`, `AGENT`, `ADMIN` | `User` model |
| `Gender` | `MALE`, `FEMALE`, `ANY` | `Student`, `Property`, `RoommateProfile` |
| `RoomType` | `SELF_CONTAIN`, `SHARED`, `ONE_BEDROOM`, `TWO_BEDROOM`, `HOSTEL` | `Property` |
| `ListingStatus` | `PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED` | `Property` |
| `BookingStatus` | `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`, `COMPLETED` | `Booking` |
| `SleepSchedule` | `EARLY_BIRD`, `NIGHT_OWL`, `FLEXIBLE` | `RoommateProfile` |
| `CleanlinessLevel` | `RELAXED`, `MODERATE`, `VERY_CLEAN` | `RoommateProfile` |
| `NoiseTolerance` | `LOW`, `MEDIUM`, `HIGH` | `RoommateProfile` |
| `NotificationType` | `BOOKING_UPDATE`, `MESSAGE`, `LISTING_STATUS`, `ROOMMATE_MATCH`, `ROOMMATE_MATCH_REQUEST`, `ROOMMATE_MATCH_ACCEPTED`, `ROOMMATE_MATCH_DECLINED`, `SYSTEM`, `PROPERTY_INQUIRY`, `INSPECTION_CONFIRMED`, `VERIFICATION_APPROVED`, `PROPERTY_APPROVED`, `SECURITY_ALERT`, `ACCOUNT_WARNING`, `REQUEST_CREATED`, `REQUEST_RESPONSE`, `REVIEW_SUBMITTED` | `Notification` |
| `VerificationStatus` | `PENDING`, `UNDER_REVIEW`, `VERIFIED`, `REJECTED`, `SUSPENDED` | `AgentVerification` |
| `ConversationType` | `PROPERTY_CHAT`, `ROOMMATE_CHAT` | `Conversation` |
| `MessageType` | `TEXT`, `IMAGE`, `SYSTEM` | `Message` |
| `AttachmentType` | `IMAGE`, `PDF` | `MessageAttachment` |
| `RoomTypePreference` | `SELF_CONTAIN`, `SHARED`, `ONE_BEDROOM`, `TWO_BEDROOM`, `HOSTEL`, `ANY` | `AccommodationRequest` |
| `RequestStatus` | `OPEN`, `IN_PROGRESS`, `CLOSED` | `AccommodationRequest` |
| `MatchRequestStatus` | `PENDING`, `ACCEPTED`, `DECLINED`, `EXPIRED` | `RoommateMatchRequest` |

## Models

### University
**Table:** `universities`

| Field | Type | Notes |
|-------|------|-------|
| `id` | String (CUID) | PK |
| `name` | String | Unique |
| `slug` | String | Unique |
| `city` | String | |
| `country` | String | Default: "Nigeria" |
| `createdAt` | DateTime | |

**Relations:** students, properties, accommodationRequests

---

### User
**Table:** `users`

| Field | Type | Notes |
|-------|------|-------|
| `id` | String (CUID) | PK |
| `email` | String | Unique |
| `passwordHash` | String | |
| `role` | Role | STUDENT, AGENT, or ADMIN |
| `isVerified` | Boolean | Default: false |
| `isActive` | Boolean | Default: true |
| `twoFactorEnabled` | Boolean | Default: false |
| `acceptedTerms` | Boolean? | Default: false |
| `acceptedTermsVersion` | String? | |
| `acceptedTermsAt` | DateTime? | |
| `pushToken` | String? | |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

**Relations:** student, agent, admin, verificationRequests, notifications, sentMessages, refreshTokens, preferences

---

### UserPreference
**Table:** `user_preferences`

| Field | Type | Notes |
|-------|------|-------|
| `id` | String (CUID) | PK |
| `userId` | String | Unique, FK to User |
| `inApp` | Boolean | Default: true |
| `email` | Boolean | Default: true |
| `push` | Boolean | Default: false |
| `securityNotifEnabled` | Boolean | Default: true |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

---

### RefreshToken
**Table:** `refresh_tokens`

| Field | Type | Notes |
|-------|------|-------|
| `id` | String (CUID) | PK |
| `token` | String | Unique |
| `userId` | String | FK to User |
| `expiresAt` | DateTime | |
| `createdAt` | DateTime | |
| `revoked` | Boolean | Default: false |

**Indexes:** userId

---

### Student
**Table:** `students`

| Field | Type | Notes |
|-------|------|-------|
| `id` | String (CUID) | PK |
| `userId` | String | Unique, FK to User |
| `firstName` | String | |
| `lastName` | String | |
| `phone` | String? | |
| `universityId` | String | FK to University |
| `faculty` | String? | |
| `level` | String? | |
| `gender` | Gender? | Default: ANY |
| `avatarUrl` | String? | |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

**Relations:** bookings, favourites, roommateProfile, reviews, conversationsAsPrimary, conversationsAsSecondary, roommateMatchesAsStudentA, roommateMatchesAsStudentB, sentMatchRequests, receivedMatchRequests, savedMatchs, savedTarget, accommodationRequests

**Indexes:** universityId

---

### Agent
**Table:** `agents`

| Field | Type | Notes |
|-------|------|-------|
| `id` | String (CUID) | PK |
| `userId` | String | Unique, FK to User |
| `firstName` | String | |
| `lastName` | String | |
| `phone` | String | |
| `businessName` | String? | |
| `isVerified` | Boolean | Default: false |
| `avatarUrl` | String? | |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

**Relations:** properties, conversations, verificationRequests

---

### AgentVerification
**Table:** `agent_verifications`

| Field | Type | Notes |
|-------|------|-------|
| `id` | String (CUID) | PK |
| `userId` | String | FK to User |
| `agentId` | String? | FK to Agent, SetNull on delete |
| `idDocumentUrl` | String | |
| `selfieUrl` | String? | |
| `proofOfOwnershipUrl` | String? | |
| `status` | VerificationStatus | Default: PENDING |
| `adminNotes` | String? | |
| `createdAt` | DateTime | |
| `reviewedAt` | DateTime? | |
| `submitterConfirmation` | Boolean? | |

**Indexes:** userId, status

---

### Admin
**Table:** `admins`

| Field | Type | Notes |
|-------|------|-------|
| `id` | String (CUID) | PK |
| `userId` | String | Unique, FK to User |
| `firstName` | String | |
| `lastName` | String | |
| `createdAt` | DateTime | |

---

### Property
**Table:** `properties`

| Field | Type | Notes |
|-------|------|-------|
| `id` | String (CUID) | PK |
| `agentId` | String | FK to Agent |
| `universityId` | String | FK to University |
| `title` | String | |
| `description` | String | |
| `price` | Decimal(10,2) | |
| `location` | String | Text location description |
| `distanceFromCampusKm` | Decimal(5,2) | |
| `bedrooms` | Int | |
| `bathrooms` | Int | |
| `roomType` | RoomType | |
| `genderRestriction` | Gender | Default: ANY |
| `isAvailable` | Boolean | Default: true |
| `status` | ListingStatus | Default: PENDING |
| `rejectionReason` | String? | |
| `latitude` | Decimal(10,8)? | |
| `longitude` | Decimal(11,8)? | |
| `formattedAddress` | String? | |
| `placeId` | String? | |
| `locationVisibility` | String? | Default: "public" |
| `estimatedMoveInCost` | Decimal(12,2)? | |
| `agentFee` | Decimal(10,2)? | |
| `legalFee` | Decimal(10,2)? | |
| `cautionFee` | Decimal(10,2)? | |
| `serviceCharge` | Decimal(10,2)? | |
| `electricityNote` | String? | |
| `waterNote` | String? | |
| `internetNote` | String? | |
| `securityNote` | String? | |
| `rulesNotes` | String? | |
| `furnished` | Boolean? | Default: false |
| `hasGenerator` | Boolean? | Default: false |
| `hasInverter` | Boolean? | Default: false |
| `hasSolar` | Boolean? | Default: false |
| `hasBorehole` | Boolean? | Default: false |
| `hasSecurity` | Boolean? | Default: false |
| `hasGate` | Boolean? | Default: false |
| `hasWifi` | Boolean? | Default: false |
| `allowsCooking` | Boolean? | Default: true |
| `allowsVisitors` | Boolean? | Default: true |
| `allowsGenerator` | Boolean? | Default: true |
| `allowsAppliances` | Boolean? | Default: true |
| `hasCurfew` | Boolean? | Default: false |
| `propertyCondition` | String? | |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

**Relations:** images, amenities, bookings, favourites, reviews, conversations

**Indexes:** universityId + status, agentId

---

### PropertyImage
**Table:** `property_images`

| Field | Type | Notes |
|-------|------|-------|
| `id` | String (CUID) | PK |
| `propertyId` | String | FK to Property |
| `url` | String | Cloudinary URL |
| `publicId` | String | Cloudinary public_id |
| `isPrimary` | Boolean | Default: false |
| `createdAt` | DateTime | |

**Indexes:** propertyId

---

### Amenity
**Table:** `amenities`

| Field | Type | Notes |
|-------|------|-------|
| `id` | String (CUID) | PK |
| `name` | String | Unique |

---

### PropertyAmenity
**Table:** `property_amenities`

| Field | Type | Notes |
|-------|------|-------|
| `propertyId` | String | PK, FK to Property |
| `amenityId` | String | PK, FK to Amenity |

---

### Booking
**Table:** `bookings`

| Field | Type | Notes |
|-------|------|-------|
| `id` | String (CUID) | PK |
| `studentId` | String | FK to Student |
| `propertyId` | String | FK to Property |
| `status` | BookingStatus | Default: PENDING |
| `moveInDate` | DateTime | |
| `message` | String? | |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

**Indexes:** propertyId + status, studentId

---

### Review
**Table:** `reviews`

| Field | Type | Notes |
|-------|------|-------|
| `id` | String (CUID) | PK |
| `studentId` | String | FK to Student |
| `propertyId` | String | FK to Property |
| `rating` | Int | 1-5 |
| `comment` | String? | |
| `isApproved` | Boolean | Default: true |
| `isFlagged` | Boolean | Default: false |
| `flaggedReason` | String? | |
| `helpfulCount` | Int | Default: 0 |
| `unhelpfulCount` | Int | Default: 0 |
| `agentResponse` | String? | |
| `agentRespondedAt` | DateTime? | |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

**Unique:** studentId + propertyId

---

### Favourite
**Table:** `favourites`

| Field | Type | Notes |
|-------|------|-------|
| `studentId` | String | PK, FK to Student |
| `propertyId` | String | PK, FK to Property |
| `createdAt` | DateTime | |

---

### RoommateProfile
**Table:** `roommate_profiles`

| Field | Type | Notes |
|-------|------|-------|
| `id` | String (CUID) | PK |
| `studentId` | String | Unique, FK to Student |
| `budgetMin` | Decimal(10,2) | |
| `budgetMax` | Decimal(10,2) | |
| `genderPreference` | Gender | Default: ANY |
| `sleepSchedule` | SleepSchedule | |
| `cleanliness` | CleanlinessLevel | |
| `isSmoker` | Boolean | Default: false |
| `noiseTolerance` | NoiseTolerance | |
| `bio` | String? | |
| `isActive` | Boolean | Default: true |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

---

### RoommateMatch
**Table:** `roommate_matches`

| Field | Type | Notes |
|-------|------|-------|
| `id` | String (CUID) | PK |
| `studentAId` | String | FK to Student |
| `studentBId` | String | FK to Student |
| `score` | Int | 0-100 compatibility |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

**Unique:** studentAId + studentBId  
**Relations:** conversation

---

### RoommateMatchRequest
**Table:** `roommate_match_requests`

| Field | Type | Notes |
|-------|------|-------|
| `id` | String (CUID) | PK |
| `senderId` | String | FK to Student |
| `receiverId` | String | FK to Student |
| `status` | MatchRequestStatus | Default: PENDING |
| `message` | String? | |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |
| `respondedAt` | DateTime? | |

**Unique:** senderId + receiverId  
**Indexes:** senderId, receiverId + status

---

### RoommateMatchFavourite
**Table:** `roommate_match_favourites`

| Field | Type | Notes |
|-------|------|-------|
| `id` | String (CUID) | PK |
| `studentId` | String | FK to Student |
| `targetId` | String | FK to Student |
| `createdAt` | DateTime | |

**Unique:** studentId + targetId

---

### Conversation
**Table:** `conversations`

| Field | Type | Notes |
|-------|------|-------|
| `id` | String (CUID) | PK |
| `type` | ConversationType | Default: PROPERTY_CHAT |
| `propertyId` | String? | FK to Property |
| `roommateMatchId` | String? | Unique, FK to RoommateMatch |
| `primaryStudentId` | String? | FK to Student |
| `secondaryStudentId` | String? | FK to Student |
| `agentId` | String? | FK to Agent |
| `lastMessageId` | String? | |
| `lastMessageContent` | String? | |
| `lastMessageType` | MessageType? | |
| `lastMessageAt` | DateTime? | |
| `lastMessageSenderId` | String? | |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |
| `isArchived` | Boolean | Default: false |

**Unique:** propertyId + primaryStudentId + agentId  
**Indexes:** type + updatedAt, propertyId, primaryStudentId, secondaryStudentId, agentId

---

### Message
**Table:** `messages`

| Field | Type | Notes |
|-------|------|-------|
| `id` | String (CUID) | PK |
| `conversationId` | String | FK to Conversation |
| `senderId` | String | FK to User |
| `content` | String | |
| `messageType` | MessageType | Default: TEXT |
| `isRead` | Boolean | Default: false |
| `readAt` | DateTime? | |
| `deliveredAt` | DateTime? | Default: now() |
| `deletedAt` | DateTime? | |
| `deletedByUserId` | String? | |
| `createdAt` | DateTime | |

**Relations:** attachments

**Indexes:** conversationId + createdAt

---

### MessageAttachment
**Table:** `message_attachments`

| Field | Type | Notes |
|-------|------|-------|
| `id` | String (CUID) | PK |
| `messageId` | String | FK to Message |
| `url` | String | |
| `publicId` | String? | Cloudinary public_id |
| `fileName` | String? | |
| `mimeType` | String? | |
| `fileSize` | Int? | |
| `type` | AttachmentType | Default: IMAGE |
| `createdAt` | DateTime | |

**Indexes:** messageId

---

### Notification
**Table:** `notifications`

| Field | Type | Notes |
|-------|------|-------|
| `id` | String (CUID) | PK |
| `userId` | String | FK to User |
| `type` | NotificationType | |
| `title` | String | |
| `body` | String | |
| `actionUrl` | String? | |
| `isSecurity` | Boolean | Default: false |
| `readAt` | DateTime? | |
| `createdAt` | DateTime | |

**Indexes:** userId + readAt

---

### AccommodationRequest
**Table:** `accommodation_requests`

| Field | Type | Notes |
|-------|------|-------|
| `id` | String (CUID) | PK |
| `studentId` | String | FK to Student |
| `universityId` | String | FK to University |
| `preferredLocation` | String | |
| `budgetMin` | Decimal(10,2)? | |
| `budgetMax` | Decimal(10,2)? | |
| `roomType` | RoomTypePreference | |
| `genderPreference` | Gender | Default: ANY |
| `moveInDate` | DateTime? | |
| `numberOfOccupants` | Int? | Default: 1 |
| `roommateRequired` | Boolean | Default: false |
| `preferences` | String? | |
| `additionalNotes` | String? | |
| `status` | RequestStatus | Default: OPEN |
| `respondedAt` | DateTime? | |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

**Indexes:** studentId + status, universityId + status

---

## Migrations

Migrations are stored in `backend/prisma/migrations/`. Each migration has a timestamp folder containing a `migration.sql` file.

To apply migrations:
```bash
cd backend
npx prisma migrate dev      # development
npx prisma migrate deploy   # production
```

## Seed

Seed script: `backend/prisma/seed.ts`

```bash
cd backend
npx prisma db seed
```

Current seed data:
- Federal University Otuoke (slug: `fuotuoke`, city: Otuoke, country: Nigeria)

## Schema Changes

When modifying the schema:
1. Edit `backend/prisma/schema.prisma`
2. Run `cd backend && npx prisma migrate dev --name description_of_change`
3. Commit both the schema file and the new migration folder