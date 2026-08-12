(function() {
    let currentImages = [];
    let currentIndex = 0;
    let currentModal = null;

    function openGallery(images, startIndex) {
        currentImages = images;
        currentIndex = startIndex;
        currentModal = document.getElementById('gallery-modal');
        
        if (!currentModal) return;
        
        updateGallery();
        currentModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function updateGallery() {
        const mainImg = document.querySelector('.gallery-main');
        const counter = document.querySelector('.gallery-counter');
        const thumbnails = document.querySelector('.gallery-thumbnails');
        
        if (!mainImg || !counter) return;
        
        mainImg.src = currentImages[currentIndex];
        counter.textContent = `${currentIndex + 1} / ${currentImages.length}`;
        
        // Обновляем миниатюры
        if (thumbnails) {
            thumbnails.innerHTML = '';
            currentImages.forEach((img, idx) => {
                const thumb = document.createElement('img');
                thumb.src = img;
                thumb.classList.add('gallery-thumb');
                if (idx === currentIndex) thumb.classList.add('active');
                thumb.addEventListener('click', () => {
                    currentIndex = idx;
                    updateGallery();
                });
                thumbnails.appendChild(thumb);
            });
        }
    }
    
    function nextImage() {
        if (currentIndex < currentImages.length - 1) {
            currentIndex++;
            updateGallery();
        }
    }
    
    function prevImage() {
        if (currentIndex > 0) {
            currentIndex--;
            updateGallery();
        }
    }
    
    function closeGallery() {
        if (currentModal) {
            currentModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    // Обработчики для картинок с классом gallery-trigger
    document.querySelectorAll('.gallery-trigger').forEach(img => {
        img.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const imagesAttr = img.getAttribute('data-images');
            if (imagesAttr) {
                try {
                    const images = JSON.parse(imagesAttr);
                    const currentSrc = img.src;
                    const startIndex = images.indexOf(currentSrc);
                    openGallery(images, startIndex !== -1 ? startIndex : 0);
                } catch(e) {
                    console.error('Ошибка парсинга data-images:', e);
                }
            }
        });
    });
    
    // Вешаем обработчики после загрузки DOM
    document.addEventListener('DOMContentLoaded', () => {
        // Кнопки навигации
        const nextBtn = document.querySelector('.gallery-next');
        const prevBtn = document.querySelector('.gallery-prev');
        const closeBtn = document.querySelector('#gallery-modal .modal-close');
        const modal = document.getElementById('gallery-modal');
        
        if (nextBtn) nextBtn.addEventListener('click', nextImage);
        if (prevBtn) prevBtn.addEventListener('click', prevImage);
        if (closeBtn) closeBtn.addEventListener('click', closeGallery);
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeGallery();
            });
        }
        
        document.addEventListener('keydown', (e) => {
            if (!modal?.classList.contains('active')) return;
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'Escape') closeGallery();
        });
    });
})();