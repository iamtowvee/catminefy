// ============================
// СИСТЕМА ПЕРЕВОДОВ (i18n) — ПОЛНАЯ ВЕРСИЯ
// ============================

class I18n {
    constructor() {
        this.fallbackLang = 'ru_RU';
        this.currentLang = localStorage.getItem('lang') || 'ru_RU';
        this.translations = {};
        this.observers = [];
        this.isLoaded = false;
        this.dynamicElements = []; // Массив зарегистрированных элементов
    }

    /**
     * Загрузить локаль
     */
    async loadLocale(lang) {
        if (this.translations[lang]) {
            return this.translations[lang];
        }

        try {
            const response = await fetch(`../assets/locales/${lang}.json`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const data = await response.json();
            this.translations[lang] = data;
            return data;
        } catch (error) {
            console.error(`[i18n] Ошибка загрузки локали ${lang}:`, error);
            return null;
        }
    }

    /**
     * Инициализация
     */
    async init() {
        if (this.isLoaded) return;

        let currentData = await this.loadLocale(this.currentLang);
        if (!currentData) {
            this.currentLang = this.fallbackLang;
            currentData = await this.loadLocale(this.fallbackLang);
        }
        if (!currentData) {
            this.currentLang = 'ru_RU';
            await this.loadLocale('ru_RU');
        }

        this.isLoaded = true;
        this._updateAll();
        this._notifyObservers();

        // 👇 КИДАЕМ СОБЫТИЕ, ЧТО I18N ГОТОВ
        document.dispatchEvent(new CustomEvent('i18nReady', {
            detail: { lang: this.currentLang }
        }));

        console.log(`🌍 I18n инициализирован: ${this.currentLang}`);
    }

    /**
     * Получить перевод по ключу
     */
    t(key) {
        if (!this.isLoaded) {
            console.warn('[i18n] Не инициализирован, возвращаем ключ:', key);
            return key;
        }

        let result = this._getNestedValue(this.translations[this.currentLang], key);
        if (result === undefined || result === null) {
            result = this._getNestedValue(this.translations[this.fallbackLang], key);
        }
        if (result === undefined || result === null) {
            console.warn(`[i18n] Перевод не найден: ${key}`);
            return key;
        }
        return result;
    }

    /**
     * Получить вложенное значение по точечному ключу
     */
    _getNestedValue(obj, key) {
        if (!obj) return undefined;
        const keys = key.split('.');
        let current = obj;
        for (const k of keys) {
            if (current[k] === undefined) {
                return undefined;
            }
            current = current[k];
        }
        return current;
    }

    /**
     * Сменить язык
     */
    async setLanguage(lang) {
        if (lang === this.currentLang) return;

        const data = await this.loadLocale(lang);
        if (!data) {
            console.warn(`[i18n] Язык ${lang} не загружен, используем fallback`);
            lang = this.fallbackLang;
            await this.loadLocale(lang);
        }

        this.currentLang = lang;
        localStorage.setItem('lang', lang);
        this._updateAll();
        this._notifyObservers();

        document.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { lang }
        }));

        console.log(`🌍 Язык изменён: ${lang}`);
    }

    /**
     * Получить текущий язык
     */
    getLanguage() {
        return this.currentLang;
    }

    /**
     * Зарегистрировать колбэк при смене языка
     */
    onChange(callback) {
        this.observers.push(callback);
        callback(this.currentLang);
    }

    _notifyObservers() {
        for (const cb of this.observers) {
            cb(this.currentLang);
        }
    }

    // ============================================================
    // 👇 НОВАЯ СИСТЕМА РЕГИСТРАЦИИ ДИНАМИЧЕСКИХ ЭЛЕМЕНТОВ
    // ============================================================

    /**
     * Зарегистрировать элемент для автоматического обновления при смене языка
     * 
     * @param {HTMLElement} element - DOM элемент
     * @param {string} key - Ключ перевода (полный путь в JSON)
     * @param {string} fallback - Текст, если перевод не найден
     * @param {string} mode - 'textContent' (по умолчанию) или 'innerHTML'
     */
    register(element, key, fallback = '', mode = 'textContent') {
        if (!element) {
            console.warn('[i18n] Невалидный элемент для регистрации:', key);
            return;
        }

        // Проверяем, не зарегистрирован ли уже этот элемент
        const existing = this.dynamicElements.findIndex(e => e.element === element);
        if (existing !== -1) {
            this.dynamicElements[existing] = { element, key, fallback, mode };
        } else {
            this.dynamicElements.push({ element, key, fallback, mode });
        }
        this._updateElement(element, key, fallback, mode);
    }

    /**
     * Обновить один элемент
     */
    _updateElement(element, key, fallback, mode) {
        if (!element || !element.isConnected) return;
        const translation = this.t(key);
        const text = (translation && translation !== key) ? translation : fallback;
        if (mode === 'innerHTML') {
            element.innerHTML = text;
        } else {
            element.textContent = text;
        }
    }

    /**
     * Обновить все зарегистрированные элементы
     */
    _updateDynamicElements() {
        for (const { element, key, fallback, mode } of this.dynamicElements) {
            if (element && element.isConnected) {
                this._updateElement(element, key, fallback, mode);
            }
        }
    }

    /**
     * Обновить элементы с data-translate И динамические
     */
    _updateAll() {
        // 1. data-translate элементы
        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            const translation = this.t(key);
            if (typeof translation === 'string' && (translation.includes('<a') || translation.includes('<span') || translation.includes('<strong'))) {
                el.innerHTML = translation;
            } else {
                el.textContent = (typeof translation === 'string') ? translation : key;
            }
        });

        document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
            const key = el.getAttribute('data-translate-placeholder');
            const translation = this.t(key);
            if (typeof translation === 'string' && translation) {
                el.placeholder = translation;
            }
        });

        document.querySelectorAll('[data-translate-title]').forEach(el => {
            const key = el.getAttribute('data-translate-title');
            const translation = this.t(key);
            if (typeof translation === 'string' && translation) {
                el.title = translation;
            }
        });

        document.querySelectorAll('[data-translate-value]').forEach(el => {
            const key = el.getAttribute('data-translate-value');
            const translation = this.t(key);
            if (typeof translation === 'string' && translation) {
                el.value = translation;
            }
        });

        // 2. Динамические элементы
        this._updateDynamicElements();
    }
}

// ============================
// ГЛОБАЛЬНЫЙ ЭКЗЕМПЛЯР
// ============================

window.i18n = new I18n();

// Инициализация и запуск
window.i18n.init().then(() => {
    // После загрузки JSON — кидаем событие (уже есть внутри init, но на всякий случай дублируем)
    console.log('✅ I18n полностью загружен и готов');
}).catch(err => {
    console.error('❌ Ошибка инициализации i18n:', err);
});