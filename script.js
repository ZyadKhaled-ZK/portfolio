(function() {
    'use strict';

    const GITHUB_USERNAME = 'ZyadKhaled-ZK';
    const GITHUB_API = 'https://api.github.com';

    const API = {
        github: {
            profile: `${GITHUB_API}/users/${GITHUB_USERNAME}`,
            repos: `${GITHUB_API}/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=30`,
            events: `${GITHUB_API}/users/${GITHUB_USERNAME}/events/public?per_page=10`
        },
        weather: 'https://api.openweathermap.org/data/2.5/weather?q=Banha,EG&units=metric&lang=ar',
        weatherKey: 'demo',
        quotes: 'https://api.quotable.io/random?tags=technology,future'
    };

    const state = {
        githubData: null,
        weatherData: null,
        lastUpdate: null,
        typingIndex: 0,
        roles: [
            '.NET Backend Developer',
            'Full-Stack Developer',
            'ASP.NET Core Specialist',
            'Software Engineer',
            'Problem Solver'
        ]
    };

    function init() {
        initTypingEffect();
        initNavbar();
        initMenuToggle();
        initScrollReveal();
        initSkillBars();
        initStatsCounter();
        initProjectFilters();
        initContactForm();
        initClock();
        fetchGithubData();
        initWeather();
        initQuotes();
        initNavTime();
    }

    function initTypingEffect() {
        const el = document.getElementById('typingRole');
        if (!el) return;
        let roleIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function type() {
            const currentRole = state.roles[roleIndex];
            if (isDeleting) {
                el.textContent = currentRole.substring(0, charIndex - 1);
                charIndex--;
            } else {
                el.textContent = currentRole.substring(0, charIndex + 1);
                charIndex++;
            }

            let delay = isDeleting ? 40 : 80;

            if (!isDeleting && charIndex === currentRole.length) {
                delay = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                roleIndex = (roleIndex + 1) % state.roles.length;
                delay = 500;
            }

            setTimeout(type, delay);
        }
        type();
    }

    function initNavbar() {
        window.addEventListener('scroll', () => {
            const navbar = document.getElementById('navbar');
            if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);

            const sections = document.querySelectorAll('section[id]');
            let current = '';
            sections.forEach(s => {
                if (window.scrollY >= s.offsetTop - 120) current = s.id;
            });
            document.querySelectorAll('.nav-link').forEach(l => {
                l.classList.toggle('active', l.getAttribute('href') === '#' + current);
            });
        });
    }

    function initMenuToggle() {
        const toggle = document.getElementById('menuToggle');
        const menu = document.getElementById('navMenu');
        if (!toggle || !menu) return;

        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            menu.classList.toggle('active');
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                toggle.classList.remove('active');
                menu.classList.remove('active');
                const target = document.querySelector(link.getAttribute('href'));
                if (target) window.scrollTo({ top: target.offsetTop - 67, behavior: 'smooth' });
            });
        });
    }

    function initScrollReveal() {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = parseFloat(entry.target.dataset.delay) || 0;
                    setTimeout(() => entry.target.classList.add('visible'), delay * 1000);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }

    function initSkillBars() {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    setTimeout(() => {
                        bar.style.width = bar.dataset.level + '%';
                    }, 300);
                    observer.unobserve(bar);
                }
            });
        }, { threshold: 0.3 });
        document.querySelectorAll('.skill-bar').forEach(b => observer.observe(b));
    }

    function initStatsCounter() {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.dataset.count);
                    let current = 0;
                    const inc = target / 60;
                    const timer = setInterval(() => {
                        current += inc;
                        if (current >= target) {
                            el.textContent = target.toLocaleString();
                            clearInterval(timer);
                        } else {
                            el.textContent = Math.floor(current).toLocaleString();
                        }
                    }, 25);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });
        document.querySelectorAll('.hero-stat-num[data-count]').forEach(s => observer.observe(s));
    }

    function initProjectFilters() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.dataset.filter;
                document.querySelectorAll('.project-card').forEach(card => {
                    const show = filter === 'all' || card.dataset.category === filter;
                    if (show) {
                        card.style.display = '';
                        setTimeout(() => { card.style.opacity = '1'; card.style.transform = ''; }, 10);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.95)';
                        setTimeout(() => card.style.display = 'none', 300);
                    }
                });
            });
        });
    }

    function initContactForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;
        form.addEventListener('submit', e => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            alert(`[SYSTEM] Message received from ${name}\nEmail: ${email}\nStatus: QUEUED_FOR_DELIVERY`);
            form.reset();
        });
    }

    function initClock() {
        function update() {
            const now = new Date();
            const time = now.toLocaleTimeString('en-US', { hour12: false });
            const el = document.getElementById('navTime');
            if (el) el.textContent = time;
        }
        update();
        setInterval(update, 1000);
    }

    function initNavTime() {
        initClock();
    }

    async function fetchGithubData() {
        try {
            const [profileRes, reposRes] = await Promise.all([
                fetch(API.github.profile),
                fetch(API.github.repos)
            ]);

            if (profileRes.ok) {
                state.githubData = await profileRes.json();
                updateGithubUI(state.githubData);
            }
            if (reposRes.ok) {
                const repos = await reposRes.json();
                updateReposUI(repos);
            }
            state.lastUpdate = new Date();
        } catch (err) {
            console.log('[CYBER] GitHub API offline, using cached data');
        }
    }

    function updateGithubUI(data) {
        const bioEl = document.getElementById('githubBio');
        const reposEl = document.getElementById('githubRepos');
        const followersEl = document.getElementById('githubFollowers');
        const followingEl = document.getElementById('githubFollowing');

        if (bioEl && data.bio) bioEl.textContent = data.bio;
        if (reposEl) reposEl.textContent = data.public_repos || 9;
        if (followersEl) followersEl.textContent = data.followers || 1;
        if (followingEl) followingEl.textContent = data.following || 0;
    }

    function updateReposUI(repos) {
        const grid = document.getElementById('projectsGrid');
        if (!grid) return;

        const localProjects = grid.innerHTML;
        grid.innerHTML = '';

        repos.forEach((repo, i) => {
            if (repo.fork && !repo.description) return;

            const langColors = {
                'C#': '#178600', 'JavaScript': '#f1e05a', 'HTML': '#e34c26',
                'Python': '#3572A5', 'C++': '#f34b7d', 'CSS': '#563d7c',
                'TypeScript': '#2b7489'
            };
            const langColor = langColors[repo.language] || '#8b8b8b';

            const card = document.createElement('div');
            card.className = 'project-card reveal visible';
            card.dataset.category = getCategory(repo);
            card.style.transitionDelay = `${i * 0.05}s`;
            card.innerHTML = `
                <div class="project-header">
                    <div class="project-status-bar">
                        ${repo.language ? `<span class="project-lang-dot" style="background:${langColor}"></span><span class="project-lang">${repo.language}</span>` : ''}
                        <span class="project-stars">&#9733; ${repo.stargazers_count}</span>
                        <span class="project-forks">&#9741; ${repo.forks_count}</span>
                    </div>
                    <h3>${repo.name}</h3>
                    <p class="project-desc">${repo.description || 'No description available'}</p>
                    ${repo.topics && repo.topics.length > 0 ? `
                        <div class="project-tech-tags">
                            ${repo.topics.slice(0, 6).map(t => `<span class="ptag">${t}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="project-actions">
                    <a href="${repo.html_url}" target="_blank" class="project-btn">Code &#8594;</a>
                    ${repo.homepage ? `<a href="${repo.homepage}" target="_blank" class="project-btn primary">Live Demo &#8594;</a>` : ''}
                </div>
            `;
            grid.appendChild(card);
        });

        setTimeout(() => {
            grid.querySelectorAll('.project-card').forEach((card, i) => {
                setTimeout(() => { card.style.opacity = '1'; card.style.transform = ''; }, i * 50);
            });
        }, 100);
    }

    function getCategory(repo) {
        const topics = (repo.topics || []).map(t => t.toLowerCase());
        const name = (repo.name || '').toLowerCase();
        const desc = (repo.description || '').toLowerCase();
        const all = [...topics, name, desc].join(' ');

        if (all.includes('game') || all.includes('pixel') || all.includes('rpg')) return 'game';
        if (all.includes('backend') || all.includes('api') || all.includes('server') || all.includes('store') || all.includes('ecommerce')) return 'backend';
        if (all.includes('frontend') || all.includes('ui') || all.includes('css') || all.includes('3d') || all.includes('transform')) return 'frontend';
        return 'tool';
    }

    async function initWeather() {
        try {
            const res = await fetch(API.weather);
            if (res.ok) {
                state.weatherData = await res.json();
                updateWeatherUI(state.weatherData);
            }
        } catch (err) {
            const tempEl = document.getElementById('weatherTemp');
            const descEl = document.getElementById('weatherDesc');
            if (tempEl) tempEl.textContent = '32°C';
            if (descEl) descEl.textContent = 'Banha, Egypt';
        }
    }

    function updateWeatherUI(data) {
        const tempEl = document.getElementById('weatherTemp');
        const descEl = document.getElementById('weatherDesc');
        const iconEl = document.getElementById('weatherIcon');
        const locEl = document.getElementById('weatherLoc');

        if (tempEl) tempEl.textContent = `${Math.round(data.main.temp)}°C`;
        if (descEl) descEl.textContent = data.weather[0]?.description || 'Sunny';
        if (locEl) locEl.textContent = data.name || 'Banha, Egypt';

        if (iconEl) {
            const code = data.weather[0]?.id || 800;
            if (code >= 200 && code < 300) iconEl.textContent = '⛈';
            else if (code >= 300 && code < 400) iconEl.textContent = '🌧';
            else if (code >= 500 && code < 600) iconEl.textContent = '🌧';
            else if (code >= 600 && code < 700) iconEl.textContent = '❄';
            else if (code >= 700 && code < 800) iconEl.textContent = '🌫';
            else if (code === 800) iconEl.textContent = '☀';
            else if (code > 800) iconEl.textContent = '☁';
        }
    }

    async function initQuotes() {
        try {
            const res = await fetch(API.quotes);
            if (res.ok) {
                const data = await res.json();
            }
        } catch (err) {
            console.log('[CYBER] Quotes API offline');
        }
    }

    document.addEventListener('DOMContentLoaded', init);
})();
