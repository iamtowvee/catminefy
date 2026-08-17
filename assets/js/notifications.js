class NotificationSystem {
    constructor() {
        this.container = null;
        this.notifications = [];
        this.maxNotifications = 5;
        this.defaultDuration = 5000;
        this.isReady = false;
        this.init();
    }

    isTypeEnabled(type) {
        try {
            const saved = localStorage.getItem('notificationSettings');
            if (!saved) return true;
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
            return true;
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

// ============================
// НАСТРОЙКИ УВЕДОМЛЕНИЙ — ВСЁ ЧЕРЕЗ i18n
// ============================

document.addEventListener('DOMContentLoaded', function() {
    const defaultSettings = {
        notifs: true,
        warns: true,
        errors: true,
        successes: true
    };
    
    let settings = {};
    
    try {
        const saved = localStorage.getItem('notificationSettings');
        if (saved) {
            settings = JSON.parse(saved);
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

    function t(key, fallback) {
        if (window.i18n) {
            const result = window.i18n.t(key);
            if (result && result !== key) return result;
        }
        return fallback || key;
    }
    
    function saveSettings() {
        localStorage.setItem('notificationSettings', JSON.stringify(settings));
        updateDisplay();
    }
    
    function updateDisplay() {
        const isNotifs = document.getElementById('isNotifs');
        const isWarns = document.getElementById('isWarns');
        const isErrors = document.getElementById('isErrors');
        const isSuccesses = document.getElementById('isSuccesses');
        
        // ✅ РЕГИСТРИРУЕМ ЭЛЕМЕНТЫ ДЛЯ АВТООБНОВЛЕНИЯ
        if (window.i18n) {
            // Регистрируем каждый элемент с его текущим ключом
            const currentLang = localStorage.getItem('lang') || 'ru_RU';
            
            // Для каждого элемента проверяем, включён ли он, и регистрируем с правильным значением
            const elements = [
                { el: isNotifs, key: 'notifs' },
                { el: isWarns, key: 'warns' },
                { el: isErrors, key: 'errors' },
                { el: isSuccesses, key: 'successes' }
            ];
            
            elements.forEach(({ el, key }) => {
                if (el) {
                    const value = settings[key];
                    // Регистрируем с ключом yes или no в зависимости от значения
                    const valueKey = value ? 'yes' : 'no';
                    const translateKey = `app.settings.content.notifications.values.${valueKey}`;
                    window.i18n.register(el, translateKey, value ? '✔ Да' : '✘ Нет', 'innerHTML');
                }
            });
        }
        
        // Обновляем активные кнопки (это не требует перевода)
        document.querySelectorAll('.toNotifs').forEach(btn => {
            btn.classList.remove('active');
            
            const notifType = btn.dataset.notifs;
            const warnType = btn.dataset.warns;
            const errorType = btn.dataset.errors;
            const successType = btn.dataset.successes;
            
            if (notifType !== undefined && warnType === undefined) {
                if (settings.notifs === (notifType === 'true')) btn.classList.add('active');
            }
            if (warnType !== undefined && notifType === undefined) {
                if (settings.warns === (warnType === 'true')) btn.classList.add('active');
            }
            if (errorType !== undefined && notifType === undefined) {
                if (settings.errors === (errorType === 'true')) btn.classList.add('active');
            }
            if (successType !== undefined && notifType === undefined) {
                if (settings.successes === (successType === 'true')) btn.classList.add('active');
            }
            
            if (notifType !== undefined && warnType !== undefined && errorType !== undefined && successType !== undefined) {
                const allOn = settings.notifs && settings.warns && settings.errors && settings.successes;
                const allOff = !settings.notifs && !settings.warns && !settings.errors && !settings.successes;
                
                if (notifType === 'true' && allOn) btn.classList.add('active');
                if (notifType === 'false' && allOff) btn.classList.add('active');
            }
        });
    }
    
    function updateSetting(type, value) {
        settings[type] = value === 'true';
        saveSettings();
        
        const typeNames = {
            notifs: t('app.settings.content.notifications.info', 'Информационные уведомления'),
            warns: t('app.settings.content.notifications.warn', 'Предупреждения'),
            errors: t('app.settings.content.notifications.error', 'Ошибки'),
            successes: t('app.settings.content.notifications.success', 'Уведомления об успехе')
        };
        
        const statusKey = value === 'true' ? 'enabled' : 'disabled';
        const status = t(`app.settings.content.notifications.statuses.${statusKey}`, value === 'true' ? 'включены' : 'выключены');
        
        if (window.notifications) {
            const title = t('app.settings.content.subtitles.notifications', 'Настройки уведомлений');
            const message = t('app.settings.content.notifications.single_status', '{name} {status}')
                .replace('{name}', typeNames[type] || type)
                .replace('{status}', status);
            window.notifications.info(title, message, 3000);
        }
    }
    
    document.querySelectorAll('.toNotifs').forEach(button => {
        button.addEventListener('click', function() {
            const notifType = this.dataset.notifs;
            const warnType = this.dataset.warns;
            const errorType = this.dataset.errors;
            const successType = this.dataset.successes;
            
            if (notifType !== undefined && warnType !== undefined && errorType !== undefined && successType !== undefined) {
                const value = notifType === 'true';
                settings.notifs = value;
                settings.warns = value;
                settings.errors = value;
                settings.successes = value;
                saveSettings();
                
                if (window.notifications) {
                    const title = t('app.settings.content.subtitles.notifications', 'Настройки уведомлений');
                    const statusKey = value ? 'enabled' : 'disabled';
                    const status = t(`app.settings.content.notifications.statuses.${statusKey}`, value ? 'включены' : 'выключены');
                    const message = t('app.settings.content.notifications.all_status', 'Все уведомления {status}').replace('{status}', status);
                    window.notifications.info(title, message, 3000);
                }
                return;
            }
            
            if (notifType !== undefined && warnType === undefined) {
                updateSetting('notifs', notifType);
                return;
            }
            if (warnType !== undefined && notifType === undefined) {
                updateSetting('warns', warnType);
                return;
            }
            if (errorType !== undefined && notifType === undefined) {
                updateSetting('errors', errorType);
                return;
            }
            if (successType !== undefined && notifType === undefined) {
                updateSetting('successes', successType);
                return;
            }
        });
    });
    
    updateDisplay();
    
    console.log('Система уведомлений настроена:', settings);
});

window.notifications = new NotificationSystem();

window.addEventListener('beforeunload', () => {
    if (window.notifications) {
        window.notifications.destroy();
    }
});