document.addEventListener('DOMContentLoaded', function() {
    const theme = document.getElementById('switchThemeBtn');
    let cur = localStorage.getItem('theme') || 'light';
    
    document.documentElement.setAttribute('data-theme', cur);
    localStorage.setItem('theme', cur);

    theme.addEventListener('click', function() {
        let current = document.documentElement.getAttribute('data-theme');
        let newTheme = current === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        window.notifications.info('Смена темы', `Применена тема: ${newTheme}`);
    });
});