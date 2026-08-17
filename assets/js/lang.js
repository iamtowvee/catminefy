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
    
    // ✅ РЕГИСТРИРУЕМ #curLang С ПРАВИЛЬНЫМ КЛЮЧОМ
    if (window.i18n) {
        // Текущий язык — храним в localStorage
        const currentLang = localStorage.getItem('lang') || 'ru_RU';
        // Регистрируем с ключом названия языка
        window.i18n.register(curt, `app.settings.content.langs.${currentLang}`, 'Русский язык');
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
            
            if (window.i18n) {
                // Меняем язык
                window.i18n.setLanguage(newLang);
                // Обновляем регистрацию #curLang на новый ключ
                window.i18n.register(curt, `app.settings.content.langs.${newLang}`, 'Русский язык');
                // Принудительно обновляем
                window.i18n._updateAll();
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
    if (!element) return;
    // Уже обновится через регистрацию, но на всякий случай
    if (!window.i18n) {
        element.textContent = lang === 'ru_RU' ? 'Русский язык' : 'English';
    }
}