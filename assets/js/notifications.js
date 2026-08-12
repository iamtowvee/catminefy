class NotificationSystem {
    constructor() {
        this.container = null;
        this.notifications = [];
        this.maxNotifications = 5;
        this.defaultDuration = 5000;
        this.isReady = false;
        this.init();
    }

    async init() {
        // Создаем контейнер для уведомлений
        if (!document.querySelector('.notification-container')) {
            this.container = document.createElement('div');
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.querySelector('.notification-container');
        }

        // Настраиваем IPC-слушатели
        this.setupIpcListeners();
        this.isReady = true;

        // Запрашиваем активные уведомления после загрузки страницы
        if (document.readyState === 'complete') {
            this.requestActiveNotifications();
        } else {
            window.addEventListener('load', () => {
                this.requestActiveNotifications();
            });
        }
    }

    setupIpcListeners() {
        // Слушаем входящие уведомления из main процесса
        if (window.electronAPI) {
            // Удаляем старые слушатели
            if (this._removeListener) {
                this._removeListener();
            }

            // Добавляем новый слушатель для уведомлений
            this._removeListener = window.electronAPI.onNotification((data) => {
                this.showFromIPC(data);
            });

            // Слушаем удаление уведомлений
            if (window.electronAPI.onRemoveNotification) {
                this._removeRemoveListener = window.electronAPI.onRemoveNotification((id) => {
                    this.removeFromDOM(id);
                });
            }

            // Слушаем очистку всех уведомлений
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
        // Проверяем, не существует ли уже такое уведомление
        const exists = this.notifications.some(n => n.id === data.id);
        if (exists) return;

        const duration = data.duration || this.defaultDuration;
        const closable = data.closable !== undefined ? data.closable : true;

        // Создаем уведомление
        const notification = this.createNotificationElement(data, closable);
        
        // Добавляем в контейнер
        this.container.appendChild(notification);
        this.notifications.push({ ...data, element: notification });

        // Настройка автоматического закрытия
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
            info: 'info',
            warning: 'warning',
            error: 'error',
            success: 'check_circle'
        };

        const icon = icons[data.type] || icons.info;

        notification.innerHTML = `
            <div class="notification-icon">
                <span class="material-symbols-outlined">${icon}</span>
            </div>
            <div class="notification-content">
                <div class="notification-title">${this.escapeHtml(data.title)}</div>
                <div class="notification-message">${this.escapeHtml(data.message)}</div>
            </div>
            ${closable ? `<button class="notification-close" data-id="${data.id}"><i class="fa-solid fa-xmark"></i></button>` : ''}
        `;

        // Обработчик закрытия
        if (closable) {
            const closeBtn = notification.querySelector('.notification-close');
            closeBtn.addEventListener('click', () => {
                this.removeNotification(data.id);
            });
        }

        return notification;
    }

    /**
     * Показать уведомление
     */
    show(title, message, type = 'info', duration = this.defaultDuration, closable = true) {
        const data = {
            id: Date.now() + Math.random(),
            title,
            message,
            type,
            duration,
            closable,
            timestamp: Date.now()
        };

        // Отправляем уведомление через IPC в main процесс
        if (window.electronAPI && window.electronAPI.showNotification) {
            window.electronAPI.showNotification(data);
        } else {
            // Fallback для локального использования
            this.showFromIPC(data);
        }

        return data.id;
    }

    /**
     * Удалить уведомление
     */
    removeNotification(id) {
        // Удаляем из DOM
        this.removeFromDOM(id);
        
        // Уведомляем main процесс об удалении
        if (window.electronAPI && window.electronAPI.removeNotification) {
            window.electronAPI.removeNotification(id);
        }
    }

    /**
     * Удалить уведомление из DOM
     */
    removeFromDOM(id) {
        // Находим уведомление
        const index = this.notifications.findIndex(n => n.id === id);
        if (index === -1) return;

        const notification = this.notifications[index];
        
        // Удаляем из массива
        this.notifications.splice(index, 1);

        // Удаляем из DOM с анимацией
        if (notification.element && notification.element.parentNode) {
            notification.element.classList.add('hiding');
            setTimeout(() => {
                if (notification.element.parentNode) {
                    notification.element.remove();
                }
            }, 400);
        }
    }

    /**
     * Очистить все уведомления локально
     */
    clearAllLocal() {
        this.notifications.forEach(n => {
            if (n.element && n.element.parentNode) {
                n.element.remove();
            }
        });
        this.notifications = [];
    }

    /**
     * Очистить все уведомления (локально и в main процессе)
     */
    clearAll() {
        this.clearAllLocal();

        if (window.electronAPI && window.electronAPI.clearAllNotifications) {
            window.electronAPI.clearAllNotifications();
        }
    }

    /**
     * Экранирование HTML
     */
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

    // Очистка при размонтировании
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

// Создаем глобальный экземпляр
window.notifications = new NotificationSystem();

// Очищаем при перезагрузке страницы
window.addEventListener('beforeunload', () => {
    if (window.notifications) {
        window.notifications.destroy();
    }
});