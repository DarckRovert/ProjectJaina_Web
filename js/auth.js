/**
 * Project JAIna — Módulo Maestro de Autenticación de Jugadores y Modal de Login
 * Conexión autoritativa SRP6 con acore_auth y visor de personajes en tiempo real.
 * Cero dependencias · Máxima compatibilidad cross-page.
 */
(function () {
    'use strict';

    const STORAGE_KEY_USER = 'pj_auth_user';
    const STORAGE_KEY_TOKEN = 'pj_auth_token';

    function getApiUrl() {
        if (typeof CONFIG !== 'undefined' && typeof CONFIG.getApiUrl === 'function') {
            return CONFIG.getApiUrl();
        }
        return 'http://127.0.0.1:8080';
    }

    function getBasePath() {
        const path = window.location.pathname.toLowerCase();
        if (path.includes('/wiki/') || path.includes('/voz/')) {
            return '../';
        }
        return '';
    }

    function getCurrentUser() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_USER);
            return raw ? JSON.parse(raw) : null;
        } catch (_) {
            return null;
        }
    }

    function saveSession(user, token) {
        try {
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
            if (token) localStorage.setItem(STORAGE_KEY_TOKEN, token);
            window.dispatchEvent(new CustomEvent('pj:auth:changed', { detail: { user, loggedIn: true } }));
        } catch (e) {
            console.error('[AUTH] Error guardando sesión:', e);
        }
    }

    function clearSession() {
        try {
            localStorage.removeItem(STORAGE_KEY_USER);
            localStorage.removeItem(STORAGE_KEY_TOKEN);
            window.dispatchEvent(new CustomEvent('pj:auth:changed', { detail: { user: null, loggedIn: false } }));
        } catch (e) {
            console.error('[AUTH] Error cerrando sesión:', e);
        }
    }

    // =========================================================================
    // 1. Inyección Dinámica del Modal de Inicio de Sesión
    // =========================================================================
    function ensureModalInDOM() {
        if (document.getElementById('pjLoginModalOverlay')) return;
        const basePath = getBasePath();

        const modalHtml = `
        <div id="pjLoginModalOverlay" class="pj-modal-overlay" aria-hidden="true">
            <div class="pj-modal-card" role="dialog" aria-modal="true" aria-labelledby="pjModalTitle">
                <button type="button" class="pj-modal-close" id="pjModalCloseBtn" aria-label="Cerrar ventana">✕</button>
                
                <div class="pj-modal-header">
                    <div class="pj-modal-rune">🛡️</div>
                    <h3 id="pjModalTitle" class="pj-modal-title">INICIAR SESIÓN</h3>
                    <p class="pj-modal-subtitle">Accede a tu cuenta de juego en <strong>Project JAIna (WotLK 3.3.5a)</strong></p>
                </div>

                <div id="pjLoginAlert" class="pj-modal-alert" style="display: none;"></div>

                <form id="pjLoginForm" class="pj-modal-form" autocomplete="on">
                    <div class="pj-form-group">
                        <label for="pjLoginUser">NOMBRE DE CUENTA (USUARIO)</label>
                        <div class="pj-input-wrap">
                            <span class="pj-input-icon">👤</span>
                            <input type="text" id="pjLoginUser" name="username" placeholder="Ingresa tu usuario de juego" required autofocus autocomplete="username" spellcheck="false">
                        </div>
                    </div>

                    <div class="pj-form-group">
                        <label for="pjLoginPass">CONTRASEÑA</label>
                        <div class="pj-input-wrap">
                            <span class="pj-input-icon">🔑</span>
                            <input type="password" id="pjLoginPass" name="password" placeholder="••••••••" required autocomplete="current-password">
                            <button type="button" id="pjTogglePassBtn" class="pj-pass-toggle" title="Mostrar/ocultar contraseña" tabindex="-1">👁️</button>
                        </div>
                    </div>

                    <div class="pj-form-options">
                        <label class="pj-checkbox-label">
                            <input type="checkbox" id="pjRememberMe" checked>
                            <span>Recordar sesión</span>
                        </label>
                        <a href="https://discord.gg/YFpGGy8RGR" target="_blank" rel="noopener noreferrer" class="pj-forgot-link">¿Olvidaste tu clave?</a>
                    </div>

                    <button type="submit" id="pjBtnSubmitLogin" class="pj-btn-login-submit">
                        <span class="pj-btn-label">ENTRAR AL REINO</span>
                        <span class="pj-btn-arrow">➔</span>
                    </button>
                </form>

                <div class="pj-modal-footer">
                    <span>¿Aún no tienes cuenta?</span>
                    <a href="${basePath}registro.html" class="pj-register-link">Crear Cuenta Gratis (1 Clic)</a>
                </div>
            </div>
        </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        attachModalEvents();
    }

    function openModal() {
        ensureModalInDOM();
        const overlay = document.getElementById('pjLoginModalOverlay');
        const alertBox = document.getElementById('pjLoginAlert');
        if (alertBox) {
            alertBox.style.display = 'none';
            alertBox.textContent = '';
            alertBox.className = 'pj-modal-alert';
        }
        if (overlay) {
            overlay.classList.add('pj-modal-visible');
            overlay.setAttribute('aria-hidden', 'false');
            document.body.classList.add('pj-modal-open');
            setTimeout(() => {
                const userField = document.getElementById('pjLoginUser');
                if (userField) userField.focus();
            }, 100);
        }
    }

    function closeModal() {
        const overlay = document.getElementById('pjLoginModalOverlay');
        if (overlay) {
            overlay.classList.remove('pj-modal-visible');
            overlay.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('pj-modal-open');
        }
    }

    function attachModalEvents() {
        const overlay = document.getElementById('pjLoginModalOverlay');
        const closeBtn = document.getElementById('pjModalCloseBtn');
        const form = document.getElementById('pjLoginForm');
        const togglePassBtn = document.getElementById('pjTogglePassBtn');
        const passInput = document.getElementById('pjLoginPass');

        if (closeBtn) closeBtn.addEventListener('click', closeModal);

        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeModal();
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay && overlay.classList.contains('pj-modal-visible')) {
                closeModal();
            }
        });

        if (togglePassBtn && passInput) {
            togglePassBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const isPass = passInput.getAttribute('type') === 'password';
                passInput.setAttribute('type', isPass ? 'text' : 'password');
                togglePassBtn.textContent = isPass ? '🔒' : '👁️';
            });
        }

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await handleLoginSubmit();
            });
        }
    }

    async function handleLoginSubmit() {
        const userInput = document.getElementById('pjLoginUser');
        const passInput = document.getElementById('pjLoginPass');
        const alertBox = document.getElementById('pjLoginAlert');
        const submitBtn = document.getElementById('pjBtnSubmitLogin');

        const username = userInput ? userInput.value.trim() : '';
        const password = passInput ? passInput.value : '';

        if (!username || !password) {
            showModalAlert('Por favor completa ambos campos.', 'error');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="pj-spinner"></span> Conectando al Reino...';

        const apiUrl = getApiUrl();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000);

        try {
            const resp = await fetch(`${apiUrl}/api/auth/login`, {
                method: 'POST',
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ username, password })
            });
            clearTimeout(timeoutId);

            const data = await resp.json().catch(() => null);

            if (resp.ok && data && data.ok) {
                showModalAlert(data.message || `¡Bienvenido, ${data.user.username}!`, 'success');
                saveSession(data.user, data.token);

                setTimeout(() => {
                    closeModal();
                    if (userInput) userInput.value = '';
                    if (passInput) passInput.value = '';
                    updateNavbarAuthUI();
                }, 900);
            } else {
                const msg = (data && data.message) ? data.message : 'Error al validar credenciales.';
                showModalAlert(msg, 'error');
            }
        } catch (err) {
            clearTimeout(timeoutId);
            const isAbort = err.name === 'AbortError';
            showModalAlert(isAbort ? 'Tiempo de espera agotado al conectar con el servidor.' : 'No se pudo conectar con el servidor de autenticación.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span class="pj-btn-label">ENTRAR AL REINO</span><span class="pj-btn-arrow">➔</span>';
        }
    }

    function showModalAlert(message, type) {
        const alertBox = document.getElementById('pjLoginAlert');
        if (!alertBox) return;
        alertBox.textContent = message;
        alertBox.className = `pj-modal-alert pj-alert-${type}`;
        alertBox.style.display = 'block';
    }

    // =========================================================================
    // 2. Renderizado del Estado de Autenticación en la Barra Superior (Navbar)
    // =========================================================================
    function updateNavbarAuthUI() {
        const user = getCurrentUser();
        const tray = document.querySelector('.nav-actions-tray');
        if (!tray) return;

        let container = document.getElementById('authNavContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'authNavContainer';
            container.className = 'auth-nav-container';

            // Insertar antes del botón de CTA "Jugar Gratis" o al inicio de la bandeja
            const ctaBtn = tray.querySelector('.btn-cta-nav');
            if (ctaBtn) {
                tray.insertBefore(container, ctaBtn);
            } else {
                tray.prepend(container);
            }
        }

        if (!user) {
            // Estado: NO LOGUEADO -> Botón Iniciar Sesión
            container.innerHTML = `
                <button id="btnOpenLoginModal" class="btn-login-nav" type="button" title="Acceder a tu cuenta oficial">
                    <span class="btn-login-icon">👤</span>
                    <span class="btn-login-text">Iniciar Sesión</span>
                </button>
            `;
            const btn = document.getElementById('btnOpenLoginModal');
            if (btn) btn.addEventListener('click', openModal);
        } else {
            // Estado: LOGUEADO -> Pill interactivo con avatar y menú desplegable
            const charCount = (user.characters && user.characters.length) || 0;
            const topChar = charCount > 0 ? user.characters[0] : null;
            const gmBadge = user.gmlevel > 0 ? `<span class="pj-pill-gm">GM</span>` : '';
            
            let charsHtml = '';
            if (charCount > 0) {
                charsHtml = user.characters.slice(0, 3).map(c => `
                    <div class="pj-user-char-item">
                        <span class="pj-char-badge">Nvl ${c.level}</span>
                        <span class="pj-char-name">${c.name}</span>
                        <span class="pj-char-meta">${c.race_name} ${c.class_name}</span>
                    </div>
                `).join('');
            } else {
                charsHtml = `<div class="pj-user-no-chars">Sin personajes en el reino aún.</div>`;
            }

            container.innerHTML = `
                <div class="pj-user-pill-wrap" id="pjUserPillWrap">
                    <button class="pj-user-pill-btn" id="pjUserPillBtn" type="button" aria-expanded="false">
                        <span class="pj-pill-avatar">⚔️</span>
                        <span class="pj-pill-name">${user.username}</span>
                        ${gmBadge}
                        <span class="pj-pill-chevron">▼</span>
                    </button>
                    <div class="pj-user-dropdown" id="pjUserDropdown">
                        <div class="pj-ud-header">
                            <div class="pj-ud-user">${user.username}</div>
                            <div class="pj-ud-title">${user.gmtitle || 'Aventurero de Azeroth'}</div>
                            <div class="pj-ud-email">${user.email}</div>
                        </div>
                        <div class="pj-ud-divider"></div>
                        <div class="pj-ud-section-label">⚔️ Mis Personajes (${charCount})</div>
                        <div class="pj-ud-chars">${charsHtml}</div>
                        <div class="pj-ud-divider"></div>
                        <a href="${basePath}cuenta.html" class="pj-ud-link" style="color:var(--gold-primary); font-weight:700; background:rgba(245,158,11,0.1); border-radius:6px;"><span class="pj-ud-link-icon">👑</span> Panel de Mi Cuenta</a>
                        <a href="${basePath}armeria.html" class="pj-ud-link"><span class="pj-ud-link-icon">🛡️</span> Armería de Campeones</a>
                        <a href="${basePath}tienda.html" class="pj-ud-link"><span class="pj-ud-link-icon">💎</span> Tienda & Donaciones</a>
                        <a href="${basePath}bugs.html" class="pj-ud-link"><span class="pj-ud-link-icon">🐛</span> Reportar un Error</a>
                        <div class="pj-ud-divider"></div>
                        <button type="button" id="pjBtnLogout" class="pj-ud-logout">🚪 Cerrar Sesión</button>
                    </div>
                </div>
            `;

            const pillBtn = document.getElementById('pjUserPillBtn');
            const dropdown = document.getElementById('pjUserDropdown');
            const logoutBtn = document.getElementById('pjBtnLogout');

            if (pillBtn && dropdown) {
                pillBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isOpen = dropdown.classList.toggle('pj-ud-active');
                    pillBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
                });

                document.addEventListener('click', (e) => {
                    if (!e.target.closest('#pjUserPillWrap')) {
                        dropdown.classList.remove('pj-ud-active');
                        pillBtn.setAttribute('aria-expanded', 'false');
                    }
                });
            }

            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    clearSession();
                    updateNavbarAuthUI();
                });
            }
        }
    }

    // =========================================================================
    // 3. Inicialización Automática
    // =========================================================================
    function init() {
        ensureModalInDOM();
        updateNavbarAuthUI();

        window.addEventListener('pj:auth:changed', () => {
            updateNavbarAuthUI();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Exponer API global ligera
    window.ProjectJainaAuth = {
        openLogin: openModal,
        closeLogin: closeModal,
        getUser: getCurrentUser,
        logout: clearSession,
        refreshUI: updateNavbarAuthUI
    };

})();
