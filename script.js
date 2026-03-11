/* ============================================================
   زياد خالد محمد سعد — Portfolio Scripts
   ============================================================ */

(function () {
    'use strict';

    /* ===== HELPERS ===== */
    const isTouchDevice = () => window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    /* ===== STARS CANVAS ===== */
    (function initStars() {
        const canvas = document.getElementById('stars-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let stars = [];
        let animFrame = null;
        let isHidden = false;

        const STAR_COUNT_DESKTOP = 160;
        const STAR_COUNT_MOBILE = 80;

        function getStarCount() {
            return window.innerWidth < 768 ? STAR_COUNT_MOBILE : STAR_COUNT_DESKTOP;
        }

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function createStars() {
            const count = getStarCount();
            stars = [];
            for (let i = 0; i < count; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    r: Math.random() * 1.5 + 0.3,
                    alpha: Math.random(),
                    speed: Math.random() * 0.015 + 0.005,
                    twinkleOffset: Math.random() * Math.PI * 2
                });
            }
        }

        function drawStars(t) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            stars.forEach(s => {
                s.alpha = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * s.speed * 60 + s.twinkleOffset));
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(240, 220, 160, ${s.alpha})`;
                ctx.fill();
            });
        }

        function animate(ts) {
            if (!isHidden) drawStars(ts / 1000);
            animFrame = requestAnimationFrame(animate);
        }

        resizeCanvas();
        createStars();
        animFrame = requestAnimationFrame(animate);

        window.addEventListener('resize', () => {
            resizeCanvas();
            createStars();
        });

        // Page Visibility API — pause when tab is hidden
        document.addEventListener('visibilitychange', () => {
            isHidden = document.hidden;
        });
    })();

    /* ===== LAYALI AL-SAHRAA PROJECT CANVAS ===== */
    (function initLayaliCanvas() {
        const c = document.getElementById('layaliCanvas');
        if (!c) return;
        const cx = c.getContext('2d');
        let isHidden = false;

        function resize() {
            const w = c.parentElement;
            c.width = w.clientWidth;
            c.height = w.clientHeight;
        }

        resize();
        window.addEventListener('resize', resize);
        document.addEventListener('visibilitychange', () => { isHidden = document.hidden; });

        const pts = [];
        for (let i = 0; i < 55; i++) {
            pts.push({
                x: Math.random(), y: Math.random() * 0.65,
                r: Math.random() * 1 + 0.2,
                o: Math.random() * Math.PI * 2,
                s: Math.random() * 0.012 + 0.004
            });
        }

        function draw(t) {
            if (isHidden) { requestAnimationFrame(ts => draw(ts / 1000)); return; }
            const w = c.width, h = c.height;
            const g = cx.createLinearGradient(0, 0, 0, h);
            g.addColorStop(0, '#020808');
            g.addColorStop(0.7, '#091414');
            g.addColorStop(1, '#162010');
            cx.fillStyle = g;
            cx.fillRect(0, 0, w, h);

            pts.forEach(s => {
                const a = 0.15 + 0.85 * (0.5 + 0.5 * Math.sin(t * s.s * 60 + s.o));
                cx.beginPath();
                cx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
                cx.fillStyle = `rgba(240,220,150,${a})`;
                cx.fill();
            });

            cx.save();
            cx.beginPath();
            cx.arc(w * 0.78, h * 0.22, 16, 0, Math.PI * 2);
            cx.fillStyle = 'rgba(240,220,130,0.88)';
            cx.shadowColor = 'rgba(240,220,130,0.5)';
            cx.shadowBlur = 20;
            cx.fill();
            cx.restore();

            [['#100c04', 0.72], ['#0a0802', 0.80], ['#181208', 0.68]].forEach(([col, y], i) => {
                cx.fillStyle = col;
                cx.beginPath();
                cx.moveTo(0, h);
                cx.bezierCurveTo(w * 0.25, h * (y - 0.1 + i * 0.02), w * 0.6, h * (y + 0.05), w, h * (y - 0.05 + i * 0.01));
                cx.lineTo(w, h);
                cx.closePath();
                cx.fill();
            });

            cx.save();
            cx.textAlign = 'center';
            cx.font = `bold ${Math.max(16, w * 0.075)}px 'Amiri', serif`;
            cx.fillStyle = 'rgba(240,192,96,0.92)';
            cx.shadowColor = 'rgba(240,192,96,0.5)';
            cx.shadowBlur = 18;
            cx.fillText('ليالي الصحراء', w / 2, h * 0.48);
            cx.font = `${Math.max(10, w * 0.032)}px 'Tajawal', sans-serif`;
            cx.fillStyle = 'rgba(160,140,90,0.75)';
            cx.shadowBlur = 0;
            cx.fillText('لعبة RPG · ذكاء اصطناعي', w / 2, h * 0.63);
            cx.restore();

            requestAnimationFrame(ts => draw(ts / 1000));
        }

        requestAnimationFrame(ts => draw(ts / 1000));
    })();

    /* ===== CUSTOM CURSOR (desktop only) ===== */
    (function initCursor() {
        if (isTouchDevice()) return;

        const glow = document.getElementById('cursorGlow');
        const ring = document.getElementById('cursorRing');
        if (!glow || !ring) return;

        let mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;
        let trailCount = 0;
        const TRAIL_LIMIT = 1; // create trail dot every N mousemove events

        document.addEventListener('mousemove', e => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            ring.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;

            trailCount++;
            if (trailCount >= TRAIL_LIMIT) {
                createTrail(mouseX, mouseY);
                trailCount = 0;
            }
        });

        function animateGlow() {
            glowX += (mouseX - glowX) / 6;
            glowY += (mouseY - glowY) / 6;
            glow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%, -50%)`;
            requestAnimationFrame(animateGlow);
        }
        animateGlow();

        function createTrail(x, y) {
            const d = document.createElement('div');
            d.className = 'trail-dot';
            d.style.left = x + 'px';
            d.style.top = y + 'px';
            document.body.appendChild(d);
            setTimeout(() => d.remove(), 400);
        }

        document.addEventListener('mousedown', e => {
            const r = document.createElement('div');
            r.className = 'ripple';
            r.style.left = e.clientX + 'px';
            r.style.top = e.clientY + 'px';
            document.body.appendChild(r);
            setTimeout(() => r.remove(), 500);
        });

        const interactiveEls = 'a, button, .btn, input, textarea, .filter-btn, .nav-link, .social-link, .project-card, .skill-card';
        document.querySelectorAll(interactiveEls).forEach(el => {
            el.addEventListener('mouseenter', () => { ring.classList.add('active'); glow.classList.add('active'); });
            el.addEventListener('mouseleave', () => { ring.classList.remove('active'); glow.classList.remove('active'); });
        });
    })();

    /* ===== NAVBAR ===== */
    (function initNavbar() {
        const navbar = document.getElementById('navbar');
        const menuToggle = document.getElementById('menuToggle');
        const navMenu = document.getElementById('navMenu');

        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        });

        menuToggle.addEventListener('click', () => {
            const isActive = menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                const target = document.querySelector(link.getAttribute('href'));
                if (target) window.scrollTo({ top: target.offsetTop - 66, behavior: 'smooth' });
            });
        });

        // Highlight active section on scroll
        const sections = document.querySelectorAll('section[id]');
        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(s => {
                if (window.scrollY >= s.offsetTop - 130) current = s.id;
            });
            document.querySelectorAll('.nav-link').forEach(l => {
                l.classList.toggle('active', l.getAttribute('href') === '#' + current);
            });
            const si = document.getElementById('scrollIndicator');
            if (si) si.style.opacity = window.scrollY > 100 ? '0' : '1';
        });
    })();

    /* ===== TYPEWRITER HERO SUBTITLE ===== */
    (function initTypewriter() {
        const el = document.getElementById('heroSubtitle');
        if (!el) return;
        const roles = [
            'مطور ويب | Web Developer',
            'مبرمج واجهات أمامية | Frontend Dev',
            'أبحث عن فرصة تدريب'
        ];
        let roleIdx = 0;
        let charIdx = 0;
        let deleting = false;
        let pauseFrames = 0;

        const cursor = document.createElement('span');
        cursor.className = 'typing-cursor';
        cursor.setAttribute('aria-hidden', 'true');
        el.appendChild(cursor);

        const textNode = document.createTextNode('');
        el.insertBefore(textNode, cursor);

        function tick() {
            const currentRole = roles[roleIdx];
            if (pauseFrames > 0) { pauseFrames--; setTimeout(tick, 80); return; }

            if (!deleting) {
                textNode.nodeValue = currentRole.slice(0, ++charIdx);
                if (charIdx === currentRole.length) { deleting = true; pauseFrames = 30; }
            } else {
                textNode.nodeValue = currentRole.slice(0, --charIdx);
                if (charIdx === 0) {
                    deleting = false;
                    roleIdx = (roleIdx + 1) % roles.length;
                    pauseFrames = 8;
                }
            }
            setTimeout(tick, deleting ? 50 : 90);
        }
        setTimeout(tick, 1200);
    })();

    /* ===== SCROLL REVEAL ===== */
    (function initReveal() {
        const revealObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
    })();

    /* ===== SKILL BARS ===== */
    (function initSkillBars() {
        const skillObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    setTimeout(() => { bar.style.width = bar.getAttribute('data-level') + '%'; }, 200);
                    skillObserver.unobserve(bar);
                }
            });
        }, { threshold: 0.3 });

        document.querySelectorAll('.skill-bar').forEach(b => skillObserver.observe(b));
    })();

    /* ===== STATS COUNTER ===== */
    (function initStats() {
        const statsObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.getAttribute('data-target'));
                    let current = 0;
                    const inc = target / 50;
                    const timer = setInterval(() => {
                        current += inc;
                        if (current >= target) {
                            el.textContent = target + '+';
                            clearInterval(timer);
                        } else {
                            el.textContent = Math.floor(current) + '+';
                        }
                    }, 30);
                    statsObserver.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('.stat-number[data-target]').forEach(s => statsObserver.observe(s));
    })();

    /* ===== PROJECTS FILTER ===== */
    (function initProjectsFilter() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.getAttribute('data-filter');
                document.querySelectorAll('.project-card').forEach(card => {
                    const show = filter === 'all' || card.getAttribute('data-category') === filter;
                    card.style.transition = 'all 0.3s ease';
                    if (show) {
                        card.style.display = '';
                        setTimeout(() => { card.style.opacity = '1'; card.style.transform = ''; }, 10);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.9)';
                        setTimeout(() => { card.style.display = 'none'; }, 300);
                    }
                });
            });
        });
    })();

    /* ===== CONTACT FORM ===== */
    (function initContactForm() {
        const form = document.getElementById('contactForm');
        const messageEl = document.getElementById('formMessage');
        if (!form) return;

        function validateField(input) {
            const valid = input.value.trim() !== '';
            input.classList.toggle('error', !valid);
            input.classList.toggle('success', valid);
            return valid;
        }

        form.addEventListener('submit', e => {
            e.preventDefault();
            const nameEl = document.getElementById('name');
            const emailEl = document.getElementById('email');
            const subjectEl = document.getElementById('subject');
            const msgEl = document.getElementById('message');

            const allValid = [nameEl, emailEl, subjectEl, msgEl].map(validateField).every(Boolean);
            if (!allValid) {
                if (messageEl) {
                    messageEl.textContent = 'يرجى ملء جميع الحقول المطلوبة';
                    messageEl.className = 'form-message error';
                }
                return;
            }

            // Build mailto link
            const subject = encodeURIComponent(subjectEl.value);
            const body = encodeURIComponent(
                `الاسم: ${nameEl.value}\nالبريد: ${emailEl.value}\n\n${msgEl.value}`
            );
            window.location.href = `mailto:zyadxtmore@gmail.com?subject=${subject}&body=${body}`;

            if (messageEl) {
                messageEl.textContent = 'جاري فتح برنامج البريد الإلكتروني...';
                messageEl.className = 'form-message success';
            }
            setTimeout(() => { form.reset(); [nameEl, emailEl, subjectEl, msgEl].forEach(el => { el.classList.remove('error', 'success'); }); if (messageEl) messageEl.className = 'form-message'; }, 3000);
        });

        // Live validation on blur
        form.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('blur', () => { if (input.value.trim() !== '') validateField(input); });
        });
    })();

    /* ===== DYNAMIC YEAR ===== */
    (function initYear() {
        const el = document.getElementById('footerYear');
        if (el) el.textContent = new Date().getFullYear();
    })();

    /* ===== BACK TO TOP ===== */
    (function initBackToTop() {
        const btn = document.getElementById('back-to-top');
        if (!btn) return;
        window.addEventListener('scroll', () => {
            btn.classList.toggle('visible', window.scrollY > 400);
        });
        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    })();

    /* ===== CONSOLE GREETING ===== */
    console.log('%c مرحباً! 👋 أنا زياد خالد — مطور ويب', 'color: #f0c060; font-size: 18px; font-weight: bold;');
    console.log('%c ✨ Built with HTML, CSS & JavaScript', 'color: #c8954a; font-size: 13px;');
    console.log('%c 📧 zyadxtmore@gmail.com', 'color: #3a8e8e; font-size: 12px;');

})();
