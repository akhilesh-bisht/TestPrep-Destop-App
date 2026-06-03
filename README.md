
    // "postinstall": "electron-builder install-app-deps"
# TestPrep Pro

Offline-first desktop test preparation application built with **React 19**, **Electron**, **Node.js**, and **SQLite** (better-sqlite3).

## Features

- **Authentication** — Admin and student login with role-based access
- **Admin** — Create/edit/delete tests, MCQ question bank, Excel import, view attempts & statistics
- **Student** — Take timed tests, save answers, auto-submit on expiry, view results & analytics
- **Offline** — All data stored locally in SQLite; no internet required

## Tech Stack

| Layer | Technology |
|-------|------------|
| UI | React 19, Vite, MUI, Framer Motion, Zustand, React Router |
| Desktop | Electron, electron-builder |
| Backend | Node.js, TypeScript, better-sqlite3, Zod, xlsx |
| Database | SQLite (WAL mode) |

## Project Structure

```
test-prep-app/
├── frontend/          # React UI
├── backend/           # Business logic, repositories, services
├── electron/          # Main process, preload, IPC
├── database/          # Migrations & SQLite file
└── docs/              # Documentation
```

## Prerequisites

- Node.js 20+
- npm 10+
- Windows: Visual Studio Build Tools (for better-sqlite3 native module)

## Quick Start

```bash
# Install dependencies (root + workspaces)
npm install

# Build backend (required before Electron)
npm run build --prefix backend

# Run in development (Vite + Electron)
npm run dev
```

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@testprep.com | admin123 |
| Student | student@testprep.com | student123 |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server + Electron |
| `npm run build` | Build frontend & backend |
| `npm run dist` | Package desktop app (electron-builder) |
| `npm run lint` | Lint frontend & backend |
| `npm run format` | Prettier format |

## Excel Import Format

Columns (header row required): `question`, `optionA`, `optionB`, `optionC`, `optionD`, `correctAnswer`, `marks`

See `docs/EXCEL_IMPORT.md` for details.

## Database

- **Development:** `database/app.db` (created on first run)
- **Production:** `%APPDATA%/TestPrep Pro/app.db` (Windows userData)

Migrations run automatically on startup.

## License

MIT
