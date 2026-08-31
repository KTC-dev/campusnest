# Deployment Documentation

## Current Deployment Architecture

### Frontend
- Built with Vite (
pm run build)
- Output: static assets in rontend/dist/
- Currently configured for Railway deployment via root Dockerfile
- .env.production points to Railway backend URL

### Backend
- Node.js application (Docker: Node 20 Alpine)
- Runs on port 4000
- Database: PostgreSQL (local or Railway provisioned)
- Socket.IO attached to HTTP server

### Database
- PostgreSQL required
- Prisma migrations applied via prisma migrate deploy
- Seed runs on startup in production (
pm run start)

### Hosting
- Railway (configured via ailway.toml)
- Dockerfile at repository root

## Environment Variables

### Backend (set in Railway dashboard or Docker env)

Required:
- DATABASE_URL — PostgreSQL connection string
- JWT_ACCESS_SECRET — long random string
- JWT_REFRESH_SECRET — long random string (different from access secret)

Recommended:
- CORS_ORIGIN — frontend production URL(s)
- CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
- FCM_SERVER_KEY

### Frontend (set in Railway dashboard or build env)

- VITE_API_URL — backend production URL
- VITE_GOOGLE_MAPS_API_KEY — Google Maps JavaScript API key

## Build Commands

### Docker Build
`ash
docker build -t edurus .
`

The Dockerfile:
1. Uses 
ode:20-alpine base
2. Installs openssl (required by Prisma)
3. Copies entire repository to /app
4. Runs 
pm ci --ignore-scripts in backend
5. Runs 
px prisma generate
6. Runs 
pm run build (tsc compile)
7. Sets NODE_ENV=production and PORT=4000
8. Exposes port 4000
9. Runs 
pm run start on container start

### Production Start
`ash
npm run start
`

This executes:
`ash
prisma migrate deploy && npm run seed && node dist/server.js
`

## Database Migrations

### Development
`ash
cd backend
npx prisma migrate dev
`

### Production
`ash
cd backend
npx prisma migrate deploy
`

### Seed
`ash
cd backend
npx prisma db seed
`

The seed script creates the Federal University Otuoke (FUO) university record.

## Railway Configuration

ailway.toml:
`	oml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"

[deploy]
startCommand = "sh -c 'if [ -f /app/backend/package.json ]; then cd /app/backend && npm run start; elif [ -f /app/package.json ]; then npm run start; else echo \"No backend package.json found\" && exit 1; fi'"
`

Railway builds the Dockerfile and runs the start command.

## CORS Configuration

Backend CORS is configured in ackend/src/app.ts and ackend/src/server.ts.

Allowed origins:
1. Origins listed in CORS_ORIGIN environment variable (comma-separated)
2. Any origin ending with .edurus.pages.dev

For production, set CORS_ORIGIN to your frontend domain(s):
`
CORS_ORIGIN=https://edurus.vercel.app,https://www.edurus.com
`

## Google Maps Configuration

1. Create a Google Cloud project
2. Enable Maps JavaScript API
3. Create an API key
4. Set VITE_GOOGLE_MAPS_API_KEY in frontend environment
5. Restrict the API key to your domain(s)

## Cloudinary Configuration

1. Create a Cloudinary account
2. Get CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
3. Set in backend environment variables
4. Upload folders: edurus/properties, edurus/verification, edurus/messages

## SMTP Configuration

1. Set up an SMTP provider (Gmail, SendGrid, Mailgun, etc.)
2. Configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
3. Test by submitting a verification request or triggering a booking notification

## FCM Configuration

1. Create a Firebase project
2. Get the legacy server key (or migrate to FCM v1 service account)
3. Set FCM_SERVER_KEY in backend environment
4. Frontend collects device tokens and stores them on User.pushToken

## Production Troubleshooting

### Database connection fails
- Verify DATABASE_URL is correct
- Ensure PostgreSQL is running and accessible
- Check that migrations have been applied: 
px prisma migrate status

### Prisma generate fails with file lock
- Stop any running Node processes
- On Windows, check Task Manager for 
ode.exe processes holding query_engine-windows.dll.node

### CORS errors
- Verify CORS_ORIGIN includes the frontend origin
- Check that the frontend VITE_API_URL matches an allowed origin

### Image uploads fail
- Verify Cloudinary credentials are set
- Check that upload service is configured (isConfigured check in upload.service.ts)

### Socket.IO disconnects
- Verify the frontend connects to the same origin as the REST API
- Check CORS settings for Socket.IO
- Ensure JWT token is valid and not expired

### TypeScript build errors
- Run cd backend && npx tsc -p tsconfig.json --noEmit
- Run cd frontend && npx tsc -b

### Port conflicts
- Backend default: 4000. Override with PORT env var.
- Frontend dev default: 5173. Override in ite.config.ts.

## Planned Deployment Improvements

- CI/CD pipeline (GitHub Actions) for automated testing and deployment
- Health check endpoint at /health for monitoring
- Structured logging to external service (Datadog, Logtail, etc.)
- Database backup strategy
- CDN for frontend static assets
- HTTPS termination at load balancer
