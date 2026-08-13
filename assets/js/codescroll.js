// ============================
// УПРАВЛЕНИЕ СКРОЛЛОМ С КЛАВИАТУРЫ (← и →) — ИСПРАВЛЕННАЯ ВЕРСИЯ
// ============================

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.code-block').forEach(function(block) {
        // Находим ПРАВИЛЬНЫЙ элемент — тот, у которого scrollWidth > clientWidth
        let scrollable = null;
        
        // Проверяем все возможные кандидаты
        const candidates = [
            block.querySelector('pre'),
            block.querySelector('.code-content'),
            block.querySelector('.code-wrapper'),
            block.querySelector('code')
        ];
        
        for (const el of candidates) {
            if (el && el.scrollWidth > el.clientWidth) {
                scrollable = el;
                break;
            }
        }
        
        // Если ничего не нашли — выходим
        if (!scrollable) {
            console.log('Нет элемента с горизонтальным скроллом в этом блоке');
            return;
        }
        
        console.log('Найден скроллируемый элемент:', scrollable);
        
        // Убеждаемся, что скролл включен
        scrollable.style.overflowX = 'auto';
        scrollable.style.overflowY = 'hidden';
        
        // Делаем элемент фокусируемым
        scrollable.setAttribute('tabindex', '0');
        scrollable.style.outline = 'none';
        
        // Клик = фокус
        scrollable.addEventListener('click', function() {
            this.focus();
        });
        
        // Обработчик нажатий клавиш
        scrollable.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                e.stopPropagation();
                this.scrollLeft = Math.max(0, this.scrollLeft - 5);
                console.log('← scrollLeft:', this.scrollLeft);
            }
            else if (e.key === 'ArrowRight') {
                e.preventDefault();
                e.stopPropagation();
                const maxScroll = this.scrollWidth - this.clientWidth;
                this.scrollLeft = Math.min(maxScroll, this.scrollLeft + 5);
                console.log('→ scrollLeft:', this.scrollLeft);
            }
        });
        
        // При фокусе — обводка
        scrollable.addEventListener('focus', function() {
            this.style.outline = '3px solid var(--gl-secondary)';
            this.style.outlineOffset = '-2px';
        });
        
        scrollable.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
        
        // Добавляем индикатор скролла
        const indicator = document.createElement('span');
        indicator.className = 'code-scroll-indicator';
        indicator.textContent = ' скролл влево,  скролл влево';
        const pre = block.querySelector('pre');
        if (pre) {
            pre.style.position = 'relative';
            pre.appendChild(indicator);
        }
        
        // Проверяем, есть ли переполнение
        function checkOverflow() {
            const isOverflowing = scrollable.scrollWidth > scrollable.clientWidth;
            if (indicator) {
                if (isOverflowing) {
                    indicator.classList.add('visible');
                } else {
                    indicator.classList.remove('visible');
                }
            }
        }
        
        setTimeout(checkOverflow, 200);
        window.addEventListener('resize', checkOverflow);
    });
});