# Kassensystem (POS)

Ein kleines Point-of-Sale-System mit React-Frontend, Express-Backend und PostgreSQL-Datenbank.

## Projektstruktur

```
├── backend/           # Express + TypeScript API (Port 5000)
│   ├── src/
│   │   ├── controllers/    # Business-Logik (Produkte, Bestellungen, Kategorien, Auth)
│   │   ├── middleware/     # Auth-Middleware
│   │   ├── routes/         # API-Routen
│   │   ├── utils/          # DB-Pool (PostgreSQL)
│   │   ├── validation/     # Zod-Validierungsschemata
│   │   └── server.ts       # Entrypoint
│   ├── migrations/         # node-pg-migrate Migrationen
│   ├── scripts/          # Migration- & Seed-Wrapper
│   ├── .env                # Environment-Variablen (NICHT commiten)
│   └── .env.example        # Template für .env
├── frontend/        # React + Vite (Port 3000)
│   ├── src/
│   │   ├── components/     # UI-Komponenten (Kasse, Scanner, Dashboard, etc.)
│   │   ├── contexts/       # AuthContext
│   │   ├── services/       # API-Client
│   │   ├── App.tsx         # Haupt-Layout
│   │   └── types.ts        # TypeScript-Typen
│   └── vite.config.ts      # Vite-Config mit Proxy auf Backend
├── db/
│   └── init.sql            # DB-Schema + Demo-Daten (nur erster Docker-Start)
└── docker-compose.yml      # PostgreSQL-Container
```

## Voraussetzungen

- **Node.js** (via nvm empfohlen)
- **npm**
- **Docker Desktop** (für PostgreSQL)
- **Git**

## Setup

### 1. Repo klonen

```bash
git clone https://github.com/NotDonCitron/Kassensystem.git
cd pos-system
```

### 2. PostgreSQL starten

```bash
docker compose up -d
```

Die Datenbank läuft dann auf `localhost:5432` und wird beim ersten Start automatisch mit Schema + Demo-Daten (`db/init.sql`) initialisiert.

> Falls Docker nicht verfügbar ist: Installiere PostgreSQL lokal und führe `db/init.sql` manuell aus.

### 3. Backend einrichten

```bash
cd backend
cp .env.example .env
npm install
npm run migrate      # Datenbank-Schema + Migrationen anwenden
npm run seed         # Demo-Benutzer anlegen (admin, kasse)
npm run dev
```

Das Backend läuft dann auf **http://localhost:5000**.

> **Hinweis:** Die `.env` enthält DB-Zugangsdaten, CORS-Einstellungen und `JWT_SECRET`. `.env` wird durch `.gitignore` nicht committed.

### 4. Frontend einrichten

Neues Terminal:

```bash
cd frontend
npm install
npm run dev
```

Das Frontend läuft dann auf **http://localhost:3000** und leitet API-Calls automatisch an `localhost:5000` weiter (siehe `vite.config.ts` → `proxy: "/api"`).

### 5. Anmelden

Öffne `http://localhost:3000` und melde dich mit einem der Demo-Benutzer an:

| Benutzer | Passwort | Rolle     |
|----------|----------|-----------|
| admin    | pos123   | Manager   |
| kasse    | pos123   | Kassierer |

Manager dürfen Produkte anlegen, bearbeiten und löschen. Kassierer können nur die Kasse und die Ansichten nutzen.

## Demo-Daten

Die Datenbank wird mit folgenden Beispiel-Produkten initialisiert:

| Produkt     | Barcode       | Preis | Bestand | Kategorie           |
|-------------|---------------|-------|---------|---------------------|
| Apfel       | 4000000012345 | 0.49  | 150     | Obst & Gemuese      |
| Banane      | 4000000067890 | 0.29  | 80      | Obst & Gemuese      |
| Milch 1L    | 4000000023456 | 1.39  | 40      | Grundnahrungsmittel |
| Brot        | 4000000034567 | 3.49  | 20      | Backwaren           |
| Wasser 0.5L | 4000000045678 | 0.69  | 200     | Getraenke           |
| Schokolade  | 4000000056789 | 1.49  | 60      | Suessigkeiten       |
| Kaffee 200g | 4000000067891 | 5.99  | 15      | Grundnahrungsmittel |
| Eier 10er   | 4000000078901 | 3.29  | 30      | Grundnahrungsmittel |

## Tech Stack

| Layer      | Technologie                              |
|------------|------------------------------------------|
| Frontend   | React 18, Vite, TypeScript, Tailwind CSS |
| Backend    | Express 4, TypeScript, tsx (dev)         |
| Datenbank  | PostgreSQL 16 (Docker)                   |
| Scanner    | react-qr-barcode-scanner (Webcam)        |

## Wichtige Ports

| Service    | Port  |
|------------|-------|
| Frontend   | 3000  |
| Backend    | 5000  |
| PostgreSQL | 5432  |

## Nützliche Skripte

```bash
# Backend (im backend/-Ordner)
npm run dev         # Dev-Server mit Hot-Reload (tsx watch)
npm run build       # TypeScript kompilieren
npm run start       # Produktiv-Build starten
npm run migrate     # Migrationen anwenden
npm run migrate:down # Letzte Migration zurückrollen
npm run seed        # Demo-Benutzer anlegen
npm run test        # Backend-API-Tests ausführen

# Frontend (im frontend/-Ordner)
npm run dev      # Vite Dev-Server
npm run build    # Produktiv-Build
npm run preview  # Preview des Builds
```

## Für KI-Agents / Automatisches Setup

Falls ein KI-Agent dieses Repo automatisch einrichten soll:

1. `docker compose up -d` startet die DB.
2. `backend/.env` aus `backend/.env.example` kopieren (falls nicht vorhanden).
3. `npm install` in `backend/` und `frontend/` ausführen.
4. `npm run migrate` im `backend/`-Ordner ausführen.
5. `npm run seed` im `backend/`-Ordner ausführen.
6. `npm run dev` in beiden Ordnern parallel starten.
7. App ist unter `http://localhost:3000` erreichbar.
8. Anmelden mit `admin` / `pos123` oder `kasse` / `pos123`.
9. API-Healthcheck: `GET http://localhost:5000/health`

## Lizenz

MIT
