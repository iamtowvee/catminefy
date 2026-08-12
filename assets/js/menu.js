(function() {
    const burger = document.getElementById('burgerBtn');
    const nav = document.getElementById('nav');
    
    if (!burger || !nav) return;
    
    burger.addEventListener('click', function() {
        burger.classList.toggle('active');
        nav.classList.toggle('active');
        
        if (nav.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
            burger.style.setProperty('--burger-color', '#FFFFFF');
        } else {
            document.body.style.overflow = '';
            burger.style.setProperty('--burger-color', '');
        }
    });
    
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            nav.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && !burger.contains(e.target) && nav.classList.contains('active')) {
            burger.classList.remove('active');
            nav.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
})();