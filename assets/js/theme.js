// theme.js
document.addEventListener('DOMContentLoaded', function() {
    const langs = {
        ru_RU: {
            dark: "Тёмная тема",
            light: "Светлая тема",
            notifications: {
                title: "Смена темы",
                message: "Применена тема: "
            }
        },
        en_US: {
            dark: "Dark theme",
            light: "Light theme",
            notifications: {
                title: "Theme changed",
                message: "Applied theme: "
            }
        }
    };
    
    const themeButtons = document.querySelectorAll('.toTheme');
    const curt = document.getElementById('curTheme');
    
    if (!themeButtons || themeButtons.length === 0) {
        console.warn('Кнопки .toTheme не найдены');
    }
    
    if (!curt) {
        console.warn('Элемент #curTheme не найден');
    }
    
    const currentLang = localStorage.getItem('lang') || 'en_US';
    let currentTheme = localStorage.getItem('theme') || 'light';
    
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    
    updateActiveButton(currentTheme, themeButtons);
    updateCurrentThemeDisplay(currentTheme, currentLang, langs, curt);
    
    themeButtons.forEach(button => {
        button.addEventListener('click', function() {
            let newTheme = this.dataset.tthm;
            let lang = localStorage.getItem('lang') || 'en_US';
            
            if (newTheme !== 'dark' && newTheme !== 'light') {
                console.error('Неправильная тема:', newTheme);
                return;
            }
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            const notif = langs[lang].notifications;
            const themeName = langs[lang][newTheme];
            window.notifications.success(notif.title, notif.message + themeName);
            
            updateCurrentThemeDisplay(newTheme, lang, langs, curt);
            updateActiveButton(newTheme, themeButtons);
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

function updateCurrentThemeDisplay(theme, lang, langs, element) {
    if (!langs[lang]) {
        console.error('Язык не найден для темы:', lang);
        element.textContent = theme === 'dark' ? 'Dark' : 'Light';
        return;
    }
    
    if (langs[lang] && langs[lang][theme]) {
        element.textContent = langs[lang][theme];
    } else {
        console.warn('Тема не найдена:', theme, 'для языка:', lang);
        element.textContent = theme === 'dark' ? 'Dark' : 'Light';
    }
}