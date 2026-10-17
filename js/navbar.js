/**
 * Project JAIna — Master Navigation & Responsive Drawer Controller
 * Manejo unificado de menús desplegables (Touch / Click / Teclado) y drawer móvil
 * Cero dependencias · Máxima compatibilidad cross-device (iOS / Android / Desktop)
 */
(function () {
    'use strict';

    function initNavbar() {
        const navbar = document.getElementById('mainNavbar') || document.querySelector('.navbar');
        const toggleBtn = document.getElementById('mobileNavToggle');
        const navLinks = document.getElementById('navbarLinks');
        const dropdownItems = document.querySelectorAll('.nav-item-dropdown');

        function closeAllDropdowns() {
            dropdownItems.forEach(item => {
                item.classList.remove('dropdown-active');
                const trigger = item.querySelector('.dropdown-trigger');
                if (trigger) trigger.setAttribute('aria-expanded', 'false');
            });
        }

        // 1. Mobile Drawer Toggle
        if (toggleBtn && navLinks) {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = navLinks.classList.toggle('nav-open');
                toggleBtn.textContent = isOpen ? '✕' : '☰';
                toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            });

            // Cerrar menú móvil al hacer clic en enlaces normales
            navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    navLinks.classList.remove('nav-open');
                    toggleBtn.textContent = '☰';
                    toggleBtn.setAttribute('aria-expanded', 'false');
                    closeAllDropdowns();
                });
            });
        }

        // 2. Dropdown Toggles (Click / Tap / Touch Support)
        dropdownItems.forEach(item => {
            const trigger = item.querySelector('.dropdown-trigger');
            if (!trigger) return;

            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const isActive = item.classList.contains('dropdown-active');

                // Cerrar otros dropdowns activos
                dropdownItems.forEach(other => {
                    if (other !== item) {
                        other.classList.remove('dropdown-active');
                        const otherBtn = other.querySelector('.dropdown-trigger');
                        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                    }
                });

                item.classList.toggle('dropdown-active', !isActive);
                trigger.setAttribute('aria-expanded', !isActive ? 'true' : 'false');
            });
        });

        // 3. Cerrar dropdowns al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-item-dropdown')) {
                closeAllDropdowns();
            }
            if (navLinks && navLinks.classList.contains('nav-open') && !e.target.closest('#mainNavbar')) {
                navLinks.classList.remove('nav-open');
                if (toggleBtn) {
                    toggleBtn.textContent = '☰';
                    toggleBtn.setAttribute('aria-expanded', 'false');
                }
            }
        });

        // 4. Accesibilidad: Cerrar con tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeAllDropdowns();
                if (navLinks && navLinks.classList.contains('nav-open')) {
                    navLinks.classList.remove('nav-open');
                    if (toggleBtn) {
                        toggleBtn.textContent = '☰';
                        toggleBtn.setAttribute('aria-expanded', 'false');
                        toggleBtn.focus();
                    }
                }
            }
        });

        // 5. Scroll dinámico de Navbar (efecto glassmorphism compacto)
        if (navbar) {
            const onScroll = () => {
                const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
                if (currentScroll > 30) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            };
            window.addEventListener('scroll', onScroll, { passive: true });
            onScroll();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavbar);
    } else {
        initNavbar();
    }
})();
