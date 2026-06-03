/// <reference types="vite/client" />

interface ElectronAPI {
  invoke: <T>(channel: string, ...args: unknown[]) => Promise<T>;
  openExcelFile: () => Promise<ArrayBuffer | null>;
}

interface Window {
  electronAPI?: ElectronAPI;
}
