# AI Setup Prompt – Kassensystem POS

## Für KI-Agents: Schnellstart-Anleitung

Dieses Dokument ist für KI-Assistenz-Agenten (z. B. GitHub Copilot, Claude, GPT) gedacht, die dieses Repository automatisch einrichten und starten sollen.

---

### Schritt 1: Repository klonen

```bash
git clone https://github.com/NotDonCitron/Kassensystem.git
cd kassensystem
```

### Schritt 2: Umgebungsvariablen & Datenbank starten (Docker)

```bash
cd backend
cp .env.example .env  # muss vor Docker Compose existieren
cd ..
docker compose up -d
```

> Docker Desktop muss installiert und gestartet sein. Die Datenbank läuft auf `localhost:5432` und wird beim ersten Start mit `db/init.sql` initialisiert.

Falls Docker nicht verfügbar ist:
- PostgreSQL 16+ lokal installieren
- `backend/.env` an lokale DB-Zugangsdaten anpassen
- `db/init.sql` manuell ausführen

### Schritt 3: Backend einrichten

```bash
cd backend
npm install
npm run migrate      # Migrationen anwenden
npm run seed         # Demo-Benutzer anlegen
npm run dev
```

Das Backend läuft auf **http://localhost:5000**.

### Schritt 4: Frontend einrichten

Neues Terminal:

```bash
cd frontend
npm install
npm run dev
```

Das Frontend läuft auf **http://localhost:3000** und leitet API-Calls automatisch an `localhost:5000` weiter.

### Schritt 5: Validierung

- Frontend: `http://localhost:3000` sollte die POS-App laden.
- Backend-Healthcheck: `GET http://localhost:5000/health`
- API: `GET http://localhost:5000/api/products` sollte JSON mit Produkten zurückgeben.

---

### Tech-Stack-Übersicht

| Layer      | Technologie                              |
|------------|------------------------------------------|
| Frontend   | React 18, Vite, TypeScript, Tailwind CSS |
| Backend    | Express 4, TypeScript, tsx (dev)         |
| Datenbank  | PostgreSQL 16 (Docker)                   |
| Icons      | lucide-react                             |
| Scanner    | react-qr-barcode-scanner (Webcam)        |

### Wichtige Ports

| Service    | Port  |
|------------|-------|
| Frontend   | 3000  |
| Backend    | 5000  |
| PostgreSQL | 5432  |

### Verfügbare npm-Scripts

**Backend** (`cd backend/`):
- `npm run dev` – Dev-Server mit Hot-Reload (tsx watch)
- `npm run build` – TypeScript kompilieren
- `npm run start` – Produktiv-Build starten
- `npm run migrate` – Migrationen anwenden
- `npm run seed` – Demo-Benutzer anlegen
- `npm run test` – API-Tests ausführen

**Frontend** (`cd frontend/`):
- `npm run dev` – Vite Dev-Server
- `npm run build` – Produktiv-Build
- `npm run preview` – Preview des Builds

### Projektstruktur

```
├── backend/           # Express + TypeScript API (Port 5000)
│   ├── src/
│   │   ├── controllers/    # Business-Logik
│   │   ├── middleware/     # Auth-Middleware
│   │   ├── routes/         # API-Routen
│   │   ├── utils/          # DB-Pool
│   │   ├── validation/     # Zod-Validierung
│   │   └── server.ts       # Entrypoint
│   ├── migrations/         # node-pg-migrate
│   ├── scripts/          # Migration/Seed-Wrapper
│   ├── .env                # Environment-Variablen
│   └── .env.example        # Template
├── frontend/        # React + Vite (Port 3000)
│   ├── src/
│   │   ├── components/     # UI-Komponenten
│   │   ├── contexts/       # AuthContext
│   │   ├── services/       # API-Client
│   │   ├── utils/          # categoryStyles, Helpers
│   │   ├── App.tsx         # Haupt-Layout
│   │   └── types.ts        # TypeScript-Typen
│   └── vite.config.ts      # Vite-Config mit Proxy
├── db/
│   └── init.sql            # DB-Schema + Demo-Daten (erster Docker-Start)
└── docker-compose.yml      # PostgreSQL-Container
```

### Hinweise für KI-Agents

1. **Niemals `backend/.env` committen** – sie enthält Passwörter.
2. **Docker ist Pflicht** für die Datenbank, es sei denn PostgreSQL ist lokal installiert.
3. **Beide Server (Backend + Frontend) müssen parallel laufen**.
4. **Das Frontend leitet `/api`-Calls via Proxy an das Backend weiter** – kein CORS-Problem.
5. **Migrationen**: Nach dem ersten DB-Start `npm run migrate` im `backend/`-Ordner ausführen.
6. **Demo-Benutzer**: `npm run seed` im `backend/`-Ordner ausführen. Login: `admin`/`pos123` (Manager) oder `kasse`/`pos123` (Kassierer).
7. **Tests**: `npm run test` im `backend/`-Ordner ausführen.
