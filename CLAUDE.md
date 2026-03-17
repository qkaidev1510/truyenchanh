# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TruyenChanh is a high-security manga reader platform built as a pnpm monorepo. It uses NestJS for the backend API and Next.js 14 for the frontend, with infrastructure services managed via Docker Compose.

## Common Commands

```bash
# Development
pnpm dev              # Start web + api concurrently
pnpm dev:web          # Next.js only (port 3000)
pnpm dev:api          # NestJS only (port 4000)

# Build
pnpm build            # Build all packages

# Database
pnpm db:migrate       # Run Prisma migrations
pnpm db:seed          # Seed sample data
pnpm db:studio        # Open Prisma Studio

# Infrastructure
pnpm docker:up        # Start Docker services
pnpm docker:down      # Stop Docker services

# Code quality
pnpm lint             # Run ESLint
pnpm format           # Format with Prettier
pnpm typecheck        # TypeScript type checking
```

Initial setup: `bash scripts/setup.sh` (copies .env, starts Docker, installs deps, runs migrations, seeds data).

Before starting the dev servers, ensure workspace packages are built:

```bash
pnpm --filter @manga/shared build
pnpm --filter @manga/ui build
pnpm --filter @manga/api exec prisma generate --schema=./prisma/schema.prisma
```

## Monorepo Structure

```
apps/
  api/          # NestJS backend (port 4000)
  web/          # Next.js 14 frontend (port 3000)
packages/
  shared/       # @manga/shared — HMAC signature utils, types, constants
  ui/           # @manga/ui — React component library (Tailwind CSS)
  wasm/         # @manga/wasm — Stub for WASM image descrambler (Rust pending)
docker/         # Docker Compose config for Postgres, Redis, MinIO, Meilisearch, Nginx
```

## Architecture

### Request Flow

Every API request must include an `X-Signature` header (HMAC-SHA256 of `timestamp + userAgent + hashedIP`), verified by `SignatureMiddleware` in the API. The signature logic lives in `packages/shared/src/` and is used by both the web's Axios client and the API's middleware. Signatures older than 5 minutes are rejected.

```
Web (Next.js) → Axios + X-Signature → NestJS API → Prisma → PostgreSQL
                                                  ↘ Redis (cache, BullMQ jobs)
                                                  ↘ MinIO (image storage)
                                                  ↘ Meilisearch (full-text search)
```

### API Module Structure (`apps/api/src/`)

- `auth/` — Registration, login, JWT (15m access / 7d refresh), TOTP 2FA
- `manga/` — Manga CRUD, listing, Meilisearch integration
- `chapter/` — Chapter retrieval, page ordering
- `comment/` — Nested comments with cursor-based pagination
- `image/` — Serving scrambled pages via MinIO presigned URLs (5-min expiry)
- `middleware/` — `SignatureMiddleware`, `RateLimitMiddleware` (120 req/min Redis sliding window)
- `workers/` — BullMQ background jobs (image processing)
- `config/` — Database, Redis, MinIO, BullMQ module setup

### Frontend Structure (`apps/web/src/`)

- `app/` — Next.js App Router pages (`manga/`, `read/`, `admin/`)
- `components/` — React components (layout, manga cards, reader)
- `hooks/` — Custom hooks (`usePreloader`, etc.)
- `lib/` — Axios API client with signature injection, SWR setup
- `store/` — Zustand global state

### Image Security

Pages are tile-scrambled server-side. The web reader uses `ImageBitmap → Canvas` rendering (no `<img>` tags) to prevent right-click saving. The WASM module (`packages/wasm/`) is currently a TypeScript stub — the Rust implementation is pending.

## Key Technologies

| Layer              | Technology                      |
| ------------------ | ------------------------------- |
| Backend framework  | NestJS 10                       |
| ORM                | Prisma 5 + PostgreSQL 16        |
| Auth               | Passport + JWT + OTPAuth (TOTP) |
| Queue              | BullMQ on Redis 7               |
| Storage            | MinIO (S3-compatible)           |
| Search             | Meilisearch                     |
| Image processing   | Sharp                           |
| Frontend framework | Next.js 14 (App Router)         |
| State management   | Zustand                         |
| Data fetching      | SWR + Axios                     |
| Styling            | Tailwind CSS 3                  |

## Database Schema

Core models in `apps/api/prisma/schema.prisma`: `User` (with TOTP secret, role), `Manga` (status enum), `Chapter`, `Page` (scramble metadata as JSON), `Comment` (nested, cursor-paginated), `Session`.

## Known Gotchas

- **`@manga/shared` must be built before running the API or web** — it has no watch mode wired into `pnpm dev`. Run `pnpm --filter @manga/shared build` after any changes to `packages/shared/src/`.
- **`@manga/ui` must be built before running the web** — same reason.
- **`next.config` must be `.mjs`** — Next.js 14.2 does not support `next.config.ts`.
- **`prisma/seed.ts` is excluded from the API's `tsconfig.json`** — it has its own compilation context. Do not re-add it to `include`.
- **`packages/shared` exports both `require` and `import`** — needed because the API uses CommonJS and the web uses ESM.
- **`crypto` not `node:crypto`** — use plain `crypto` in `@manga/shared` so webpack can handle it in the browser bundle.

## Environment

Copy `.env.example` to `.env`. Required vars include DB connection, Redis, MinIO credentials, JWT secrets, and TOTP issuer. Docker Compose exposes Postgres on 5432, Redis on 6379, MinIO on 9000/9001, Meilisearch on 7700, Nginx on 80/443.
