/**
 * ========================================
 * 🎬 CINEMATIC LOVE STORY - منه
 * ========================================
 */

(function() {
    'use strict';

    // ========== CONFIG ==========
    const TOTAL = 8;
    const START_DATE = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

    // ========== STATE ==========
    let current = 0;
    let transitioning = false;
    let paused = false;
    let musicPlaying = false;
    let touchY = 0;
    let slide = 0;
    let galleryTimer = null;
    let typingTimer = null;
    let charIdx = 0;

    // ========== MESSAGE ==========
    const msg = `يا منه...

من أول يوم شفتك فيه، عرفت إنك مختلفة.

ابتسامتك نورت حياتي، وعيونك بقت بيتي.

كل يوم معاكِ بحس إني أغنى واحد في الدنيا.
مش عشان عندي حاجات... عشان عندي إنتِ.

السنة اللي فاتت دي كانت أحلى سنة في حياتي...
وكل سنة جاية هتبقى أحلى معاكِ.

يا منه... أنتِ مش بس خطيبتي.
أنتِ صاحبتي، وحبيبتي، ونص روحي.

بحبك يا منه... للأبد 💕`;

    // ========== WORDS ==========
    const words = [
        { t: "يا منه", h: ["منه"] },
        { t: "أنتِ الدنيا كلها", h: ["الدنيا"] },
        { t: "قلبي مالوش غيرك", h: ["قلبي", "غيرك"] },
        { t: "سنة أولى حب", h: ["سنة", "حب"] },
        { t: "وهفضل أحبك للأبد", h: ["أحبك", "للأبد"] }
    ];

    // ========== HELPERS ==========
    const $ = s => document.querySelector(s);
    const $$ = s => document.querySelectorAll(s);

    // ========== INIT ==========
    function init() {
        $('#startBtn').onclick = startExperience;
        bindEvents();
    }

    // ========== START EXPERIENCE ==========
    function startExperience() {
        $('#startScreen').classList.add('hidden');
        $('#loadingScreen').classList.add('show');
        
        // Play music on click
        playAudio();
        
        setTimeout(() => {
            $('#loadingScreen').classList.remove('show');
            $('#loadingScreen').classList.add('hide');
            activate(0);
            startCounter();
            makeHearts();
        }, 2500);
    }

    // ========== AUDIO ==========
    function playAudio() {
        const a = $('#bgMusic');
        a.volume = 0.8;
        a.play().then(() => {
            musicPlaying = true;
            $('#musicIndicator').classList.remove('paused');
            $('#muteBtn').textContent = '🔊';
            $('#vinyl').classList.add('spin');
            $('#visualizer').classList.add('active');
        }).catch(e => {
            console.log('Audio blocked:', e);
            $('#musicIndicator').classList.add('paused');
        });
    }

    // ========== EVENTS ==========
    function bindEvents() {
        // Wheel
        window.addEventListener('wheel', e => {
            e.preventDefault();
            if (transitioning || paused) return;
            e.deltaY > 40 ? next() : e.deltaY < -40 ? prev() : null;
        }, { passive: false });

        // Touch
        window.addEventListener('touchstart', e => touchY = e.touches[0].clientY, { passive: true });
        window.addEventListener('touchend', e => {
            if (transitioning || paused) return;
            const d = touchY - e.changedTouches[0].clientY;
            if (Math.abs(d) > 50) d > 0 ? next() : prev();
        }, { passive: true });

        // Keyboard
        window.addEventListener('keydown', e => {
            if (['ArrowDown', 'ArrowRight', ' '].includes(e.key)) { e.preventDefault(); next(); }
            if (['ArrowUp', 'ArrowLeft'].includes(e.key)) { e.preventDefault(); prev(); }
            if (e.key === 'm' || e.key === 'M') toggleMute();
            if (e.key === 'p' || e.key === 'P') togglePause();
            if (e.key >= '1' && e.key <= '8') goTo(+e.key - 1);
        });

        // Nav dots
        $$('.nav-dot').forEach((d, i) => d.onclick = () => goTo(i));
        
        // Gallery dots
        $$('.g-dot').forEach((d, i) => d.onclick = () => { slide = i; updateGallery(); });
        
        // Controls
        $('#pauseBtn').onclick = togglePause;
        $('#muteBtn').onclick = toggleMute;
        $('#musicIndicator').onclick = toggleMute;
        $('#restartBtn').onclick = restart;

        // Disable context menu
        document.addEventListener('contextmenu', e => e.preventDefault());
    }

    // ========== NAVIGATION ==========
    function next() { if (current < TOTAL - 1) goTo(current + 1); }
    function prev() { if (current > 0) goTo(current - 1); }

    function goTo(i) {
        if (transitioning || i === current || i < 0 || i >= TOTAL) return;
        transitioning = true;
        
        leave(current);
        current = i;
        update();
        
        setTimeout(() => enter(i), 400);
        setTimeout(() => transitioning = false, 1000);
    }

    function activate(i) {
        $$('.scene')[i].classList.add('active');
        updateProgress();
        updateDots();
        enter(i);
    }

    function update() {
        $$('.scene').forEach((s, j) => {
            s.classList.toggle('active', j === current);
        });
        updateProgress();
        updateDots();
    }

    function updateProgress() {
        const p = ((current + 1) / TOTAL) * 100;
        $('#progressFill').style.height = p + '%';
        $('#progressText').textContent = `${current + 1}/${TOTAL}`;
    }

    function updateDots() {
        $$('.nav-dot').forEach((d, j) => d.classList.toggle('active', j === current));
    }

    // ========== SCENE HANDLERS ==========
    function enter(i) {
        switch(i) {
            case 2: showWords(); break;
            case 3: showReasons(); break;
            case 4: startGallery(); break;
            case 6: setTimeout(startTyping, 2000); break;
            case 7: makeConfetti(); break;
        }
    }

    function leave(i) {
        if (i === 4) clearInterval(galleryTimer);
        if (i === 6) clearInterval(typingTimer);
    }

    // ========== COUNTER ==========
    function startCounter() {
        updateCounter();
        setInterval(updateCounter, 1000);
    }

    function updateCounter() {
        const diff = Date.now() - START_DATE.getTime();
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        
        $('#cDays').textContent = String(d).padStart(3, '0');
        $('#cHours').textContent = String(h).padStart(2, '0');
        $('#cMins').textContent = String(m).padStart(2, '0');
        $('#cSecs').textContent = String(s).padStart(2, '0');
    }

    // ========== WORDS ==========
    function showWords() {
        const box = $('#wordsBox');
        box.innerHTML = '';
        let delay = 0;
        
        words.forEach(w => {
            const line = document.createElement('div');
            line.className = 'word-line';
            
            w.t.split(' ').forEach(word => {
                const span = document.createElement('span');
                span.className = 'word' + (w.h.includes(word) ? ' hl' : '');
                span.textContent = word;
                line.appendChild(span);
                setTimeout(() => span.classList.add('show'), delay);
                delay += 400;
            });
            
            box.appendChild(line);
            delay += 300;
        });
    }

    // ========== REASONS ==========
    function showReasons() {
        $$('.reason-card').forEach((c, i) => {
            setTimeout(() => c.classList.add('show'), i * 200);
        });
    }

    // ========== GALLERY ==========
    function startGallery() {
        slide = 0;
        updateGallery();
        galleryTimer = setInterval(() => {
            if (!paused && current === 4) {
                slide = (slide + 1) % 4;
                updateGallery();
            }
        }, 3500);
    }

    function updateGallery() {
        $$('.gallery-slide').forEach((s, i) => s.classList.toggle('active', i === slide));
        $$('.g-dot').forEach((d, i) => d.classList.toggle('active', i === slide));
    }

    // ========== TYPING ==========
    function startTyping() {
        const el = $('#typingText');
        el.textContent = '';
        charIdx = 0;
        
        typingTimer = setInterval(() => {
            if (paused) return;
            if (charIdx < msg.length) {
                el.textContent += msg[charIdx];
                charIdx++;
                el.parentElement.scrollTop = el.parentElement.scrollHeight;
            } else {
                clearInterval(typingTimer);
            }
        }, 40);
    }

    // ========== HEARTS ==========
    function makeHearts() {
        const box = $('#heartsRain');
        const hearts = ['❤️', '💕', '💖', '💗', '💓', '💝', '🩷'];
        
        for (let i = 0; i < 30; i++) {
            const h = document.createElement('span');
            h.className = 'float-heart';
            h.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            h.style.left = Math.random() * 100 + '%';
            h.style.fontSize = (1 + Math.random() * 1.5) + 'rem';
            h.style.animationDelay = Math.random() * 7 + 's';
            h.style.animationDuration = (5 + Math.random() * 5) + 's';
            box.appendChild(h);
        }
    }

    // ========== CONFETTI ==========
    function makeConfetti() {
        const box = $('#confettiBox');
        box.innerHTML = '';
        const colors = ['#ff6b9d', '#a855f7', '#fbbf24', '#f43f5e', '#fff', '#c44569'];
        const shapes = ['■', '●', '▲', '♥', '★', '◆'];
        
        for (let i = 0; i < 70; i++) {
            const c = document.createElement('span');
            c.className = 'confetti';
            c.textContent = shapes[Math.floor(Math.random() * shapes.length)];
            c.style.left = Math.random() * 100 + '%';
            c.style.color = colors[Math.floor(Math.random() * colors.length)];
            c.style.fontSize = (8 + Math.random() * 12) + 'px';
            c.style.animationDuration = (3 + Math.random() * 4) + 's';
            c.style.animationDelay = Math.random() * 3 + 's';
            box.appendChild(c);
        }
    }

    // ========== CONTROLS ==========
    function togglePause() {
        paused = !paused;
        document.body.classList.toggle('paused', paused);
        $('#pauseBtn').textContent = paused ? '▶' : '⏸';
        
        const a = $('#bgMusic');
        if (paused) a.pause();
        else if (musicPlaying) a.play();
    }

    function toggleMute() {
        const a = $('#bgMusic');
        const ind = $('#musicIndicator');
        
        if (a.paused) {
            a.play().then(() => {
                musicPlaying = true;
                ind.classList.remove('paused');
                $('#muteBtn').textContent = '🔊';
            });
        } else {
            a.pause();
            musicPlaying = false;
            ind.classList.add('paused');
            $('#muteBtn').textContent = '🔇';
        }
    }

    function restart() {
        clearInterval(galleryTimer);
        clearInterval(typingTimer);
        current = 0;
        charIdx = 0;
        
        $$('.scene').forEach(s => s.classList.remove('active'));
        $$('.reason-card').forEach(c => c.classList.remove('show'));
        $$('.word').forEach(w => w.classList.remove('show'));
        
        setTimeout(() => activate(0), 100);
    }

    // ========== START ==========
    document.addEventListener('DOMContentLoaded', init);

})();