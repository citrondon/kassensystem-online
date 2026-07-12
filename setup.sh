#!/usr/bin/env bash
set -euo pipefail

# Kassensystem POS — One-shot Linux setup
# Usage:
#   git clone https://github.com/citrondon/kassensystem.git
#   cd kassensystem
#   bash setup.sh

echo "=== Kassensystem POS Setup ==="

# ── Prerequisites ──────────────────────────────────────────────
echo "[1/8] Checking prerequisites..."
for cmd in git node npm docker; do
  command -v "$cmd" >/dev/null 2>&1 || {
    echo "ERROR: $cmd not found. Please install it first."
    exit 1
  }
done

# bcrypt needs build tools on Linux
if ! dpkg -s build-essential >/dev/null 2>&1 2>/dev/null; then
  if command -v apt-get >/dev/null 2>&1; then
    echo "       Installing build-essential (needed for bcrypt)..."
    sudo apt-get update -qq && sudo apt-get install -y -qq build-essential python3 make g++
  else
    echo "WARNING: build-essential not found. If bcrypt install fails, install it manually."
  fi
fi

# ── .env files ─────────────────────────────────────────────────
echo "[2/8] Copying .env files..."
cp backend/.env.example backend/.env
cp backend/.env.test.example backend/.env.test

# ── Docker DB ──────────────────────────────────────────────────
echo "[3/8] Starting PostgreSQL container..."
docker compose up -d

echo "[4/8] Waiting for DB to be healthy..."
until docker ps --filter "name=kassenprojekt2-db" --filter "health=healthy" --format "{{.Names}}" | grep -q kassenprojekt2-db; do
  printf "."
  sleep 2
done
echo " healthy!"

# ── Backend ────────────────────────────────────────────────────
echo "[5/8] Installing backend dependencies..."
cd backend
npm install

echo "[6/8] Running migrations + seed..."
npm run migrate
npm run seed

# ── Frontend ───────────────────────────────────────────────────
echo "[7/8] Installing frontend dependencies..."
cd ../frontend
npm install
cd ..

# ── Health check ───────────────────────────────────────────────
echo "[8/8] Verifying backend..."
cd backend
npm run dev &
BACKEND_PID=$!
sleep 4

if curl -sf http://localhost:5000/health | grep -q '"ok"'; then
  echo ""
  echo "=== Setup complete! ==="
  echo ""
  echo "  Backend:  http://localhost:5000  (running, PID $BACKEND_PID)"
  echo "  Frontend: http://localhost:3000  (start with: cd frontend && npm run dev)"
  echo "  Login:    admin/pos123 (Manager) or kasse/pos123 (Cashier)"
  echo ""
  echo "  Stop backend: kill $BACKEND_PID"
  echo ""
  kill "$BACKEND_PID" 2>/dev/null || true
  echo "Backend stopped. Start both servers when ready:"
  echo "  Terminal 1: cd backend && npm run dev"
  echo "  Terminal 2: cd frontend && npm run dev"
else
  echo "ERROR: Backend health check failed. Check: cd backend && npm run dev"
  kill "$BACKEND_PID" 2>/dev/null || true
  exit 1
fi
