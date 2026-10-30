/**
 * Project JAIna — Master Navigation, Responsive Drawer & Kirin Tor Dialog Suite v7.1
 * Manejo unificado de menús desplegables, drawer móvil y notificaciones no bloqueantes
 * (showPortalToast · showPortalConfirm · showPortalPrompt)
 */
(function () {
    'use strict';

    function sanitizePortalHtml(raw) {
        if (raw === null || raw === undefined) return '';
        let str = String(raw);
        // Eliminar etiquetas ejecutables o peligrosas y manejadores inline on*=
        str = str.replace(/<\s*(script|iframe|object|embed|style|link|meta)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '');
        str = str.replace(/<\s*(script|iframe|object|embed|style|link|meta)[^>]*\/?>/gi, '');
        str = str.replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
        str = str.replace(/javascript\s*:/gi, '');
        if (!/<br\s*\/?>/i.test(str) && str.indexOf('\n') !== -1) {
            str = str.replace(/\n/g, '<br>');
        }
        return str;
    }

    function dismissPortalToast(toast) {
        if (!toast || toast.classList.contains('toast-closing')) return;
        toast.classList.add('toast-closing');
        toast.classList.remove('toast-show');
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
    }

    function showPortalToast(messageHtml, type = 'info', duration = 4200) {
        if (!document.body) return;
        let container = document.getElementById('portalToastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'portalToastContainer';
            container.className = 'portal-toast-container';
            container.setAttribute('aria-live', 'polite');
            document.body.appendChild(container);
        }

        const dock = document.querySelector('.jb-floating-dock.visible');
        container.classList.toggle('dock-offset', Boolean(dock));

        const normType = ['success', 'warning', 'error', 'info', 'arcane'].includes(type) ? type : 'info';
        const toast = document.createElement('div');
        toast.className = `portal-toast toast-${normType}`;

        const icons = {
            success: '✓',
            warning: '⚠️',
            error: '🛡️',
            info: '🌐',
            arcane: '✨'
        };
        const icon = icons[normType] || '✨';
        const safeHtml = sanitizePortalHtml(messageHtml);
        const ms = Math.max(1800, Number(duration) || 4200);

        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">${safeHtml}</div>
            <button type="button" class="toast-close" aria-label="Cerrar notificación">&times;</button>
            <div class="toast-progress" style="animation-duration:${ms}ms;"></div>
        `;

        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) closeBtn.addEventListener('click', () => dismissPortalToast(toast));

        container.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('toast-show'));

        let timer = setTimeout(() => dismissPortalToast(toast), ms);
        toast.addEventListener('mouseenter', () => {
            clearTimeout(timer);
            const bar = toast.querySelector('.toast-progress');
            if (bar) bar.style.animationPlayState = 'paused';
        });
        toast.addEventListener('mouseleave', () => {
            const bar = toast.querySelector('.toast-progress');
            if (bar) bar.style.animationPlayState = 'running';
            timer = setTimeout(() => dismissPortalToast(toast), 1800);
        });
    }

    function showPortalConfirm(opts) {
        return new Promise((resolve) => {
            const cfg = (typeof opts === 'string')
                ? { title: 'Confirmación del Kirin Tor', messageHtml: opts }
                : (opts || {});
            const title = sanitizePortalHtml(cfg.title || 'Confirmar Acción');
            const msg = sanitizePortalHtml(cfg.messageHtml || cfg.message || '¿Deseas continuar con esta operación?');
            const confirmText = sanitizePortalHtml(cfg.confirmText || 'Confirmar');
            const cancelText = sanitizePortalHtml(cfg.cancelText || 'Cancelar');
            const isDanger = Boolean(cfg.danger);
            const icon = cfg.icon || (isDanger ? '⚠️' : '🛡️');

            const overlay = document.createElement('div');
            overlay.className = 'pj-dialog-overlay';
            overlay.innerHTML = `
                <div class="pj-dialog-card" role="dialog" aria-modal="true">
                    <div class="pj-dialog-header">
                        <span class="pj-dialog-icon">${icon}</span>
                        <h3 class="pj-dialog-title">${title}</h3>
                    </div>
                    <div class="pj-dialog-body">${msg}</div>
                    <div class="pj-dialog-actions">
                        <button type="button" class="pj-dialog-btn pj-dialog-btn-cancel">${cancelText}</button>
                        <button type="button" class="pj-dialog-btn ${isDanger ? 'pj-dialog-btn-danger' : 'pj-dialog-btn-confirm'}">${confirmText}</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
            requestAnimationFrame(() => overlay.classList.add('active'));

            const btnCancel = overlay.querySelector('.pj-dialog-btn-cancel');
            const btnOk = overlay.querySelector('.pj-dialog-btn-confirm, .pj-dialog-btn-danger');

            function cleanup(result) {
                document.removeEventListener('keydown', onKey);
                overlay.classList.remove('active');
                setTimeout(() => {
                    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                }, 200);
                resolve(result);
            }

            function onKey(e) {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    cleanup(false);
                } else if (e.key === 'Enter' && document.activeElement !== btnCancel) {
                    e.preventDefault();
                    cleanup(true);
                }
            }

            document.addEventListener('keydown', onKey);
            btnCancel.addEventListener('click', () => cleanup(false));
            btnOk.addEventListener('click', () => cleanup(true));
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) cleanup(false);
            });
            setTimeout(() => btnOk.focus(), 40);
        });
    }

    function showPortalPrompt(opts) {
        return new Promise((resolve) => {
            const cfg = (typeof opts === 'string')
                ? { title: 'Entrada Requerida', messageHtml: opts }
                : (opts || {});
            const title = sanitizePortalHtml(cfg.title || 'Selección del Jugador');
            const msg = sanitizePortalHtml(cfg.messageHtml || cfg.message || '');
            const confirmText = sanitizePortalHtml(cfg.confirmText || 'Aceptar');
            const cancelText = sanitizePortalHtml(cfg.cancelText || 'Cancelar');
            const defaultVal = cfg.defaultValue !== undefined ? String(cfg.defaultValue) : '';
            const placeholder = cfg.placeholder || 'Escribe aquí...';
            const options = Array.isArray(cfg.options) ? cfg.options.filter(Boolean) : [];

            let fieldHtml = '';
            if (options.length > 0) {
                const optsHtml = options.map((opt) => {
                    const val = String(opt).replace(/"/g, '&quot;');
                    const sel = (String(opt) === defaultVal) ? ' selected' : '';
                    return `<option value="${val}"${sel}>${sanitizePortalHtml(opt)}</option>`;
                }).join('');
                fieldHtml = `<select class="pj-dialog-select" id="pjDialogPromptField">${optsHtml}</select>`;
            } else {
                const safeDef = defaultVal.replace(/"/g, '&quot;');
                const safePh = placeholder.replace(/"/g, '&quot;');
                fieldHtml = `<input type="text" class="pj-dialog-input" id="pjDialogPromptField" value="${safeDef}" placeholder="${safePh}" autocomplete="off" spellcheck="false">`;
            }

            const overlay = document.createElement('div');
            overlay.className = 'pj-dialog-overlay';
            overlay.innerHTML = `
                <div class="pj-dialog-card" role="dialog" aria-modal="true">
                    <div class="pj-dialog-header">
                        <span class="pj-dialog-icon">${cfg.icon || '✨'}</span>
                        <h3 class="pj-dialog-title">${title}</h3>
                    </div>
                    <div class="pj-dialog-body">
                        <div style="margin-bottom: 0.85rem;">${msg}</div>
                        ${fieldHtml}
                    </div>
                    <div class="pj-dialog-actions">
                        <button type="button" class="pj-dialog-btn pj-dialog-btn-cancel">${cancelText}</button>
                        <button type="button" class="pj-dialog-btn pj-dialog-btn-confirm">${confirmText}</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
            requestAnimationFrame(() => overlay.classList.add('active'));

            const field = overlay.querySelector('#pjDialogPromptField');
            const btnCancel = overlay.querySelector('.pj-dialog-btn-cancel');
            const btnOk = overlay.querySelector('.pj-dialog-btn-confirm');

            function cleanup(val) {
                document.removeEventListener('keydown', onKey);
                overlay.classList.remove('active');
                setTimeout(() => {
                    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                }, 200);
                resolve(val);
            }

            function onKey(e) {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    cleanup(null);
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    cleanup(field ? field.value.trim() : '');
                }
            }

            document.addEventListener('keydown', onKey);
            btnCancel.addEventListener('click', () => cleanup(null));
            btnOk.addEventListener('click', () => cleanup(field ? field.value.trim() : ''));
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) cleanup(null);
            });
            setTimeout(() => {
                if (field) {
                    field.focus();
                    if (field.select) field.select();
                }
            }, 40);
        });
    }

    window.showPortalToast = showPortalToast;
    window.showPortalConfirm = showPortalConfirm;
    window.showPortalPrompt = showPortalPrompt;

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

        if (toggleBtn && navLinks) {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = navLinks.classList.toggle('nav-open');
                toggleBtn.textContent = isOpen ? '✕' : '☰';
                toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            });

            navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    navLinks.classList.remove('nav-open');
                    toggleBtn.textContent = '☰';
                    toggleBtn.setAttribute('aria-expanded', 'false');
                    closeAllDropdowns();
                });
            });
        }

        dropdownItems.forEach(item => {
            const trigger = item.querySelector('.dropdown-trigger');
            if (!trigger) return;

            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const isActive = item.classList.contains('dropdown-active');

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
