(function() {
    const paths = [
        /* '../assets/icons/mks/preview/default.jpg',
        '../../assets/icons/mks/preview/default.jpg',
        '../../../assets/icons/mks/preview/default.jpg',
        '../../../../assets/icons/mks/preview/default.jpg',
        '../../../../../assets/icons/mks/preview/default.jpg',
        './assets/icons/mks/preview/default.jpg',
        '/assets/icons/mks/preview/default.jpg' */
    ];
    
    let debugMode = false;
    let DEFAULT_SRC = null;
    
    // Асинхронно проверяем какой путь работает
    async function findWorkingPath() {
        for (let path of paths) {
            const exists = await checkImageExists(path);
            if (exists) {
                DEFAULT_SRC = path;
                if (debugMode) {
                    console.log('LOG FOR DEVS > Найден рабочий путь:', path);
                }
                return path;
            }
        }
        if (debugMode) {
            console.warn('LOG FOR DEVS > default.jpg не найден ни по одному пути');
        }
        return null;
    }
    
    function checkImageExists(src) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = src;
        });
    }
    
    function setImageFallback(img) {
        img.onerror = () => {
            if (DEFAULT_SRC && img.src !== DEFAULT_SRC) {
                img.src = DEFAULT_SRC;
            } else {
                const placeholder = document.createElement('div');
                placeholder.className = 'card-image-placeholder';
                placeholder.textContent = img.alt || 'Нет изображения';
                img.parentElement.replaceChild(placeholder, img);
            }
        };
        
        if (img.complete && img.naturalWidth === 0) {
            img.onerror();
        }
    }
    
    // Запускаем поиск пути, потом применяем fallback
    findWorkingPath().then(() => {
        document.querySelectorAll('.card img').forEach(setImageFallback);
        
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.querySelectorAll) {
                        node.querySelectorAll('.card img').forEach(setImageFallback);
                    }
                });
            });
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    });
})();