// theme.js
document.addEventListener('DOMContentLoaded', function() {
    const themeButtons = document.querySelectorAll('.toTheme');
    const curt = document.getElementById('curTheme');
    
    if (!themeButtons || themeButtons.length === 0) {
        console.warn('Кнопки .toTheme не найдены');
    }
    
    if (!curt) {
        console.warn('Элемент #curTheme не найден');
    }
    
    // ✅ РЕГИСТРИРУЕМ #curTheme С ПРАВИЛЬНЫМ КЛЮЧОМ
    if (window.i18n) {
        const currentTheme = localStorage.getItem('theme') || 'light';
        const key = currentTheme === 'light' ? 'light' : 'dark';
        window.i18n.register(curt, `app.settings.content.themes.${key}`, 'Светлая тема');
    }
    
    let currentTheme = localStorage.getItem('theme') || 'light';
    
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    
    updateActiveButton(currentTheme, themeButtons);
    updateCurrentThemeDisplay(currentTheme, curt);
    
    themeButtons.forEach(button => {
        button.addEventListener('click', function() {
            let newTheme = this.dataset.tthm;
            
            if (newTheme !== 'dark' && newTheme !== 'light') {
                console.error('Неправильная тема:', newTheme);
                return;
            }
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // ✅ ОБНОВЛЯЕМ РЕГИСТРАЦИЮ #curTheme
            if (window.i18n) {
                const key = newTheme === 'light' ? 'light' : 'dark';
                window.i18n.register(curt, `app.settings.content.themes.${key}`, 'Светлая тема');
                window.i18n._updateAll();
            }
            
            updateCurrentThemeDisplay(newTheme, curt);
            updateActiveButton(newTheme, themeButtons);
            
            const themeKey = newTheme === 'light' ? 'light' : 'dark';
            const themeName = window.i18n ? window.i18n.t(`app.settings.content.themes.${themeKey}`) : (newTheme === 'light' ? 'Светлая тема' : 'Темная тема');
            const title = window.i18n ? window.i18n.t('app.settings.content.themes.change_title', 'Смена темы') : 'Смена темы';
            const message = window.i18n ? window.i18n.t('app.settings.content.themes.change_message', 'Применена тема: {theme}').replace('{theme}', themeName) : `Применена тема: ${themeName}`;
            
            window.notifications.success(title, message);
        });
    });
});

function updateActiveButton(theme, buttons) {
    buttons.forEach(button => {
        if (button.dataset.tthm === theme) {
            button.classList.add('tthma');
        } else {
            button.classList.remove('tthma');
        }
    });
}

function updateCurrentThemeDisplay(theme, element) {
    if (!element) return;
    if (!window.i18n) {
        element.textContent = theme === 'light' ? 'Светлая тема' : 'Темная тема';
    }
}