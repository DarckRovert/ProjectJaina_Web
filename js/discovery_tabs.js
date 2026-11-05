/**
 * ===============================================================================
 * Project JAIna — Enrutador Reactivo de Pestañas & Deep-Linking (v7.4.0)
 * Archivo: js/discovery_tabs.js
 * Autor: Claude Mythos 5 (L9 Staff Software Engineer)
 * ===============================================================================
 * Resuelve de forma infalible la navegación entre pestañas y anclas del Navbar,
 * evitando el colapso de enlaces directos a secciones con display: none y
 * compensando la altura combinada de la Navbar fija y la barra de pestañas sticky.
 * ===============================================================================
 */

(function () {
    'use strict';

    // Mapeo exhaustivo y autoritativo: ID de Sección -> ID de Pestaña Contenedora
    const SECTION_TO_TAB_MAP = {
        // Tab 1: Lore Viviente & Héroes
        'campeones-soberanos': 'tab-lore',
        'living-lore': 'tab-lore',
        'mundo-viviente': 'tab-lore',
        'trailer-cinematico': 'tab-lore',

        // Tab 2: Fases, Reinos & Desafíos
        'fase-beta': 'tab-fases',
        'linea-de-fases': 'tab-fases',
        'modos-de-juego': 'tab-fases',
        'economia-del-reino': 'tab-fases',

        // Tab 3: Tecnología, AddOns & WebClient
        'addons-showcase': 'tab-tech',
        'escaparate-web': 'tab-tech',
        'tres-formas-de-jugar': 'tab-tech',
        'juego-movil': 'tab-tech',
        'por-que-jaina': 'tab-tech',

        // Tab 4: Comunidad, Música & Taberna
        'fonoteca-taberna': 'tab-comunidad',
        'comunidad-creadores': 'tab-comunidad',
        'serverFundingSection': 'tab-comunidad',
        'financiacion': 'tab-comunidad'
    };

    const VALID_TABS = ['tab-lore', 'tab-fases', 'tab-tech', 'tab-comunidad'];
    const DEFAULT_TAB = 'tab-lore';

    let currentActiveTab = null;

    /**
     * Calcula la compensación dinámica combinada (Navbar fija + Tabs Sticky)
     */
    function getDynamicHeaderOffset() {
        const navbar = document.getElementById('mainNavbar');
        const tabsNav = document.querySelector('.discovery-tabs-nav-wrapper');
        const navH = navbar ? navbar.offsetHeight : 70;
        const tabsH = tabsNav ? tabsNav.offsetHeight : 65;
        // Compensación combinada + margen visual de holgura
        return navH + tabsH + 24;
    }

    /**
     * Activa una pestaña específica y sincroniza botones y paneles
     */
    function activateTab(tabId, shouldReposition = false) {
        if (!VALID_TABS.includes(tabId)) {
            tabId = DEFAULT_TAB;
        }

        if (currentActiveTab === tabId) {
            return;
        }

        const buttons = document.querySelectorAll('.discovery-tab-btn');
        const panes = document.querySelectorAll('.discovery-tab-pane');

        buttons.forEach(btn => {
            const target = btn.getAttribute('data-target-tab');
            const isActive = target === tabId;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        panes.forEach(pane => {
            const isTarget = pane.id === tabId;
            pane.classList.toggle('active', isTarget);
        });

        currentActiveTab = tabId;

        // Si el usuario cambia de pestaña estando por debajo del Hub, reposicionar arriba del contenido
        if (shouldReposition) {
            const tabsNav = document.querySelector('.discovery-tabs-nav-wrapper');
            const navbar = document.getElementById('mainNavbar');
            if (tabsNav) {
                const navRect = tabsNav.getBoundingClientRect();
                const navH = navbar ? navbar.offsetHeight : 70;
                // Si la barra ya está pegada o el usuario está scrolleado abajo
                if (navRect.top <= (navH + 20)) {
                    const topPos = tabsNav.getBoundingClientRect().top + window.pageYOffset - (navH + 15);
                    window.scrollTo({ top: Math.max(0, topPos), behavior: 'smooth' });
                }
            }
        }

        // Notificar a módulos desacoplados (como el canvas del Jukebox o animaciones)
        window.dispatchEvent(new CustomEvent('jaina:tabChanged', { detail: { activeTab: tabId } }));
    }

    /**
     * Resuelve y navega hacia un ancla interna profunda (#id)
     */
    function navigateToSection(targetId) {
        if (!targetId) return false;

        // Caso 1: El target es directamente una de las pestañas maestras
        if (VALID_TABS.includes(targetId)) {
            activateTab(targetId, true);
            return true;
        }

        // Caso 2: El target está contenido dentro de una pestaña
        const parentTab = SECTION_TO_TAB_MAP[targetId];
        if (parentTab) {
            activateTab(parentTab, false);

            // Doble ciclo de requestAnimationFrame para asegurar reflow completo de display: block
            requestAnimationFrame(() => {
                setTimeout(() => {
                    const targetEl = document.getElementById(targetId);
                    if (targetEl) {
                        const offset = getDynamicHeaderOffset();
                        const targetY = targetEl.getBoundingClientRect().top + window.pageYOffset - offset;

                        window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });

                        // Resaltado visual momentáneo
                        targetEl.classList.remove('section-deep-highlight');
                        void targetEl.offsetWidth; // Forzar reflow
                        targetEl.classList.add('section-deep-highlight');
                    }
                }, 90);
            });
            return true;
        }

        // Caso 3: Sección global fuera de pestañas (#como-jugar, #los-4-pilares, #empezar-en-3-pasos)
        const globalEl = document.getElementById(targetId);
        if (globalEl) {
            const navbar = document.getElementById('mainNavbar');
            const navH = navbar ? navbar.offsetHeight : 70;
            const targetY = globalEl.getBoundingClientRect().top + window.pageYOffset - (navH + 20);
            window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
            return true;
        }

        return false;
    }

    /**
     * Intercepta clics en enlaces con ancla href="#..."
     */
    function attachAnchorInterceptors() {
        document.addEventListener('click', (e) => {
            const anchor = e.target.closest('a[href*="#"]');
            if (!anchor) return;

            const href = anchor.getAttribute('href');
            if (!href || href === '#' || href.startsWith('javascript:')) return;

            const hashIndex = href.indexOf('#');
            if (hashIndex === -1) return;

            const hashTarget = href.substring(hashIndex + 1);
            if (!hashTarget) return;

            const isLocal = !href.includes('/') || href.startsWith('#') || href.startsWith(window.location.pathname);
            if (isLocal && (SECTION_TO_TAB_MAP[hashTarget] || VALID_TABS.includes(hashTarget))) {
                e.preventDefault();
                history.replaceState(null, '', `#${hashTarget}`);
                navigateToSection(hashTarget);
            }
        });
    }

    /**
     * Inicialización del Hub al cargar el DOM
     */
    function initDiscoveryTabs() {
        const buttons = document.querySelectorAll('.discovery-tab-btn');
        if (!buttons.length) return;

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-target-tab');
                if (targetTab) {
                    history.replaceState(null, '', `#${targetTab}`);
                    activateTab(targetTab, true);
                }
            });
        });

        attachAnchorInterceptors();

        // Procesar hash inicial si el usuario ingresó por URL con ancla
        const initialHash = window.location.hash.replace('#', '').trim();
        if (initialHash) {
            setTimeout(() => {
                navigateToSection(initialHash);
            }, 180);
        } else {
            activateTab(DEFAULT_TAB, false);
        }

        // Escuchar cambios de hash por historial (back/forward del navegador)
        window.addEventListener('hashchange', () => {
            const currentHash = window.location.hash.replace('#', '').trim();
            if (currentHash) {
                navigateToSection(currentHash);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDiscoveryTabs);
    } else {
        initDiscoveryTabs();
    }
})();
