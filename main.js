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

// ============================
// КЭШ ПРИЛОЖЕНИЯ
// ============================

/**
 * Получить размер папки рекурсивно
 */
async function getFolderSize(folderPath) {
    let totalSize = 0;
    try {
        const files = await fs.readdir(folderPath, { withFileTypes: true });
        for (const file of files) {
            const filePath = path.join(folderPath, file.name);
            if (file.isDirectory()) {
                totalSize += await getFolderSize(filePath);
            } else {
                const stats = await fs.stat(filePath);
                totalSize += stats.size;
            }
        }
    } catch (error) {
        // Если папки нет или ошибка доступа
        return 0;
    }
    return totalSize;
}

/**
 * Форматировать размер в удобный вид
 */
function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Получить путь к кэшу приложения
 */
function getCachePath() {
    const appName = app.getName() || 'catminefy';
    const cacheDir = path.join(app.getPath('userData'), 'Cache');
    return cacheDir;
}

// IPC: Получить размер кэша
ipcMain.handle('get-cache-size', async () => {
    try {
        const cachePath = getCachePath();
        const size = await getFolderSize(cachePath);
        return { success: true, size: size, formatted: formatSize(size) };
    } catch (error) {
        console.error('Ошибка получения размера кэша:', error);
        return { success: false, error: error.message };
    }
});

// IPC: Очистить кэш
ipcMain.handle('clear-cache', async () => {
    try {
        const cachePath = getCachePath();
        
        // Проверяем, существует ли папка
        try {
            await fs.access(cachePath);
        } catch {
            return { success: true, message: 'Кэш уже пуст' };
        }
        
        // Удаляем всё содержимое папки
        const files = await fs.readdir(cachePath);
        let deletedCount = 0;
        let deletedSize = 0;
        
        for (const file of files) {
            const filePath = path.join(cachePath, file);
            const stats = await fs.stat(filePath);
            if (stats.isDirectory()) {
                deletedSize += await getFolderSize(filePath);
                await fs.rm(filePath, { recursive: true, force: true });
            } else {
                deletedSize += stats.size;
                await fs.unlink(filePath);
            }
            deletedCount++;
        }
        
        return {
            success: true,
            message: `Очищено ${deletedCount} элементов (${formatSize(deletedSize)})`,
            deletedCount,
            deletedSize
        };
    } catch (error) {
        console.error('Ошибка очистки кэша:', error);
        return { success: false, error: error.message };
    }
});

// IPC: Получить путь к кэшу (для отладки)
ipcMain.handle('get-cache-path', () => {
    return getCachePath();
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