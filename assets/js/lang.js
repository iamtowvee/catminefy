// lang.js
document.addEventListener('DOMContentLoaded', function() {
    const langs = {
        ru_RU: {
            ru_RU: "Русский",
            en_US: "Английский",
            notifications: {
                title: "Смена языка",
                message: "Применён язык: Русский"
            }
        },
        en_US: {
            ru_RU: "Russian",
            en_US: "English",
            notifications: {
                title: "Language changed",
                message: "Applied language: English"
            }
        }
    };
    
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
    
    let curLang = localStorage.getItem('lang') || 'en_US';
    localStorage.setItem('lang', curLang);
    
    updateActiveButton(curLang, langButtons);
    updateCurrentLanguageDisplay(curLang, langs, curt);
    
    langButtons.forEach(button => {
        button.addEventListener('click', function() {
            let newLang = this.dataset.lnga;
            
            if (!langs[newLang]) {
                console.error('Неправильный язык:', newLang);
                return;
            }
            
            localStorage.setItem('lang', newLang);
            
            // ✅ Уведомление на выбранном языке
            const notif = langs[newLang].notifications;
            window.notifications.info(notif.title, notif.message);
            
            updateCurrentLanguageDisplay(newLang, langs, curt);
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

function updateCurrentLanguageDisplay(lang, langs, element) {
    if (!langs[lang]) {
        console.error('Язык не найден:', lang);
        element.textContent = 'Unknown';
        return;
    }
    
    if (langs[lang] && langs[lang][lang]) {
        element.textContent = langs[lang][lang];
    } else {
        console.warn('Язык не найден:', lang);
        element.textContent = 'Unknown';
    }
}