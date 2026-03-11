#!/bin/bash
# TruyenChanh Monorepo — One-time setup script
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[setup]${NC} $1"; }
warn() { echo -e "${YELLOW}[warn]${NC} $1"; }
die()  { echo -e "${RED}[error]${NC} $1"; exit 1; }

# ── 1. Check prerequisites ────────────────────────────────────────────────────
log "Checking prerequisites..."

command -v pnpm  >/dev/null 2>&1 || die "pnpm not found. Install: npm i -g pnpm"
command -v docker >/dev/null 2>&1 || die "docker not found. Install: https://docs.docker.com/get-docker/"
command -v docker-compose >/dev/null 2>&1 || \
  docker compose version >/dev/null 2>&1   || \
  die "docker compose not found."

log "Prerequisites OK (pnpm $(pnpm --version), docker $(docker --version | head -c 20))"

# ── 2. Copy .env ──────────────────────────────────────────────────────────────
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

if [ ! -f .env ]; then
  log "Copying .env.example → .env"
  cp .env.example .env
  warn "Edit .env with real secrets before production use!"
else
  warn ".env already exists, skipping copy."
fi

# Load .env
set -a; source .env; set +a

# ── 3. Start Docker services ──────────────────────────────────────────────────
log "Starting Docker services..."
docker compose -f docker/docker-compose.yml up -d

# ── 4. Wait for PostgreSQL ────────────────────────────────────────────────────
log "Waiting for PostgreSQL to be ready..."
RETRIES=30
until docker exec manga_postgres pg_isready -U "${POSTGRES_USER:-manga}" >/dev/null 2>&1; do
  RETRIES=$((RETRIES - 1))
  if [ "$RETRIES" -eq 0 ]; then
    die "PostgreSQL did not become ready in time."
  fi
  sleep 2
done
log "PostgreSQL is ready."

# ── 5. Install dependencies ───────────────────────────────────────────────────
log "Installing pnpm dependencies..."
pnpm install

# ── 6. Run Prisma migrations ──────────────────────────────────────────────────
log "Running database migrations..."
pnpm db:migrate

# ── 7. Seed database ──────────────────────────────────────────────────────────
log "Seeding database..."
pnpm db:seed

# ── 8. Initialize MinIO buckets ──────────────────────────────────────────────
log "Initializing MinIO buckets..."
if command -v mc >/dev/null 2>&1; then
  bash docker/minio/init.sh
else
  warn "MinIO client (mc) not found — skipping bucket init. Run docker/minio/init.sh manually."
fi

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Setup complete! Run: pnpm dev        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo "  Web:        http://localhost:3000"
echo "  API:        http://localhost:4000/api"
echo "  Swagger:    http://localhost:4000/api/docs"
echo "  MinIO:      http://localhost:9001"
echo "  Meili:      http://localhost:7700"
echo ""
