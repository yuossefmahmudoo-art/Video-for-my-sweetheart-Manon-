/**
 * ========================================
 * 🎬 CINEMATIC LOVE STORY - منه
 * ======================================== 
 */

(function() {
    'use strict';

    // ==================== CONFIGURATION ====================
    const CONFIG = {
        totalScenes: 8,
        transitionDuration: 1200,
        scrollCooldown: 1000,
        slideshowInterval: 4000,
        typingSpeed: 40,
        // تاريخ بداية العلاقة - سنة كاملة من النهارده
        loveStartDate: new Date(Date.now() - (365 * 24 * 60 * 60 * 1000)),
    };

    // ==================== STATE ====================
    const state = {
        currentScene: 0,
        isTransitioning: false,
        isPaused: false,
        isMusicPlaying: false,
        touchStartY: 0,
        currentSlide: 0,
        slideTimer: null,
        typingTimer: null,
        counterTimer: null,
        charIndex: 0,
    };

    // ==================== LOVE MESSAGE ====================
    const loveMessage = `يا منه...

من أول يوم شفتك فيه، عرفت إنك مختلفة عن كل البنات.

ابتسامتك نورت حياتي، وعيونك بقت بيتي الجديد.

كل يوم بيعدي عليّا وأنا معاكِ، بحس إني أغنى واحد في الدنيا.

مش عشان عندي فلوس أو حاجات... لأ، عشان عندي إنتِ.

أنتِ اللي بتحسسيني إني قادر أعمل أي حاجة.
أنتِ اللي بتسنديني لما الدنيا بتقسى عليا.
أنتِ اللي بتفهميني من غير ما أتكلم.

يا منه... أنتِ مش بس خطيبتي.
أنتِ صاحبتي، وحبيبتي، ونص روحي.

السنة اللي فاتت دي كانت أحلى سنة في حياتي...
وكل سنة جاية هتبقى أحلى وأحلى معاكِ.

وعد مني ليكِ:
هفضل جنبك في كل خطوة.
هفضل أحبك أكتر كل يوم.
هفضل أختارك من تاني ومن تالت.

بحبك يا منه... للأبد 💕`;

    // ==================== WORD BY WORD DATA ====================
    const sentences = [
        { text: "يا منه", highlights: ["منه"] },
        { text: "أنتِ الدنيا كلها", highlights: ["الدنيا"] },
        { text: "قلبي مالوش غيرك", highlights: ["قلبي", "غيرك"] },
        { text: "سنة أولى حب", highlights: ["سنة", "حب"] },
        { text: "وهفضل أحبك للأبد", highlights: ["أحبك", "للأبد"] }
    ];

    // ==================== DOM HELPERS ====================
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    // ==================== INITIALIZATION ====================
    function init() {
        createParticles();
        createFloatingHearts();
        
        // Hide loading and start music
        setTimeout(() => {
            $('#loadingScreen').classList.add('hide');
            activateScene(0);
            startLoveCounter();
            
            // Auto play music after loading
            setTimeout(autoPlayMusic, 500);
        }, 3000);

        bindEvents();
    }

    // ==================== AUTO PLAY MUSIC ====================
    function autoPlayMusic() {
        const audio = $('#bgMusic');
        const indicator = $('#musicIndicator');
        
        if (!audio) return;
        
        // Try to play
        audio.volume = 0.7;
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                // Autoplay worked!
                state.isMusicPlaying = true;
                indicator?.classList.remove('paused');
                updateMuteBtn(true);
                console.log('🎵 Music playing!');
            }).catch(err => {
                // Autoplay blocked - need user interaction
                console.log('Autoplay blocked, waiting for user interaction');
                state.isMusicPlaying = false;
                indicator?.classList.add('paused');
                
                // Play on first click/touch
                const startMusicOnInteraction = () => {
                    audio.play().then(() => {
                        state.isMusicPlaying = true;
                        indicator?.classList.remove('paused');
                        updateMuteBtn(true);
                    });
                    document.removeEventListener('click', startMusicOnInteraction);
                    document.removeEventListener('touchstart', startMusicOnInteraction);
                };
                
                document.addEventListener('click', startMusicOnInteraction, { once: true });
                document.addEventListener('touchstart', startMusicOnInteraction, { once: true });
            });
        }
    }

    // ==================== EVENT BINDING ====================
    function bindEvents() {
        // Scroll/Wheel
        window.addEventListener('wheel', handleWheel, { passive: false });
        
        // Touch
        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchend', handleTouchEnd, { passive: true });
        
        // Keyboard
        window.addEventListener('keydown', handleKeyboard);
        
        // Navigation dots
        $$('.nav-dot').forEach((dot, i) => {
            dot.addEventListener('click', () => goToScene(i));
        });
        
        // Controls
        $('#playPauseBtn')?.addEventListener('click', togglePause);
        $('#muteBtn')?.addEventListener('click', toggleMute);
        $('#fullscreenBtn')?.addEventListener('click', toggleFullscreen);
        
        // Music indicator click to toggle
        $('#musicIndicator')?.addEventListener('click', toggleMute);
        
        // Gallery
        $('#galleryPrev')?.addEventListener('click', prevSlide);
        $('#galleryNext')?.addEventListener('click', nextSlide);
        
        // Final buttons
        $('#restartBtn')?.addEventListener('click', restart);
        $('#shareBtn')?.addEventListener('click', shareExperience);
        
        // Disable context menu
        document.addEventListener('contextmenu', e => e.preventDefault());
    }

    // ==================== NAVIGATION ====================
    function handleWheel(e) {
        e.preventDefault();
        if (state.isTransitioning || state.isPaused) return;
        
        if (e.deltaY > 50) nextScene();
        else if (e.deltaY < -50) prevScene();
    }

    function handleTouchStart(e) {
        state.touchStartY = e.touches[0].clientY;
    }

    function handleTouchEnd(e) {
        if (state.isTransitioning || state.isPaused) return;
        
        const diff = state.touchStartY - e.changedTouches[0].clientY;
        
        if (Math.abs(diff) > 60) {
            if (diff > 0) nextScene();
            else prevScene();
        }
    }

    function handleKeyboard(e) {
        switch(e.key) {
            case 'ArrowDown':
            case 'ArrowRight':
            case ' ':
                e.preventDefault();
                nextScene();
                break;
            case 'ArrowUp':
            case 'ArrowLeft':
                e.preventDefault();
                prevScene();
                break;
            case 'p':
            case 'P':
                togglePause();
                break;
            case 'm':
            case 'M':
                toggleMute();
                break;
            case 'f':
            case 'F':
                toggleFullscreen();
                break;
        }
        
        if (e.key >= '1' && e.key <= '8') {
            goToScene(parseInt(e.key) - 1);
        }
    }

    function nextScene() {
        if (state.currentScene < CONFIG.totalScenes - 1) {
            goToScene(state.currentScene + 1);
        }
    }

    function prevScene() {
        if (state.currentScene > 0) {
            goToScene(state.currentScene - 1);
        }
    }

    function goToScene(index) {
        if (state.isTransitioning || index === state.currentScene) return;
        if (index < 0 || index >= CONFIG.totalScenes) return;
        
        state.isTransitioning = true;
        const prevIndex = state.currentScene;
        state.currentScene = index;
        
        leaveScene(prevIndex);
        updateScenes(prevIndex, index);
        updateProgress(index);
        updateNavDots(index);
        
        setTimeout(() => {
            enterScene(index);
        }, 400);
        
        setTimeout(() => {
            state.isTransitioning = false;
        }, CONFIG.scrollCooldown);
    }

    function activateScene(index) {
        $$('.scene')[index]?.classList.add('active');
        updateProgress(index);
        updateNavDots(index);
        enterScene(index);
    }

    function updateScenes(prevIndex, newIndex) {
        const scenes = $$('.scene');
        scenes.forEach((scene, i) => {
            scene.classList.remove('active', 'zoom-in', 'zoom-out');
            if (i === newIndex) {
                scene.classList.add('active', 'zoom-in');
            } else if (i === prevIndex) {
                scene.classList.add('zoom-out');
            }
        });
    }

    function updateProgress(index) {
        const progress = ((index + 1) / CONFIG.totalScenes) * 100;
        const fill = $('#progressFill');
        const glow = $('#progressGlow');
        const text = $('#progressText');
        
        if (fill) fill.style.height = `${progress}%`;
        if (glow) glow.style.height = `${progress}%`;
        if (text) text.textContent = `${index + 1}/${CONFIG.totalScenes}`;
    }

    function updateNavDots(index) {
        $$('.nav-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    // ==================== SCENE HANDLERS ====================
    function enterScene(index) {
        switch(index) {
            case 2:
                startWordByWord();
                break;
            case 3:
                showReasons();
                break;
            case 4:
                startGallery();
                break;
            case 6:
                setTimeout(startTyping, 2500);
                break;
            case 7:
                startFinale();
                break;
        }
    }

    function leaveScene(index) {
        switch(index) {
            case 4:
                stopGallery();
                break;
            case 6:
                stopTyping();
                break;
        }
    }

    // ==================== LOVE COUNTER ====================
    function startLoveCounter() {
        updateCounter();
        state.counterTimer = setInterval(updateCounter, 1000);
    }

    function updateCounter() {
        const now = new Date();
        const diff = now - CONFIG.loveStartDate;
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        const daysEl = $('#counterDays');
        const hoursEl = $('#counterHours');
        const minutesEl = $('#counterMinutes');
        const secondsEl = $('#counterSeconds');
        
        if (daysEl) daysEl.textContent = String(days).padStart(3, '0');
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
        if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    // ==================== WORD BY WORD ====================
    function startWordByWord() {
        const container = $('#wordsContainer');
        if (!container) return;
        
        container.innerHTML = '';
        let delay = 0;
        
        sentences.forEach(sentence => {
            const lineDiv = document.createElement('div');
            lineDiv.className = 'word-line';
            
            sentence.text.split(' ').forEach(word => {
                const span = document.createElement('span');
                span.className = 'word';
                span.textContent = word;
                
                if (sentence.highlights.includes(word)) {
                    span.classList.add('highlight');
                }
                
                lineDiv.appendChild(span);
                
                setTimeout(() => {
                    if (!state.isPaused) span.classList.add('show');
                }, delay);
                
                delay += 450;
            });
            
            container.appendChild(lineDiv);
            delay += 350;
        });
    }

    // ==================== REASONS ====================
    function showReasons() {
        $$('.reason-card').forEach((card, i) => {
            setTimeout(() => {
                if (!state.isPaused) card.classList.add('show');
            }, i * 300);
        });
    }

    // ==================== GALLERY ====================
    function startGallery() {
        state.currentSlide = 0;
        updateGallery();
        
        state.slideTimer = setInterval(() => {
            if (!state.isPaused && state.currentScene === 4) {
                state.currentSlide = (state.currentSlide + 1) % 4;
                updateGallery();
            }
        }, CONFIG.slideshowInterval);
    }

    function stopGallery() {
        if (state.slideTimer) {
            clearInterval(state.slideTimer);
            state.slideTimer = null;
        }
    }

    function nextSlide() {
        state.currentSlide = (state.currentSlide + 1) % 4;
        updateGallery();
    }

    function prevSlide() {
        state.currentSlide = (state.currentSlide - 1 + 4) % 4;
        updateGallery();
    }

    function updateGallery() {
        const cards = $$('.gallery-card');
        const dots = $$('.g-dot');
        const total = cards.length;
        
        cards.forEach((card, i) => {
            card.classList.remove('active', 'prev', 'next');
            
            if (i === state.currentSlide) {
                card.classList.add('active');
            } else if (i === (state.currentSlide - 1 + total) % total) {
                card.classList.add('prev');
            } else if (i === (state.currentSlide + 1) % total) {
                card.classList.add('next');
            }
        });
        
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === state.currentSlide);
        });
    }

    // ==================== TYPING ====================
    function startTyping() {
        const typingEl = $('#typingText');
        if (!typingEl) return;
        
        typingEl.textContent = '';
        state.charIndex = 0;
        
        state.typingTimer = setInterval(() => {
            if (state.isPaused) return;
            
            if (state.charIndex < loveMessage.length) {
                typingEl.textContent += loveMessage.charAt(state.charIndex);
                state.charIndex++;
                
                const content = typingEl.parentElement;
                if (content) content.scrollTop = content.scrollHeight;
            } else {
                stopTyping();
            }
        }, CONFIG.typingSpeed);
    }

    function stopTyping() {
        if (state.typingTimer) {
            clearInterval(state.typingTimer);
            state.typingTimer = null;
        }
    }

    // ==================== FINALE ====================
    function startFinale() {
        createConfetti();
    }

    function createConfetti() {
        const container = $('#confettiContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        const colors = ['#ff6b9d', '#a855f7', '#fbbf24', '#f43f5e', '#fff'];
        const shapes = ['■', '●', '▲', '♥', '★'];
        
        for (let i = 0; i < 80; i++) {
            const confetti = document.createElement('span');
            confetti.className = 'confetti';
            confetti.textContent = shapes[Math.floor(Math.random() * shapes.length)];
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.color = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.fontSize = (8 + Math.random() * 12) + 'px';
            confetti.style.animationDuration = (3 + Math.random() * 3) + 's';
            confetti.style.animationDelay = Math.random() * 3 + 's';
            container.appendChild(confetti);
        }
    }

    // ==================== PARTICLES ====================
    function createParticles() {
        const container = $('#particles1');
        if (!container) return;
        
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('span');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 8 + 's';
            particle.style.animationDuration = (6 + Math.random() * 6) + 's';
            container.appendChild(particle);
        }
    }

    // ==================== FLOATING HEARTS ====================
    function createFloatingHearts() {
        const container = $('#heartsRain');
        if (!container) return;
        
        const hearts = ['❤️', '💕', '💖', '💗', '💓', '💝', '🩷', '💘'];
        
        for (let i = 0; i < 30; i++) {
            const heart = document.createElement('span');
            heart.className = 'floating-heart';
            heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            heart.style.left = Math.random() * 100 + '%';
            heart.style.fontSize = (1 + Math.random() * 1.5) + 'rem';
            heart.style.animationDelay = Math.random() * 8 + 's';
            heart.style.animationDuration = (6 + Math.random() * 6) + 's';
            container.appendChild(heart);
        }
    }

    // ==================== CONTROLS ====================
    function togglePause() {
        state.isPaused = !state.isPaused;
        document.body.classList.toggle('paused', state.isPaused);
        
        const btn = $('#playPauseBtn');
        if (btn) {
            btn.querySelector('.btn-icon').textContent = state.isPaused ? '▶' : '⏸';
        }
        
        // Pause/resume music too
        const audio = $('#bgMusic');
        if (audio) {
            if (state.isPaused) {
                audio.pause();
            } else if (state.isMusicPlaying) {
                audio.play();
            }
        }
    }

    function toggleMute() {
        const audio = $('#bgMusic');
        const indicator = $('#musicIndicator');
        
        if (!audio) return;
        
        if (audio.paused) {
            audio.play().then(() => {
                state.isMusicPlaying = true;
                indicator?.classList.remove('paused');
                updateMuteBtn(true);
            });
        } else {
            audio.pause();
            state.isMusicPlaying = false;
            indicator?.classList.add('paused');
            updateMuteBtn(false);
        }
    }

    function updateMuteBtn(isPlaying) {
        const btn = $('#muteBtn');
        if (btn) {
            btn.querySelector('.btn-icon').textContent = isPlaying ? '🔊' : '🔇';
        }
    }

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    }

    function restart() {
        stopGallery();
        stopTyping();
        
        state.currentScene = 0;
        state.charIndex = 0;
        
        $$('.scene').forEach(scene => {
            scene.classList.remove('active', 'zoom-in', 'zoom-out');
        });
        
        $$('.reason-card').forEach(card => card.classList.remove('show'));
        $$('.word').forEach(word => word.classList.remove('show'));
        
        setTimeout(() => {
            activateScene(0);
        }, 100);
    }

    function shareExperience() {
        if (navigator.share) {
            navigator.share({
                title: 'قصة حبنا - منه',
                text: 'شوفي الفيديو ده يا حبيبتي 💕',
                url: window.location.href
            }).catch(console.log);
        } else {
            navigator.clipboard?.writeText(window.location.href);
            alert('تم نسخ الرابط! 💕');
        }
    }

    // ==================== START ====================
    document.addEventListener('DOMContentLoaded', init);

})();