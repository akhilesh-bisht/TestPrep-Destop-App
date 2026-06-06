const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { registerIpcHandlers } = require('../ipc/handlers');

let mainWindow = null;

function getDbPaths() {
  const isDev = !app.isPackaged;

  const userData = app.getPath('userData');

  const dbPath = isDev
    ? path.join(process.cwd(), 'database', 'app.db')
    : path.join(userData, 'app.db');

  const migrationsDir = isDev
    ? path.join(process.cwd(), 'database', 'migrations')
    : path.join(process.resourcesPath, 'database', 'migrations');

  return { dbPath, migrationsDir, isDev };
}

function createWindow() {
  const isDev = !app.isPackaged;

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    const indexPath = path.join(__dirname, '../../frontend/dist/index.html');

    console.log('app.isPackaged:', app.isPackaged);
    console.log('__dirname:', __dirname);
    console.log('indexPath:', indexPath);
    console.log('exists:', fs.existsSync(indexPath));

    mainWindow.loadFile(indexPath);
  }
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  const paths = getDbPaths();
  registerIpcHandlers(paths);

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('dialog:openExcel', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Excel', extensions: ['xlsx', 'xls', 'csv'] }],
  });

  if (result.canceled || !result.filePaths[0]) return null;

  return fs.readFileSync(result.filePaths[0]);
});
