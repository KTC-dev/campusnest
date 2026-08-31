# Security Documentation

## Authentication

### JWT Access Tokens
- Algorithm: HS256
- Payload: `{ id, role, email }`
- Default expiry: 15 minutes (`JWT_ACCESS_EXPIRES_IN`)
- Sent in `Authorization: Bearer {token}` header on every request
- Verified in `backend/src/middleware/authenticate.ts`

### JWT Refresh Tokens
- Payload: `{ id }`
- Default expiry: 7 days (`JWT_REFRESH_EXPIRES_IN`)
- Stored in `RefreshToken` table with `revoked` flag and `expiresAt`
- Rotation on every refresh: old token revoked, new pair issued
- Verified in `backend/src/services/auth.service.ts`

### Token Storage (Frontend)
- Stored in Zustand persist middleware under localStorage key `edurus-auth`
- Contains `user`, `accessToken`, `refreshToken`
- Access token is short-lived to limit exposure window

### Session Management
- Users can list active sessions via `GET /sessions/`
- Users can revoke individual sessions via `DELETE /sessions/:id`
- Users can revoke all other sessions via `POST /sessions/revoke-others`

## Authorization

### Role-Based Access Control
- Three roles: `STUDENT`, `AGENT`, `ADMIN`
- `requireRole(...allowedRoles)` middleware enforces role membership
- Used on admin routes, agent routes, and student-only routes

### Route Protection
- `authenticate` middleware must run before `requireRole`
- `authenticate` verifies JWT, checks user exists and is active, enforces terms acceptance
- Frontend `ProtectedRoute` component redirects unauthenticated users and role-mismatched users

## Password Security

- Hashing: bcrypt with 12 salt rounds (`backend/src/utils/password.ts`)
- Registration validation (Zod):
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one number
- Login uses constant-time comparison via bcrypt
- Error messages are vague ("Invalid email or password") to prevent account enumeration

## Input Validation

- All API inputs validated via Zod schemas in `backend/src/utils/validation/`
- `validate(schema)` middleware parses and type-coerces body, query, and params
- Unknown keys are stripped by Zod
- Sanitization middleware (`sanitize.ts`) strips null bytes and trims strings

## CORS

- Configured in `backend/src/app.ts` and `backend/src/server.ts`
- Allowed origins from `CORS_ORIGIN` env variable (comma-separated)
- Also allows `*.edurus.pages.dev` origins
- Credentials enabled

## Rate Limiting

### Global
- 300 requests per 15 minutes per IP (`backend/src/app.ts`)

### Endpoint-Specific
- Login: 10 attempts per 15 minutes (`loginRateLimit`)
- Property creation: 20 requests per hour (`createPropertyRateLimit`)
- Booking creation: 30 requests per hour (`createBookingRateLimit`)

## HTTP Security Headers

- Helmet middleware enabled (`backend/src/app.ts`)
- `x-powered-by` disabled

## Error Handling

- Global error handler (`errorHandler.ts`) catches all errors
- Prisma known errors translated to safe messages:
  - `P2002` (unique constraint) → 409 Conflict
  - `P2025` (not found) → 404 Not Found
- Stack traces only exposed in non-production mode for non-operational errors
- Operational errors logged as warnings; bugs logged as errors

## File Upload Security

- Cloudinary used for all uploads (no local storage)
- Accepted types: JPG, PNG, WEBP, PDF
- Max file size enforced by `Upload` component (configurable per use)
- Upload service checks Cloudinary configuration before processing
- `publicId` stored for later deletion

## Database Security

- Prisma parameterized queries (SQL injection prevention)
- Single shared PrismaClient instance to avoid connection pool exhaustion
- Foreign key constraints enforced by PostgreSQL
- Soft deletes where applicable (`deletedAt` on messages)

## Frontend Security

- Axios interceptor handles token refresh and logout on 401
- Client-side JWT decode is purely for UI convenience; server always re-verifies
- No sensitive data logged to console in production
- Input sanitization applied server-side before processing

## Security Weaknesses and TODOs

### High Priority
1. **No CSRF protection** — State-changing operations rely solely on Bearer tokens. Consider adding CSRF tokens or SameSite cookies for browser-based clients.
2. **Refresh tokens in localStorage** — Vulnerable to XSS. Consider migrating to httpOnly, Secure, SameSite cookies for refresh tokens.
3. **No rate limiting on refresh endpoint** — Could be abused for token brute-forcing. Add rate limiting to `/auth/refresh`.
4. **No email verification** — Users can register with any email address. Add email verification flow.
5. **No password reset** — Users cannot recover accounts. Add password reset with email tokens.

### Medium Priority
6. **FCM legacy HTTP endpoint** — Uses deprecated `fcm.googleapis.com/fcm/send` instead of modern FCM v1 API.
7. **Two-factor field without implementation** — `twoFactorEnabled` exists in schema but has no UI or enforcement.
8. **No password breach checking** — Consider integrating Have I Been Pwned or similar.
9. **Terms acceptance is versioned but not enforced on login for existing users** — Only checked during authentication middleware; users who accepted an old version can still log in until they hit an endpoint.

### Low Priority
10. **No audit log** — Admin actions (moderation, user deactivation, verification decisions) are not logged for compliance.
11. **No request ID tracing** — Winston logs are not correlated with request IDs for distributed tracing.
12. **Socket.IO auth uses raw token from handshake** — Could benefit from additional validation or token binding.
13. **No content security policy** — Helmet is used but CSP headers are not configured.
14. **No HSTS** — Strict-Transport-Security header not explicitly set (Helmet may set defaults).

## Reporting Security Issues

If you discover a security vulnerability, please report it privately to the Edurus team rather than opening a public issue.
