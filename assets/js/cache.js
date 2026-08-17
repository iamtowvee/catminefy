// cache.js
document.addEventListener('DOMContentLoaded', function() {
    const cacheSizeEl = document.getElementById('cache-size');
    const clearCacheBtn = document.getElementById('clear-cache-btn');
    const unitSelect = document.getElementById('cache-unit-select');
    
    if (!cacheSizeEl) {
        console.warn('Элемент #cache-size не найден');
        return;
    }
    
    let currentUnit = localStorage.getItem('cache-unit') || 'gb';
    if (unitSelect) {
        unitSelect.value = currentUnit;
    }
    
    function t(key, fallback) {
        if (window.i18n) {
            const result = window.i18n.t(key);
            if (result && result !== key) return result;
        }
        return fallback || key;
    }
    
    function formatSize(bytes, unit) {
        if (bytes === 0) return '0 B';
        
        if (unit === 'gib') {
            const gib = bytes / (1024 * 1024 * 1024);
            return gib.toFixed(2) + ' GiB';
        }
        
        // gb (по умолчанию)
        const gb = bytes / (1000 * 1000 * 1000);
        return gb.toFixed(2) + ' GB';
    }
    
    async function loadCacheSize() {
        if (!window.electronAPI || !window.electronAPI.getCacheSize) {
            cacheSizeEl.textContent = 'API недоступно';
            return;
        }
        
        try {
            const result = await window.electronAPI.getCacheSize();
            if (result.success) {
                const unit = unitSelect ? unitSelect.value : 'gb';
                cacheSizeEl.textContent = formatSize(result.size, unit);
            } else {
                const errorText = t('app.settings.content.app_cache.cant_get_cache_size', 'Ошибка');
                cacheSizeEl.textContent = errorText;
            }
        } catch (error) {
            console.error('Ошибка получения размера кэша:', error);
            const errorText = t('app.settings.content.app_cache.cant_get_cache_size', 'Ошибка');
            cacheSizeEl.textContent = errorText;
        }
    }
    
    async function clearCache() {
        if (!window.electronAPI || !window.electronAPI.clearCache) {
            window.notifications?.error('Ошибка', 'API очистки недоступно');
            return;
        }
        
        if (window.modal) {
            const title = t('app.settings.content.subtitles.app_cache', 'Кэш приложения');
            const message = t('app.settings.content.app_cache.clear_confirm', 'Вы уверены, что хотите очистить кэш приложения?');
            const confirmed = await window.modal.confirm(message, title);
            if (!confirmed) return;
        } else {
            const message = t('app.settings.content.app_cache.clear_confirm', 'Вы уверены, что хотите очистить кэш приложения?');
            if (!confirm(message)) return;
        }
        
        try {
            clearCacheBtn.disabled = true;
            clearCacheBtn.textContent = '⌚ ' + t('app.settings.content.app_cache.clearing', 'Очистка...');
            
            const result = await window.electronAPI.clearCache();
            
            if (result.success) {
                window.notifications?.success(t('app.settings.content.app_cache.cleared', 'Кэш очищен'), result.message || '');
                await loadCacheSize();
            } else {
                const errorText = t('app.settings.content.app_cache.cant_get_cache_size', 'Ошибка');
                window.notifications?.error(errorText, result.error || 'Не удалось очистить кэш');
            }
        } catch (error) {
            console.error('Ошибка очистки кэша:', error);
            const errorText = t('app.settings.content.app_cache.cant_get_cache_size', 'Ошибка');
            window.notifications?.error(errorText, error.message || 'Не удалось очистить кэш');
        } finally {
            clearCacheBtn.disabled = false;
            clearCacheBtn.textContent = t('app.settings.content.buttons.clear_cache', 'Очистить кэш');
        }
    }
    
    if (clearCacheBtn) {
        clearCacheBtn.addEventListener('click', clearCache);
    }
    
    if (unitSelect) {
        unitSelect.addEventListener('change', function() {
            localStorage.setItem('cache-unit', this.value);
            loadCacheSize();
        });
    }
    
    if (window.i18n) {
        window.i18n.onChange(() => {
            if (clearCacheBtn && !clearCacheBtn.disabled) {
                clearCacheBtn.textContent = t('app.settings.content.buttons.clear_cache', 'Очистить кэш');
            }
        });
    }
    
    loadCacheSize();
    
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            loadCacheSize();
        }
    });
    
    console.log('Система кэша загружена');
});