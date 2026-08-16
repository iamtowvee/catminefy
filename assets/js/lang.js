// lang.js
document.addEventListener('DOMContentLoaded', function() {
    const langButtons = document.querySelectorAll('.toLang');
    const curt = document.getElementById('curLang');
    
    if (!langButtons || langButtons.length === 0) {
        console.warn('Кнопки .toLang не найдены');
        return;
    }
    
    if (!curt) {
        console.warn('Элемент #curLang не найден');
        return;
    }
    
    let curLang = localStorage.getItem('lang') || 'ru_RU';
    localStorage.setItem('lang', curLang);
    
    updateActiveButton(curLang, langButtons);
    updateCurrentLanguageDisplay(curLang, curt);
    
    langButtons.forEach(button => {
        button.addEventListener('click', function() {
            let newLang = this.dataset.lnga;
            
            if (!newLang) {
                console.error('Неправильный язык:', newLang);
                return;
            }
            
            localStorage.setItem('lang', newLang);
            
            // Уведомление через i18n
            if (window.i18n) {
                window.i18n.setLanguage(newLang);
                const langName = newLang === 'ru_RU' ? 'Русский' : 'English';
                window.notifications.info('Смена языка', `Применён язык: ${langName}`);
            }
            
            updateCurrentLanguageDisplay(newLang, curt);
            updateActiveButton(newLang, langButtons);
        });
    });
});

function updateActiveButton(lang, buttons) {
    buttons.forEach(button => {
        if (button.dataset.lnga === lang) {
            button.classList.add('lnga');
        } else {
            button.classList.remove('lnga');
        }
    });
}

function updateCurrentLanguageDisplay(lang, element) {
    const langNames = {
        'ru_RU': 'Русский',
        'en_US': 'English'
    };
    element.textContent = langNames[lang] || lang;
}