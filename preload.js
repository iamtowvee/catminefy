const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {    
    // Уведомления
    showNotification: (data) => ipcRenderer.send('show-notification', data),
    onNotification: (callback) => {
        ipcRenderer.on('show-notification', (event, data) => callback(data));
        return () => ipcRenderer.removeAllListeners('show-notification');
    },
    removeNotification: (id) => ipcRenderer.send('remove-notification', id),
    getActiveNotifications: () => ipcRenderer.invoke('get-active-notifications'),
    clearAllNotifications: () => ipcRenderer.send('clear-all-notifications'),
    onRemoveNotification: (callback) => {
        ipcRenderer.on('remove-notification', (event, id) => callback(id));
        return () => ipcRenderer.removeAllListeners('remove-notification');
    },
    onClearAllNotifications: (callback) => {
        ipcRenderer.on('clear-all-notifications', () => callback());
        return () => ipcRenderer.removeAllListeners('clear-all-notifications');
    },
    resizeWindow: (width, height) => ipcRenderer.send('resize-window', width, height),
    getCacheSize: () => ipcRenderer.invoke('get-cache-size'),
    clearCache: () => ipcRenderer.invoke('clear-cache'),
    getCachePath: () => ipcRenderer.invoke('get-cache-path')
});