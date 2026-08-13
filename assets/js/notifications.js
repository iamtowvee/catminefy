class NotificationSystem {
    constructor() {
        this.container = null;
        this.notifications = [];
        this.maxNotifications = 5;
        this.defaultDuration = 5000;
        this.isReady = false;
        this.init();
    }

    // 👇 НОВЫЙ МЕТОД: проверяет, включен ли тип уведомления
    isTypeEnabled(type) {
        try {
            const saved = localStorage.getItem('notificationSettings');
            if (!saved) return true; // Если настроек нет — показываем всё
            
            const settings = JSON.parse(saved);
            
            const typeMap = {
                'info': 'notifs',
                'warning': 'warns',
                'error': 'errors',
                'success': 'successes'
            };
            
            const key = typeMap[type] || 'notifs';
            return settings[key] !== undefined ? settings[key] : true;
        } catch (e) {
            return true; // В случае ошибки — показываем
        }
    }

    async init() {
        if (!document.querySelector('.notification-container')) {
            this.container = document.createElement('div');
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.querySelector('.notification-container');
        }

        this.setupIpcListeners();
        this.isReady = true;

        if (document.readyState === 'complete') {
            this.requestActiveNotifications();
        } else {
            window.addEventListener('load', () => {
                this.requestActiveNotifications();
            });
        }
    }

    setupIpcListeners() {
        if (window.electronAPI) {
            if (this._removeListener) {
                this._removeListener();
            }

            this._removeListener = window.electronAPI.onNotification((data) => {
                this.showFromIPC(data);
            });

            if (window.electronAPI.onRemoveNotification) {
                this._removeRemoveListener = window.electronAPI.onRemoveNotification((id) => {
                    this.removeFromDOM(id);
                });
            }

            if (window.electronAPI.onClearAllNotifications) {
                this._removeClearListener = window.electronAPI.onClearAllNotifications(() => {
                    this.clearAllLocal();
                });
            }
        }
    }

    async requestActiveNotifications() {
        try {
            if (window.electronAPI && window.electronAPI.getActiveNotifications) {
                const notifications = await window.electronAPI.getActiveNotifications();
                notifications.forEach(data => {
                    this.showFromIPC(data);
                });
            }
        } catch (error) {
            console.error('Ошибка получения активных уведомлений:', error);
        }
    }

    showFromIPC(data) {
        // 👇 ПРОВЕРКА: если тип уведомления выключен — не показываем
        if (!this.isTypeEnabled(data.type)) {
            console.log(`Уведомление типа "${data.type}" скрыто (выключено в настройках)`);
            return;
        }

        const exists = this.notifications.some(n => n.id === data.id);
        if (exists) return;

        const duration = data.duration || this.defaultDuration;
        const closable = data.closable !== undefined ? data.closable : true;

        const notification = this.createNotificationElement(data, closable);
        this.container.appendChild(notification);
        this.notifications.push({ ...data, element: notification });

        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(data.id);
            }, duration);
        }
    }

    createNotificationElement(data, closable) {
        const notification = document.createElement('div');
        notification.className = `notification ${data.type || 'info'}`;
        notification.dataset.id = data.id;

        const icons = {
            info: '✉',
            warning: '☹',
            error: '✘',
            success: '✔'
        };

        const icon = icons[data.type] || icons.info;

        notification.innerHTML = `
            <div class="notification-icon">
                <span>${icon}</span>
            </div>
            <div class="notification-content">
                <div class="notification-title">${this.escapeHtml(data.title)}</div>
                <div class="notification-message">${this.escapeHtml(data.message)}</div>
            </div>
            ${closable ? `<button class="notification-close" data-id="${data.id}"><span class="icon">✘</span></button>` : ''}
        `;

        if (closable) {
            const closeBtn = notification.querySelector('.notification-close');
            closeBtn.addEventListener('click', () => {
                this.removeNotification(data.id);
            });
        }

        return notification;
    }

    show(title, message, type = 'info', duration = this.defaultDuration, closable = true) {
        // 👇 ПРОВЕРКА: если тип уведомления выключен — не показываем
        if (!this.isTypeEnabled(type)) {
            console.log(`Уведомление типа "${type}" скрыто (выключено в настройках)`);
            return null;
        }

        const data = {
            id: Date.now() + Math.random(),
            title,
            message,
            type,
            duration,
            closable,
            timestamp: Date.now()
        };

        if (window.electronAPI && window.electronAPI.showNotification) {
            window.electronAPI.showNotification(data);
        } else {
            this.showFromIPC(data);
        }

        return data.id;
    }

    removeNotification(id) {
        this.removeFromDOM(id);
        if (window.electronAPI && window.electronAPI.removeNotification) {
            window.electronAPI.removeNotification(id);
        }
    }

    removeFromDOM(id) {
        const index = this.notifications.findIndex(n => n.id === id);
        if (index === -1) return;

        const notification = this.notifications[index];
        this.notifications.splice(index, 1);

        if (notification.element && notification.element.parentNode) {
            notification.element.classList.add('hiding');
            setTimeout(() => {
                if (notification.element.parentNode) {
                    notification.element.remove();
                }
            }, 400);
        }
    }

    clearAllLocal() {
        this.notifications.forEach(n => {
            if (n.element && n.element.parentNode) {
                n.element.remove();
            }
        });
        this.notifications = [];
    }

    clearAll() {
        this.clearAllLocal();
        if (window.electronAPI && window.electronAPI.clearAllNotifications) {
            window.electronAPI.clearAllNotifications();
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Удобные методы
    info(title, message, duration) {
        return this.show(title, message, 'info', duration);
    }

    warning(title, message, duration) {
        return this.show(title, message, 'warning', duration);
    }

    error(title, message, duration) {
        return this.show(title, message, 'error', duration);
    }

    success(title, message, duration) {
        return this.show(title, message, 'success', duration);
    }

    destroy() {
        if (this._removeListener) {
            this._removeListener();
        }
        if (this._removeRemoveListener) {
            this._removeRemoveListener();
        }
        if (this._removeClearListener) {
            this._removeClearListener();
        }
        this.clearAllLocal();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // ========== НАСТРОЙКИ УВЕДОМЛЕНИЙ ==========
    
    // Загружаем настройки из localStorage или устанавливаем по умолчанию
    const defaultSettings = {
        notifs: true,    // Информационные уведомления
        warns: true,     // Предупреждения
        errors: true,    // Ошибки
        successes: true  // Успехи
    };
    
    let settings = {};
    
    // Загружаем сохраненные настройки
    try {
        const saved = localStorage.getItem('notificationSettings');
        if (saved) {
            settings = JSON.parse(saved);
            // Проверяем, что все поля есть
            for (const key in defaultSettings) {
                if (!(key in settings)) {
                    settings[key] = defaultSettings[key];
                }
            }
        } else {
            settings = { ...defaultSettings };
        }
    } catch (e) {
        settings = { ...defaultSettings };
    }
    
    // Сохраняем настройки в localStorage
    function saveSettings() {
        localStorage.setItem('notificationSettings', JSON.stringify(settings));
        updateDisplay();
    }
    
    // Обновляем отображение текущих настроек
    function updateDisplay() {
        // Обновляем текстовые индикаторы
        const isNotifs = document.getElementById('isNotifs');
        const isWarns = document.getElementById('isWarns');
        const isErrors = document.getElementById('isErrors');
        const isSuccesses = document.getElementById('isSuccesses');
        
        if (isNotifs) isNotifs.innerHTML = settings.notifs ? '<span class="ans-icon"><span style="color: var(--green);">✔ Да</span></span>' : '<span class="ans-icon"><span style="color: var(--red);">✘ Нет</span></span>';
        if (isWarns) isWarns.innerHTML = settings.warns ? '<span class="ans-icon"><span style="color: var(--green);">✔ Да</span></span>' : '<span class="ans-icon"><span style="color: var(--red);">✘ Нет</span></span>';
        if (isErrors) isErrors.innerHTML = settings.errors ? '<span class="ans-icon"><span style="color: var(--green);">✔ Да</span></span>' : '<span class="ans-icon"><span style="color: var(--red);">✘ Нет</span></span>';
        if (isSuccesses) isSuccesses.innerHTML = settings.successes ? '<span class="ans-icon"><span style="color: var(--green);">✔ Да</span></span>' : '<span class="ans-icon"><span style="color: var(--red);">✘ Нет</span></span>';

        // Обновляем активные кнопки
        document.querySelectorAll('.toNotifs').forEach(btn => {
            btn.classList.remove('active');
            
            // Проверяем, какой тип уведомления эта кнопка контролирует
            const notifType = btn.dataset.notifs;
            const warnType = btn.dataset.warns;
            const errorType = btn.dataset.errors;
            const successType = btn.dataset.successes;
            
            // Если кнопка управляет одним типом
            if (notifType !== undefined && warnType === undefined) {
                if (settings.notifs === (notifType === 'true')) {
                    btn.classList.add('active');
                }
            }
            if (warnType !== undefined && notifType === undefined) {
                if (settings.warns === (warnType === 'true')) {
                    btn.classList.add('active');
                }
            }
            if (errorType !== undefined && notifType === undefined) {
                if (settings.errors === (errorType === 'true')) {
                    btn.classList.add('active');
                }
            }
            if (successType !== undefined && notifType === undefined) {
                if (settings.successes === (successType === 'true')) {
                    btn.classList.add('active');
                }
            }
            
            // Если кнопка "Включить все" или "Выключить все" (все 4 атрибута)
            if (notifType !== undefined && warnType !== undefined && errorType !== undefined && successType !== undefined) {
                const allOn = settings.notifs && settings.warns && settings.errors && settings.successes;
                const allOff = !settings.notifs && !settings.warns && !settings.errors && !settings.successes;
                
                if (notifType === 'true' && allOn) {
                    btn.classList.add('active');
                }
                if (notifType === 'false' && allOff) {
                    btn.classList.add('active');
                }
            }
        });
    }
    
    // Обновляем настройку
    function updateSetting(type, value) {
        settings[type] = value === 'true';
        saveSettings();
        
        // Уведомление об изменении
        const typeNames = {
            notifs: 'Информационные уведомления',
            warns: 'Предупреждения',
            errors: 'Ошибки',
            successes: 'Уведомления об успехе'
        };
        
        const status = value === 'true' ? 'включены' : 'выключены';
        if (window.notifications) {
            window.notifications.info(
                'Настройки уведомлений',
                `${typeNames[type] || type} ${status}`,
                3000
            );
        }
    }
    
    // Обработчики кнопок
    document.querySelectorAll('.toNotifs').forEach(button => {
        button.addEventListener('click', function() {
            const notifType = this.dataset.notifs;
            const warnType = this.dataset.warns;
            const errorType = this.dataset.errors;
            const successType = this.dataset.successes;
            
            // Если у кнопки есть все 4 атрибута — это "Включить все" или "Выключить все"
            if (notifType !== undefined && warnType !== undefined && errorType !== undefined && successType !== undefined) {
                const value = notifType === 'true';
                settings.notifs = value;
                settings.warns = value;
                settings.errors = value;
                settings.successes = value;
                saveSettings();
                
                const status = value ? 'включены' : 'выключены';
                if (window.notifications) {
                    window.notifications.info(
                        'Настройки уведомлений',
                        `Все уведомления ${status}`,
                        3000
                    );
                }
                return;
            }
            
            // Если кнопка управляет информационными уведомлениями
            if (notifType !== undefined && warnType === undefined) {
                updateSetting('notifs', notifType);
                return;
            }
            
            // Если кнопка управляет предупреждениями
            if (warnType !== undefined && notifType === undefined) {
                updateSetting('warns', warnType);
                return;
            }
            
            // Если кнопка управляет ошибками
            if (errorType !== undefined && notifType === undefined) {
                updateSetting('errors', errorType);
                return;
            }
            
            // Если кнопка управляет успехами
            if (successType !== undefined && notifType === undefined) {
                updateSetting('successes', successType);
                return;
            }
        });
    });
    
    // Обновляем отображение при загрузке
    updateDisplay();
    
    console.log('Система уведомлений настроена:', settings);
});

// Создаем глобальный экземпляр
window.notifications = new NotificationSystem();

// Очищаем при перезагрузке страницы
window.addEventListener('beforeunload', () => {
    if (window.notifications) {
        window.notifications.destroy();
    }
});