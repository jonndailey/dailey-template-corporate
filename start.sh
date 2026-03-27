#!/bin/bash
# Dailey OS startup script - runs both Strapi backend and Next.js frontend
set -e

echo "=== Dailey OS: Corporate Marketing Site ==="

# Create .env files if they don't exist
if [ ! -f "backend/.env" ]; then
  echo "Creating backend .env with default values..."
  cat > backend/.env <<'ENVEOF'
HOST=0.0.0.0
PORT=1337
APP_KEYS=daileyOS1key,daileyOS2key,daileyOS3key,daileyOS4key
API_TOKEN_SALT=daileyOS-api-token-salt-value
ADMIN_JWT_SECRET=daileyOS-admin-jwt-secret-value
JWT_SECRET=daileyOS-jwt-secret-value
TRANSFER_TOKEN_SALT=daileyOS-transfer-token-salt
ENVEOF
fi

if [ ! -f "frontend/.env" ]; then
  echo "Creating frontend .env with default values..."
  cat > frontend/.env <<'ENVEOF'
NEXT_PUBLIC_STRAPI_API_TOKEN=
NEXT_PUBLIC_PAGE_LIMIT=6
NEXT_PUBLIC_STRAPI_FORM_SUBMISSION_TOKEN=
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337
ENVEOF
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing root dependencies..."
  npm install
fi

if [ ! -d "backend/node_modules" ]; then
  echo "Installing backend dependencies..."
  cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
  echo "Installing frontend dependencies..."
  cd frontend && npm install && cd ..
fi

# Build Strapi admin if not built
if [ ! -d "backend/build" ]; then
  echo "Building Strapi admin panel..."
  cd backend && npm run build && cd ..
fi

# Seed data if database doesn't exist
if [ ! -f "backend/.tmp/data.db" ]; then
  echo "Seeding initial data..."
  cd backend && npx strapi import -f ../seed-data.tar.gz --force && cd ..
fi

echo ""
echo "Starting services..."
echo "  Strapi CMS Admin:  http://localhost:1337/admin"
echo "  Website:           http://localhost:3000"
echo ""
echo "NOTE: On first run, create an admin user at the Strapi admin URL above."
echo ""

# Run both services in dev mode (avoids build-time dependency on Strapi being up)
npx concurrently \
  --names "strapi,nextjs" \
  --prefix-colors "blue,green" \
  "cd backend && npm run develop" \
  "cd frontend && npm run dev"
