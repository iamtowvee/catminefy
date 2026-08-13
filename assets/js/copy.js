// assets/js/copy.js
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.dataset.target;
            const codeElement = document.getElementById(targetId);
            if (!codeElement) return;
            
            // Берём текст из элемента
            let text = codeElement.textContent;
            
            // Если текст пустой — пробуем взять из data-атрибута
            if (!text || text.trim() === '') {
                const codeBlock = codeElement.closest('.code-block');
                if (codeBlock && codeBlock.dataset.originalCode) {
                    text = codeBlock.dataset.originalCode;
                }
            }
            
            // Если всё ещё пусто — выходим
            if (!text || text.trim() === '') {
                console.warn('Нечего копировать');
                return;
            }
            
            const originalText = this.innerHTML;
            
            navigator.clipboard.writeText(text).then(() => {
                this.innerHTML = '<span class="ans-icon"><span style="color: var(--green);">✔ Скопировано</span></span>';
                
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.style.color = '';
                }, 2000);
            }).catch(() => {
                // fallback
                const textarea = document.createElement('textarea');
                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                
                this.innerHTML = '<span class="ans-icon"><span style="color: var(--green);">✔ Скопировано</span></span>';
                setTimeout(() => {
                    this.innerHTML = originalText;
                }, 2000);
            });
        });
    });
});