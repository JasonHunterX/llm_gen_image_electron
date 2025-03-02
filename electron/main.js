const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = require('electron-is-dev');
const url = require('url');
const axios = require('axios');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    frame: false, // 移除默认的窗口框架
    titleBarStyle: 'hidden', // 修改为 hidden
    backgroundColor: '#f5f5f5',
    // 添加窗口控制按钮
    titleBarOverlay: {
      color: '#2e3440',
      symbolColor: '#ffffff',
      height: 40
    },
  });
  
  const startUrl = isDev
    ? 'http://localhost:3000'
    : url.format({
        pathname: path.join(__dirname, '../dist/index.html'),
        protocol: 'file:',
        slashes: true,
      });

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// 处理保存图片到本地
ipcMain.handle('save-image', async (event, imageUrl) => {
  try {
    const { filePath } = await dialog.showSaveDialog({
      title: '保存图片',
      defaultPath: path.join(app.getPath('pictures'), 'ai-generated-image.png'),
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg'] }],
    });

    if (filePath) {
      // 下载URL图片并保存到本地
      const response = await axios({
        url: imageUrl,
        method: 'GET',
        responseType: 'arraybuffer'
      });
      
      fs.writeFileSync(filePath, Buffer.from(response.data));
      return { success: true, filePath };
    }
    return { success: false, message: '用户取消了保存操作' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});