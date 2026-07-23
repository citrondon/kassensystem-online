#!/bin/bash
# Kassensystem — Version auswählen
# Web (Server-basiert) oder Mobile (Offline Android)

echo ""
echo "  ╔══════════════════════════════════════════════╗"
echo "  ║       Kassensystem — Version wählen          ║"
echo "  ╠══════════════════════════════════════════════╣"
echo "  ║  [1] Web-Version (React + Express + Docker)  ║"
echo "  ║      Server-basiert, Browser, PostgreSQL     ║"
echo "  ║                                              ║"
echo "  ║  [2] Mobile-Version (React Native + Expo)    ║"
echo "  ║      Offline, SQLite, APK-fähig              ║"
echo "  ╚══════════════════════════════════════════════╝"
echo ""
read -p "  Auswahl (1 oder 2): " choice

case "$choice" in
  1)
    echo ""
    echo "  → Starte Web-Version..."
    echo ""
    echo "  1. Docker DB starten:"
    if ! command -v docker &> /dev/null; then
      echo "     FEHLER: Docker nicht installiert."
      exit 1
    fi
    docker compose up -d
    echo ""
    echo "  2. Backend installieren + starten:"
    cd backend
    if [ ! -d "node_modules" ]; then
      npm install
    fi
    if [ ! -f ".env" ]; then
      cp .env.example .env
    fi
    npm run migrate
    npm run seed
    echo ""
    echo "  Backend läuft auf http://localhost:5000"
    echo "  Starte Frontend in neuem Terminal: cd frontend && npm run dev"
    echo "  Frontend: http://localhost:3000"
    echo "  Login: admin/pos123 oder kasse/pos123"
    echo ""
    npm run dev
    ;;
  2)
    echo ""
    echo "  → Starte Mobile-Version..."
    echo ""
    cd mobile
    if [ ! -d "node_modules" ]; then
      npm install
    fi
    echo ""
    echo "  Expo Dev Server startet..."
    echo "  • Auf Android: Expo Go App installieren, QR-Code scannen"
    echo "  • Im Browser: 'w' drücken für Web-Preview"
    echo "  • Auf Emulator: 'a' drücken"
    echo ""
    npx expo start
    ;;
  *)
    echo "  Ungültige Auswahl."
    exit 1
    ;;
esac
