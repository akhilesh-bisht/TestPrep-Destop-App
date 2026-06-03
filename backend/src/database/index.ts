import type Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { getConfig } from '../config/env';
import { getDatabase, resetDatabaseInstance } from './connection';
import { runMigrations } from './migrate';
import { runSeed } from './seed';

export function initializeDatabase(customDbPath?: string, customMigrationsDir?: string): Database.Database {
  const { dbPath } = getConfig(customDbPath);
  const db = getDatabase(dbPath);

  const migrationsDir =
    customMigrationsDir ||
    path.join(process.cwd(), 'database', 'migrations');

  if (!fs.existsSync(migrationsDir)) {
    const alt = path.join(__dirname, '..', '..', '..', 'database', 'migrations');
    runMigrations(db, fs.existsSync(alt) ? alt : migrationsDir);
  } else {
    runMigrations(db, migrationsDir);
  }

  runSeed(db);
  return db;
}

export function initApp(dbPath: string, migrationsDir: string): Database.Database {
  resetDatabaseInstance();
  const db = getDatabase(dbPath);
  runMigrations(db, migrationsDir);
  runSeed(db);
  return db;
}

export { getDatabase, closeDatabase, resetDatabaseInstance } from './connection';
