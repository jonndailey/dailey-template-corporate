#!/bin/bash
# Dailey OS startup script - runs both Strapi backend and Next.js frontend.
# Works locally (dev mode) and in a deployed container (production mode),
# where the app directory may be read-only and the platform injects $PORT.
set -e
cd "$(dirname "$0")"

echo "=== Dailey OS: Corporate Marketing Site ==="

# --- Environment defaults (Strapi refuses to boot without these) ---
export HOST="${HOST:-0.0.0.0}"
export APP_KEYS="${APP_KEYS:-daileyOS1key,daileyOS2key,daileyOS3key,daileyOS4key}"
export API_TOKEN_SALT="${API_TOKEN_SALT:-daileyOS-api-token-salt-value}"
export ADMIN_JWT_SECRET="${ADMIN_JWT_SECRET:-daileyOS-admin-jwt-secret-value}"
export JWT_SECRET="${JWT_SECRET:-daileyOS-jwt-secret-value}"
export TRANSFER_TOKEN_SALT="${TRANSFER_TOKEN_SALT:-daileyOS-transfer-token-salt}"

# Frontend binds the platform-injected $PORT (default 3000).
# Strapi stays internal on 1337 unless overridden.
FRONTEND_PORT="${PORT:-3000}"
BACKEND_PORT="${BACKEND_PORT:-1337}"

# Point the frontend's server-side fetches at the local Strapi instance.
export NEXT_PUBLIC_STRAPI_API_URL="${NEXT_PUBLIC_STRAPI_API_URL:-http://127.0.0.1:$BACKEND_PORT}"

# --- SQLite database: pick a writable location ---
DB_DIR="backend/.tmp"
if ! mkdir -p "$DB_DIR" 2>/dev/null || ! touch "$DB_DIR/.writecheck" 2>/dev/null; then
  DB_DIR="${TMPDIR:-/tmp}/strapi-data"
  mkdir -p "$DB_DIR"
  echo "App directory is not writable; using $DB_DIR for the SQLite database."
fi
rm -f "$DB_DIR/.writecheck" 2>/dev/null || true
export DATABASE_FILENAME="$(cd "$DB_DIR" && pwd)/data.db"

# --- Local development conveniences (no-ops in a built container) ---
if [ ! -d "node_modules" ]; then
  echo "Installing root dependencies..."
  npm install
fi
if [ ! -d "backend/node_modules" ]; then
  echo "Installing backend dependencies..."
  (cd backend && npm install)
fi
if [ ! -d "frontend/node_modules" ]; then
  echo "Installing frontend dependencies..."
  (cd frontend && npm install)
fi
if [ ! -d "backend/build" ]; then
  echo "Building Strapi admin panel..."
  (cd backend && npm run build)
fi

# --- Seed initial content once ---
if [ ! -f "$DATABASE_FILENAME" ] && [ -f "seed-data.tar.gz" ]; then
  echo "Seeding initial data..."
  (cd backend && npx strapi import -f ../seed-data.tar.gz --force) \
    || echo "WARNING: seeding failed; starting with an empty database."
fi

echo ""
echo "Starting services..."
echo "  Strapi CMS Admin:  http://localhost:${BACKEND_PORT}/admin"
echo "  Website:           http://localhost:${FRONTEND_PORT}"
echo ""

if [ -d "frontend/.next" ]; then
  # Production build exists (deployed container): run compiled apps.
  exec npx concurrently \
    --names "strapi,nextjs" \
    --prefix-colors "blue,green" \
    "cd backend && PORT=$BACKEND_PORT npm run start" \
    "cd frontend && PORT=$FRONTEND_PORT npm run start"
else
  # Local development: watch mode for both apps.
  exec npx concurrently \
    --names "strapi,nextjs" \
    --prefix-colors "blue,green" \
    "cd backend && PORT=$BACKEND_PORT npm run develop" \
    "cd frontend && PORT=$FRONTEND_PORT npm run dev"
fi
