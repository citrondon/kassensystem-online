# AI Setup Prompt – Kassensystem POS

## Prompt zum Kopieren (für Swanna)

> Kopiere den folgenden Block in deinen KI-Assistenten. Der Agent soll das Projekt automatisch klonen, aufsetzen und starten.

```
Setze das Repository https://github.com/NotDonCitron/Kassensystem.git auf meinem Rechner auf.

Ablauf:
1. Klone das Repo in ein neues Verzeichnis und wechsle hinein.
2. Kopiere backend/.env.example nach backend/.env (für Docker Compose notwendig).
3. Kopiere backend/.env.test.example nach backend/.env.test (für Tests notwendig).
4. Starte Docker Desktop, falls es nicht läuft. Starte dann die Datenbank mit: docker compose up -d
5. Warte, bis der Container "kassenprojekt2-db" gesund ist.
6. Wechsle in backend/, führe npm install aus, dann npm run migrate, dann npm run seed.
7. Starte das Backend im Hintergrund: npm run dev
8. In einem neuen Terminal: Wechsle in frontend/, führe npm install aus, dann npm run dev.
9. Prüfe, ob http://localhost:5000/health ein {status:"ok"} zurückgibt.
10. Prüfe, ob http://localhost:3000 erreichbar ist und sich mit admin/pos123 oder kasse/pos123 anmelden lässt.

Hinweise:
- Auf Windows PowerShell ausführen. Auf Linux/Mac bash.
- Ports 3000, 5000 und 5432 müssen frei sein.
- backend/.env und backend/.env.test dürfen niemals committed werden.
- Falls npm run dev nicht beendet wird, ist das korrekt: es läuft als Dev-Server.
```

---

## Manuelle Schritt-für-Schritt-Anleitung

### Schritt 1: Repository klonen

```bash
git clone https://github.com/NotDonCitron/Kassensystem.git
cd kassensystem
```

### Schritt 2: Umgebungsvariablen anlegen

Diese Dateien müssen **vor** Docker Compose existieren:

```bash
cd backend
cp .env.example .env
cp .env.test.example .env.test
cd ..
```

### Schritt 3: Datenbank starten (Docker)

```bash
docker compose up -d
```

> Docker Desktop muss installiert und gestartet sein. Die Datenbank läuft auf `localhost:5432` und wird beim ersten Start mit `db/init.sql` initialisiert.

Falls Docker nicht verfügbar ist:
- PostgreSQL 16+ lokal installieren.
- `backend/.env` und `backend/.env.test` an lokale DB-Zugangsdaten anpassen.
- `db/init.sql` manuell ausführen.

### Schritt 4: Backend einrichten

```bash
cd backend
npm install
npm run migrate      # Datenbank-Schema + Migrationen anwenden
npm run seed         # Demo-Benutzer anlegen
npm run dev
```

Das Backend läuft auf **http://localhost:5000**.

### Schritt 5: Frontend einrichten

Neues Terminal:

```bash
cd frontend
npm install
npm run dev
```

Das Frontend läuft auf **http://localhost:3000** und leitet API-Calls automatisch an `localhost:5000` weiter.

### Schritt 6: Tests optional ausführen

```bash
cd backend
npm run test
```

### Schritt 7: Validierung

- Frontend: `http://localhost:3000` sollte die POS-App laden.
- Backend-Healthcheck: `GET http://localhost:5000/health` sollte `{status: "ok"}` zurückgeben.
- API: `GET http://localhost:5000/api/products` sollte JSON mit Produkten zurückgeben.
- Anmelden mit `admin`/`pos123` (Manager) oder `kasse`/`pos123` (Kassierer).

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
- `npm run migrate:down` – Letzte Migration zurückrollen
- `npm run seed` – Demo-Benutzer anlegen
- `npm run test` – Backend-API-Tests ausführen

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
│   ├── scripts/            # Migration/Seed-Wrapper
│   ├── .env.example        # Template für .env
│   ├── .env.test.example   # Template für .env.test
│   └── vitest.config.ts    # Test-Konfiguration
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

1. **Niemals `backend/.env` oder `backend/.env.test` committen** – sie enthalten Passwörter und sind in `.gitignore` aufgeführt.
2. **Docker ist Pflicht** für die Datenbank, es sei denn PostgreSQL ist lokal installiert.
3. **Beide Server (Backend + Frontend) müssen parallel laufen**.
4. **Das Frontend leitet `/api`-Calls via Proxy an das Backend weiter** – kein CORS-Problem.
5. **Migrationen**: Nach dem ersten DB-Start `npm run migrate` im `backend/`-Ordner ausführen.
6. **Demo-Benutzer**: `npm run seed` im `backend/`-Ordner ausführen. Login: `admin`/`pos123` (Manager) oder `kasse`/`pos123` (Kassierer).
7. **Tests**: `npm run test` im `backend/`-Ordner ausführen. Benötigen `backend/.env.test`.
8. **Docker-Container muss gesund sein**, bevor Migrationen/Seed ausgeführt werden. Prüfbar mit `docker ps`.
9. **Ports 3000, 5000, 5432** müssen auf dem Rechner frei sein.

### Troubleshooting

- **Docker Compose findet kein `.env`:** `cp backend/.env.example backend/.env` wurde vergessen oder aus der falschen Position ausgeführt.
- **Datenbank nicht erreichbar:** Container noch nicht gesund. `docker compose up -d` wiederholen und `docker ps` prüfen.
- **Port 5432 belegt:** Vorhandene PostgreSQL-Instanz stoppen oder `DB_PORT` in `backend/.env` ändern.
- **Tests schlagen fehl:** `backend/.env.test` fehlt. Vorlage: `backend/.env.test.example`.
