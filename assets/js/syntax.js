// assets/js/syntax.js
document.addEventListener('DOMContentLoaded', function() {
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    function parseNumber(line, i, len) {
        const start = i;
        
        if (i + 1 < len && line[i] === '0' && (line[i+1] === 'x' || line[i+1] === 'b')) {
            i += 2;
            if (line[i-1] === 'x') {
                while (i < len && ((line[i] >= '0' && line[i] <= '9') || 
                       (line[i] >= 'a' && line[i] <= 'f') || 
                       (line[i] >= 'A' && line[i] <= 'F'))) {
                    i++;
                }
            } else if (line[i-1] === 'b') {
                while (i < len && (line[i] === '0' || line[i] === '1')) {
                    i++;
                }
            }
            const num = line.substring(start, i);
            return { value: num, newIndex: i };
        }
        
        while (i < len && (line[i] >= '0' && line[i] <= '9' || line[i] === '.')) {
            i++;
        }
        const num = line.substring(start, i);
        return { value: num, newIndex: i };
    }

    function isOperator(char) {
        const operators = ['+', '-', '*', '/', '%', '_', '$', '=', '#', '!', '<', '>', '&', '|', '^', '~', '?', ':'];
        return operators.includes(char);
    }
    
    function highlightEscapes(str) {
        return str.replace(/\\([n0\\tr\'"abf v?]|[0-7]{1,3}|x[0-9a-fA-F]{1,2})/g, function(match) {
            return `<span class="hl-number">${match}</span>`;
        });
    }
    
    function highlightText(code) {
        return code;
    }

    function highlightHtml(code) {
        let result = '';
        let i = 0;
        const len = code.length;
        let inTag = false;
        let inString = false;
        let stringChar = '';
        
        function isTagNameChar(char) {
            return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || 
                   char === '-' || char === '_' || (char >= '0' && char <= '9');
        }
        
        function isAttributeNameChar(char) {
            return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || 
                   char === '-' || char === '_' || char === ':' || (char >= '0' && char <= '9');
        }
        
        function isWhitespace(char) {
            return char === ' ' || char === '\t' || char === '\n' || char === '\r';
        }
        
        const selfClosingTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 
            'param', 'source', 'track', 'wbr'];
        
        while (i < len) {
            const char = code[i];
            
            // Строки внутри тегов
            if (inTag && (char === '"' || char === "'")) {
                if (!inString) {
                    inString = true;
                    stringChar = char;
                    const start = i;
                    i++;
                    while (i < len && !(code[i] === stringChar && code[i-1] !== '\\')) {
                        i++;
                    }
                    if (i < len) i++;
                    const str = code.substring(start, i);
                    let safe = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    result += `<span class="hl-string">${safe}</span>`;
                    inString = false;
                    continue;
                }
            }
            
            if (inString) {
                i++;
                continue;
            }
            
            // Комментарии
            if (!inTag && i + 3 < len && code[i] === '<' && code[i+1] === '!' && code[i+2] === '-' && code[i+3] === '-') {
                const start = i;
                i += 4;
                while (i + 2 < len && !(code[i] === '-' && code[i+1] === '-' && code[i+2] === '>')) {
                    i++;
                }
                if (i + 2 < len) {
                    i += 3;
                }
                const comment = code.substring(start, i);
                result += `<span class="hl-comment">${escapeHtml(comment)}</span>`;
                continue;
            }
            
            // DOCTYPE
            if (!inTag && i + 8 < len && code.substring(i, i + 9).toUpperCase() === '<!DOCTYPE') {
                const start = i;
                while (i < len && code[i] !== '>') {
                    i++;
                }
                if (i < len) i++;
                const doctype = code.substring(start, i);
                result += `<span class="hl-keyword">${escapeHtml(doctype)}</span>`;
                continue;
            }
            
            // Открывающий или закрывающий тег
            if (!inTag && char === '<' && i + 1 < len) {
                if (isTagNameChar(code[i+1]) || (i + 2 < len && code[i+1] === '/' && isTagNameChar(code[i+2]))) {
                    inTag = true;
                    const tagStart = i;
                    i++;
                    
                    // Собираем весь тег в одну строку для подсветки
                    let tagContent = '<';
                    let isClosing = false;
                    
                    if (code[i] === '/') {
                        isClosing = true;
                        tagContent += '/';
                        i++;
                    }
                    
                    // Читаем имя тега
                    while (i < len && isTagNameChar(code[i])) {
                        tagContent += code[i];
                        i++;
                    }
                    
                    // Если это закрывающий тег - просто собираем до >
                    if (isClosing) {
                        while (i < len && code[i] !== '>') {
                            tagContent += code[i];
                            i++;
                        }
                        if (i < len && code[i] === '>') {
                            tagContent += '>';
                            i++;
                        }
                        result += `<span class="hl-builtin">${escapeHtml(tagContent)}</span>`;
                        inTag = false;
                        continue;
                    }
                    
                    // Для открывающего тега - собираем тег с атрибутами
                    // Сначала добавляем имя тега в результат с подсветкой
                    result += `<span class="hl-builtin">${escapeHtml(tagContent)}</span>`;
                    
                    // Пропускаем пробелы
                    while (i < len && isWhitespace(code[i])) {
                        result += escapeHtml(code[i]);
                        i++;
                    }
                    
                    // Читаем атрибуты и закрытие тега
                    let tagEnded = false;
                    while (i < len && !tagEnded) {
                        // Пропускаем пробелы
                        while (i < len && isWhitespace(code[i])) {
                            result += escapeHtml(code[i]);
                            i++;
                        }
                        
                        if (i >= len) break;
                        
                        // Закрытие тега >
                        if (code[i] === '>') {
                            // Добавляем > как часть тега hl-builtin
                            let closeTag = '>';
                            i++;
                            // Проверяем самозакрывающийся тег
                            if (i > 0 && code[i-2] === '/') {
                                // Уже есть / перед >
                                closeTag = '/>';
                            } else if (i + 1 < len && code[i] === '/' && code[i+1] === '>') {
                                // Самозакрывающийся тег
                                closeTag = '/>';
                                i += 2;
                            }
                            // Проверяем, не является ли это самозакрывающимся тегом
                            if (selfClosingTags.includes(tagContent.toLowerCase())) {
                                // Уже обработали
                            }
                            result += `<span class="hl-builtin">${escapeHtml(closeTag)}</span>`;
                            inTag = false;
                            tagEnded = true;
                            break;
                        }
                        
                        if (code[i] === '/') {
                            // Слеш перед >
                            result += `<span class="hl-builtin">${escapeHtml('/')}</span>`;
                            i++;
                            if (i < len && code[i] === '>') {
                                result += `<span class="hl-builtin">${escapeHtml('>')}</span>`;
                                i++;
                                inTag = false;
                                tagEnded = true;
                                break;
                            }
                            continue;
                        }
                        
                        // Имя атрибута
                        if (isAttributeNameChar(code[i])) {
                            const attrStart = i;
                            while (i < len && isAttributeNameChar(code[i])) {
                                i++;
                            }
                            const attrName = code.substring(attrStart, i);
                            result += `<span class="hl-literal">${escapeHtml(attrName)}</span>`;
                            
                            // Пропускаем пробелы
                            while (i < len && isWhitespace(code[i])) {
                                result += escapeHtml(code[i]);
                                i++;
                            }
                            
                            // Знак равенства
                            if (i < len && code[i] === '=') {
                                result += `<span class="hl-operator">${escapeHtml('=')}</span>`;
                                i++;
                                
                                // Пропускаем пробелы
                                while (i < len && isWhitespace(code[i])) {
                                    result += escapeHtml(code[i]);
                                    i++;
                                }
                                
                                // Значение атрибута
                                if (i < len && (code[i] === '"' || code[i] === "'")) {
                                    const quoteChar = code[i];
                                    const valStart = i;
                                    i++;
                                    while (i < len && !(code[i] === quoteChar && code[i-1] !== '\\')) {
                                        i++;
                                    }
                                    if (i < len) i++;
                                    const attrValue = code.substring(valStart, i);
                                    let safe = attrValue.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                                    result += `<span class="hl-string">${safe}</span>`;
                                } else if (i < len && !isWhitespace(code[i]) && code[i] !== '>' && code[i] !== '/') {
                                    // Без кавычек
                                    const valStart = i;
                                    while (i < len && !isWhitespace(code[i]) && code[i] !== '>' && code[i] !== '/') {
                                        i++;
                                    }
                                    const attrValue = code.substring(valStart, i);
                                    result += `<span class="hl-string">${escapeHtml(attrValue)}</span>`;
                                }
                            }
                        } else {
                            // Если не атрибут - просто выводим символ
                            result += escapeHtml(code[i]);
                            i++;
                        }
                    }
                    continue;
                }
            }
            
            // Текст вне тегов (HTML-сущности)
            if (!inTag) {
                if (char === '&') {
                    const start = i;
                    i++;
                    while (i < len && code[i] !== ';' && (code[i] >= 'a' && code[i] <= 'z' || code[i] >= 'A' && code[i] <= 'Z' || code[i] >= '0' && code[i] <= '9' || code[i] === '#')) {
                        i++;
                    }
                    if (i < len && code[i] === ';') {
                        i++;
                        const entity = code.substring(start, i);
                        result += `<span class="hl-decorator">${escapeHtml(entity)}</span>`;
                    } else {
                        result += escapeHtml(char);
                    }
                    continue;
                }
                
                result += escapeHtml(char);
                i++;
                continue;
            }
            
            result += escapeHtml(char);
            i++;
        }
        
        return result;
    }

    function highlightCmd(code) {
        let result = '';
        let i = 0;
        const len = code.length;
        let inString = false;
        let stringChar = '';
        
        while (i < len) {
            const char = code[i];
            
            // Проверяем строки
            if ((char === '"' || char === "'")) {
                if (!inString) {
                    inString = true;
                    stringChar = char;
                    const start = i;
                    i++;
                    while (i < len && !(code[i] === stringChar && code[i-1] !== '\\')) {
                        i++;
                    }
                    if (i < len) i++;
                    const str = code.substring(start, i);
                    let safe = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    safe = safe.replace(/\\([n0\\tr'"])/g, function(m) {
                        return `<span class="hl-type">${m}</span>`;
                    });
                    result += `<span class="hl-string">${safe}</span>`;
                    inString = false;
                    continue;
                }
            }
            
            if (inString) {
                i++;
                continue;
            }
            
            // Однострочные комментарии
            if (char === '#') {
                const start = i;
                while (i < len && code[i] !== '\n') {
                    i++;
                }
                const comment = code.substring(start, i);
                result += `<span class="hl-comment">${escapeHtml(comment)}</span>`;
                continue;
            }
            
            // Декораторы @
            if (char === '@') {
                const start = i;
                i++;
                while (i < len && ((code[i] >= 'a' && code[i] <= 'z') || (code[i] >= 'A' && code[i] <= 'Z') || code[i] === '_' || (code[i] >= '0' && code[i] <= '9'))) {
                    i++;
                }
                const word = code.substring(start, i);
                result += `<span class="hl-decorator">${escapeHtml(word)}</span>`;
                continue;
            }
            
            // Проверка на унарный оператор перед числом
            if ((char === '-' || char === '+') && i + 1 < len && code[i+1] >= '0' && code[i+1] <= '9') {
                const before = i > 0 ? code[i-1] : '';
                if (!/[a-zA-Z0-9_)"]/.test(before)) {
                    const sign = char;
                    i++;
                    const numResult = parseNumber(code, i, len);
                    i = numResult.newIndex;
                    result += `<span class="hl-number">${escapeHtml(sign + numResult.value)}</span>`;
                    continue;
                }
            }
            
            // Потом обработка чисел:
            if (char >= '0' && char <= '9') {
                const numResult = parseNumber(code, i, len);
                i = numResult.newIndex;
                result += `<span class="hl-number">${escapeHtml(numResult.value)}</span>`;
                continue;
            }
            
            // Ключевые слова, функции, типы
            if ((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || char === '_') {
                const start = i;
                while (i < len && ((code[i] >= 'a' && code[i] <= 'z') || (code[i] >= 'A' && code[i] <= 'Z') || code[i] === '_' || (code[i] >= '0' && code[i] <= '9'))) {
                    i++;
                }
                const word = code.substring(start, i);
                
                const isFirstWord = (start === 0 || code[start - 1] === '\n');
                
                const keywords = ["dir", "cd", "chdir", "md", "mkdir", "rmdir", "rd", "copy", "move",
                    "del", "erase", "ren", "rename", "type", "systeminfo", "ver", "tasklist", "taskkill",
                    "shutdown", "color", "cls", "ipconfig", "ping", "tracert", "netstat", "nslookup",
                    "chkdsk", "sfc", "format", "diskpart", "help"];
                
                const opers = ["scannow"];
                const literals = ['true', 'false', 'nul'];
                const builtins = ['string', 'char', 'int', 'float', 'double', 'arr', 'dict', 'void', 'bool'];
                
                if (isFirstWord) {
                    result += `<span class="hl-type">${escapeHtml(word)}</span>`;
                } else if (keywords.includes(word)) {
                    result += `<span class="hl-keyword">${escapeHtml(word)}</span>`;
                } else if (literals.includes(word)) {
                    result += `<span class="hl-literal">${escapeHtml(word)}</span>`;
                } else if (opers.includes(word)) {
                    result += `<span class="hl-operator">${escapeHtml(word)}</span>`;
                } else if (builtins.includes(word)) {
                    result += `<span class="hl-type">${escapeHtml(word)}</span>`;
                } else if (i < len && code[i] === '(') {
                    result += `<span class="hl-function">${escapeHtml(word)}</span>`;
                } else {
                    result += escapeHtml(word);
                }
                continue;
            }
            
            // Обычный символ
            result += escapeHtml(char);
            i++;
        }
        
        return result;
    }

    function highlightC(code) {
        let result = '';
        let i = 0;
        const len = code.length;
        let inMultiComment = false;
        let inString = false;
        let stringChar = '';
        
        while (i < len) {
            const char = code[i];
            
            // Проверяем строки
            if (!inMultiComment && (char === '"' || char === "'")) {
                if (!inString) {
                    inString = true;
                    stringChar = char;
                    const start = i;
                    i++;
                    while (i < len && !(code[i] === stringChar && code[i-1] !== '\\')) {
                        i++;
                    }
                    if (i < len) i++;
                    const str = code.substring(start, i);
                    let safe = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    safe = safe.replace(/\\([n0\\tr'"])/g, function(m) {
                        return `<span class="hl-type">${m}</span>`;
                    });
                    result += `<span class="hl-string">${safe}</span>`;
                    inString = false;
                    continue;
                }
            }
            
            if (inString) {
                i++;
                continue;
            }
            
            // Проверяем начало многострочного комментария
            if (!inMultiComment && i + 1 < len && char === '/' && code[i+1] === '*') {
                result += '<span class="hl-comment">';
                result += escapeHtml(char);
                result += escapeHtml(code[i+1]);
                i += 2;
                inMultiComment = true;
                
                while (i + 1 < len && !(code[i] === '*' && code[i+1] === '/')) {
                    result += escapeHtml(code[i]);
                    i++;
                }
                
                if (i + 1 < len) {
                    result += escapeHtml(code[i]);
                    result += escapeHtml(code[i+1]);
                    i += 2;
                }
                
                result += '</span>';
                inMultiComment = false;
                continue;
            }
            
            if (inMultiComment) {
                i++;
                continue;
            }
            
            // Однострочные комментарии
            if (char === '/' && i + 1 < len && code[i+1] === '/') {
                const start = i;
                while (i < len && code[i] !== '\n') {
                    i++;
                }
                const comment = code.substring(start, i);
                result += `<span class="hl-comment">${escapeHtml(comment)}</span>`;
                continue;
            }
            
            // Проверка на унарный оператор перед числом
            if ((char === '-' || char === '+') && i + 1 < len && code[i+1] >= '0' && code[i+1] <= '9') {
                const before = i > 0 ? code[i-1] : '';
                if (!/[a-zA-Z0-9_)"]/.test(before)) {
                    const sign = char;
                    i++;
                    const numResult = parseNumber(code, i, len);
                    i = numResult.newIndex;
                    result += `<span class="hl-number">${escapeHtml(sign + numResult.value)}</span>`;
                    continue;
                }
            }
            
            // Потом обработка чисел:
            if (char >= '0' && char <= '9') {
                const numResult = parseNumber(code, i, len);
                i = numResult.newIndex;
                result += `<span class="hl-number">${escapeHtml(numResult.value)}</span>`;
                continue;
            }
            
            // Ключевые слова, функции, типы
            if ((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || char === '_') {
                const start = i;
                while (i < len && ((code[i] >= 'a' && code[i] <= 'z') || (code[i] >= 'A' && code[i] <= 'Z') || code[i] === '_' || (code[i] >= '0' && code[i] <= '9'))) {
                    i++;
                }
                const word = code.substring(start, i);
                
                const keywords = ["if", "else", "switch", "case", "while", "do", "default", 
                    "for", "break", "continue", "goto", "return", "signed", "const", "volatile",
                    "restrict", "struct", "union", "enum", "auto", "extern", "register", "static"];
                
                const opers = ["sizeof", "typedef", "inline", "_Bool"];
                const literals = ["NULL"];
                const builtins = ["int", "char", "float", "double", "void", "short", "long", "unsigned"];
                
                if (keywords.includes(word)) {
                    result += `<span class="hl-keyword">${escapeHtml(word)}</span>`;
                } else if (literals.includes(word)) {
                    result += `<span class="hl-literal">${escapeHtml(word)}</span>`;
                } else if (opers.includes(word)) {
                    result += `<span class="hl-operator">${escapeHtml(word)}</span>`;
                } else if (builtins.includes(word)) {
                    result += `<span class="hl-type">${escapeHtml(word)}</span>`;
                } else if (word.length > 0 && word[0] >= 'A' && word[0] <= 'Z') {
                    result += `<span class="hl-type">${escapeHtml(word)}</span>`;
                } else if (i < len && code[i] === '(') {
                    result += `<span class="hl-function">${escapeHtml(word)}</span>`;
                } else {
                    result += escapeHtml(word);
                }
                continue;
            }
            
            // Операторы
            if (isOperator(char)) {
                let operator = char;
                i++;
                while (i < len && isOperator(code[i]) && !inString) {
                    operator += code[i];
                    i++;
                }
                result += `<span class="hl-operator">${escapeHtml(operator)}</span>`;
                continue;
            }
            
            // Обычный символ
            result += escapeHtml(char);
            i++;
        }
        
        return result;
    }
    
    function highlightYaml(code) {
        let result = '';
        let i = 0;
        const len = code.length;
        let inMultiComment = false;
        let inString = false;
        let stringChar = '';
        let lineStart = true;
        
        while (i < len) {
            const char = code[i];
            
            // Проверяем строки в кавычках
            if (!inMultiComment && (char === '"' || char === "'")) {
                if (!inString) {
                    inString = true;
                    stringChar = char;
                    const start = i;
                    i++;
                    while (i < len && !(code[i] === stringChar && code[i-1] !== '\\')) {
                        i++;
                    }
                    if (i < len) i++;
                    const str = code.substring(start, i);
                    let safe = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    safe = safe.replace(/\\([n0\\tr'"])/g, function(m) {
                        return `<span class="hl-type">${m}</span>`;
                    });
                    result += `<span class="hl-string">${safe}</span>`;
                    inString = false;
                    continue;
                }
            }
            
            if (inString) {
                i++;
                continue;
            }
            
            // Однострочные комментарии
            if (char === '#') {
                const start = i;
                while (i < len && code[i] !== '\n') {
                    i++;
                }
                const comment = code.substring(start, i);
                result += `<span class="hl-comment">${escapeHtml(comment)}</span>`;
                lineStart = true;
                continue;
            }
            
            // Проверка на маркер списка в начале строки
            if (lineStart && char === '-') {
                const nextIdx = i + 1;
                if (nextIdx < len && (code[nextIdx] === ' ' || code[nextIdx] === '\t' || code[nextIdx] === '\n')) {
                    const start = i;
                    i++;
                    while (i < len && (code[i] === ' ' || code[i] === '\t')) {
                        i++;
                    }
                    const marker = code.substring(start, i);
                    result += `<span class="hl-operator">${escapeHtml(marker)}</span>`;
                    lineStart = false;
                    continue;
                }
            }
            
            // Проверка на унарный оператор перед числом
            if ((char === '-' || char === '+') && i + 1 < len && code[i+1] >= '0' && code[i+1] <= '9') {
                const before = i > 0 ? code[i-1] : '';
                if (!/[a-zA-Z0-9_)"]/.test(before)) {
                    const sign = char;
                    i++;
                    const numResult = parseNumber(code, i, len);
                    i = numResult.newIndex;
                    result += `<span class="hl-number">${escapeHtml(sign + numResult.value)}</span>`;
                    lineStart = false;
                    continue;
                }
            }
            
            // Обработка чисел
            if (char >= '0' && char <= '9') {
                const numResult = parseNumber(code, i, len);
                i = numResult.newIndex;
                result += `<span class="hl-number">${escapeHtml(numResult.value)}</span>`;
                lineStart = false;
                continue;
            }
            
            // Ключи, ключевые слова, булевы значения, null
            if ((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || char === '_') {
                const start = i;
                while (i < len && ((code[i] >= 'a' && code[i] <= 'z') || (code[i] >= 'A' && code[i] <= 'Z') || code[i] === '_' || (code[i] >= '0' && code[i] <= '9'))) {
                    i++;
                }
                const word = code.substring(start, i);
                
                const keywords = ["true", "false"];
                const literals = ["null"];
                
                // Проверяем, является ли слово ключом в YAML (в начале строки перед ':')
                let isKey = false;
                let j = i;
                while (j < len && (code[j] === ' ' || code[j] === '\t')) {
                    j++;
                }
                if (lineStart && j < len && code[j] === ':') {
                    isKey = true;
                }
                
                if (keywords.includes(word)) {
                    result += `<span class="hl-type">${escapeHtml(word)}</span>`;
                } else if (literals.includes(word)) {
                    result += `<span class="hl-literal">${escapeHtml(word)}</span>`;
                } else if (isKey) {
                    result += `<span class="hl-function">${escapeHtml(word)}</span>`;
                } else {
                    // ВСЕ ОСТАЛЬНЫЕ СЛОВА - КАК СТРОКИ
                    result += `<span class="hl-string">${escapeHtml(word)}</span>`;
                }
                lineStart = false;
                continue;
            }
            
            // Двоеточие
            if (char === ':') {
                let operator = char;
                i++;
                while (i < len && isOperator(code[i]) && !inString) {
                    operator += code[i];
                    i++;
                }
                result += `<span class="hl-operator">${escapeHtml(operator)}</span>`;
                lineStart = false;
                continue;
            }
            
            // Пробелы - пропускаем без подсветки
            if (char === ' ' || char === '\t') {
                result += escapeHtml(char);
                i++;
                continue;
            }
            
            // Перенос строки
            if (char === '\n') {
                result += escapeHtml(char);
                i++;
                lineStart = true;
                continue;
            }
            
            // ВСЕ ОСТАЛЬНЫЕ СИМВОЛЫ (знаки препинания, специальные символы и т.д.) - КАК СТРОКИ
            result += `<span class="hl-string">${escapeHtml(char)}</span>`;
            i++;
            lineStart = false;
        }
        
        return result;
    }

    // Подсветка всех блоков с нумерацией строк
    document.querySelectorAll('.code-block code').forEach(function(block) {
        const codeBlock = block.closest('.code-block');
        const lang = codeBlock ? codeBlock.dataset.lang : 'javascript';
        const code = block.textContent;
        codeBlock.dataset.originalCode = code;
        
        let highlighted = '';
        switch(lang) {
            case 'cmd':
                highlighted = highlightCmd(code);
                break;
            case 'c':
                highlighted = highlightC(code);
                break;
            case 'html':
                highlighted = highlightHtml(code);
                break;
            case 'txt':
            case 'text':
                highlighted = highlightText(code);
                break;
            case 'yml':
            case 'yaml':
                highlighted = highlightYaml(code);
                break;
            default:
                highlighted = highlightText(code);
        }
        
        // Разбиваем ОРИГИНАЛЬНЫЙ код на строки (не highlighted!)
        const lines = code.split('\n');
        if (lines.length > 0 && lines[lines.length - 1] === '') {
            lines.pop();
        }
        
        // Если строк меньше 2 - не добавляем нумерацию
        if (lines.length < 2) {
            block.innerHTML = highlighted;
            return;
        }
        
        // Теперь разбиваем highlighted на строки
        const highlightedLines = highlighted.split('\n');
        if (highlightedLines.length > 0 && highlightedLines[highlightedLines.length - 1] === '') {
            highlightedLines.pop();
        }
        
        // Оборачиваем каждую строку в span
        const wrappedLines = highlightedLines.map(line => {
            return `<span>${line || ' '}</span>`;
        });
        block.innerHTML = wrappedLines.join('');
        
        // Проверяем, не добавлена ли уже нумерация
        if (codeBlock.querySelector('.line-numbers')) {
            return;
        }
        
        // Создаём номера строк
        const lineNumbers = document.createElement('div');
        lineNumbers.className = 'line-numbers';
        lineNumbers.innerHTML = lines.map((_, i) => `<span>${i + 1}</span>`).join('');
        
        // Создаём обёртку для кода
        const codeContent = document.createElement('div');
        codeContent.className = 'code-content';
        
        // Создаём wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'code-wrapper';
        
        // Перемещаем block в codeContent
        const pre = block.parentNode;
        
        // Делаем pre flex-контейнером
        pre.style.display = 'flex';
        pre.style.flexDirection = 'column';
        
        // Очищаем pre
        pre.innerHTML = '';
        
        // Собираем структуру
        wrapper.appendChild(lineNumbers);
        wrapper.appendChild(codeContent);
        codeContent.appendChild(block);
        pre.appendChild(wrapper);
    });
});

// ===== ФИКС ОТСТУПОВ ДЛЯ БЛОКОВ С 1 СТРОКОЙ =====
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.code-block').forEach(function(block) {
        const lineNumbers = block.querySelector('.line-numbers');
        const codeContent = block.querySelector('.code-content');
        if (!lineNumbers || !codeContent) return;
        
        // Проверяем, сколько строк в блоке
        const lines = lineNumbers.querySelectorAll('span');
        if (lines.length === 1) {
            codeContent.style.paddingLeft = '0.75rem';
        }
    });
});