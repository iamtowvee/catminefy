document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('[data-tooltip]').forEach(el => {
        const text = el.dataset.tooltip;
        const icon = el.dataset.tooltipIcon || '';
        const clr = el.dataset.tooltipColor || 'accent';
        
        // Контейнер тултипа
        const box = document.createElement('div');
        box.className = 'tooltip-box';
        if (icon) {
            box.innerHTML = `<i style="color: var(--${clr});" class="fas ${icon}"></i> ${text}`;
        } else {
            box.textContent = text;
        }
        el.appendChild(box);
        
        // Стрелка
        const arrow = document.createElement('div');
        arrow.className = 'tooltip-arrow';
        el.appendChild(arrow);
    });
});