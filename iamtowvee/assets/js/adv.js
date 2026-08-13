document.addEventListener('DOMContentLoaded', function() {
    const adIds = ["adv00"];
    
    adIds.forEach(id => {
        const data = localStorage.getItem(id);
        if (data) {
            try {
                const parsed = JSON.parse(data);
                // Если прошло больше 6 часов (21600000 мс) — удаляем запись
                if (Date.now() - parsed.timestamp > 21600000) {
                    localStorage.removeItem(id);
                } else {
                    // Иначе скрываем баннер
                    document.getElementById(id)?.remove();
                }
            } catch(e) {
                // Если данные битые — удаляем
                localStorage.removeItem(id);
            }
        }
    });
});

window.resetAds = function() {
    const adIds = ["adv00", "adv01", "adv02"];
    adIds.forEach(id => {
        localStorage.removeItem(id);
        location.reload();
    });
};

window.hide = function(id) {
    // Проверяем, не скрыт ли уже
    const data = localStorage.getItem(id);
    if (data) {
        try {
            const parsed = JSON.parse(data);
            if (Date.now() - parsed.timestamp <= 21600000) {
                return; // Ещё не прошло 6 часов
            }
        } catch(e) {}
    }
    
    // Сохраняем с меткой времени
    localStorage.setItem(id, JSON.stringify({
        hidden: true,
        timestamp: Date.now()
    }));
    
    // Анимация исчезновения
    const el = document.getElementById(id);
    if (!el) return;
    
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    el.style.opacity = '0';
    el.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
        el.remove();
    }, 500);
};