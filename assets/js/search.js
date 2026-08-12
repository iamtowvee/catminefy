(function() {
    const searchBtn = document.getElementById('searchBtn');
    const searchModal = document.getElementById('search-modal');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    
    if (!searchBtn || !searchModal) return;
    
    let searchData = [];
    
    function collectSearchData() {
        searchData = [];
        
        // Карточки мастер-классов
        document.querySelectorAll('.card').forEach((card, index) => {
            const title = card.querySelector('.card-content h3')?.innerText || '';
            const desc = card.querySelector('.card-content p:first-of-type')?.innerText || '';
            const price = card.querySelector('.card-content p:not(.mut)')?.innerText || '';
            const tableText = Array.from(card.querySelectorAll('.info-table td:last-child'))
                .map(td => td.innerText).join(' ');
            
            searchData.push({
                id: `card-${index}`,
                title: title,
                text: `${title} ${desc} ${price} ${tableText}`,
                element: card,
                type: 'card'
            });
        });
        
        // Футер (все тексты)
        const footer = document.querySelector('.footer');
        if (footer) {
            const footerText = footer.innerText;
            searchData.push({
                id: 'footer',
                title: 'Футер (нижняя часть страницы)',
                text: footerText,
                element: footer,
                type: 'footer'
            });
        }
        
        // Header (навигация)
        const header = document.querySelector('header');
        if (header) {
            const headerText = header.innerText;
            searchData.push({
                id: 'header',
                title: 'Навигация',
                text: headerText,
                element: header,
                type: 'header'
            });
        }
        
        // Все секции с текстом
        document.querySelectorAll('section:not(.cards-section)').forEach((section, idx) => {
            const sectionText = section.innerText;
            if (sectionText.trim()) {
                searchData.push({
                    id: `section-${idx}`,
                    title: `${section.querySelector('h1, h2, h3')?.innerText || 'Секция'}`,
                    text: sectionText,
                    element: section,
                    type: 'section'
                });
            }
        });
    }
    
    function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    function highlightText(text, query) {
        if (!query) return text.substring(0, 200);
        const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
        return text.substring(0, 200).replace(regex, '<mark class="search-highlight">$1</mark>');
    }
    
    function performSearch(query) {
        if (!query.trim()) {
            searchResults.innerHTML = '<div class="search-no-results"><i class="fa-solid fa-magnifying-glass"></i>&nbsp; Введите запрос для поиска</div>';
            return;
        }
        
        const lowerQuery = query.toLowerCase();
        const results = searchData.filter(item => {
            return item.text.toLowerCase().includes(lowerQuery);
        });
        
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-no-results"><i class="fa-regular fa-face-frown"></i>&nbsp; Ничего не найдено</div>';
            return;
        }
        
        searchResults.innerHTML = results.map(result => `
            <div class="search-result-item" data-result-id="${result.id}">
                <div class="search-result-title">${result.title}</div>
                <div class="search-result-text">${highlightText(result.text, query)}</div>
            </div>
        `).join('');
        
        document.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const resultId = item.dataset.resultId;
                const result = searchData.find(r => r.id === resultId);
                if (result && result.element) {
                    result.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    searchModal.classList.remove('active');
                    document.body.style.overflow = '';
                    searchInput.value = '';
                    
                    result.element.style.transition = '0.3s';
                    result.element.style.boxShadow = '0 0 0 2px var(--accent-primary)';
                    setTimeout(() => {
                        if (result.element) result.element.style.boxShadow = '';
                    }, 1500);
                }
            });
        });
    }
    
    let debounceTimer;
    searchBtn.addEventListener('click', () => {
        collectSearchData();
        searchModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => searchInput.focus(), 100);
        searchResults.innerHTML = '<div class="search-no-results"><i class="fa-solid fa-magnifying-glass"></i>&nbsp; Введите запрос для поиска</div>';
        if (searchInput) searchInput.value = '';
    });
    
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                performSearch(searchInput.value);
            }, 300);
        });
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchModal.classList.contains('active')) {
            const closeBtn = searchModal.querySelector('.modal-close');
            if (closeBtn) closeBtn.click();
        }
    });
})();