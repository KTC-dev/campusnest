# Edurus deployment guide

## Target architecture
- Frontend: Cloudflare Pages
- Backend: Railway
- Database: PostgreSQL on Railway
- Media storage: Cloudinary
- Source control: GitHub

## 1. Repository setup
1. Create a GitHub repository and push the current project.
2. Ensure the repo contains the deployment files in this project root.

## 2. Backend deployment (Railway)
1. Create a new Railway project.
2. Add a PostgreSQL service.
3. Connect the backend service to the repository.
4. Set the following environment variables in Railway:
   - NODE_ENV=production
   - PORT=4000
   - TRUST_PROXY=1
   - APP_VERSION=1.0.0
   - DATABASE_URL=<railway postgres url>
   - JWT_ACCESS_SECRET=<strong random string>
   - JWT_REFRESH_SECRET=<strong random string>
   - JWT_ACCESS_EXPIRES_IN=15m
   - JWT_REFRESH_EXPIRES_IN=7d
   - CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173,https://campusnest.app,https://www.campusnest.app,https://campusnest.pages.dev
   - CLOUDINARY_CLOUD_NAME=<cloudinary cloud name>
   - CLOUDINARY_API_KEY=<cloudinary api key>
   - CLOUDINARY_API_SECRET=<cloudinary api secret>
5. Railway will run the backend start command from package.json.

## 3. Database migrations
Run these commands in the Railway backend service shell or locally before first deploy:
- npm run prisma:generate
- npm run prisma:deploy

## 4. Frontend deployment (Cloudflare Pages)
1. Create a Cloudflare Pages project.
2. Connect the GitHub repository.
3. Set the build command to `npm install && npm run build` inside the frontend folder.
4. Set the output directory to `frontend/dist`.
5. Set the environment variable:
   - VITE_API_URL=https://<your-railway-backend-domain>

## 5. Cloudflare DNS
1. Point your custom domain to the Cloudflare Pages site.
2. Set the backend domain via Railway and configure the API URL in Cloudflare Pages.

## 6. Production checklist
- Confirm the backend health endpoint returns a 200 response.
- Confirm Prisma migrations applied successfully.
- Confirm Cloudinary uploads work.
- Confirm the frontend can reach the backend API.
- Confirm CORS allows the production frontend domain.

## CORS Configuration
The backend supports the following origins:
- Development: http://localhost:5173, http://127.0.0.1:5173
- Production: https://campusnest.app, https://www.campusnest.app, https://campusnest.pages.dev
- Cloudflare Pages preview URLs: All URLs ending with .campusnest.pages.dev (e.g., https://abc123.campusnest.pages.dev)

Cloudflare Pages preview URLs are automatically allowed since they end with .campusnest.pages.dev.