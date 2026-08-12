document.addEventListener('DOMContentLoaded', async () => {
    const cacheSizeSpan = document.getElementById('cache-size');
    const clearCacheBtn = document.getElementById('clear-cache-btn');

    async function updateCacheSize() {
        try {
            const size = await window.electronAPI.getCacheSize();
            cacheSizeSpan.textContent = size;
        } catch (error) {
            console.error('Ошибка:', error);
            window.notifications.error('Ошибка кэша', 'Не удалось загрузить размер кэша');
            cacheSizeSpan.textContent = 'Ошибка';
        }
    }

    await updateCacheSize();

    clearCacheBtn.addEventListener('click', async () => {
        try {
            cacheSizeSpan.textContent = 'Очистка...';
            clearCacheBtn.disabled = true;
            
            const result = await window.electronAPI.clearCache();
            
            if (result.success) {
                setTimeout(async () => {
                    await updateCacheSize();
                    clearCacheBtn.disabled = false;
                    location.reload();
                    window.notifications.success('Готово', 'Кэш приложения очищен');
                }, 500);
            } else {
                console.error('Ошибка:', result.error);
                window.notifications.error('Ошибка кэша', 'Не удалось очистить кэш приложения');
                clearCacheBtn.disabled = false;
            }
        } catch (error) {
            console.error('Ошибка очистки:', error);
            window.notifications.error('Ошибка кэша', 'Не удалось очистить кэш приложения');
            clearCacheBtn.disabled = false;
        }
    });
});