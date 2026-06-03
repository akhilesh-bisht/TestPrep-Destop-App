# Architecture

## Overview

TestPrep Pro follows **Clean Architecture** with clear separation between UI, IPC bridge, and data layers.

```
┌─────────────────────────────────────────────────────────┐
│  React Frontend (Renderer)                              │
│  Zustand · MUI · React Router                           │
└───────────────────────┬─────────────────────────────────┘
                        │ contextBridge (preload)
┌───────────────────────▼─────────────────────────────────┐
│  Electron Main + IPC Handlers                           │
└───────────────────────┬─────────────────────────────────┘
                        │ require()
┌───────────────────────▼─────────────────────────────────┐
│  Backend App (TypeScript → CommonJS)                    │
│  Controllers → Services → Repositories → SQLite         │
└─────────────────────────────────────────────────────────┘
```

## Backend Layers

| Layer | Responsibility |
|-------|----------------|
| **Validators** | Zod schemas for input validation |
| **Repositories** | SQL queries, data access only |
| **Services** | Business rules, scoring, imports |
| **App** | IPC-facing facade with unified error handling |

## SOLID Practices

- **Single Responsibility** — Each repository handles one entity
- **Open/Closed** — Services extend behavior without changing repositories
- **Dependency Inversion** — Services depend on repository abstractions via constructor injection

## Security

- Context isolation enabled
- Node integration disabled in renderer
- Passwords hashed with bcrypt (10 rounds)

## Offline Model

No network calls. SQLite WAL mode ensures durability. Electron `userData` path used for packaged app database.
