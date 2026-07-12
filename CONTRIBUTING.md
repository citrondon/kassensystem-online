# CONTRIBUTING.md – KI-Agent Setup für Mitarbeiter

> Diese Datei ist für KI-Assistenz-Agenten (Claude, GPT, Copilot) gedacht, die automatisch die Entwicklungsumgebung einrichten und den Git-Workflow durchführen sollen.

## Auftrag für KI-Agent

Du hilfst einem Entwickler, der als **Collaborator** am `citrondon/kassensystem`-Repo mitarbeitet. Dein Ziel: Repo klonen, lokalen Server-Stack starten, Änderungen auf einem Feature-Branch machen und per Pull Request einreichen.

---

## Schritt 1: Repository klonen

```bash
git clone https://github.com/citrondon/kassensystem.git
cd kassensystem
```

## Schritt 2: Abhängigkeiten installieren & Server starten

Führe **parallel** aus:

**Terminal 1 – Datenbank:**
```bash
docker compose up -d
```

**Terminal 2 – Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 3 – Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Validierung:
- Frontend: `http://localhost:3000`
- Backend: `GET http://localhost:5000/health`
- API: `GET http://localhost:5000/api/products`

## Schritt 3: Vor jeder Änderung – Branch erstellen

```bash
git checkout -b feature/<beschreibung>
```

Beispiele: `feature/dark-mode`, `feature/qr-scanner-fix`, `feature/neue-kategorie`

**NIE direkt auf `master` arbeiten!**

## Schritt 4: Änderungen machen, committen, pushen

```bash
# Änderungen ansehen
git status

# Stagen
git add .

# Commit (konventionelle Nachricht):
git commit -m "feat: kurze Beschreibung der Änderung"

# Push:
git push -u origin feature/<beschreibung>
```

## Schritt 5: Pull Request auf GitHub erstellen

1. Auf `github.com/citrondon/kassensystem` gehen
2. GitHub zeigt automatisch den neuen Branch → **Compare & pull request**
3. Titel: Kurze Zusammenfassung
4. Beschreibung: Was wurde geändert und warum
5. **Create pull request**
6. Repository-Owner (`citrondon`) reviewt und mergt

---

## Konventionelle Commit-Typen

| Präfix | Bedeutung |
|--------|-----------|
| `feat:` | Neue Funktion |
| `fix:` | Bugfix |
| `docs:` | Dokumentation (README, AGENTS.md, etc.) |
| `style:` | CSS/Tailwind-Styling ohne Logikänderung |
| `refactor:` | Code-Refactoring ohne Feature-Änderung |
| `chore:` | Build, Dependencies, Setup |

---

## Wichtige Regeln

1. **`backend/.env` niemals committen** – sie enthält Passwörter. Sie steht bereits in `.gitignore`.
2. **Vor `git push` immer `npm run build` im Frontend testen**, damit TypeScript fehlerfrei durchläuft.
3. **Backend-API nicht ändern ohne Absprache** – das Frontend und andere Clients hängen am Vertrag.
4. **Keine Secrets (Tokens, Passwörter) in Code oder Commits** hinterlassen.
5. **Für UI-Änderungen:** Screenshots im PR-Beschreibung helfen beim Review.

---

## Projektstruktur (Kurzform)

```
├── backend/           # Express API (Port 5000)
│   ├── src/controllers/
│   ├── src/routes/
│   └── src/server.ts
├── frontend/          # React + Vite (Port 3000)
│   ├── src/components/   # UI-Komponenten
│   ├── src/services/     # API-Client
│   ├── src/utils/        # categoryStyles, Helpers
│   └── src/App.tsx
├── db/init.sql        # DB-Schema + Demo-Daten
└── docker-compose.yml # PostgreSQL-Container
```

---

## Falls Docker nicht verfügbar ist

- PostgreSQL 16+ lokal installieren
- `db/init.sql` manuell ausführen
- `backend/.env` an lokale Zugangsdaten anpassen
- Docker-Container-Schritt überspringen

---

## Schnell-Checkliste für KI-Agenten

- [ ] `git clone` ausgeführt
- [ ] `docker compose up -d` läuft
- [ ] `npm install` in `backend/` und `frontend/` ausgeführt
- [ ] `npm run dev` in beiden Ordnern läuft
- [ ] Feature-Branch erstellt (`git checkout -b feature/...`)
- [ ] Änderungen committed (`git commit -m "feat: ..."`)
- [ ] Branch gepusht (`git push -u origin feature/...`)
- [ ] Pull Request auf GitHub erstellt

---

## Für AI-Setup-Prompts

Wenn ein Nutzer sagt: *„Richte das Projekt ein und starte die Server"*, führe Schritte 1+2 aus.

Wenn ein Nutzer sagt: *„Ich habe eine neue Idee für das POS"*, führe Schritte 1-5 aus (mit Feature-Branch und PR).
