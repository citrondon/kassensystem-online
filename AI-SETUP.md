# AI Setup Instructions — Kassensystem POS

Du bist ein KI-Agent. Deine Aufgabe: dieses Kassensystem auf dem Rechner des Nutzers aufsetzen und starten. Arbeite autonom, schrittweise, validiere am Ende.

## Was das Projekt ist

POS (Point-of-Sale) Kassensystem:
- **Frontend:** React 18 + Vite + TypeScript + Tailwind (Port 3000)
- **Backend:** Express 4 + TypeScript + tsx (Port 5000)
- **Datenbank:** PostgreSQL 16 via Docker (Port 5432)
- **Auth:** JWT, bcrypt-gehashhte Passwörter

## Voraussetzungen (Prereqs)

Der Rechner ist **Nobara Linux** (Fedora-basiert, Pakete via `dnf`).

Prüfe zuerst, was fehlt, und installiere nur das Nötige:

```bash
# Basis-Tools (falls fehlend)
sudo dnf install -y git curl gcc-c++ make python3

# Node.js 20+ (via nvm, falls node --version < 20 oder nicht vorhanden)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 20

# Docker (falls nicht vorhanden)
sudo dnf install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
newgrp docker
```

> `gcc-c++` und `make` werden für das native Modul `bcrypt` gebraucht.
> `newgrp docker` nur falls "permission denied" auftritt — sonst ab-/anmelden.

## Setup ausführen (One-Shot)

Das Repo liegt bereits entpackt vor. Wechsle ins Projektverzeichnis:

```bash
cd kassensystem
bash setup.sh
```

`setup.sh` macht alles automatisch:
1. Erkennt Fedora/Nobara (dnf), installiert fehlende Build-Tools
2. Prüft/installiert Node.js via nvm falls nötig
3. Prüft Docker
4. Kopiert `backend/.env.example` -> `backend/.env` und `backend/.env.test.example` -> `backend/.env.test`
5. `docker compose down -v` (zerstört stale Volumes früherer Läufe) + `docker compose up -d` (frisches PostgreSQL mit init.sql)
6. Wartet bis DB healthy ist
7. `npm install` in `backend/` und `frontend/`
8. `npm run migrate` (Datenbankschema, idempotent via `ifNotExists`)
9. `npm run seed` (Demo-Benutzer: admin/pos123, kasse/pos123)
10. Startet Backend kurz, macht Healthcheck, stoppt es wieder

## Server starten

Nach `setup.sh` beide Dev-Server starten (jeder in eigenem Hintergrund-Prozess/Terminal):

```bash
# Backend (Port 5000)
cd backend && npm run dev &

# Frontend (Port 3000)
cd frontend && npm run dev &
```

> `npm run dev` beendet sich nicht — das ist korrekt, es ist ein Dev-Server mit Hot-Reload.

## Validieren

```bash
# Backend Healthcheck — muss {"status":"ok"} liefern
curl http://localhost:5000/health

# Frontend — muss HTML zurückgeben
curl http://localhost:3000

# Orders — muss 200 + JSON liefern (nicht 500)
curl http://localhost:5000/api/orders
```

## Zugang / Login

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health:** http://localhost:5000/health
- **Login Manager:** `admin` / `pos123`
- **Login Kassierer:** `kasse` / `pos123`

## Wichtige Ports

| Service    | Port  |
|------------|-------|
| Frontend   | 3000  |
| Backend    | 5000  |
| PostgreSQL | 5432  |

Alle drei müssen frei sein. Konflikte siehe Troubleshooting.

## Troubleshooting

| Problem | Lösung |
|---------|--------|
| bcrypt Build-Fehler | `sudo dnf install -y gcc-c++ make python3` |
| Docker permission denied | `newgrp docker` (oder ab-/anmelden) |
| Port 5432 belegt (Docker) | `docker compose down -v` im Projektverzeichnis, dann `docker compose up -d` |
| Port 5432 belegt (System-Postgres) | `sudo systemctl stop postgresql` |
| Port 3000/5000 belegt | `ss -ltn \| grep -E ':3000\|:5000'` — Prozess beenden |
| `npm run dev` beendet sich nicht | Korrekt — Dev-Server. Mit `kill <PID>` stoppen |
| nvm not found | `source ~/.bashrc` oder `source ~/.nvm/nvm.sh` |
| `/api/orders` liefert 500 "column ... does not exist" | Stale DB-Volume. `docker compose down -v` + `docker compose up -d`, dann `npm run migrate` neu. |
| Container-Name `kassenprojekt2-db` schon belegt | Anderes Projekt nutzt denselben Namen. Dort `docker compose down -v` ausführen, dann hier neu starten. |

## Tests (optional)

```bash
cd backend
npm run test
```

Erwartet: 13/13 grün.

## Hinweise

- `backend/.env` und `backend/.env.test` enthalten Passwörter — **niemals committen** (stehen in `.gitignore`).
- Das Frontend leitet `/api`-Calls via Vite-Proxy an `localhost:5000` weiter — kein CORS-Problem.
- `JWT_SECRET` in `backend/.env` steht auf Template-Wert — für Produktion ändern.
- Dev-Server laufen nur in der aktuellen Session. Für Dauerbetrieb eigene Terminals/Services nutzen.