# TruyenChanh — Manga Platform Monorepo

High-security manga reader SPA platform built with Next.js 14, NestJS, Prisma, and Docker.

## Architecture

```
truyenchanh-monorepo/
├── apps/
│   ├── api/           NestJS backend (port 4000)
│   └── web/           Next.js 14 frontend (port 3000)
├── packages/
│   ├── shared/        Shared types, constants, signature utils
│   ├── ui/            Shared React components (Tailwind)
│   └── wasm/          WASM descramble stub (compile from Rust later)
├── docker/
│   ├── docker-compose.yml
│   ├── postgres/
│   ├── minio/
│   └── nginx/
└── scripts/
    └── setup.sh       One-time setup script
```

### Infrastructure

| Service      | Image                        | Port      | Purpose              |
|--------------|------------------------------|-----------|----------------------|
| postgres     | postgres:16-alpine           | 5432      | Primary database     |
| redis        | redis:7-alpine               | 6379      | Cache + BullMQ       |
| minio        | minio/minio                  | 9000/9001 | S3-compatible images |
| meilisearch  | getmeili/meilisearch:v1.6    | 7700      | Full-text search     |
| nginx        | nginx:alpine                 | 80        | Reverse proxy        |

### Security Features

- **API Signature**: Every request carries `X-Signature` (HMAC-SHA256 of `timestamp + userAgent + hashedIP`)
- **5-minute replay window**: Signatures older than 5 min are rejected
- **Redis sliding-window rate limiting**: 120 req/min per IP
- **JWT + Refresh tokens**: 15m access / 7d refresh
- **TOTP 2FA**: Optional TOTP setup per user
- **Image scrambling**: Tile-based server-side scramble + WASM client-side descramble
- **Signed URLs**: MinIO presigned URLs with 5-min expiry (no direct S3 key exposure)

### Canvas Reader

The reader uses raw `<canvas>` elements instead of `<img>` tags to prevent right-click-save piracy:

1. `usePreloader` prefetches pages N+1 and N+2 as `ImageBitmap`
2. `PageCanvas` draws the bitmap to canvas, applying WASM descramble if needed
3. `VirtualizedPageList` renders only 5-7 canvases at a time (recycles off-screen ones)

---

## Quick Start

### Prerequisites
- Node.js ≥ 20
- pnpm ≥ 9
- Docker Desktop

### One-command setup

```bash
bash scripts/setup.sh
```

This will:
1. Copy `.env.example` → `.env`
2. Start all Docker services
3. Wait for PostgreSQL health
4. Run `pnpm install`
5. Run Prisma migrations
6. Seed sample data
7. Initialize MinIO buckets

### Manual setup

```bash
# 1. Install dependencies
pnpm install

# 2. Start infrastructure
pnpm docker:up

# 3. Configure environment
cp .env.example .env
# Edit .env with your values

# 4. Run migrations
pnpm db:migrate

# 5. Seed data
pnpm db:seed

# 6. Start development servers
pnpm dev
```

### Access points

| URL                              | Description           |
|----------------------------------|-----------------------|
| http://localhost:3000            | Manga reader web app  |
| http://localhost:4000/api        | NestJS REST API       |
| http://localhost:4000/api/docs   | Swagger UI            |
| http://localhost:9001            | MinIO console         |
| http://localhost:7700            | Meilisearch dashboard |

---

## Development

### Scripts

| Command              | Description                          |
|----------------------|--------------------------------------|
| `pnpm dev`           | Start web + api in watch mode        |
| `pnpm dev:web`       | Start Next.js only                   |
| `pnpm dev:api`       | Start NestJS only                    |
| `pnpm db:migrate`    | Run Prisma migrations                |
| `pnpm db:seed`       | Seed sample data                     |
| `pnpm db:studio`     | Open Prisma Studio                   |
| `pnpm docker:up`     | Start Docker services                |
| `pnpm docker:down`   | Stop Docker services                 |
| `pnpm lint`          | Run ESLint                           |
| `pnpm format`        | Format with Prettier                 |
| `pnpm typecheck`     | TypeScript type checking             |

### Dev mode flags (`.env`)

```env
DISABLE_SIGNATURE_CHECK=true   # Skip HMAC signature validation
DISABLE_RATE_LIMIT=true        # Skip Redis rate limiting
```

### Environment variables

See `.env.example` for all available variables with documentation.

---

## API Endpoints

### Auth
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login (returns access + refresh tokens)
- `POST /api/auth/refresh` — Refresh access token
- `GET  /api/auth/totp/setup` — Get TOTP QR code (auth required)
- `POST /api/auth/totp/verify` — Enable TOTP (auth required)

### Manga
- `GET  /api/manga` — List manga (supports `?q=` search, `?status=`, `?page=`)
- `GET  /api/manga/:slug` — Manga detail + chapter list
- `POST /api/manga` — Create manga (admin)
- `PATCH /api/manga/:slug` — Update manga (admin)

### Chapters
- `GET  /api/manga/:mangaSlug/chapters` — Chapter list
- `GET  /api/manga/:mangaSlug/chapters/:chapterSlug` — Chapter with signed page URLs

### Comments
- `GET  /api/manga/:mangaSlug/comments` — Comments (cursor-based pagination)
- `POST /api/manga/:mangaSlug/comments` — Post comment (auth required)

### Users
- `GET  /api/users/me` — Profile (auth required)
- `PATCH /api/users/me` — Update profile (auth required)

---

## WASM Descramble

The `packages/wasm` package ships a TypeScript stub. To compile the real WASM module from Rust, see [`packages/wasm/README.md`](packages/wasm/README.md).

In dev, the stub is a no-op identity transform — images display unscrambled.
In production, compile the Rust module before deploying.
