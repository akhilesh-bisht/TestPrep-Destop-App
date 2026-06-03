import path from 'path';

export interface AppConfig {
  dbPath: string;
  isDev: boolean;
}

export function getConfig(customDbPath?: string): AppConfig {
  const isDev = process.env.NODE_ENV === 'development';
  const dbPath =
    customDbPath ||
    process.env.DB_PATH ||
    path.join(process.cwd(), 'database', 'app.db');

  return { dbPath, isDev };
}
