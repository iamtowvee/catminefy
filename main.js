const { app, BrowserWindow, session, ipcMain } = require('electron');
const path = require('path');

let activeNotifications = [];

// Обработчик уведомлений из renderer
ipcMain.on('show-notification', (event, data) => {
    // Сохраняем уведомление в хранилище
    const notification = {
        id: Date.now() + Math.random(),
        ...data,
        timestamp: Date.now()
    };
    activeNotifications.push(notification);
    
    // Отправляем уведомление всем окнам
    BrowserWindow.getAllWindows().forEach(window => {
        if (!window.isDestroyed()) {
            window.webContents.send('show-notification', notification);
        }
    });
});

// Метод для получения всех активных уведомлений
ipcMain.handle('get-active-notifications', () => {
    return activeNotifications;
});

// Метод для удаления уведомления
ipcMain.on('remove-notification', (event, notificationId) => {
    activeNotifications = activeNotifications.filter(n => n.id !== notificationId);
    // Уведомляем все окна об удалении
    BrowserWindow.getAllWindows().forEach(window => {
        if (!window.isDestroyed()) {
            window.webContents.send('remove-notification', notificationId);
        }
    });
});

// Метод для очистки всех уведомлений
ipcMain.on('clear-all-notifications', () => {
    activeNotifications = [];
    BrowserWindow.getAllWindows().forEach(window => {
        if (!window.isDestroyed()) {
            window.webContents.send('clear-all-notifications');
        }
    });
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    autoHideMenuBar: true,
    backgroundColor: '#fff',
    webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        preload: path.join(__dirname, 'preload.js')
    }
    });
  win.loadFile('pages/home.html');
  win.setMenu(null);

  win.webContents.on('did-finish-load', () => {
        activeNotifications.forEach(notification => {
            win.webContents.send('show-notification', notification);
        });
    });
}

app.whenReady().then(createWindow);