// ============================
// МУЗЫКА ДЛЯ CATMINEFY (СПЕЦИАЛЬНЫЕ ВОЗМОЖНОСТИ)
// ============================

document.addEventListener('DOMContentLoaded', function() {
    // === ЭЛЕМЕНТЫ ===
    const toggleBtn = document.getElementById('toggleMusic');
    const selectEl = document.getElementById('musicSelect');
    const volumeSlider = document.getElementById('musicVolume');
    const volumeLabel = document.getElementById('volumeLabel');
    
    // === СОСТОЯНИЕ ===
    let isMusicEnabled = true;
    let currentVolume = 0.3;
    let audioElement = null;
    let currentTrack = 'freedomly-lands';
    let currentTime = 0;
    let isLooping = false;
    
    // === ПЛЕЙЛИСТ ===
    const tracks = {
        'freedomly-lands': {
            name: 'Catminefy Theme',
            file: '../assets/audio/freedomly-lands.wav',
            duration: 24
        }
    };
    
    // === ЗАГРУЗКА СОХРАНЁННЫХ НАСТРОЕК ===
    function loadSettings() {
        const savedMusic = localStorage.getItem('catminefy-music');
        if (savedMusic !== null) {
            isMusicEnabled = savedMusic === 'true';
        }
        
        const savedTrack = localStorage.getItem('catminefy-track');
        if (savedTrack && tracks[savedTrack]) {
            currentTrack = savedTrack;
        }
        
        const savedVolume = localStorage.getItem('catminefy-volume');
        if (savedVolume !== null) {
            currentVolume = parseFloat(savedVolume);
        }
        
        const savedTime = localStorage.getItem('catminefy-time');
        if (savedTime !== null) {
            currentTime = parseFloat(savedTime);
        }
    }
    
    // === СОХРАНЕНИЕ НАСТРОЕК ===
    function saveSettings() {
        localStorage.setItem('catminefy-music', isMusicEnabled);
        localStorage.setItem('catminefy-track', currentTrack);
        localStorage.setItem('catminefy-volume', currentVolume);
        if (audioElement) {
            localStorage.setItem('catminefy-time', audioElement.currentTime);
        }
    }
    
    // === ЗАГРУЗКА И ВОСПРОИЗВЕДЕНИЕ ТРЕКА ===
    function loadTrack(trackKey, startTime) {
        if (trackKey === 'none') {
            if (audioElement) {
                audioElement.pause();
                audioElement = null;
            }
            updateUI();
            return;
        }
        
        const track = tracks[trackKey];
        if (!track) return;
        
        if (audioElement) {
            audioElement.pause();
            audioElement = null;
        }
        
        audioElement = new Audio(track.file);
        audioElement.volume = currentVolume;
        
        // Устанавливаем время, если передано
        if (startTime !== undefined && startTime > 0) {
            audioElement.currentTime = startTime;
        }
        
        // === БЕСШОВНЫЙ ЛУП ===
        audioElement.addEventListener('timeupdate', function() {
            // Сохраняем время каждую секунду
            localStorage.setItem('catminefy-time', this.currentTime);
            
            // Если осталось меньше 0.3 секунды до конца — перематываем на 0
            if (this.duration - this.currentTime < 0.3) {
                this.currentTime = 0;
            }
        });
        
        // На случай, если timeupdate не сработал на конце
        audioElement.addEventListener('ended', function() {
            this.currentTime = 0;
            this.play().catch(() => {});
        });
        
        if (isMusicEnabled) {
            audioElement.play().catch(() => {});
        }
        
        updateUI();
    }
    
    // === ПЕРЕКЛЮЧЕНИЕ МУЗЫКИ ===
    function toggleMusic() {
        isMusicEnabled = !isMusicEnabled;
        saveSettings();
        
        if (isMusicEnabled) {
            if (audioElement) {
                audioElement.play().catch(() => {});
            } else if (currentTrack !== 'none') {
                loadTrack(currentTrack, currentTime);
            }
        } else {
            if (audioElement) {
                audioElement.pause();
            }
        }
        
        updateUI();
        
        if (window.notifications) {
            window.notifications.info(
                'Музыка',
                isMusicEnabled ? 'Фоновая музыка включена' : 'Фоновая музыка выключена'
            );
        }
    }
    
    // === СМЕНА ТРЕКА ===
    function changeTrack(trackKey) {
        if (trackKey === 'none') {
            if (audioElement) {
                audioElement.pause();
                audioElement = null;
            }
            currentTrack = 'none';
            currentTime = 0;
            isMusicEnabled = false;
            saveSettings();
            updateUI();
            return;
        }
        
        if (!tracks[trackKey]) return;
        
        currentTrack = trackKey;
        currentTime = 0;
        if (!isMusicEnabled) {
            isMusicEnabled = true;
        }
        saveSettings();
        loadTrack(trackKey, 0);
        updateUI();
    }
    
    // === ИЗМЕНЕНИЕ ГРОМКОСТИ ===
    function setVolume(value) {
        currentVolume = Math.max(0, Math.min(1, value / 100));
        if (audioElement) {
            audioElement.volume = currentVolume;
        }
        saveSettings();
        updateUI();
    }
    
    // === ОБНОВЛЕНИЕ UI ===
    function updateUI() {
        if (toggleBtn) {
            toggleBtn.textContent = isMusicEnabled ? 'Включена ✔' : 'Выключена ✘';
        }
        
        if (selectEl) {
            selectEl.value = currentTrack;
        }
        
        if (volumeSlider) {
            volumeSlider.value = Math.round(currentVolume * 100);
        }
        if (volumeLabel) {
            volumeLabel.textContent = Math.round(currentVolume * 100) + '%';
        }
    }
    
    // === ИНИЦИАЛИЗАЦИЯ ===
    function init() {
        loadSettings();
        
        if (isMusicEnabled && currentTrack !== 'none') {
            loadTrack(currentTrack, currentTime);
        }
        
        updateUI();
        
        console.log('Музыка загружена:', {
            enabled: isMusicEnabled,
            track: currentTrack,
            time: currentTime,
            volume: currentVolume
        });
    }
    
    // === ОБРАБОТЧИКИ ===
    
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleMusic);
    }
    
    if (selectEl) {
        selectEl.addEventListener('change', function() {
            changeTrack(this.value);
        });
    }
    
    if (volumeSlider) {
        volumeSlider.addEventListener('input', function() {
            const val = parseInt(this.value);
            if (volumeLabel) {
                volumeLabel.textContent = val + '%';
            }
            setVolume(val);
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'm') {
            e.preventDefault();
            toggleMusic();
        }
    });
    
    window.addEventListener('beforeunload', function() {
        if (audioElement) {
            localStorage.setItem('catminefy-time', audioElement.currentTime);
        }
    });
    
    // === ЗАПУСК ===
    init();
});