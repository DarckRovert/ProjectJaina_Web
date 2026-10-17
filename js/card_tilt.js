/**
 * Project JAIna — 3D Gyroscopic Perspective Tilt & Specular Lighting System
 * Aceleración de hardware (transform-style: preserve-3d) sin dependencias externas
 * Otorga sensación física AAA a tarjetas, HUD y módulos clave
 */
(function () {
    'use strict';

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return; // Respeta accesibilidad
    }

    // Detección táctil pura para no interferir en scrolls móviles
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (isTouch && window.innerWidth < 1024) {
        return;
    }

    const TILT_SELECTORS = [
        '[data-tilt]',
        '.addon-card',
        '.world-feature-card',
        '.feature-item-glass',
        '.countdown-tile',
        '.realm-card-live',
        '.param-box',
        '.conn-step-card',
        '.conn-master-banner',
        '.hero-banner-container',
        '.lore-card',
        '.timeline-card',
        '.db-card',
        '.podium-card',
        '.tier-card',
        '.store-card',
        '.bug-card',
        '.enclave-card',
        '.enclave-detail-view'
    ].join(',');

    function initCardTilt() {
        const cards = document.querySelectorAll(TILT_SELECTORS);

        cards.forEach((card) => {
            if (card.dataset.tiltInitialized) return;
            card.dataset.tiltInitialized = 'true';

            // Contenedor de reflejo especular
            let glare = card.querySelector('.tilt-glare');
            if (!glare) {
                glare = document.createElement('div');
                glare.className = 'tilt-glare';
                card.appendChild(glare);
            }

            let rafId = null;
            let currentX = 0;
            let currentY = 0;
            let targetX = 0;
            let targetY = 0;

            const maxTilt = parseFloat(card.getAttribute('data-tilt-max') || '8.5'); // Grados de inclinación
            const perspective = parseFloat(card.getAttribute('data-tilt-perspective') || '1000');

            card.style.transformStyle = 'preserve-3d';
            card.style.willChange = 'transform';

            function updateTilt() {
                // Interpolación lineal (LERP suave)
                currentX += (targetX - currentX) * 0.14;
                currentY += (targetY - currentY) * 0.14;

                const rotX = (currentY * maxTilt).toFixed(2);
                const rotY = (-currentX * maxTilt).toFixed(2);

                card.style.transform = `perspective(${perspective}px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(8px) scale3d(1.018, 1.018, 1.018)`;

                // Posicionamiento del reflejo de luz radial
                const glareX = ((currentX + 1) * 50).toFixed(1);
                const glareY = ((currentY + 1) * 50).toFixed(1);
                glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0) 65%)`;
                glare.style.opacity = '1';

                if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
                    rafId = requestAnimationFrame(updateTilt);
                }
            }

            card.addEventListener('mouseenter', () => {
                card.style.transition = 'none';
                glare.style.transition = 'opacity 0.25s ease';
            });

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width; // 0 a 1
                const y = (e.clientY - rect.top) / rect.height; // 0 a 1

                // Normalizado de -1 a 1
                targetX = (x - 0.5) * 2;
                targetY = (y - 0.5) * 2;

                if (!rafId) {
                    rafId = requestAnimationFrame(updateTilt);
                }
            });

            card.addEventListener('mouseleave', () => {
                targetX = 0;
                targetY = 0;
                card.style.transition = 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)';
                card.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)`;
                glare.style.opacity = '0';
                if (rafId) {
                    cancelAnimationFrame(rafId);
                    rafId = null;
                }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCardTilt);
    } else {
        initCardTilt();
    }

    // Re-evaluar si se agregan elementos dinámicos
    window.addEventListener('load', initCardTilt);
    window.reinitCardTilt = initCardTilt;

    // MutationObserver debounced para nodos insertados por APIs asíncronas
    if (typeof MutationObserver !== 'undefined') {
        let timer = null;
        const observer = new MutationObserver(() => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                initCardTilt();
            }, 100);
        });

        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                observer.observe(document.body, { childList: true, subtree: true });
            });
        }
    }
})();
