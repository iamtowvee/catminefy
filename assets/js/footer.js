(function() {
    const footer = document.querySelector('.footer');
    if (!footer) return;
    
    function checkFooterVisibility() {
        const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        
        if (scrollTop + windowHeight >= docHeight - 50) {
            footer.classList.add('visible');
            document.body.removeEventListener('scroll', checkFooterVisibility);
            window.removeEventListener('resize', checkFooterVisibility);
        }
    }
    
    document.body.addEventListener('scroll', checkFooterVisibility);
    window.addEventListener('resize', checkFooterVisibility);
    checkFooterVisibility();
})();