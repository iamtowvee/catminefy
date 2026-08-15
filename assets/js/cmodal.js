// ============================
// КАСТОМНОЕ ВСПЛЫВАЮЩЕЕ ОКНО
// ============================

class CustomModal {
    constructor() {
        this.modal = document.getElementById('customModal');
        this.title = document.getElementById('customModalTitle');
        this.body = document.getElementById('customModalBody');
        this.footer = document.getElementById('customModalFooter');
        this.confirmBtn = document.getElementById('customModalConfirm');
        this.cancelBtn = document.getElementById('customModalCancel');
        this.closeBtn = document.getElementById('customModalClose');
        
        this.resolve = null;
        this.reject = null;
        
        this._bindEvents();
    }
    
    _bindEvents() {
        // Закрытие по крестику
        this.closeBtn.addEventListener('click', () => this._close());
        
        // Закрытие по оверлею
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal || e.target.classList.contains('custom-modal-overlay')) {
                this._close();
            }
        });
        
        // Кнопка "Отмена"
        this.cancelBtn.addEventListener('click', () => this._cancel());
        
        // Кнопка "Ок"
        this.confirmBtn.addEventListener('click', () => this._confirm());
        
        // Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this._close();
            }
        });
    }
    
    _open() {
        this.modal.classList.add('active');
        this.modal.style.display = 'flex';
    }
    
    _close() {
        this.modal.classList.remove('active');
        this.modal.style.display = 'none';
        if (this.reject) this.reject('closed');
    }
    
    _confirm() {
        this.modal.classList.remove('active');
        this.modal.style.display = 'none';
        if (this.resolve) this.resolve(true);
    }
    
    _cancel() {
        this.modal.classList.remove('active');
        this.modal.style.display = 'none';
        if (this.resolve) this.resolve(false);
    }
    
    /**
     * Показать модальное окно (аналог alert)
     */
    alert(message, title = 'Внимание') {
        return new Promise((resolve) => {
            this.title.textContent = title;
            this.body.textContent = message;
            this.confirmBtn.textContent = 'Ок';
            this.confirmBtn.className = 'btn custom-modal-btn custom-modal-confirm';
            this.cancelBtn.style.display = 'none';
            this.resolve = resolve;
            this.reject = null;
            this._open();
            
            // Один обработчик для кнопки Ок
            this.confirmBtn.onclick = () => {
                this.modal.classList.remove('active');
                this.modal.style.display = 'none';
                resolve(true);
            };
        });
    }
    
    /**
     * Показать модальное окно с подтверждением (аналог confirm)
     */
    confirm(message, title = 'Подтверждение') {
        return new Promise((resolve) => {
            this.title.textContent = title;
            this.body.textContent = message;
            this.confirmBtn.textContent = 'Да';
            this.confirmBtn.className = 'btn custom-modal-btn custom-modal-confirm danger';
            this.cancelBtn.style.display = 'inline-flex';
            this.resolve = resolve;
            this.reject = null;
            this._open();
            
            // Перепривязываем обработчики
            this.confirmBtn.onclick = () => {
                this.modal.classList.remove('active');
                this.modal.style.display = 'none';
                resolve(true);
            };
            this.cancelBtn.onclick = () => {
                this.modal.classList.remove('active');
                this.modal.style.display = 'none';
                resolve(false);
            };
        });
    }
}

// Создаём глобальный экземпляр
window.modal = new CustomModal();