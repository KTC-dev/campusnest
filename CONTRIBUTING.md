# Contributing to Edurus

Thank you for helping improve Edurus. This guide covers the actual repository setup, commands, and conventions.

## Prerequisites

- Node.js 18+ (tested on Node 20)
- PostgreSQL
- npm
- Git

## Project structure

- `backend/` — Express + TypeScript + Prisma API
- `frontend/` — React + Vite + Tailwind web app
- `docs/` — project documentation
- `Dockerfile` — production container build
- `railway.toml` — Railway deployment config

## Setup

1. Clone the repository
2. Install dependencies in both `backend/` and `frontend/`
3. Copy `.env.example` to `.env` in both directories
4. Create the PostgreSQL database `campusnest`
5. Run `npx prisma migrate dev` and `npx prisma db seed` in `backend/`
6. Start both dev servers

See `SETUP.md` for detailed instructions.

## Commands

### Backend (`cd backend`)

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server with tsx watch |
| `npm run build` | Generate Prisma client + compile TypeScript |
| `npm run start` | Production start: migrate deploy + seed + run dist |
| `npm run prisma:migrate` | Create/apply migrations in development |
| `npm run prisma:deploy` | Apply migrations in production |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run seed` | Run database seed |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest |

### Frontend (`cd frontend`)

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server (port 5173) |
| `npm run build` | TypeScript check + Vite production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Code conventions

- TypeScript strict mode enabled in both frontend and backend
- Backend uses a service layer; controllers stay thin
- Frontend uses feature-based service files in `src/services/`
- API responses follow `{ success: boolean, data: T }` shape
- Use `AppError` for expected errors in backend
- Use `catchAsync` wrapper for async route handlers
- Zod schemas in `backend/src/utils/validation/` validate all inputs

## Git workflow

1. Create a feature branch from `main`
2. Make changes with clear commit messages
3. Ensure both `cd frontend && npx tsc -b` and `cd backend && npx tsc -p tsconfig.json --noEmit` pass
4. Open a pull request

## Testing

Backend tests use Vitest. Run from `backend/`:

```bash
npm test
```

Known test status at time of this guide:
- `booking.service.test.ts` — passing
- `roommate.service.test.ts` — has pre-existing failures
- `conversation.service.test.ts` — has pre-existing failures
- `property.service.test.ts` — passing

## Reporting issues

When reporting bugs, include:
- Steps to reproduce
- Expected vs actual behavior
- Environment (local dev / Railway production)
- Relevant logs from backend Winston output

## Questions

See `README.md` for architecture overview, `SYSTEM_ARCHITECTURE.md` for system design, and `SETUP.md` for environment setup.
