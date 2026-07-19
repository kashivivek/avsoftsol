document.addEventListener("DOMContentLoaded", () => {
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;

    // ======================================================
    // 1. Scroll Reveal (IntersectionObserver)
    // ======================================================
    const revealEls = document.querySelectorAll('.reveal-up');
    const revealObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { rootMargin: '0px 0px -80px 0px', threshold: 0.1 });
    revealEls.forEach(el => revealObs.observe(el));

    // ======================================================
    // 2. Smooth anchor scrolling
    // ======================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const id = this.getAttribute('href');
            if (id === '#') return;
            const target = document.querySelector(id);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // ======================================================
    // 3. Pure Water Ripple Trail (Canvas)
    // ======================================================
    const canvas = document.getElementById('ripple-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let ripples = [];
        let lastRippleTime = 0;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        // Ambient ripples
        function spawnAmbientRipple() {
            ripples.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: 1,
                maxRadius: 50 + Math.random() * 60,
                alpha: 0.06 + Math.random() * 0.04,
                speed: 0.4 + Math.random() * 0.3,
                isAmbient: true,
            });
        }
        setInterval(() => {
            if (ripples.length < 20) spawnAmbientRipple();
        }, 2500);

        // Mouse move — water ripples
        document.addEventListener('mousemove', e => {
            const now = Date.now();
            if (now - lastRippleTime > 35) {
                ripples.push({
                    x: e.clientX,
                    y: e.clientY,
                    radius: 1,
                    maxRadius: 40 + Math.random() * 25,
                    alpha: 0.25 + Math.random() * 0.15,
                    speed: 1.0 + Math.random() * 0.6,
                    isAmbient: false,
                });
                lastRippleTime = now;
            }
        });

        // Touch drag
        document.addEventListener('touchmove', e => {
            const now = Date.now();
            if (now - lastRippleTime > 35 && e.touches.length > 0) {
                ripples.push({
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY,
                    radius: 1,
                    maxRadius: 40 + Math.random() * 25,
                    alpha: 0.25 + Math.random() * 0.15,
                    speed: 1.0 + Math.random() * 0.6,
                    isAmbient: false,
                });
                lastRippleTime = now;
            }
        }, { passive: true });

        // Click — splash burst
        document.addEventListener('click', e => {
            for (let i = 0; i < 4; i++) {
                setTimeout(() => {
                    ripples.push({
                        x: e.clientX + (Math.random() - 0.5) * 20,
                        y: e.clientY + (Math.random() - 0.5) * 20,
                        radius: 1,
                        maxRadius: 80 + Math.random() * 60,
                        alpha: 0.3 - (i * 0.06),
                        speed: 1.5 - (i * 0.15),
                        isAmbient: false,
                    });
                }, i * 80);
            }
        });

        // Touch tap
        document.addEventListener('touchstart', e => {
            if (e.touches.length > 0) {
                const clientX = e.touches[0].clientX;
                const clientY = e.touches[0].clientY;
                for (let i = 0; i < 4; i++) {
                    setTimeout(() => {
                        ripples.push({
                            x: clientX + (Math.random() - 0.5) * 20,
                            y: clientY + (Math.random() - 0.5) * 20,
                            radius: 1,
                            maxRadius: 80 + Math.random() * 60,
                            alpha: 0.3 - (i * 0.06),
                            speed: 1.5 - (i * 0.15),
                            isAmbient: false,
                        });
                    }, i * 80);
                }
            }
        }, { passive: true });

        function drawRipples() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = ripples.length - 1; i >= 0; i--) {
                const r = ripples[i];
                r.radius += r.speed;
                r.alpha -= r.isAmbient ? 0.001 : 0.004;

                if (r.alpha <= 0 || r.radius >= r.maxRadius) {
                    ripples.splice(i, 1);
                    continue;
                }

                const progress = r.radius / r.maxRadius;
                const currentAlpha = r.alpha * (1 - progress * 0.4);

                // Pure water style — translucent white/blue glow
                // Outer glow ring
                ctx.beginPath();
                ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(180, 220, 255, ${currentAlpha * 0.5})`;
                ctx.lineWidth = 2.0 + (1 - progress) * 1.5;
                ctx.shadowColor = `rgba(180, 220, 255, ${currentAlpha * 0.3})`;
                ctx.shadowBlur = 12;
                ctx.stroke();
                ctx.shadowBlur = 0;

                // Inner ring 1
                if (r.radius > 12) {
                    ctx.beginPath();
                    ctx.arc(r.x, r.y, r.radius - 8, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(200, 235, 255, ${currentAlpha * 0.25})`;
                    ctx.lineWidth = 1.2;
                    ctx.shadowColor = `rgba(200, 235, 255, ${currentAlpha * 0.2})`;
                    ctx.shadowBlur = 6;
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                }

                // Inner ring 2
                if (r.radius > 25) {
                    ctx.beginPath();
                    ctx.arc(r.x, r.y, r.radius - 16, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(220, 245, 255, ${currentAlpha * 0.12})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }

                // Subtle fill highlight (like light catching the water)
                ctx.beginPath();
                ctx.arc(r.x, r.y, r.radius * 0.3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha * 0.04})`;
                ctx.fill();
            }

            requestAnimationFrame(drawRipples);
        }
        requestAnimationFrame(drawRipples);
    }

    // ======================================================
    // 4. Enhanced Custom Cursor
    // ======================================================
    const cursorDot = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');

    if (cursorDot && cursorRing && isFinePointer) {
        cursorDot.style.display = '';
        cursorRing.style.display = '';

        let mouseX = 0, mouseY = 0;
        let ringX = 0, ringY = 0;

        document.addEventListener('mousemove', e => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
        });

        function animateCursor() {
            ringX += (mouseX - ringX) * 0.12;
            ringY += (mouseY - ringY) * 0.12;
            cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        document.querySelectorAll('a, button, .magnetic, .parallax-card, .service-card-img, .social-icon-btn').forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorRing.style.width = '60px';
                cursorRing.style.height = '60px';
                cursorRing.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                cursorRing.style.background = 'rgba(139, 92, 246, 0.05)';
            });
            el.addEventListener('mouseleave', () => {
                cursorRing.style.width = '32px';
                cursorRing.style.height = '32px';
                cursorRing.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                cursorRing.style.background = 'transparent';
            });
        });
    }

    // ======================================================
    // 5. Parallax on Scroll
    // ======================================================
    const parallaxElements = document.querySelectorAll('[data-parallax-speed]');

    function updateParallax() {
        const scrollY = window.scrollY;
        parallaxElements.forEach(el => {
            const speed = parseFloat(el.dataset.parallaxSpeed);
            const rect = el.parentElement.getBoundingClientRect();
            if (rect.bottom > -500 && rect.top < window.innerHeight + 500) {
                const offset = scrollY * speed;
                el.style.transform = `translateY(${offset}px)`;
            }
        });
    }
    window.addEventListener('scroll', updateParallax, { passive: true });
    updateParallax();

    // ======================================================
    // 6. Enhanced 3D Parallax Image Stack
    // ======================================================
    const imageStack = document.querySelector('.parallax-image-stack');
    if (imageStack) {
        const cards = imageStack.querySelectorAll('.parallax-card');

        if (isFinePointer) {
            imageStack.addEventListener('mousemove', e => {
                const rect = imageStack.getBoundingClientRect();
                const cx = rect.width / 2;
                const cy = rect.height / 2;
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const tiltX = ((x - cx) / cx) * 8;
                const tiltY = -((y - cy) / cy) * 8;

                cards.forEach((card, i) => {
                    const depth = (i + 1) * 0.5;
                    const baseRotateY = [0, 3, -2][i] || 0;
                    card.style.transform = `
                        perspective(1200px)
                        rotateX(${tiltY * depth}deg)
                        rotateY(${tiltX * depth + baseRotateY}deg)
                        translateZ(${(i + 1) * 20}px)
                    `;
                });
            });

            imageStack.addEventListener('mouseleave', () => {
                cards.forEach((card, i) => {
                    const baseRotate = [0, 3, -2][i] || 0;
                    card.style.transform = `rotate(${baseRotate}deg)`;
                });
            });
        } else {
            function tiltOnScroll() {
                const rect = imageStack.getBoundingClientRect();
                const stackCenter = rect.top + rect.height / 2;
                const screenCenter = window.innerHeight / 2;
                const distanceFromCenter = (stackCenter - screenCenter) / screenCenter;
                const factor = Math.min(Math.max(distanceFromCenter, -1), 1);

                cards.forEach((card, i) => {
                    const depth = (i + 1) * 0.5;
                    const tiltY = factor * 10 * depth;
                    const baseRotate = [0, 3, -2][i] || 0;
                    card.style.transform = `
                        perspective(1000px)
                        rotateY(${tiltY}deg)
                        rotateZ(${baseRotate}deg)
                        translateZ(${(i + 1) * 15}px)
                    `;
                });
            }
            window.addEventListener('scroll', tiltOnScroll, { passive: true });
            tiltOnScroll();
        }

        // Scroll-driven blur
        function updateCardBlur() {
            const rect = imageStack.getBoundingClientRect();
            const stackCenter = rect.top + rect.height / 2;
            const screenCenter = window.innerHeight / 2;
            const distance = Math.abs(stackCenter - screenCenter) / (window.innerHeight * 0.5);
            const blurAmount = Math.min(distance * 2, 4);

            cards.forEach((card, i) => {
                const depthFactor = 1 + (cards.length - i) * 0.3;
                const cardBlur = blurAmount * depthFactor * 0.3;
                card.style.filter = `blur(${cardBlur}px)`;
            });
        }
        window.addEventListener('scroll', updateCardBlur, { passive: true });
        updateCardBlur();
    }

    // ======================================================
    // 7. Horizontal Scroll Gallery
    // ======================================================
    const hsSection = document.querySelector('.horizontal-scroll-section');
    if (hsSection) {
        const stickyContainer = hsSection.querySelector('.hs-sticky-container');
        const inner = hsSection.querySelector('.hs-inner');
        const panels = hsSection.querySelectorAll('.hs-panel');
        const totalPanelsWidth = Array.from(panels).reduce((sum, p) => sum + p.offsetWidth, 0);

        function updateHorizontalScroll() {
            const rect = hsSection.getBoundingClientRect();
            if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
                const totalScroll = rect.height - window.innerHeight;
                let progress = Math.abs(rect.top) / totalScroll;
                progress = Math.min(Math.max(progress, 0), 1);
                const maxTranslate = totalPanelsWidth - window.innerWidth;
                inner.style.transform = `translateX(${-progress * maxTranslate}px)`;
            } else if (rect.top > 0) {
                inner.style.transform = `translateX(0)`;
            }
        }
        window.addEventListener('scroll', updateHorizontalScroll, { passive: true });
        window.addEventListener('resize', updateHorizontalScroll);
        updateHorizontalScroll();
    }

    // ======================================================
    // 8. Card Mouse Glow + 3D Tilt (Testimonials)
    // ======================================================
    if (isFinePointer) {
        const glowCards = document.querySelectorAll('.testimonial-card');
        glowCards.forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                card.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
                card.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');

                const cx = rect.width / 2;
                const cy = rect.height / 2;
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const tiltX = ((x - cx) / cx) * 3;
                const tiltY = -((y - cy) / cy) * 3;
                card.style.transform = `perspective(800px) rotateX(${tiltY}deg) rotateY(${tiltX}deg) translateY(-4px)`;
            });
            card.addEventListener('mouseleave', () => { card.style.transform = ''; });
        });
    }

    // ======================================================
    // 9. Magnetic Buttons
    // ======================================================
    if (isFinePointer) {
        document.querySelectorAll('.magnetic').forEach(btn => {
            btn.addEventListener('mousemove', e => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
            });
            btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
        });
    }

    // ======================================================
    // 10. Scroll-Driven Gradient Text Color Shift
    // ======================================================
    const gradientTexts = document.querySelectorAll('.gradient-text');
    function updateGradientShift() {
        const scrollProgress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        gradientTexts.forEach(el => {
            const hueShift = scrollProgress * 60;
            el.style.background = `linear-gradient(135deg, hsl(${260 + hueShift}, 80%, 60%), hsl(${170 + hueShift}, 80%, 60%))`;
            el.style.webkitBackgroundClip = 'text';
            el.style.webkitTextFillColor = 'transparent';
            el.style.backgroundClip = 'text';
        });
    }
    window.addEventListener('scroll', updateGradientShift, { passive: true });
    updateGradientShift();

    // ======================================================
    // 11. Project Gallery Modal
    // ======================================================
    const projectData = {
        ttt: {
            name: 'TV Time Tracker (TTT)',
            role: 'Architect & Developer',
            year: '2026 - Now',
            type: 'Web Application',
            credits: 'TMDB API',
            github: 'https://github.com/kashivivek/TTT',
            app: 'https://tvtime.online/',
            overview: 'TV Time Tracker is designed to help you organize, track, and manage your TV shows and movies. Built as a powerful alternative to existing tracking platforms, it offers lightning-fast syncing, deep TMDB integration, and a premium user interface.',
            features: [
                'Seamless Watch Tracking — one-click season-level tracking',
                'TV Time Zip Import — upload exported archives, auto-resolves history',
                'Smart Upcoming Episodes — unreleased episodes parsed automatically',
                'Interactive Dashboard — Current, Not Watched, Upcoming & Completed',
                'Zero API Lag — background syncing for instant dashboard loads'
            ],
            gradient: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
            bgClass: 'project-bg-ttt',
            folder: 'ttt'
        },
        niyan: {
            name: 'Niyan',
            role: 'Architect & Developer',
            year: '2026 - Now',
            type: 'Mobile & Web App',
            credits: 'Flutter, Firebase',
            github: 'https://github.com/kashivivek/niyan',
            app: 'https://play.google.com/store/apps/details?id=com.kashivivek.niyan&hl=en_US',
            overview: 'Niyan is designed to help landlords streamline their operations, track revenue, and manage tenant relationships with ease. Built with Flutter and Firebase, Niyan offers a reactive and intuitive experience across Android, iOS, and Web.',
            features: [
                'Modern Dashboard — occupancy rates, monthly revenue, pending tasks',
                'Property & Unit Management — detailed status tracking',
                'Tenant Ledger — complete history with contact info and leases',
                'Smart Rent Notifications — automated reminders for upcoming/overdue rent',
                'Financial Tracking — robust income and expense tracking per property'
            ],
            gradient: 'linear-gradient(135deg, #06d6a0, #0d3b66)',
            bgClass: 'project-bg-niyan',
            folder: 'niyan'
        },
        getit: {
            name: 'Get It',
            role: 'Architect & Developer',
            year: '2015 - Now',
            type: 'Mobile App',
            credits: 'Android Studio',
            github: 'https://github.com/kashivivek/Get-it',
            app: 'https://play.google.com/store/apps/details?id=com.getit.getit.yes&hl=en_US',
            overview: 'A consumer-facing mobile application available on the Google Play Store. Built to provide users with a seamless and intuitive mobile experience with optimized performance and engaging UI/UX.',
            features: [
                'Consumer-facing mobile experience on Google Play',
                'Optimized performance and smooth UI',
                'Intuitive navigation and user flows',
                'Engaging user interface with modern design patterns'
            ],
            gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
            bgClass: 'project-bg-getit',
            folder: 'getit'
        },
        thalinbiryani: {
            name: 'Thali n Biryani',
            role: 'Developer',
            year: '2024',
            type: 'Food & Restaurant',
            credits: '',
            github: '',
            app: '#',
            overview: 'A digital presence for Thali n Biryani, bringing authentic Indian cuisine to customers through a beautifully crafted web experience.',
            features: [
                'Restaurant menu showcase',
                'Online ordering integration',
                'Location and contact management',
                'Brand-focused design'
            ],
            gradient: 'linear-gradient(135deg, #ef4444, #991b1b)',
            bgClass: 'project-bg-thalinbiryani',
            folder: 'thalinbiryani'
        },
        dosapoint: {
            name: 'Dosapoint',
            role: 'Developer',
            year: '2024',
            type: 'Food & Restaurant',
            credits: '',
            github: '',
            app: '#',
            overview: 'A digital platform for Dosapoint, showcasing their menu and providing an engaging online experience for customers.',
            features: [
                'Restaurant digital showcase',
                'Menu and specials display',
                'Customer engagement features',
                'Location and hours information'
            ],
            gradient: 'linear-gradient(135deg, #10b981, #047857)',
            bgClass: 'project-bg-dosapoint',
            folder: 'dosapoint'
        },
        khichidi: {
            name: 'Khichidi',
            role: 'Developer',
            year: '2024',
            type: 'Food & Restaurant',
            credits: '',
            github: '',
            app: '#',
            overview: 'A modern digital experience for Khichidi restaurant, bringing comfort food to customers through an elegant online presence.',
            features: [
                'Restaurant menu and brand showcase',
                'Engaging visual presentation',
                'Customer connection features',
                'Modern responsive design'
            ],
            gradient: 'linear-gradient(135deg, #a855f7, #6b21a8)',
            bgClass: 'project-bg-khichidi',
            folder: 'khichidi'
        }
    };

    window.openProject = function(id) {
        const data = projectData[id];
        if (!data) return;

        const modal = document.getElementById('project-modal');
        const scroll = document.getElementById('modal-scroll');

        // Build screenshots HTML — try multiple naming patterns
        const folder = `img/projects/${data.folder}/`;
        const patterns = [];
        // Pattern 1: numbered (1.jpg, 2.png, 3.webp, etc.)
        for (let i = 1; i <= 10; i++) {
            patterns.push(`${folder}${i}.jpg`);
            patterns.push(`${folder}${i}.png`);
            patterns.push(`${folder}${i}.webp`);
        }
        // Pattern 2: descriptive names
        ['screen', 'screenshot', 'ss', 'photo', 'pic'].forEach(prefix => {
            for (let i = 1; i <= 5; i++) {
                patterns.push(`${folder}${prefix}-${i}.jpg`);
                patterns.push(`${folder}${prefix}-${i}.png`);
                patterns.push(`${folder}${prefix}-${i}.webp`);
                patterns.push(`${folder}${prefix}_${i}.jpg`);
                patterns.push(`${folder}${prefix}_${i}.png`);
                patterns.push(`${folder}${prefix}_${i}.webp`);
            }
            patterns.push(`${folder}${prefix}.jpg`);
            patterns.push(`${folder}${prefix}.png`);
            patterns.push(`${folder}${prefix}.webp`);
        });
        // Pattern 3: common names
        ['cover', 'featured', 'gallery', 'main', 'banner'].forEach(name => {
            patterns.push(`${folder}${name}.jpg`);
            patterns.push(`${folder}${name}.png`);
            patterns.push(`${folder}${name}.webp`);
        });

        // Create screenshot elements — each will remove itself if image fails to load
        const screenshotsHtml = patterns.map(src =>
            `<div class="screenshot-thumb" style="display:none"><img src="${src}" alt="Screenshot" onload="this.style.display='';this.parentElement.style.display=''" onerror="this.parentElement.remove()"></div>`
        ).join('');

        // Logo — try multiple extensions, with a safe fallback
        const logoPath = `img/projects/${data.folder}/logo`;
        const logoInitial = data.name.split(' ')[0].substring(0, 5);

        scroll.innerHTML = `
            <div class="modal-header">
                <div class="modal-header-bg ${data.bgClass}"></div>
                <div class="modal-header-content">
                    <div class="modal-header-logo" id="modal-header-logo">
                        <img src="${logoPath}.png" alt="${data.name}" style="width:100%;height:100%;object-fit:contain" onerror="this.onerror=null;this.src='${logoPath}.jpg';this.onerror=null;this.style.display='none';this.insertAdjacentHTML('afterend','<span class=\\'modal-logo-fallback\\'>${logoInitial}</span>')">
                    </div>
                    <div class="modal-header-text">
                        <h2>${data.name}</h2>
                        <div class="modal-meta">
                            <span>${data.role}</span>
                            <span class="dot-sep"></span>
                            <span>${data.year}</span>
                            <span class="dot-sep"></span>
                            <span>${data.type}</span>
                            ${data.credits ? `<span class="dot-sep"></span><span>${data.credits}</span>` : ''}
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-body">
                <h3>Overview</h3>
                <p>${data.overview}</p>

                <h3>Features</h3>
                <ul class="modal-features">
                    ${data.features.map(f => `<li>${f}</li>`).join('')}
                </ul>

                <div class="modal-links">
                    ${data.github ? `<a href="${data.github}" target="_blank" class="modal-link modal-link-github"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg> View GitHub</a>` : ''}
                    ${data.app ? `<a href="${data.app}" target="_blank" class="modal-link modal-link-app"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg> Visit App</a>` : ''}
                </div>

                <div class="modal-screenshots" id="modal-screenshots">
                    <h3>Screenshots</h3>
                    <div class="screenshots-scroll">
                        ${screenshotsHtml}
                    </div>
                </div>
            </div>
        `;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.closeProject = function() {
        const modal = document.getElementById('project-modal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    // Close modal on Escape key
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeProject();
    });

    // ======================================================
    // 12. Floating 3D Elements in Hero
    // ======================================================
    const hero = document.querySelector('.hero');
    if (hero && isFinePointer) {
        const floatContainer = document.createElement('div');
        floatContainer.className = 'float-3d-container';
        floatContainer.setAttribute('aria-hidden', 'true');
        hero.appendChild(floatContainer);

        const shapes = ['circle', 'square', 'triangle'];
        for (let i = 0; i < 6; i++) {
            const el = document.createElement('div');
            el.className = `float-3d-element float-shape-${shapes[i % 3]}`;
            el.style.cssText = `
                --x: ${Math.random() * 100}%;
                --y: ${Math.random() * 100}%;
                --size: ${20 + Math.random() * 40}px;
                --delay: ${Math.random() * 5}s;
                --duration: ${8 + Math.random() * 8}s;
                --opacity: ${0.03 + Math.random() * 0.05};
            `;
            floatContainer.appendChild(el);
        }

        hero.addEventListener('mousemove', e => {
            const rect = hero.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            floatContainer.style.transform = `translate(${x * 20}px, ${y * 20}px)`;
        });
    }
});