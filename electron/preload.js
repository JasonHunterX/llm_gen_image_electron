const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveImage: (imageData) => ipcRenderer.invoke('save-image', imageData),
});