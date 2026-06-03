const { contextBridge, ipcRenderer } = require('electron');

const api = {
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  openExcelFile: () => ipcRenderer.invoke('dialog:openExcel'),
};

contextBridge.exposeInMainWorld('electronAPI', api);
