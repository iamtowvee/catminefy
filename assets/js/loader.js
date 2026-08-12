(function() {
    const loader = document.getElementById('loader');
    const progressBar = document.getElementById('loaderProgress');
    
    let progress = 0;
    let interval;
    
    function updateProgress(value) {
        progress = Math.min(95, Math.max(0, value));
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
    }
    
    interval = setInterval(() => {
        if (progress < 95) {
            progress += Math.random() * 8;
            updateProgress(progress);
        } else {
            clearInterval(interval);
        }
    }, 100);
    
    function finishLoading() {
        if (interval) clearInterval(interval);
        
        let finalProgress = 95;
        const finalInterval = setInterval(() => {
            if (finalProgress < 100) {
                finalProgress += 2;
                if (progressBar) progressBar.style.width = finalProgress + '%';
            } else {
                clearInterval(finalInterval);
                if (loader) loader.classList.add('hide');
                setTimeout(() => {
                    if (loader && loader.parentNode) loader.remove();
                }, 800);
            }
        }, 15);
    }
    
    if (document.readyState === 'complete') {
        finishLoading();
    } else {
        window.addEventListener('load', finishLoading);
    }
})();