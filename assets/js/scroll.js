document.querySelectorAll('*').forEach(el => {
    const style = getComputedStyle(el);
    if (style.overflowX === 'auto' || style.overflowX === 'scroll') {
        el.style.overflowX = 'hidden';
    }
});