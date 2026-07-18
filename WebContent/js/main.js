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
    // 3. Mouse Ripple Trail (Canvas)
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

        document.addEventListener('mousemove', e => {
            const now = Date.now();
            // Emit a ripple every 40ms for a more continuous trail
            if (now - lastRippleTime > 40) {
                ripples.push({
                    x: e.clientX,
                    y: e.clientY,
                    radius: 1,
                    maxRadius: 40 + Math.random() * 20,
                    alpha: 0.3,
                    speed: 1.0 + Math.random() * 0.5,
                });
                lastRippleTime = now;
            }
        });

        // Touch drag ripples for mobile
        document.addEventListener('touchmove', e => {
            const now = Date.now();
            if (now - lastRippleTime > 40 && e.touches.length > 0) {
                ripples.push({
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY,
                    radius: 1,
                    maxRadius: 40 + Math.random() * 20,
                    alpha: 0.3,
                    speed: 1.0 + Math.random() * 0.5,
                });
                lastRippleTime = now;
            }
        }, { passive: true });

        document.addEventListener('click', e => {
            // Emits multiple ripples instantly on click with slight delays
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    ripples.push({
                        x: e.clientX,
                        y: e.clientY,
                        radius: 1,
                        maxRadius: 100 + Math.random() * 50,
                        alpha: 0.4 - (i * 0.1),
                        speed: 1.5 - (i * 0.2),
                    });
                }, i * 150);
            }
        });

        // Touch tap ripples for mobile
        document.addEventListener('touchstart', e => {
            if (e.touches.length > 0) {
                const clientX = e.touches[0].clientX;
                const clientY = e.touches[0].clientY;
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        ripples.push({
                            x: clientX,
                            y: clientY,
                            radius: 1,
                            maxRadius: 100 + Math.random() * 50,
                            alpha: 0.4 - (i * 0.1),
                            speed: 1.5 - (i * 0.2),
                        });
                    }, i * 150);
                }
            }
        }, { passive: true });

        function drawRipples() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = ripples.length - 1; i >= 0; i--) {
                const r = ripples[i];
                r.radius += r.speed;
                r.alpha -= 0.005; // Fade out

                if (r.alpha <= 0 || r.radius >= r.maxRadius) {
                    ripples.splice(i, 1);
                    continue;
                }

                // Draw main ripple wave
                ctx.beginPath();
                ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(139, 92, 246, ${r.alpha})`;
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Draw a secondary concentric inner ring wave for water ripple effect
                if (r.radius > 15) {
                    ctx.beginPath();
                    ctx.arc(r.x, r.y, r.radius - 12, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(139, 92, 246, ${r.alpha * 0.5})`;
                    ctx.lineWidth = 1.0;
                    ctx.stroke();
                }

                // Draw a tertiary concentric inner ring wave
                if (r.radius > 30) {
                    ctx.beginPath();
                    ctx.arc(r.x, r.y, r.radius - 24, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(139, 92, 246, ${r.alpha * 0.25})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
            requestAnimationFrame(drawRipples);
        }
        requestAnimationFrame(drawRipples);
    }

    // ======================================================
    // 5. Parallax on Scroll (images, hero bg, divider)
    // ======================================================
    const parallaxElements = document.querySelectorAll('[data-parallax-speed]');

    function updateParallax() {
        const scrollY = window.scrollY;

        parallaxElements.forEach(el => {
            const speed = parseFloat(el.dataset.parallaxSpeed);
            const rect = el.parentElement.getBoundingClientRect();
            // Only animate when parent is somewhat visible
            if (rect.bottom > -500 && rect.top < window.innerHeight + 500) {
                const offset = scrollY * speed;
                el.style.transform = `translateY(${offset}px)`;
            }
        });
    }

    window.addEventListener('scroll', updateParallax, { passive: true });
    updateParallax();

    // ======================================================
    // 6. 3D Parallax Image Stack — scroll-driven depth
    // ======================================================
    const imageStack = document.querySelector('.parallax-image-stack');
    if (imageStack) {
        const cards = imageStack.querySelectorAll('.parallax-card');

        if (isFinePointer) {
            // 3D tilt on mouse over the stack (Desktop)
            imageStack.addEventListener('mousemove', e => {
                const rect = imageStack.getBoundingClientRect();
                const cx = rect.width / 2;
                const cy = rect.height / 2;
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const tiltX = ((x - cx) / cx) * 6;
                const tiltY = -((y - cy) / cy) * 6;

                cards.forEach((card, i) => {
                    const depth = (i + 1) * 0.4; // more depth for back cards
                    const baseRotateX = 0;
                    const baseRotateY = [0, 3, -2][i] || 0;
                    card.style.transform = `
                        perspective(1200px)
                        rotateX(${tiltY * depth + baseRotateX}deg)
                        rotateY(${tiltX * depth + baseRotateY}deg)
                        translateZ(${(i + 1) * 15}px)
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
            // Scroll-driven 3D depth tilt (Mobile/Touch)
            function tiltOnScroll() {
                const rect = imageStack.getBoundingClientRect();
                const stackCenter = rect.top + rect.height / 2;
                const screenCenter = window.innerHeight / 2;
                const distanceFromCenter = (stackCenter - screenCenter) / screenCenter;

                // Clamp between -1 and 1
                const factor = Math.min(Math.max(distanceFromCenter, -1), 1);

                cards.forEach((card, i) => {
                    const depth = (i + 1) * 0.4;
                    const tiltY = factor * 8 * depth; // Tilt horizontally on scroll
                    const baseRotate = [0, 3, -2][i] || 0;
                    card.style.transform = `
                        perspective(1000px)
                        rotateY(${tiltY}deg)
                        rotateZ(${baseRotate}deg)
                        translateZ(${(i + 1) * 10}px)
                    `;
                });
            }
            window.addEventListener('scroll', tiltOnScroll, { passive: true });
            tiltOnScroll();
        }
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
    // 8. Card Mouse Glow (Testimonials)
    // ======================================================
    if (isFinePointer) {
        const glowCards = document.querySelectorAll('.testimonial-card');
        glowCards.forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                card.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
                card.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
            });
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
                btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
            });
            btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
        });
    }
});