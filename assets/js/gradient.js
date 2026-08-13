// ============================
// ГЕНЕРАТОР ГРАДИЕНТОВ (ВСЕ ФОРМАТЫ) — ИСПРАВЛЕННАЯ ВЕРСИЯ
// ============================

document.addEventListener('DOMContentLoaded', function() {
    const colorList = document.getElementById('colorList');
    const previewText = document.getElementById('previewText');
    const mcOutput = document.getElementById('mcOutput');
    const textInput = document.getElementById('gradientText');
    const formatSelect = document.getElementById('formatSelect');

    // ===== НАЧАЛЬНЫЕ ЦВЕТА =====
    let colors = ['#ff6b35', '#ffaa00', '#ffd700'];

    // ===== ЦВЕТА MINECRAFT (16 СТАНДАРТНЫХ) =====
    const mcColors = [
        { name: '§0', hex: '#000000' },
        { name: '§1', hex: '#0000AA' },
        { name: '§2', hex: '#00AA00' },
        { name: '§3', hex: '#00AAAA' },
        { name: '§4', hex: '#AA0000' },
        { name: '§5', hex: '#AA00AA' },
        { name: '§6', hex: '#FFAA00' },
        { name: '§7', hex: '#AAAAAA' },
        { name: '§8', hex: '#555555' },
        { name: '§9', hex: '#5555FF' },
        { name: '§a', hex: '#55FF55' },
        { name: '§b', hex: '#55FFFF' },
        { name: '§c', hex: '#FF5555' },
        { name: '§d', hex: '#FF55FF' },
        { name: '§e', hex: '#FFFF55' },
        { name: '§f', hex: '#FFFFFF' }
    ];

    // ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(c => Math.min(255, Math.max(0, Math.round(c))).toString(16).padStart(2, '0')).join('');
    }

    function rgbToMc(r, g, b) {
        let closest = mcColors[0];
        let minDist = Infinity;
        for (const mc of mcColors) {
            const mcRgb = hexToRgb(mc.hex);
            const dist = Math.sqrt(
                Math.pow(r - mcRgb.r, 2) +
                Math.pow(g - mcRgb.g, 2) +
                Math.pow(b - mcRgb.b, 2)
            );
            if (dist < minDist) {
                minDist = dist;
                closest = mc;
            }
        }
        return closest.name;
    }

    function mcToHex(mcCode) {
        for (const mc of mcColors) {
            if (mc.name === mcCode) {
                return mc.hex;
            }
        }
        return '#FFFFFF';
    }

    // ===== ГЕНЕРАЦИЯ ДАННЫХ ГРАДИЕНТА (ПОБУКВЕННО) =====

    function generateGradientData(text) {
        if (!text || text.length === 0) return [];
        
        const textLength = text.length;
        const colorCount = colors.length;
        const result = [];

        for (let i = 0; i < textLength; i++) {
            const ratio = textLength === 1 ? 0.5 : i / (textLength - 1);
            const colorIndex = Math.min(Math.floor(ratio * (colorCount - 1)), colorCount - 2);
            
            if (colorIndex < 0 || colorIndex >= colorCount - 1) {
                const rgb = hexToRgb(colors[0] || '#FFFFFF');
                result.push({ 
                    char: text[i], 
                    hex: rgbToHex(rgb.r, rgb.g, rgb.b),
                    rgb: rgb
                });
                continue;
            }
            
            const nextColorIndex = Math.min(colorIndex + 1, colorCount - 1);
            
            const c1 = hexToRgb(colors[colorIndex]);
            const c2 = hexToRgb(colors[nextColorIndex]);
            
            const localRatio = (ratio * (colorCount - 1)) - colorIndex;
            const r = Math.round(c1.r + (c2.r - c1.r) * localRatio);
            const g = Math.round(c1.g + (c2.g - c1.g) * localRatio);
            const b = Math.round(c1.b + (c2.b - c1.b) * localRatio);
            
            result.push({ 
                char: text[i], 
                hex: rgbToHex(r, g, b),
                rgb: { r, g, b }
            });
        }

        return result;
    }

    // ===== ФОРМАТЫ ВЫВОДА =====

    function formatAsHex(data) {
        return data.map(d => `&#${d.hex.slice(1)}${d.char}`).join('');
    }

    function formatAsLegacyHex(data) {
        return data.map(d => {
            const hex = d.hex.slice(1);
            const chars = hex.split('');
            return `§x§${chars[0]}§${chars[1]}§${chars[2]}§${chars[3]}§${chars[4]}§${chars[5]}${d.char}`;
        }).join('');
    }

    function formatAsTagged(data) {
        const totalChars = data.length;
        const colorCount = colors.length;
        
        if (colorCount <= 1) {
            const hex = colors[0]?.slice(1) || 'ffffff';
            return `<#${hex}>${data.map(d => d.char).join('')}</#${hex}>`;
        }
        
        const segments = [];
        const segmentSize = Math.floor(totalChars / (colorCount - 1));
        let charIndex = 0;
        
        for (let i = 0; i < colorCount - 1; i++) {
            const start = charIndex;
            const end = (i === colorCount - 2) ? totalChars : Math.min(start + segmentSize, totalChars);
            const segmentData = data.slice(start, end);
            charIndex = end;
            
            if (segmentData.length === 0) continue;
            
            const color1 = colors[i];
            const color2 = colors[i + 1];
            const hex1 = color1.slice(1);
            const hex2 = color2.slice(1);
            
            const segmentText = segmentData.map(d => d.char).join('');
            segments.push(`<#${hex1}>${segmentText}</#${hex2}>`);
        }
        
        return segments.join('');
    }

    function formatAsMcCode(data) {
        return data.map(d => {
            const mc = rgbToMc(d.rgb.r, d.rgb.g, d.rgb.b);
            return mc + d.char;
        }).join('');
    }

    function formatAsAmpersand(data) {
        return data.map(d => {
            const mc = rgbToMc(d.rgb.r, d.rgb.g, d.rgb.b);
            return mc.replace('§', '&') + d.char;
        }).join('');
    }

    function formatAsMiniMessage(data) {
        const hexColors = colors.map(c => c.slice(1)).join(':');
        const text = data.map(d => d.char).join('');
        return `<gradient:${hexColors}>${text}</gradient>`;
    }

    // ===== КОНВЕРТАЦИЯ MC -> HTML ДЛЯ ПРЕВЬЮ (ПРОСТО И РАБОТАЕТ) =====
    function mcToHtml(mcString) {
        // 1. Убираем все управляющие символы и теги
        let clean = mcString
            // Убираем &#RRGGBB
            .replace(/&#[0-9a-fA-F]{6}/g, '')
            // Убираем §x§R§R§G§G§B§B
            .replace(/§x(§[0-9a-fA-F]){6}/g, '')
            // Убираем §code
            .replace(/§[0-9a-fk-or]/g, '')
            // Убираем &code
            .replace(/&[0-9a-fk-or]/g, '')
            // Убираем <#RRGGBB>
            .replace(/<#[0-9a-fA-F]{6}>/g, '')
            // Убираем </#RRGGBB>
            .replace(/<\/#[0-9a-fA-F]{6}>/g, '')
            // Убираем <gradient:...>
            .replace(/<gradient:[^>]+>/g, '')
            // Убираем </gradient>
            .replace(/<\/gradient>/g, '');
        
        // 2. Берём первый цвет из списка
        const firstColor = colors.length > 0 ? colors[0] : '#FFFFFF';
        
        // 3. Возвращаем span с цветом
        return `<span style="color: ${firstColor}; text-shadow: 2px 2px 0px var(--bg-footer);">${clean}</span>`;
    }

    // ===== ОБНОВЛЕНИЕ ПРЕВЬЮ =====

    function updatePreview() {
        const text = textInput.value || 'Catminefy';
        const data = generateGradientData(text);
        const format = formatSelect.value;
        
        let output = '';

        switch (format) {
            case 'hex':
                output = formatAsHex(data);
                break;
            case 'legacy-hex':
                output = formatAsLegacyHex(data);
                break;
            case 'tagged':
                output = formatAsTagged(data);
                break;
            case 'mccode':
                output = formatAsMcCode(data);
                break;
            case 'ampersand':
                output = formatAsAmpersand(data);
                break;
            case 'minimessage':
                output = formatAsMiniMessage(data);
                break;
            default:
                output = formatAsMcCode(data);
        }

        // === КОД ДЛЯ КОПИРОВАНИЯ ===
        const wrapLength = 60;
        let wrappedOutput = '';
        for (let i = 0; i < output.length; i += wrapLength) {
            wrappedOutput += output.slice(i, i + wrapLength) + '\n';
        }
        mcOutput.textContent = wrappedOutput.trim();

        // === ПРЕВЬЮ: ИСПОЛЬЗУЕМ DATA ДЛЯ ГРАДИЕНТА ===
        let previewHtml = '';
        for (const d of data) {
            previewHtml += `<span style="color: ${d.hex}; text-shadow: 2px 2px 0px var(--bg-footer);">${d.char}</span>`;
        }
        previewText.innerHTML = previewHtml;
    }

    // ===== РЕНДЕР ЦВЕТОВ =====

    function renderColors() {
        colorList.innerHTML = '';
        colors.forEach((color, index) => {
            const item = document.createElement('div');
            item.className = 'color-item';
            item.innerHTML = `
                <span class="color-index">#${index + 1}</span>
                <input type="color" value="${color}" data-index="${index}">
                <span class="color-hex" contenteditable="true" spellcheck="false" data-index="${index}">${color}</span>
                <button class="color-remove" data-index="${index}">✕</button>
            `;
            colorList.appendChild(item);
        });

        // ===== Обработчики для пикеров =====
        document.querySelectorAll('.color-item input[type="color"]').forEach(input => {
            input.addEventListener('input', function() {
                const index = parseInt(this.dataset.index);
                colors[index] = this.value;
                const hexSpan = this.closest('.color-item').querySelector('.color-hex');
                if (hexSpan) hexSpan.textContent = this.value;
                updatePreview();
            });
        });

        // ===== Обработчики для редактируемых HEX полей =====
        document.querySelectorAll('.color-hex').forEach(span => {
            span.addEventListener('input', function() {
                let val = this.textContent.trim();
                // Автоматически добавляем # если нет
                if (val && !val.startsWith('#')) {
                    val = '#' + val;
                }
                // Проверяем валидность HEX
                if (/^#[0-9a-fA-F]{6}$/.test(val)) {
                    const index = parseInt(this.dataset.index);
                    colors[index] = val;
                    // Обновляем пикер
                    const picker = this.closest('.color-item').querySelector('input[type="color"]');
                    if (picker) picker.value = val;
                    updatePreview();
                }
            });

            // При потере фокуса — исправляем некорректный ввод
            span.addEventListener('blur', function() {
                let val = this.textContent.trim();
                const index = parseInt(this.dataset.index);
                
                // Если пусто — возвращаем старый цвет
                if (!val) {
                    this.textContent = colors[index];
                    return;
                }
                
                // Добавляем # если нет
                if (!val.startsWith('#')) {
                    val = '#' + val;
                }
                
                // Проверяем валидность
                if (/^#[0-9a-fA-F]{6}$/.test(val)) {
                    colors[index] = val;
                    const picker = this.closest('.color-item').querySelector('input[type="color"]');
                    if (picker) picker.value = val;
                    updatePreview();
                } else {
                    // Если невалидный — возвращаем старый
                    this.textContent = colors[index];
                    window.notifications?.warning('Неверный формат', 'Используй HEX: #ff6b35');
                }
            });

            // Enter = сохранить и убрать фокус
            span.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.blur();
                }
            });
        });

        // ===== Обработчики для кнопок удаления =====
        document.querySelectorAll('.color-remove').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                if (colors.length <= 2) {
                    window.notifications?.warning('Нельзя удалить', 'Нужно минимум 2 цвета для градиента');
                    return;
                }
                colors.splice(index, 1);
                renderColors();
                updatePreview();
            });
        });
    }

    // ===== КНОПКИ УПРАВЛЕНИЯ =====

    document.getElementById('addColor').addEventListener('click', function() {
        const lastColor = colors[colors.length - 1] || '#ffffff';
        colors.push(lastColor);
        renderColors();
        updatePreview();
        window.notifications?.info('Цвет добавлен', `Всего цветов: ${colors.length}`);
    });

    document.getElementById('removeColor').addEventListener('click', function() {
        if (colors.length <= 2) {
            window.notifications?.warning('Нельзя удалить', 'Нужно минимум 2 цвета для градиента');
            return;
        }
        colors.pop();
        renderColors();
        updatePreview();
        window.notifications?.info('Цвет удалён', `Осталось цветов: ${colors.length}`);
    });

    document.getElementById('clearColors').addEventListener('click', function() {
        if (colors.length <= 2) {
            window.notifications?.warning('Нельзя очистить', 'Нужно минимум 2 цвета');
            return;
        }
        const first = colors[0];
        const last = colors[colors.length - 1];
        colors = [first, last];
        renderColors();
        updatePreview();
        window.notifications?.info('Очищено', 'Оставлено 2 цвета');
    });

    document.getElementById('randomColors').addEventListener('click', function() {
        const count = 2 + Math.floor(Math.random() * 4);
        colors = [];
        for (let i = 0; i < count; i++) {
            const hex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
            colors.push(hex);
        }
        renderColors();
        updatePreview();
        window.notifications?.info('Случайные цвета', `Сгенерировано ${colors.length} цветов`);
    });

    // ===== СОБЫТИЯ =====

    textInput.addEventListener('input', updatePreview);
    formatSelect.addEventListener('change', updatePreview);

    // ===== ИНИЦИАЛИЗАЦИЯ =====

    renderColors();
    updatePreview();

    console.log('🎨 Генератор градиентов загружен');
    console.log('Цвета:', colors);
    console.log('Формат:', formatSelect.value);
});