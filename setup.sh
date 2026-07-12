#!/usr/bin/env bash
set -euo pipefail

# Kassensystem POS — One-shot Linux setup (Ubuntu/Debian + Fedora)
# Usage:
#   git clone https://github.com/citrondon/kassensystem.git
#   cd kassensystem
#   bash setup.sh

echo "=== Kassensystem POS Setup ==="

# ── Detect distro ──────────────────────────────────────────────
detect_distro() {
  if command -v apt-get >/dev/null 2>&1; then
    echo "debian"
  elif command -v dnf >/dev/null 2>&1; then
    echo "fedora"
  else
    echo "unknown"
  fi
}

DISTRO=$(detect_distro)
echo "Detected: $DISTRO"

# ── Prerequisites ──────────────────────────────────────────────
echo "[1/8] Checking prerequisites..."

# Install base tools if missing
case "$DISTRO" in
  debian)
    if ! command -v git >/dev/null 2>&1 || ! command -v curl >/dev/null 2>&1; then
      sudo apt-get update -qq
      sudo apt-get install -y -qq git curl
    fi
    # bcrypt needs build tools
    if ! dpkg -s build-essential >/dev/null 2>&1 2>/dev/null; then
      echo "       Installing build tools (needed for bcrypt)..."
      sudo apt-get update -qq
      sudo apt-get install -y -qq build-essential python3 make g++
    fi
    ;;
  fedora)
    if ! command -v git >/dev/null 2>&1 || ! command -v curl >/dev/null 2>&1; then
      sudo dnf install -y git curl
    fi
    # bcrypt needs C++ compiler
    if ! command -v g++ >/dev/null 2>&1; then
      echo "       Installing build tools (needed for bcrypt)..."
      sudo dnf install -y gcc-c++ make python3
    fi
    ;;
  *)
    echo "WARNING: Unknown distro. If bcrypt install fails, install build tools manually."
    ;;
esac

# Check Node.js
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js not found. Installing via nvm..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
  nvm install 20
  nvm use 20
fi

NODE_VERSION=$(node -v 2>/dev/null || echo "none")
echo "Node.js: $NODE_VERSION"

# Check Docker
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker not found. Installing..."
  case "$DISTRO" in
    debian)
      sudo apt-get update -qq
      sudo apt-get install -y -qq docker.io
      sudo usermod -aG docker "$USER"
      sudo systemctl start docker
      sudo systemctl enable docker
      echo "Docker installed. If 'docker' permission denied, run: newgrp docker"
      ;;
    fedora)
      sudo dnf install -y docker
      sudo systemctl start docker
      sudo systemctl enable docker
      sudo usermod -aG docker "$USER"
      echo "Docker installed. If 'docker' permission denied, run: newgrp docker"
      ;;
    *)
      echo "ERROR: Please install Docker manually."
      exit 1
      ;;
  esac
fi

# Verify all commands available now
for cmd in git node npm docker; do
  command -v "$cmd" >/dev/null 2>&1 || {
    echo "ERROR: $cmd still not found after install attempt."
    exit 1
  }
done

# ── .env files ─────────────────────────────────────────────────
echo "[2/8] Copying .env files..."
cp backend/.env.example backend/.env
cp backend/.env.test.example backend/.env.test

# ── Docker DB ──────────────────────────────────────────────────
echo "[3/8] Starting PostgreSQL container (fresh volume)..."
# Destroy stale volume from previous projects, then recreate clean
docker compose down -v 2>/dev/null || true
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
