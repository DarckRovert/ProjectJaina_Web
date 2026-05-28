/**
 * SéquitoWeb V5.0 - Full Overhaul
 * Fixed: canvas alpha bug, added mobile nav, smooth scroll, active nav link tracking
 */
document.addEventListener('DOMContentLoaded', () => {

    /* =========================================================================
       1. CANVAS PARTICLE ENGINE (Fel Embers)
       Fixed: removed alpha:false which made the canvas opaque and hid particles
       ========================================================================= */
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d'); // alpha: true by default — correct
    
    let width, height;
    let particles = [];
    
    const mouse = { x: null, y: null, radius: 150 };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    const initCanvas = () => {
        width  = canvas.width  = window.innerWidth;
        height = canvas.height = window.innerHeight;
    };

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 0.4;
            this.baseX = this.x;
            this.baseY = this.y;
            this.density = (Math.random() * 25) + 1;
            this.speedY = -(Math.random() * 1.0 + 0.3);
            this.speedX = (Math.random() - 0.5) * 0.6;
            this.opacity = Math.random() * 0.5 + 0.2;

            const rand = Math.random();
            if (rand > 0.88) {
                this.color = `rgba(220, 38, 38, ${this.opacity})`; // Blood Red
            } else if (rand > 0.55) {
                this.color = `rgba(147, 51, 234, ${this.opacity})`; // Void Purple
            } else if (rand > 0.2) {
                this.color = `rgba(74, 222, 128, ${this.opacity})`; // Fel Green
            } else {
                this.color = `rgba(220, 38, 38, ${this.opacity})`; // Blood Red (lore)
            }
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX + Math.sin(this.y * 0.01) * 0.4;

            // Mouse repulsion (screen space, no scroll offset needed since canvas is fixed)
            if (mouse.x != null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    this.x -= (dx / distance) * force * this.density * 0.4;
                    this.y -= (dy / distance) * force * this.density * 0.4;
                }
            }

            // Wrap-around
            if (this.y < -10)       { this.x = Math.random() * width; this.y = height + 10; }
            if (this.x < -10)       this.x = width + 10;
            if (this.x > width + 10) this.x = -10;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }
    }

    const initParticles = () => {
        particles = [];
        let count = Math.floor((width * height) / 12000);
        if (count > 120) count = 120;
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    };

    const animate = () => {
        ctx.clearRect(0, 0, width, height); // Use clearRect to keep canvas transparent

        for (let p of particles) {
            p.update();
            p.draw();
        }
        requestAnimationFrame(animate);
    };

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            initCanvas();
            initParticles();
        }, 200);
    });

    initCanvas();
    initParticles();
    requestAnimationFrame(animate);


    /* =========================================================================
       2. INTERSECTION OBSERVERS (Reveal & Fade Ins)
       ========================================================================= */
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Slight stagger for children if they have --delay
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -60px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));


    /* =========================================================================
       3. NAVBAR — Scroll effect + Active link tracking
       ========================================================================= */
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        updateActiveNavLink();
    }, { passive: true });

    // Active nav link tracking
    const sections   = document.querySelectorAll('section[id], header[id]');
    const navLinks   = document.querySelectorAll('.nav-link');

    const updateActiveNavLink = () => {
        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            if (window.scrollY >= sectionTop) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    };

    // Add active style
    const style = document.createElement('style');
    style.textContent = `.nav-link.active { color: var(--text-main); } .nav-link.active::after { width: 100%; }`;
    document.head.appendChild(style);


    /* =========================================================================
       4. MOBILE NAV — Hamburger Menu
       ========================================================================= */
    const hamburger = document.getElementById('nav-hamburger');
    const mobileNav = document.getElementById('mobile-nav');

    if (hamburger && mobileNav) {

        const openMenu = () => {
            mobileNav.style.display = 'flex';
            // Force reflow before adding class for transition
            requestAnimationFrame(() => mobileNav.classList.add('open'));
            document.body.style.overflow = 'hidden';
            hamburger.setAttribute('aria-expanded', 'true');
        };

        const closeMenu = () => {
            mobileNav.classList.remove('open');
            document.body.style.overflow = '';
            hamburger.setAttribute('aria-expanded', 'false');
            setTimeout(() => { mobileNav.style.display = ''; }, 400);
        };

        hamburger.addEventListener('click', () => {
            const isOpen = mobileNav.classList.contains('open');
            isOpen ? closeMenu() : openMenu();
        });

        // Close on link click
        mobileNav.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // ESC key close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMenu();
        });
    }


    /* =========================================================================
       5. SMOOTH CLICK SCROLL (for anchor links)
       ========================================================================= */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const offset = 80; // account for fixed navbar
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

});
