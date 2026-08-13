const { app, BrowserWindow, session, ipcMain, shell } = require('electron');
const path = require('path');

const isDev = true;
let activeNotifications = [];
let mainWindow = null;

// Обработчик изменения размера окна
ipcMain.on('resize-window', (event, width, height) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setSize(width, height);
  }
});

// Обработчик уведомлений из renderer
ipcMain.on('show-notification', (event, data) => {
  const notification = {
    id: Date.now() + Math.random(),
    ...data,
    timestamp: Date.now()
  };
  activeNotifications.push(notification);
  
  BrowserWindow.getAllWindows().forEach(window => {
    if (!window.isDestroyed()) {
      window.webContents.send('show-notification', notification);
    }
  });
});

ipcMain.handle('get-active-notifications', () => {
  return activeNotifications;
});

ipcMain.on('remove-notification', (event, notificationId) => {
  activeNotifications = activeNotifications.filter(n => n.id !== notificationId);
  BrowserWindow.getAllWindows().forEach(window => {
    if (!window.isDestroyed()) {
      window.webContents.send('remove-notification', notificationId);
    }
  });
});

ipcMain.on('clear-all-notifications', () => {
  activeNotifications = [];
  BrowserWindow.getAllWindows().forEach(window => {
    if (!window.isDestroyed()) {
      window.webContents.send('clear-all-notifications');
    }
  });
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    resizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  
  mainWindow.loadFile('pages/home.html');
  mainWindow.setMenu(null);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('did-finish-load', () => {
    activeNotifications.forEach(notification => {
      mainWindow.webContents.send('show-notification', notification);
    });
  });

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F1' && isDev) {
      event.preventDefault();
      mainWindow.reload();
    }

    if (input.key === 'F2' && isDev) {
      event.preventDefault();
      mainWindow.loadFile('pages/home.html');
    }

    if (input.key === 'F12' && isDev) {
      event.preventDefault();
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  });

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
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});