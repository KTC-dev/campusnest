# Project Overview

## Product vision

Edurus is a student accommodation platform that helps students at Federal University Otuoke find and book verified accommodation near campus. The platform is designed to expand to additional universities without schema changes.

## Problem

- Students struggle to find trusted accommodation near campus
- Agents lack a dedicated channel to list properties and manage inquiries
- No verification system to prove agent legitimacy
- No structured way to compare properties or find compatible roommates

## Target users

### Students
- Search and filter properties near campus
- Save favourite listings
- Send accommodation requests when no listing fits
- Request to book approved listings
- Leave reviews after stays
- Find compatible roommates based on lifestyle preferences
- Message agents and roommates in real time
- Receive notifications about bookings, listings, and roommate activity

### Agents
- Register and create property listings
- Upload property images via Cloudinary
- Respond to booking requests (approve/reject)
- Manage listing availability
- View incoming accommodation requests from students
- Receive notifications for new bookings and inquiries
- Submit identity verification documents for admin approval

### Admins
- View platform statistics and analytics
- Moderate property listings (approve/reject/suspend)
- Manage users (activate/deactivate)
- Review and approve/reject agent verifications
- View and moderate flagged reviews
- Monitor bookings and accommodation requests

## Accommodation discovery

Students can browse all approved listings via `GET /properties`. Filtering includes:
- Price range
- Distance from campus
- Gender restriction
- Room type
- Amenities
- Availability
- Verified-only agents
- Utility features (borehole, generator, inverter, security, furnished)
- Bedroom count

Properties display estimated move-in costs, agent fees, legal fees, caution fees, service charges, and house rules.

## Property listings

Agents create listings via `POST /properties`. Each listing starts in `PENDING` status. Admins approve listings before they become publicly visible. Agents can edit listings (which resets status to `PENDING`) or toggle availability without re-review.

## Property verification

Agents submit ID documents, selfies, and proof of ownership via `POST /agents/verification`. Admins review and approve or reject verifications. Approved agents receive a verified badge visible on listings and profiles.

## Roommate functionality

Students create a roommate profile with budget, gender preference, sleep schedule, cleanliness, smoking, and noise tolerance. The system computes a weighted compatibility score against all other active profiles. Students can send match requests, accept/decline requests, save favourite matches, and start roommate conversations.

## Request board

Students can post accommodation requests when they don't find a suitable listing. Requests include preferred location, budget, room type, move-in date, and roommate requirements. Agents and admins can browse open requests.

## Messaging

Real-time conversations exist for:
- Property inquiries (student ↔ agent)
- Roommate matches (student ↔ student)

Socket.IO powers live message delivery, typing indicators, and read receipts. Messages support text, images, and PDFs.

## Notifications

In-app notifications are created for:
- Booking status changes
- Property listing moderation decisions
- Roommate match requests and responses
- New messages
- Agent verification decisions
- Accommodation request status changes
- Review submissions

Email and push notifications are dispatched based on user preferences.

## Bookings

Students create booking requests on approved, available properties. Agents approve or reject bookings. Approving a booking automatically marks the property unavailable and rejects other pending requests for the same property.

## Google Maps/location

Agents can set property locations during listing creation using a Google Maps picker. Location data (latitude, longitude, formatted address, place ID) is stored on the Property model. The property details page displays a read-only map when coordinates are present.

## Other implemented MVP features

- Landing page with live search, featured properties, stats, FAQ
- User authentication with JWT access + refresh tokens and rotation
- Terms acceptance enforcement
- Password strength requirements
- Session management (list and revoke refresh tokens)
- Notification preferences (in-app, email, push)
- Admin dashboard with stats, analytics, user management, moderation
- Responsive mobile-first UI with bottom navigation shells
- Toast notifications
- Cookie consent banner

## Planned features

- Real payment integration (Stripe/Paystack/Flutterwave)
- Second university onboarding (schema supports it; UI default is FUO)
- Email verification on registration
- Password reset flow
- Two-factor authentication UI
- Advanced roommate matching filters (faculty, level)
- Property tours / virtual visits
- Maintenance request system
- Student marketplace
- University announcements
