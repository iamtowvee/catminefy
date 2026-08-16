// ============================
// СИСТЕМА ПЕРЕВОДОВ (i18n) — JSON
// ============================

class I18n {
    constructor() {
        this.fallbackLang = 'ru_RU';
        this.currentLang = localStorage.getItem('lang') || 'ru_RU';
        this.translations = {};
        this.observers = [];
        this.isLoaded = false;
        this.loadingPromise = null;
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
     * Инициализация — загружаем текущий язык и fallback
     */
    async init() {
        if (this.isLoaded) return;

        // Загружаем текущий язык
        let currentData = await this.loadLocale(this.currentLang);
        
        // Если текущий язык не загрузился — пробуем fallback
        if (!currentData) {
            this.currentLang = this.fallbackLang;
            currentData = await this.loadLocale(this.fallbackLang);
        }

        // Если и fallback не загрузился — загружаем русский как последнюю надежду
        if (!currentData) {
            this.currentLang = 'ru_RU';
            await this.loadLocale('ru_RU');
        }

        this.isLoaded = true;
        this._updateAll();
        this._notifyObservers();

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

        // Пробуем на текущем языке
        let result = this._getNestedValue(this.translations[this.currentLang], key);
        
        // Если нет — пробуем на fallback
        if (result === undefined || result === null) {
            result = this._getNestedValue(this.translations[this.fallbackLang], key);
        }
        
        // Если и там нет — возвращаем ключ
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

        // Загружаем новую локаль
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

        // Кидаем событие для других скриптов
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
        // Сразу вызываем с текущим языком
        callback(this.currentLang);
    }

    _notifyObservers() {
        for (const cb of this.observers) {
            cb(this.currentLang);
        }
    }

    /**
     * Обновить все элементы с data-translate
     */
    _updateAll() {
        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            const translation = this.t(key);
            
            if (translation && (translation.includes('<a') || translation.includes('<span') || translation.includes('<strong'))) {
                el.innerHTML = translation;
            } else {
                el.textContent = translation || key;
            }
        });

        document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
            const key = el.getAttribute('data-translate-placeholder');
            const translation = this.t(key);
            if (translation) {
                el.placeholder = translation;
            }
        });

        document.querySelectorAll('[data-translate-title]').forEach(el => {
            const key = el.getAttribute('data-translate-title');
            const translation = this.t(key);
            if (translation) {
                el.title = translation;
            }
        });

        document.querySelectorAll('[data-translate-value]').forEach(el => {
            const key = el.getAttribute('data-translate-value');
            const translation = this.t(key);
            if (translation) {
                el.value = translation;
            }
        });
    }
}

// ============================
// ГЛОБАЛЬНЫЙ ЭКЗЕМПЛЯР
// ============================

window.i18n = new I18n();

// Автоматическая инициализация
document.addEventListener('DOMContentLoaded', () => {
    window.i18n.init();
});