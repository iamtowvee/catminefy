    // ============================
    // ГЕНЕРАТОР ГРАДИЕНТОВ С ЗАГОТОВКАМИ, ИЗБРАННЫМ И ИСТОРИЕЙ
    // ============================
if (window._gradientInitialized) {
    console.warn('Генератор градиентов уже инициализирован, пропускаем');
} else {
    window._gradientInitialized = true;
    function initGradientGenerator() {

        if (window._gradientRunning) {
            console.warn('⚠️ Генератор уже запущен, пропускаем');
            return;
        }
        window._gradientRunning = true;

        // === ЭЛЕМЕНТЫ ===
        const colorList = document.getElementById('colorList');
        const previewText = document.getElementById('previewText');
        const mcOutput = document.getElementById('mcOutput');
        const textInput = document.getElementById('gradientText');
        const formatSelect = document.getElementById('formatSelect');
        const historySectionTitle = document.querySelector('.history-section h2');

        // === НАЧАЛЬНЫЕ ЦВЕТА ===
        let colors = ['#ff6b35', '#ffaa00', '#ffd700'];

        // === ЦВЕТА MINECRAFT ===
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

        // === ЗАГОТОВКИ ===
        const templates = {
            rainbow: { name: 'rainbow', colors: ['#ff0000', '#ff8800', '#ffff00', '#6fee34', '#00ffff', '#1f90ff', '#9f66e0'] },
            fire: { name: 'fire', colors: ['#ffcc00', '#ff0000'] },
            ice: { name: 'ice', colors: ['#6ca4f3', '#5e6ac0'] },
            ice_2: { name: 'ice_2', colors: ['#0088ff', '#00ccff', '#0088ff'] },
            ice_cream: { name: 'ice_cream', colors: ['#e31679', '#f5da90'] },
            water: { name: 'water', colors: ['#b6c79a', '#89e6ca', '#1d81f2'] },
            spruce: { name: 'spruce', colors: ['#67806e', '#425e6e'] },
            carpet: { name: 'carpet', colors: ['#bc014f', '#7d4987'] },
            creeper: { name: 'creeper', colors: ['#e5f62c', '#808a71'] },
            legend: { name: 'legend', colors: ['#f697ca', '#8bf291'] },
            experience: { name: 'experience', colors: ['#f0d921', '#7aca21'] },
            club_cocktail: { name: 'club_cocktail', colors: ['#d06ab1', '#604f7a'] },
            red_caviar: { name: 'red_caviar', colors: ['#c23a00', '#ee796c'] },
            red_velvet: { name: 'red_velvet', colors: ['#f0407f', '#ab0927'] },
            tropical_beach: { name: 'tropical_beach', colors: ['#5787d3', '#a5bafd', '#75c36f'] },
            minecraft_the_end: { name: 'minecraft_the_end', colors: ['#e6c389', '#8978e3'] },
            pastel_dessert: { name: 'pastel_dessert', colors: ['#5b61a1', '#b17b90', '#759881'] },
            magic_stick: { name: 'magic_stick', colors: ['#92b9d3', '#fad8ef', '#a1f8ec'] },
            dont_forget_to_water: { name: 'dont_forget_to_water', colors: ['#815c6d', '#b6b664'] },
            your_name_could_be_here: { name: 'your_name_could_be_here', colors: ['#ef9317', '#832d76'] },
            olives: { name: 'olives', colors: ['#a4a451', '#79b21c'] },
            bjjjjjj: { name: 'bjjjjjj', colors: ['#ffea00', '#ef7715'] },
            breeze: { name: 'breeze', colors: ['#db8f89', '#639bbd'] },
            efir_lol: { name: 'efir_lol', colors: ['#7da9b5', '#d1a298', '#87bc47'] },
            monochrome: { name: 'monochrome', colors: ['#595959', '#242424'] },
            clay_pot: { name: 'clay_pot', colors: ['#c5bcc8', '#a05d61'] },
            matrix: { name: 'matrix', colors: ['#303030', '#b1d056', '#303030'] },
            chrome: { name: 'chrome', colors: ['#fa2929', '#ffc800', '#4abe19', '#3394f0'] },
            sakura: { name: 'sakura', colors: ['#fbb6ef', '#b365bf'] },
            berry_bush: { name: 'berry_bush', colors: ['#056f8a', '#669f74', '#dd494c'] },
            i_believe_i_can_fly: { name: 'i_believe_i_can_fly', colors: ['#d7d0d2', '#92a9e8'] },
            the_end: { name: 'the_end', colors: ['#4e117d', '#960cf0', '#4e117d'] },
            de_la_france: { name: 'de_la_france', colors: ['#197df9', '#dcb2d9', '#fc0e54'] },
            italian_monster: { name: 'italian_monster', colors: ['#95e660', '#f0eddb', '#e85e5e'] },
            cyber: { name: 'cyber', colors: ['#00ffff', '#ff00ff'] },
            mint: { name: 'mint', colors: ["#45b36a", "#e9ccc9"] },
            sunset: { name: 'sunset', colors: ['#ff6b35', '#f7931e', '#ffd700', '#ff6b35'] }
        };

        // Вспомогательная функция для переводов
        function t(key, fallback) {
            if (window.i18n) {
                const result = window.i18n.t(key);
                if (result && result !== key) return result;
            }
            return fallback || key;
        }

        // ======== ИСТОРИЯ ========

        function loadHistory() {
            try {
                const saved = localStorage.getItem('catminefy-history');
                if (!saved) return [];
                const parsed = JSON.parse(saved);
                return parsed.filter(entry => entry && entry.colors && Array.isArray(entry.colors) && entry.colors.length > 0);
            } catch {
                return [];
            }
        }

        function saveHistory(history) {
            localStorage.setItem('catminefy-history', JSON.stringify(history));
        }

        function addToHistory(colorsArray, name) {
            if (!colorsArray || !Array.isArray(colorsArray) || colorsArray.length === 0) {
                console.warn('Попытка добавить пустой градиент в историю');
                return;
            }
            
            const history = loadHistory();
            const entry = {
                id: Date.now() + Math.random(),
                colors: [...colorsArray],
                name: name || t('app.gradient_generator.sections.favorites.content.placeholders.custom_gradient', 'Кастомный градиент'),
                timestamp: Date.now()
            };
            history.unshift(entry);
            if (history.length > 1000) history = history.slice(0, 1000);
            saveHistory(history);
            renderHistory();
        }

        function renderHistory() {
            const historyList = document.getElementById('historyList');
            if (!historyList) return;
            
            const history = loadHistory();
            const recent = history.slice(0, 10);

            if (recent.length === 0) {
                historyList.innerHTML = `<p class="mut" style="text-align: center; opacity: 0.5;">${t('app.gradient_generator.sections.history.content.placeholders.empty_history_last', 'История пуста. Используйте градиенты, они будут появляться здесь.')}</p>`;
                return;
            }

            historyList.innerHTML = '';
            recent.forEach(entry => {
                if (!entry || !entry.colors || !Array.isArray(entry.colors)) return;
                
                const item = document.createElement('div');
                item.className = 'history-item';
                const colorDots = entry.colors.map(c =>
                    `<span class="color-dot" style="background: ${c}; width: 16px; height: 16px; border-radius: 50%; display: inline-block; flex-shrink: 0;"></span>`
                ).join('');
                item.innerHTML = `
                    <div class="history-item-colors">${colorDots}</div>
                    <span class="history-item-name">${entry.name || t('app.gradient_generator.sections.favorites.content.placeholders.custom_gradient', 'Кастомный градиент')}</span>
                    <button class="history-use-btn btn" data-colors='${JSON.stringify(entry.colors)}'>${t('general.buttons.use', 'Использовать')}</button>
                `;
                historyList.appendChild(item);
            });

            document.querySelectorAll('.history-use-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const colorsArray = JSON.parse(this.dataset.colors);
                    if (!colorsArray || !Array.isArray(colorsArray) || colorsArray.length === 0) return;
                    colors = [...colorsArray];
                    renderColors();
                    updatePreview();
                    const name = this.closest('.history-item')?.querySelector('.history-item-name')?.textContent || t('app.gradient_generator.sections.favorites.content.placeholders.custom_gradient', 'Кастомный градиент');
                    addToHistory(colorsArray, name);
                    if (window.notifications) {
                        window.notifications.info(t('app.gradient_generator.sections.history.content.gradient_applied', 'Градиент применён'), name);
                    }
                });
            });
        }

        // ======== МОДАЛЬНОЕ ОКНО ДЛЯ ВСЕЙ ИСТОРИИ ========

        function openFullHistoryModal() {
            const modal = document.getElementById('fullHistoryModal');
            const list = document.getElementById('fullHistoryList');
            if (!modal || !list) {
                console.error('Модальное окно или список не найдены');
                return;
            }

            const history = loadHistory();
            if (history.length === 0) {
                list.innerHTML = `<p style="text-align: center; opacity: 0.5;">${t('app.gradient_generator.sections.history.content.placeholders.empty_history_full', 'История пуста')}</p>`;
            } else {
                list.innerHTML = history.map(entry => {
                    if (!entry || !entry.colors || !Array.isArray(entry.colors)) {
                        return '';
                    }
                    const colorDots = entry.colors.map(c =>
                        `<span class="color-dot" style="background: ${c}; width: 16px; height: 16px; border-radius: 50%; display: inline-block; flex-shrink: 0;"></span>`
                    ).join('');
                    const date = new Date(entry.timestamp).toLocaleString();
                    return `
                        <div class="history-item" style="margin-bottom: 0.3rem;">
                            <div class="history-item-colors">${colorDots}</div>
                            <span class="history-item-name">${entry.name || t('app.gradient_generator.sections.favorites.content.placeholders.custom_gradient', 'Кастомный градиент')}</span>
                            <span style="font-size: 0.65rem; color: var(--text-secondary); opacity: 0.5; flex-shrink: 0;">${date}</span>
                            <button class="history-use-btn btn" data-colors='${JSON.stringify(entry.colors)}' style="flex-shrink: 0; font-size: 0.7rem; padding: 0.15rem 0.6rem;">${t('general.buttons.use', 'Использовать')}</button>
                        </div>
                    `;
                }).filter(html => html !== '').join('');
            }

            modal.classList.add('active');
            modal.style.display = 'flex';

            modal.querySelectorAll('.history-use-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const colorsArray = JSON.parse(this.dataset.colors);
                    if (!colorsArray || !Array.isArray(colorsArray) || colorsArray.length === 0) return;
                    colors = [...colorsArray];
                    renderColors();
                    updatePreview();
                    const name = this.closest('.history-item')?.querySelector('.history-item-name')?.textContent || t('app.gradient_generator.sections.favorites.content.placeholders.custom_gradient', 'Кастомный градиент');
                    addToHistory(colorsArray, name);
                    if (window.notifications) {
                        window.notifications.info(t('app.gradient_generator.sections.history.content.gradient_applied', 'Градиент применён'), name);
                    }
                    modal.classList.remove('active');
                    modal.style.display = 'none';
                });
            });
        }

        // ======== ЗАКРЫТИЕ МОДАЛКИ ========

        document.getElementById('closeFullHistoryModal')?.addEventListener('click', function() {
            const modal = document.getElementById('fullHistoryModal');
            if (modal) {
                modal.classList.remove('active');
                modal.style.display = 'none';
            }
        });

        document.getElementById('fullHistoryModal')?.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
                this.style.display = 'none';
            }
        });

        // ======== ОЧИСТКА ВСЕЙ ИСТОРИИ ========

        document.getElementById('clearFullHistoryBtn')?.addEventListener('click', async function() {
            let confirmed = await window.modal.alert(t('app.gradient_generator.sections.history.content.clear_full_history_confirm', 'Удалить всю историю?'), t('general.texts.warn', 'Внимание'));
            if (confirmed) {
                saveHistory([]);
                renderHistory();
                const modal = document.getElementById('fullHistoryModal');
                if (modal) {
                    modal.classList.remove('active');
                    modal.style.display = 'none';
                }
                if (window.notifications) {
                    window.notifications.info(t('app.gradient_generator.sections.history.content.history_cleared', 'История очищена'), t('app.gradient_generator.sections.history.content.all_entries_deleted', 'Все записи удалены'));
                }
            }
        });

        // ======== КЛИК ПО ЗАГОЛОВКУ "ИСТОРИЯ" ========

        const historyTitle = document.querySelector('.history-section h2');
        if (historyTitle) {
            historyTitle.style.cursor = 'pointer';
            historyTitle.title = t('app.gradient_generator.sections.history.content.click_for_full_history', 'Нажмите для просмотра всей истории');
            historyTitle.addEventListener('click', openFullHistoryModal);
        }

        // ======== ОЧИСТКА ПОСЛЕДНИХ 10 ========

        document.getElementById('clearHistory')?.addEventListener('click', async function() {
            let confirmed = await window.modal.alert(t('app.gradient_generator.sections.history.content.clear_last_ten_confirm', 'Очистить последние 10 записей?'), t('general.texts.warn', 'Внимание'));
            if (confirmed) {
                const history = loadHistory();
                const newHistory = history.slice(10);
                saveHistory(newHistory);
                renderHistory();
                if (window.notifications) {
                    window.notifications.info(t('app.gradient_generator.sections.history.content.history_cleared', 'История очищена'), t('app.gradient_generator.sections.history.content.last_ten_deleted', 'Последние 10 записей удалены'));
                }
            }
        });

        // ======== ИЗБРАННОЕ ========

        function loadFavorites() {
            try {
                const saved = localStorage.getItem('catminefy-favorites');
                return saved ? JSON.parse(saved) : [];
            } catch { return []; }
        }

        function saveFavorites(favorites) {
            localStorage.setItem('catminefy-favorites', JSON.stringify(favorites));
        }

        function toggleFavorite(templateKey, colorsArray, name) {
            let favorites = loadFavorites();
            const id = templateKey || colorsArray.join(',');
            const exists = favorites.some(f => f.id === id);
            if (exists) {
                favorites = favorites.filter(f => f.id !== id);
            } else {
                favorites.push({
                    id: id,
                    colors: colorsArray,
                    name: name || t('app.gradient_generator.sections.favorites.content.placeholders.custom_gradient', 'Кастомный градиент')
                });
            }
            saveFavorites(favorites);
            renderFavorites();
            updateFavoriteButtons();
            if (window.notifications) {
                window.notifications.info(
                    exists ? t('app.gradient_generator.sections.favorites.content.removed', 'Убрано из избранного') : t('app.gradient_generator.sections.favorites.content.added', 'Добавлено в избранное'),
                    name || t('app.gradient_generator.sections.favorites.content.placeholders.custom_gradient', 'Кастомный градиент')
                );
            }
        }

        function updateFavoriteButtons() {
            const favorites = loadFavorites();
            document.querySelectorAll('.favorite-btn').forEach(btn => {
                const key = btn.dataset.template;
                const isFavorite = favorites.some(f => f.id === key);
                btn.textContent = isFavorite ? '★' : '☆';
                btn.classList.toggle('is-favorite', isFavorite);
            });
        }

        function renderFavorites() {
            const favoriteList = document.getElementById('favoriteList');
            if (!favoriteList) return;
            const favorites = loadFavorites();
            if (favorites.length === 0) {
                favoriteList.innerHTML = `<p class="mut" style="text-align: center; opacity: 0.5;">${t('app.gradient_generator.sections.favorites.content.placeholders.empty_favorites', 'Нет избранных градиентов. Нажмите ★ у заготовки или кастомного градиента.')}</p>`;
                return;
            }
            favoriteList.innerHTML = '';
            favorites.forEach(fav => {
                const item = document.createElement('div');
                item.className = 'favorite-item';
                const colorDots = fav.colors.map(c =>
                    `<span class="color-dot" style="background: ${c}; width: 16px; height: 16px; border-radius: 50%; display: inline-block; flex-shrink: 0;"></span>`
                ).join('');
                item.innerHTML = `
                    <div class="favorite-item-colors">${colorDots}</div>
                    <span class="favorite-item-name">${fav.name}</span>
                    <button class="favorite-use-btn btn" data-colors='${JSON.stringify(fav.colors)}' data-name="${fav.name}">${t('general.buttons.use', 'Использовать')}</button>
                    <button class="favorite-remove-btn" data-id="${fav.id}">✘</button>
                `;
                favoriteList.appendChild(item);
            });

            document.querySelectorAll('.favorite-use-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const colorsArray = JSON.parse(this.dataset.colors);
                    const name = this.dataset.name || t('app.gradient_generator.sections.favorites.content.placeholders.custom_gradient', 'Кастомный градиент');
                    colors = [...colorsArray];
                    renderColors();
                    updatePreview();
                    addToHistory(colorsArray, name);
                    if (window.notifications) {
                        window.notifications.info(t('app.gradient_generator.sections.history.content.gradient_applied', 'Градиент применён'), name);
                    }
                });
            });

            document.querySelectorAll('.favorite-remove-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.dataset.id;
                    let favorites = loadFavorites();
                    favorites = favorites.filter(f => f.id !== id);
                    saveFavorites(favorites);
                    renderFavorites();
                    updateFavoriteButtons();
                    if (window.notifications) {
                        window.notifications.info(t('app.gradient_generator.sections.favorites.content.removed', 'Убрано из избранного'));
                    }
                });
            });
        }

        document.getElementById('clearFavorites')?.addEventListener('click', async function() {
            let confirmed = await window.modal.alert(t('app.gradient_generator.sections.favorites.content.clear_all_confirm', 'Очистить всё избранное?'), t('general.texts.warn', 'Внимание'));
            if (confirmed) {
                saveFavorites([]);
                renderFavorites();
                updateFavoriteButtons();
                if (window.notifications) {
                    window.notifications.info(t('app.gradient_generator.sections.favorites.content.cleared', 'Избранное очищено'), t('app.gradient_generator.sections.favorites.content.all_deleted', 'Все записи удалены'));
                }
            }
        });

        // ======== ОСТАЛЬНОЙ КОД (ВСПОМОГАТЕЛЬНЫЙ) ========

        function hexToRgb(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 0, g: 0, b: 0 };
        }

        function rgbToHex(r, g, b) {
            return '#' + [r, g, b].map(c => Math.min(255, Math.max(0, Math.round(c))).toString(16).padStart(2, '0')).join('');
        }

        function rgbToMc(r, g, b) {
            let closest = mcColors[0];
            let minDist = Infinity;
            for (const mc of mcColors) {
                const mcRgb = hexToRgb(mc.hex);
                const dist = Math.sqrt(Math.pow(r - mcRgb.r, 2) + Math.pow(g - mcRgb.g, 2) + Math.pow(b - mcRgb.b, 2));
                if (dist < minDist) { minDist = dist; closest = mc; }
            }
            return closest.name;
        }

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
                    result.push({ char: text[i], hex: rgbToHex(rgb.r, rgb.g, rgb.b), rgb });
                    continue;
                }
                const nextColorIndex = Math.min(colorIndex + 1, colorCount - 1);
                const c1 = hexToRgb(colors[colorIndex]);
                const c2 = hexToRgb(colors[nextColorIndex]);
                const localRatio = (ratio * (colorCount - 1)) - colorIndex;
                const r = Math.round(c1.r + (c2.r - c1.r) * localRatio);
                const g = Math.round(c1.g + (c2.g - c1.g) * localRatio);
                const b = Math.round(c1.b + (c2.b - c1.b) * localRatio);
                result.push({ char: text[i], hex: rgbToHex(r, g, b), rgb: { r, g, b } });
            }
            return result;
        }

        function formatAsHex(data) { return data.map(d => `&#${d.hex.slice(1)}${d.char}`).join(''); }
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
        function formatAsMcCode(data) { return data.map(d => { const mc = rgbToMc(d.rgb.r, d.rgb.g, d.rgb.b); return mc + d.char; }).join(''); }
        function formatAsAmpersand(data) { return data.map(d => { const mc = rgbToMc(d.rgb.r, d.rgb.g, d.rgb.b); return mc.replace('§', '&') + d.char; }).join(''); }
        function formatAsMiniMessage(data) {
            const hexColors = colors.map(c => c.slice(1)).join(':');
            const text = data.map(d => d.char).join('');
            return `<gradient:${hexColors}>${text}</gradient>`;
        }

        function updatePreview() {
            const text = textInput.value || 'Catminefy';
            const data = generateGradientData(text);
            const format = formatSelect.value;
            let output = '';
            switch (format) {
                case 'hex': output = formatAsHex(data); break;
                case 'legacy-hex': output = formatAsLegacyHex(data); break;
                case 'tagged': output = formatAsTagged(data); break;
                case 'mccode': output = formatAsMcCode(data); break;
                case 'ampersand': output = formatAsAmpersand(data); break;
                case 'minimessage': output = formatAsMiniMessage(data); break;
                default: output = formatAsMcCode(data);
            }
            mcOutput.textContent = output;
            let previewHtml = '';
            for (const d of data) {
                previewHtml += `<span style="color: ${d.hex}; text-shadow: 2px 2px 0px var(--bg-footer);">${d.char}</span>`;
            }
            previewText.innerHTML = previewHtml;
        }

        function applyTemplate(templateKey) {
            const template = templates[templateKey];
            if (!template) return;
            colors = [...template.colors];
            renderColors();
            updatePreview();
            const templateName = t(`app.gradient_generator.sections.templates.content.gradients.${templateKey}`, templateKey);
            addToHistory(template.colors, templateName);
            if (window.notifications) {
                window.notifications.success(t('app.gradient_generator.sections.templates.content.template_applied', 'Заготовка применена'), templateName);
            }
        }

        function renderColors() {
            colorList.innerHTML = '';
            colors.forEach((color, index) => {
                const item = document.createElement('div');
                item.className = 'color-item';
                item.innerHTML = `
                    <span class="color-index">#${index + 1}</span>
                    <input type="color" value="${color}" data-index="${index}">
                    <span class="color-hex" contenteditable="true" spellcheck="false" data-index="${index}">${color}</span>
                    <button class="color-remove" data-index="${index}">✘</button>
                `;
                colorList.appendChild(item);
            });

            document.querySelectorAll('.color-item input[type="color"]').forEach(input => {
                input.addEventListener('input', function() {
                    const index = parseInt(this.dataset.index);
                    colors[index] = this.value;
                    const hexSpan = this.closest('.color-item').querySelector('.color-hex');
                    if (hexSpan) hexSpan.textContent = this.value;
                    updatePreview();
                    updateCustomFavoriteButton();
                    const name = textInput.value ? `"${textInput.value}" (${t('app.gradient_generator.sections.history.content.placeholders.custom', 'кастомный')})` : t('app.gradient_generator.sections.history.content.placeholders.custom_gradient', 'Кастомный градиент');
                    addToHistory(colors, name);
                });
            });

            document.querySelectorAll('.color-hex').forEach(span => {
                span.addEventListener('blur', function() {
                    let val = this.textContent.trim();
                    const index = parseInt(this.dataset.index);
                    if (!val) { this.textContent = colors[index]; return; }
                    if (!val.startsWith('#')) val = '#' + val;
                    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
                        colors[index] = val;
                        const picker = this.closest('.color-item').querySelector('input[type="color"]');
                        if (picker) picker.value = val;
                        updatePreview();
                        updateCustomFavoriteButton();
                        const name = textInput.value ? `"${textInput.value}" (${t('app.gradient_generator.sections.history.content.placeholders.custom', 'кастомный')})` : t('app.gradient_generator.sections.history.content.placeholders.custom_gradient', 'Кастомный градиент');
                        addToHistory(colors, name);
                    } else {
                        this.textContent = colors[index];
                        if (window.notifications) window.notifications.warning(t('general.texts.warn', 'Внимание'), t('app.gradient_generator.sections.generate.content.invalid_hex', 'Используй HEX: #ff6b35'));
                    }
                });
                span.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') { e.preventDefault(); this.blur(); }
                });
            });

            document.querySelectorAll('.color-remove').forEach(btn => {
                btn.addEventListener('click', function() {
                    const index = parseInt(this.dataset.index);
                    if (colors.length <= 2) {
                        if (window.notifications) window.notifications.warning(t('general.texts.warn', 'Внимание'), t('app.gradient_generator.sections.generate.content.min_colors', 'Нужно минимум 2 цвета'));
                        return;
                    }
                    colors.splice(index, 1);
                    renderColors();
                    updatePreview();
                    updateCustomFavoriteButton();
                });
            });

            updateCustomFavoriteButton();
        }

        // ======== КАСТОМНЫЙ ГРАДИЕНТ В ИЗБРАННОЕ ========

        function updateCustomFavoriteButton() {
            let customBtn = document.getElementById('customFavoriteBtn');
            if (!customBtn) {
                const container = document.querySelector('.gradient-preview');
                if (!container) return;
                const wrapper = document.createElement('div');
                wrapper.style.cssText = 'display: flex; justify-content: center; gap: 0.5rem; margin-top: 0.5rem;';
                const btn = document.createElement('button');
                btn.id = 'customFavoriteBtn';
                btn.className = 'btn';
                btn.style.cssText = 'font-size: 0.8rem; padding: 0.2rem 0.8rem;';
                btn.textContent = '☆';
                wrapper.appendChild(btn);
                container.appendChild(wrapper);
                customBtn = btn;
            }

            customBtn.textContent = '☆';
            customBtn.style.color = 'var(--text-primary)';
            customBtn.style.borderColor = 'var(--text-primary)';
            customBtn.style.display = 'flex';
            customBtn.style.alignItems = 'center';
            customBtn.style.justifyContent = 'center';
            customBtn.style.textAlign = 'center';
            customBtn.style.lineHeight = '1';

            const favorites = loadFavorites();
            const id = colors.join(',');
            const exists = favorites.some(f => f.id === id);
            if (exists) {
                customBtn.textContent = '★';
                customBtn.style.borderColor = 'var(--yellow)';
                customBtn.style.color = 'var(--yellow)';
            }

            customBtn.onclick = function() {
                const name = textInput.value ? `"${textInput.value}" (${t('app.gradient_generator.sections.favorites.content.placeholders.custom', 'кастомный')})` : t('app.gradient_generator.sections.favorites.content.placeholders.custom_gradient', 'Кастомный градиент');
                toggleFavorite(null, colors, name);
                updateCustomFavoriteButton();
            };
        }

        // ======== ОБРАБОТЧИКИ ========

        document.querySelectorAll('.use-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const template = this.dataset.template;
                if (template && templates[template]) {
                    applyTemplate(template);
                    const originalText = this.textContent;
                    this.innerHTML = `<span class="ans-icon"><span style="color: var(--green);">${t('app.gradient_generator.sections.templates.content.applied', '✔ Применено')}</span></span>`;
                    setTimeout(() => { this.textContent = t('general.buttons.use', 'Использовать'); }, 1500);
                }
            });
        });

        document.addEventListener('click', function(e) {
            const btn = e.target.closest('.favorite-btn');
            if (btn) {
                e.preventDefault();
                const key = btn.dataset.template;
                if (key && templates[key]) {
                    const templateName = t(`app.gradient_generator.sections.templates.content.gradients.${key}`, key);
                    toggleFavorite(key, templates[key].colors, templateName);
                }
            }
        });

        document.getElementById('addColor')?.addEventListener('click', function() {
            const lastColor = colors[colors.length - 1] || '#ffffff';
            colors.push(lastColor);
            renderColors();
            updatePreview();
            updateCustomFavoriteButton();
            const name = textInput.value ? `"${textInput.value}" (${t('app.gradient_generator.sections.history.content.placeholders.custom', 'кастомный')})` : t('app.gradient_generator.sections.history.content.placeholders.custom_gradient', 'Кастомный градиент');
            addToHistory(colors, name);
            if (window.notifications) window.notifications.info(t('app.gradient_generator.sections.generate.content.color_added', 'Цвет добавлен'), `${t('app.gradient_generator.sections.generate.content.total_colors', 'Всего цветов')}: ${colors.length}`);
        });

        document.getElementById('removeColor')?.addEventListener('click', function() {
            if (colors.length <= 2) {
                if (window.notifications) window.notifications.warning(t('general.texts.warn', 'Внимание'), t('app.gradient_generator.sections.generate.content.min_colors', 'Нужно минимум 2 цвета'));
                return;
            }
            colors.pop();
            renderColors();
            updatePreview();
            updateCustomFavoriteButton();
            const name = textInput.value ? `"${textInput.value}" (${t('app.gradient_generator.sections.history.content.placeholders.custom', 'кастомный')})` : t('app.gradient_generator.sections.history.content.placeholders.custom_gradient', 'Кастомный градиент');
            addToHistory(colors, name);
            if (window.notifications) window.notifications.info(t('app.gradient_generator.sections.generate.content.color_removed', 'Цвет удалён'), `${t('app.gradient_generator.sections.generate.content.total_colors', 'Всего цветов')}: ${colors.length}`);
        });

        document.getElementById('clearColors')?.addEventListener('click', function() {
            if (colors.length <= 2) {
                if (window.notifications) window.notifications.warning(t('general.texts.warn', 'Внимание'), t('app.gradient_generator.sections.generate.content.min_colors', 'Нужно минимум 2 цвета'));
                return;
            }
            const first = colors[0];
            const last = colors[colors.length - 1];
            colors = [first, last];
            renderColors();
            updatePreview();
            updateCustomFavoriteButton();
            const name = textInput.value ? `"${textInput.value}" (${t('app.gradient_generator.sections.history.content.placeholders.custom', 'кастомный')})` : t('app.gradient_generator.sections.history.content.placeholders.custom_gradient', 'Кастомный градиент');
            addToHistory(colors, name);
            if (window.notifications) window.notifications.info(t('app.gradient_generator.sections.generate.content.cleared', 'Очищено'), t('app.gradient_generator.sections.generate.content.left_2_colors', 'Оставлено 2 цвета'));
        });

        // ======== ГЕНЕРАЦИЯ СЛУЧАЙНЫХ ЦВЕТОВ ========

        document.getElementById('randomColors')?.addEventListener('click', function() {
            const minInput = document.getElementById('minRandomColorsCount');
            const maxInput = document.getElementById('maxRandomColorsCount');
            
            let min = parseInt(minInput?.value);
            let max = parseInt(maxInput?.value);
            
            if (isNaN(min) || min < 2 || min > 10) min = 2;
            if (isNaN(max) || max < 2 || max > 10) max = 6;
            
            if (min > max) {
                const temp = min;
                min = max;
                max = temp;
            }
            
            const count = Math.floor(Math.random() * (max - min + 1)) + min;
            
            colors = [];
            for (let i = 0; i < count; i++) {
                const hex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
                colors.push(hex);
            }
            
            renderColors();
            updatePreview();
            updateCustomFavoriteButton();
            const text = document.getElementById('gradientText')?.value || 'Catminefy';
            updateTemplatePreviews(text);
            const name = textInput.value ? `"${textInput.value}" (${t('app.gradient_generator.sections.history.content.placeholders.custom', 'кастомный')})` : t('app.gradient_generator.sections.history.content.placeholders.custom_gradient', 'Кастомный градиент');
            addToHistory(colors, name);
            if (window.notifications) window.notifications.info(t('app.gradient_generator.sections.generate.content.random_colors', 'Случайные цвета'), `${t('app.gradient_generator.sections.generate.content.generated', 'Сгенерировано')} ${colors.length} ${t('app.gradient_generator.sections.generate.content.colors_lower', 'цветов')} (${min}-${max})`);
        });

        // ======== ОБНОВЛЕНИЕ ПРЕВЬЮ ЗАГОТОВОК ========

        function updateTemplatePreviews(text) {
            document.querySelectorAll('.template-block').forEach(block => {
                const templateKey = block.dataset.template;
                const template = templates[templateKey];
                if (!template) return;
                const previewEl = block.querySelector('.template-preview');
                if (!previewEl) return;
                let displayText = text || 'Catminefy';
                if (displayText.length > 15) displayText = displayText.slice(0, 15) + '…';
                const colorsArr = template.colors;
                const totalChars = displayText.length;
                let html = '';
                for (let i = 0; i < totalChars; i++) {
                    const char = displayText[i];
                    const ratio = totalChars === 1 ? 0.5 : i / (totalChars - 1);
                    const colorIndex = Math.min(Math.floor(ratio * (colorsArr.length - 1)), colorsArr.length - 2);
                    if (colorIndex < 0 || colorIndex >= colorsArr.length - 1) {
                        const displayChar = char === ' ' ? '&nbsp;' : char;
                        html += `<span style="color: ${colorsArr[0] || '#ffffff'};">${displayChar}</span>`;
                        continue;
                    }
                    const nextColorIndex = Math.min(colorIndex + 1, colorsArr.length - 1);
                    const c1 = hexToRgb(colorsArr[colorIndex]);
                    const c2 = hexToRgb(colorsArr[nextColorIndex]);
                    const localRatio = (ratio * (colorsArr.length - 1)) - colorIndex;
                    const r = Math.round(c1.r + (c2.r - c1.r) * localRatio);
                    const g = Math.round(c1.g + (c2.g - c1.g) * localRatio);
                    const b = Math.round(c1.b + (c2.b - c1.b) * localRatio);
                    const hex = rgbToHex(r, g, b);
                    const displayChar = char === ' ' ? '&nbsp;' : char;
                    html += `<span style="color: ${hex};">${displayChar}</span>`;
                }
                previewEl.innerHTML = html;
            });
        }

        function applyTemplatePreviews() {
            document.querySelectorAll('.template-block').forEach(block => {
                const templateKey = block.dataset.template;
                const template = templates[templateKey];
                if (!template) return;
                const colorsContainer = block.querySelector('.template-colors');
                if (colorsContainer && colorsContainer.children.length === 0) {
                    template.colors.forEach(color => {
                        const dot = document.createElement('span');
                        dot.className = 'color-dot';
                        dot.style.background = color;
                        dot.dataset.color = color;
                        dot.addEventListener('click', function(e) {
                            e.stopPropagation();
                            const hex = this.dataset.color;
                            navigator.clipboard.writeText(hex).then(() => {
                                this.style.transform = 'scale(1.3)';
                                if (window.notifications) window.notifications.success(t('app.gradient_generator.sections.templates.content.color_copied', 'Цвет скопирован'), hex);
                                setTimeout(() => { this.style.transform = ''; }, 800);
                            }).catch(() => {
                                const textarea = document.createElement('textarea');
                                textarea.value = hex;
                                document.body.appendChild(textarea);
                                textarea.select();
                                document.execCommand('copy');
                                document.body.removeChild(textarea);
                                this.style.transform = 'scale(1.3)';
                                if (window.notifications) window.notifications.success(t('app.gradient_generator.sections.templates.content.color_copied', 'Цвет скопирован'), hex);
                                setTimeout(() => { this.style.transform = ''; }, 800);
                            });
                        });
                        colorsContainer.appendChild(dot);
                    });
                }
            });
            const text = document.getElementById('gradientText')?.value || 'Catminefy';
            updateTemplatePreviews(text);
        }

        textInput.addEventListener('input', function() {
            updatePreview();
            updateTemplatePreviews(this.value || 'Catminefy');
            updateCustomFavoriteButton();
        });
        formatSelect.addEventListener('change', updatePreview);

        // ======== ВАЛИДАЦИЯ ПОЛЕЙ ========

        function validateNumberInput(input) {
            if (!input) return;
            input.addEventListener('input', function() {
                this.value = this.value.replace(/[^0-9]/g, '').slice(0, 2);
            });
        }

        const minInput = document.getElementById('minRandomColorsCount');
        const maxInput = document.getElementById('maxRandomColorsCount');
        if (minInput) validateNumberInput(minInput);
        if (maxInput) validateNumberInput(maxInput);

        // ======== ИНИЦИАЛИЗАЦИЯ ========

        renderColors();
        updatePreview();
        applyTemplatePreviews();
        renderHistory();
        renderFavorites();
        updateFavoriteButtons();
        updateCustomFavoriteButton();

        console.log('🎨 Генератор градиентов загружен');
        console.log('Цвета:', colors);
    }

    // ======== ЗАПУСК ========

    // Если i18n уже загружен — запускаем сразу
    if (window.i18n && window.i18n.isLoaded) {
        initGradientGenerator();
    } else {
        // Ждём событие i18nReady
        document.addEventListener('i18nReady', function() {
            if (!window._gradientRunning) {
                initGradientGenerator();
            }
        });
        // Fallback: проверяем каждые 50ms
        const check = setInterval(() => {
            if (window.i18n && window.i18n.isLoaded && !window._gradientRunning) {
                clearInterval(check);
                initGradientGenerator();
            }
        }, 50);
    }
}