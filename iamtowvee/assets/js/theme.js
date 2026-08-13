// assets/js/theme.js
document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.getElementById('theme-toggle');
    const root = document.documentElement;
    const icon = toggleBtn.querySelector('i');
    const sk = document.querySelectorAll('.sk');
    const skl = document.querySelectorAll('.skl');
    
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    function setTheme(theme) {
        if (theme === 'light') {
            root.setAttribute('data-theme', 'light');
            icon.className = 'fas fa-sun';
            sk.forEach(el => { el.style.display = 'none'; });
            skl.forEach(el => { el.style.display = ''; });
        } else {
            root.removeAttribute('data-theme');
            icon.className = 'fas fa-moon';
            sk.forEach(el => { el.style.display = ''; });
            skl.forEach(el => { el.style.display = 'none'; });
        }
        localStorage.setItem('theme', theme);
        currentTheme = theme;
    }
    
    setTheme(currentTheme);
    
    toggleBtn.addEventListener('click', function() {
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });
});