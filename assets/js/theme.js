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
            
            const themeName = newTheme === 'light' ? 'Светлая тема' : 'Темная тема';
            window.notifications.success('Смена темы', `Применена тема: ${themeName}`);
            
            updateCurrentThemeDisplay(newTheme, curt);
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

function updateCurrentThemeDisplay(theme, element) {
    const themeNames = {
        'light': 'Светлая тема',
        'dark': 'Темная тема'
    };
    element.textContent = themeNames[theme] || theme;
}