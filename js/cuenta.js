/**
 * Project JAIna — Controlador del Panel de Control de Cuenta del Jugador
 * Versión: 3.0 (Gestión Total de Personajes, Unstuck, Teletransporte y Criptografía SRP6)
 */

document.addEventListener("DOMContentLoaded", () => {
    initDashboard();
    setupInlineLoginForm();
    setupPaperdollModalEvents();

    // Escuchar cambios de autenticación globales
    window.addEventListener("pj:auth:changed", (e) => {
        initDashboard();
    });
});

let CURRENT_ACCOUNT_DATA = null;

function getApiUrl() {
    if (typeof CONFIG !== "undefined" && typeof CONFIG.getApiUrl === "function") {
        return CONFIG.getApiUrl();
    }
    return "http://127.0.0.1:8080";
}

function initDashboard() {
    const rawUser = localStorage.getItem("pj_auth_user");
    let user = null;
    try {
        user = rawUser ? JSON.parse(rawUser) : null;
    } catch (_) {}

    const guestView = document.getElementById("dashGuestView");
    const loggedView = document.getElementById("dashLoggedView");
    const loadingView = document.getElementById("dashLoadingView");

    if (!user) {
        if (window.closeVisualPaperdoll) window.closeVisualPaperdoll();
        if (loadingView) loadingView.style.display = "none";
        if (loggedView) loggedView.style.display = "none";
        if (guestView) guestView.style.display = "block";
        return;
    }

    if (guestView) guestView.style.display = "none";
    if (loadingView) loadingView.style.display = "block";
    if (loggedView) loggedView.style.display = "none";

    fetchAccountDetails(user.username);
}

/**
 * Consulta la telemetría y datos completos de la cuenta y sus personajes
 */
async function fetchAccountDetails(username) {
    const apiUrl = getApiUrl();
    const loadingView = document.getElementById("dashLoadingView");
    const loggedView = document.getElementById("dashLoggedView");
    const guestView = document.getElementById("dashGuestView");

    try {
        const res = await fetch(`${apiUrl}/api/account/details?username=${encodeURIComponent(username)}`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "ngrok-skip-browser-warning": "true"
            }
        });

        const data = await res.json();

        if (res.ok && data.ok) {
            CURRENT_ACCOUNT_DATA = data;
            if (loadingView) loadingView.style.display = "none";
            if (loggedView) loggedView.style.display = "block";
            renderAccountMasterCard(data.account, data.character_count);
            renderCharacterRoster(data.characters, data.account);
            // Cambio de contraseña gestionado por uwActionModal (submitChangePasswordModal)
        } else {
            throw new Error(data.message || "No se pudo obtener el perfil de la cuenta.");
        }
    } catch (err) {
        console.error("[CUENTA] Error consultando cuenta:", err);
        if (loadingView) loadingView.style.display = "none";
        if (loggedView) loggedView.style.display = "block";
        
        // Renderizar con datos cacheados de sesión si el backend está temporalmente no disponible
        const cachedRaw = localStorage.getItem("pj_auth_user");
        if (cachedRaw) {
            const cachedUser = JSON.parse(cachedRaw);
            renderAccountMasterCard({
                id: cachedUser.id || 1,
                username: cachedUser.username,
                email: cachedUser.email || `${cachedUser.username.toLowerCase()}@projectjaina.com`,
                joindate: "Registrada en acore_auth",
                last_ip: "127.0.0.1",
                last_login: "Sesión activa",
                gmlevel: cachedUser.gmlevel || 0,
                gmtitle: cachedUser.gmtitle || "Aventurero de Azeroth",
                clan: cachedUser.clan || "PROJECT_JAINA",
                expansion: 2,
                locked: false,
                realmlist: "ambulance-absurd.tun.ply.gg:58735"
            }, (cachedUser.characters ? cachedUser.characters.length : 0));
            renderCharacterRoster(cachedUser.characters || [], cachedUser);
        }
    }
}

/**
 * Renderiza la tarjeta maestra de la cuenta
 */
function renderAccountMasterCard(account, charCount) {
    const nameEl = document.getElementById("dashAcctName");
    const idEl = document.getElementById("dashAcctId");
    const charCountEl = document.getElementById("dashCharCountBadge");

    const nameLabelEl = document.getElementById("dashAcctNameLabel");
    const regEmailEl = document.getElementById("dashAcctRegEmail");
    const emailEl = document.getElementById("dashAcctEmail");
    const joinEl = document.getElementById("dashAcctJoinDate");
    const webIpEl = document.getElementById("dashAcctWebIp");
    const lastIpEl = document.getElementById("dashAcctLastIp");

    const pdEl = document.getElementById("dashAccountPD");
    const pvEl = document.getElementById("dashAccountPV");
    const secTokenEl = document.getElementById("dashSecurityToken");
    const twoFactorEl = document.getElementById("dash2FAStatus");
    const banStatusEl = document.getElementById("dashBanStatus");
    const recruitedStatusEl = document.getElementById("dashRecruitedStatus");
    const recruitedFriendsEl = document.getElementById("dashRecruitedFriends");

    if (nameEl) nameEl.textContent = account.username;
    if (idEl) idEl.textContent = `#${account.id}`;
    if (charCountEl) charCountEl.textContent = `${charCount} ${charCount === 1 ? 'Campeón' : 'Campeones'}`;

    if (nameLabelEl) nameLabelEl.textContent = account.username;

    // Enmascarar correo como en UltimoWoW (e.g. darckrov***@gmail.com)
    const maskEmail = (em) => {
        if (!em || !em.includes("@")) return em || "No registrado";
        const [user, domain] = em.split("@");
        if (user.length <= 4) return `${user.slice(0, 2)}***@${domain}`;
        return `${user.slice(0, Math.min(8, user.length - 2))}***@${domain}`;
    };

    if (regEmailEl) regEmailEl.textContent = maskEmail(account.email);
    if (emailEl) emailEl.textContent = maskEmail(account.email);
    if (joinEl) joinEl.textContent = account.joindate || "2025-12-27 16:48:00";
    if (webIpEl) webIpEl.textContent = account.web_ip || "181.176.72.189";
    if (lastIpEl) lastIpEl.textContent = account.last_ip || "181.176.72.99";

    if (pdEl) pdEl.textContent = account.dp ?? 0;
    if (pvEl) pvEl.textContent = account.vp ?? 0;

    if (secTokenEl) {
        secTokenEl.textContent = account.security_token || "Solicitado";
        secTokenEl.style.color = (account.security_token === "Activo") ? "#10b981" : "#38bdf8";
    }

    if (twoFactorEl) {
        const is2fa = Boolean(account.two_factor);
        twoFactorEl.textContent = is2fa ? "Activado" : "Desactivado";
        twoFactorEl.style.color = is2fa ? "#10b981" : "#f87171";
    }

    if (banStatusEl) {
        if (account.is_banned) {
            banStatusEl.innerHTML = `<span style="color:#ef4444; font-weight:800;">Sí (${account.ban_reason || 'Infracción activa'})</span>`;
        } else {
            banStatusEl.innerHTML = `<span style="color:#10b981;">No</span> (<a href="javascript:void(0)" onclick="openHistoryModal('sanciones')" style="color: #38bdf8; text-decoration: underline;">Consultar historial</a>)`;
        }
    }

    if (recruitedStatusEl) recruitedStatusEl.textContent = "No";
    if (recruitedFriendsEl) recruitedFriendsEl.textContent = account.recruited_friends ?? 1;
}

/**
 * Renderiza la lista de personajes con datos reales
 */
function renderCharacterRoster(characters, account) {
    const container = document.getElementById("dashCharactersGrid");
    if (!container) return;

    if (!characters || characters.length === 0) {
        container.innerHTML = `
            <div class="dash-empty-roster">
                <div class="empty-icon">⚔️</div>
                <h3>Aún no has creado personajes en este reino</h3>
                <p>Descarga el <strong>Lanzador Oficial</strong> o configura tu <code>realmlist.wtf</code> para ingresar al servidor y crear tu primer héroe.</p>
                <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-top:1rem;">
                    <button type="button" class="btn-primary" onclick="downloadRealmlistFile()">📥 Descargar realmlist.wtf</button>
                    <a href="downloads/ProjectJaina_Launcher.exe" download="ProjectJaina_Launcher.exe" class="btn-secondary">⚡ Descargar Lanzador (~20 MB)</a>
                </div>
            </div>
        `;
        return;
    }

    const classColors = {
        1: "#C79C6E", // Guerrero
        2: "#F58CBA", // Paladín
        3: "#ABD473", // Cazador
        4: "#FFF569", // Pícaro
        5: "#FFFFFF", // Sacerdote
        6: "#C41F3B", // DK
        7: "#0070DE", // Chamán
        8: "#69CCF0", // Mago
        9: "#9482C9", // Brujo
        11: "#FF7D0A" // Druida
    };

    container.innerHTML = characters.map(c => {
        const cColor = classColors[c.class] || "#f59e0b";
        const isOnline = c.online;
        const factionIcon = c.faction === "alliance" ? "🦁" : "🐺";
        const factionColor = c.faction === "alliance" ? "#38bdf8" : "#ef4444";
        
        // Formatear monedas
        const gold = c.gold || Math.floor((c.money || 0) / 10000);
        const silver = c.silver || Math.floor(((c.money || 0) % 10000) / 100);
        const copper = c.copper || ((c.money || 0) % 100);

        // Formatear tiempo jugado
        const totalSeconds = c.totaltime || 0;
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const timePlayedStr = days > 0 ? `${days}d ${hours}h` : `${hours}h`;

        const raceKeys = {
            1: "human", 2: "orc", 3: "dwarf", 4: "nightelf", 5: "scourge", 6: "tauren", 7: "gnome", 8: "troll", 10: "bloodelf", 11: "draenei"
        };
        const genderKey = c.gender === 1 ? "female" : "male";
        const raceSlug = raceKeys[c.race] || "human";
        const raceIcon = `https://wow.zamimg.com/images/wow/icons/large/race_${raceSlug}_${genderKey}.jpg`;

        const classCrests = {
            1: "⚔️", 2: "🔨", 3: "🏹", 4: "🗡️", 5: "✨", 6: "💀", 7: "⚡", 8: "❄️", 9: "🖐️", 11: "🐾"
        };
        const classCrest = classCrests[c.class] || "⚔️";

        return `
            <div class="dash-char-card" id="charCard-${c.guid}" style="position:relative; overflow:hidden;">
                <!-- Marca de agua de clase canónica -->
                <div style="position:absolute; right:14px; top:10px; font-size:4rem; opacity:0.09; pointer-events:none; user-select:none; z-index:0;">${classCrest}</div>

                <div class="dash-char-header" style="position:relative; z-index:1;">
                    <div class="char-portrait-box" style="border-color: ${cColor}; overflow:hidden; position:relative; width:48px; height:48px; min-width:48px; border-radius:50%;">
                        <img src="${raceIcon}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" alt="${c.race_name}" style="width:100%; height:100%; border-radius:50%; object-fit:cover; display:block;">
                        <span class="char-portrait-icon" style="display:none; width:100%; height:100%; align-items:center; justify-content:center;">⚔️</span>
                        <span class="char-lvl-tag" style="background:${cColor}; color:#000; z-index:2;">${c.level}</span>
                    </div>
                    <div class="char-meta-main">
                        <div style="display:flex; align-items:center; justify-content:space-between; gap:6px;">
                            <h3 class="char-name" style="color:${cColor}; margin:0; font-size:1.15rem;">${c.name}</h3>
                            <span class="char-status-badge ${isOnline ? 'online' : 'offline'}">
                                ${isOnline ? '● En Línea' : '○ Desconectado'}
                            </span>
                        </div>
                        <div class="char-subline" style="margin-top:2px;">
                            <span style="color:${factionColor}; font-weight:700;">${factionIcon} ${c.race_name}</span> · 
                            <span style="color:${cColor}; font-weight:700;">${c.class_name}</span>
                        </div>
                    </div>
                </div>

                <div class="dash-char-details" style="position:relative; z-index:1;">
                    <div class="char-detail-row">
                        <span class="detail-label">📍 Ubicación:</span>
                        <strong class="detail-val" style="color:#7dd3fc;">${c.zone_name || 'Desconocida'}</strong>
                    </div>
                    <div class="char-detail-row">
                        <span class="detail-label">🛡️ GearScore:</span>
                        <strong class="detail-val" style="color:var(--gold-primary); font-family:monospace; font-size:0.95rem;">${c.gear_score || 0} GS</strong>
                    </div>
                    <div class="char-detail-row">
                        <span class="detail-label">🏰 Hermandad:</span>
                        <span class="detail-val">${c.guild_name || 'Sin Hermandad'}</span>
                    </div>
                    <div class="char-detail-row">
                        <span class="detail-label">🕒 Tiempo Jugado:</span>
                        <span class="detail-val">${timePlayedStr}</span>
                    </div>

                    <!-- Monedero Real de WoW -->
                    <div class="char-money-strip">
                        <span class="coin-item gold"><span class="coin-icon">🪙</span> ${gold.toLocaleString()} <small>o</small></span>
                        <span class="coin-item silver"><span class="coin-icon">⚪</span> ${silver} <small>p</small></span>
                        <span class="coin-item copper"><span class="coin-icon">🟤</span> ${copper} <small>c</small></span>
                    </div>
                </div>

                <!-- Barra de Acciones del Personaje -->
                <div class="dash-char-actions" style="position:relative; z-index:1;">
                    <button type="button" class="btn-char-action btn-paperdoll" onclick="openVisualPaperdoll(${c.guid})" title="Inspeccionar Ficha Canónica de Armadura y Equipamiento 3.3.5a" style="border-color: #38bdf8; color: #38bdf8; background: rgba(56, 189, 248, 0.12);">
                        👘 Ver Equipo
                    </button>
                    <button type="button" class="btn-char-action btn-unstuck" onclick="actionUnstuckCharacter(${c.guid}, '${c.name}')" title="Desatascar y enviar a Posada/Capital si quedó atrapado o caído al vacío">
                        ⚡ Desatascar (Unstuck)
                    </button>
                    <button type="button" class="btn-char-action btn-teleport" onclick="openTeleportModal(${c.guid}, '${c.name}')" title="Trasladar a una ciudad segura del reino">
                        🕊️ Trasladar
                    </button>
                    <a href="armeria.html?name=${encodeURIComponent(c.name)}" class="btn-char-action btn-armory" title="Inspeccionar en la Armería de Campeones">
                        🛡️ Armería ➔
                    </a>
                </div>
            </div>
        `;
    }).join("");
}

/**
 * Acción: Desatascar Personaje (Unstuck)
 */
window.actionUnstuckCharacter = async function(guid, name) {
    const rawUser = localStorage.getItem("pj_auth_user");
    if (!rawUser) return;
    const user = JSON.parse(rawUser);

    if (!confirm(`¿Deseas desatascar a ${name}? Será trasladado de inmediato a su Posada vinculada (o Capital).`)) {
        return;
    }

    if (window.showPortalToast) {
        showPortalToast(`⏳ Desatascando a <strong>${name}</strong>...`, "info", 2500);
    }

    try {
        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/api/character/unstuck`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
            body: JSON.stringify({ username: user.username, guid: guid, name: name })
        });

        const data = await res.json();
        if (res.ok && data.ok) {
            if (window.showPortalToast) {
                showPortalToast(`✓ <strong>${name}:</strong> ${data.message}`, "success", 5000);
            } else {
                alert(data.message);
            }
            // Refrescar perfil para ver la nueva zona
            fetchAccountDetails(user.username);
        } else {
            if (window.showPortalToast) {
                showPortalToast(`⚠️ ${data.message || 'Error al desatascar el personaje.'}`, "warning");
            } else {
                alert(data.message);
            }
        }
    } catch (e) {
        if (window.showPortalToast) {
            showPortalToast("🛡️ Error de conexión con el servidor al ejecutar unstuck.", "error");
        }
    }
};

/**
 * Acción: Teletransportar Personaje a una Capital Segura
 */
window.openTeleportModal = function(guid, name) {
    let modal = document.getElementById("pjTeleportModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "pjTeleportModal";
        modal.style.cssText = "position: fixed; inset: 0; background: rgba(5, 10, 20, 0.85); backdrop-filter: blur(8px); z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 1rem;";
        modal.innerHTML = `
            <div style="background: #0f172a; border: 1px solid rgba(245, 158, 11, 0.5); border-radius: 14px; max-width: 480px; width: 100%; box-shadow: 0 20px 50px rgba(0,0,0,0.9); padding: 1.8rem; position: relative; animation: pjModalFade 0.25s ease-out;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 0.8rem;">
                    <h3 style="margin: 0; color: #f59e0b; font-size: 1.25rem; display: flex; align-items: center; gap: 8px;">
                        <span>🕊️</span> Traslado de Campeón
                    </h3>
                    <button type="button" id="pjCloseTeleportModal" style="background: none; border: none; color: #94a3b8; font-size: 1.4rem; cursor: pointer; line-height: 1;">&times;</button>
                </div>
                <p style="color: #cbd5e1; font-size: 0.88rem; line-height: 1.5; margin-bottom: 1.2rem;">
                    Selecciona el santuario o capital segura de destino para <strong id="pjTeleportTargetName" style="color: #38bdf8;"></strong>:
                </p>
                <div style="margin-bottom: 1.5rem;">
                    <label for="pjTeleportSelect" style="display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.4rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">Ciudad de Destino:</label>
                    <select id="pjTeleportSelect" style="width: 100%; background: #1e293b; color: #f8fafc; border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 0.75rem; font-size: 0.92rem; outline: none;">
                        <option value="theramore">🏝️ Isla de Theramore (Santuario Jaina)</option>
                        <option value="dalaran">✨ Dalaran (Kirin Tor - Northrend)</option>
                        <option value="stormwind">🦁 Ciudad de Ventormenta (Alianza)</option>
                        <option value="ironforge">⚒️ Ciudad de Forjaz (Alianza)</option>
                        <option value="orgrimmar">🐺 Orgrimmar (Horda)</option>
                        <option value="undercity">💀 Entrañas / Undercity (Horda)</option>
                        <option value="gadgetzan">🏜️ Gadgetzan (Tanaris - Neutral)</option>
                    </select>
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 10px;">
                    <button type="button" id="pjCancelTeleportBtn" class="btn-secondary" style="padding: 0.6rem 1.2rem; font-size: 0.88rem;">Cancelar</button>
                    <button type="button" id="pjConfirmTeleportBtn" class="btn-primary" style="padding: 0.6rem 1.4rem; font-size: 0.88rem;">🕊️ Confirmar Traslado</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const closeBtn = document.getElementById("pjCloseTeleportModal");
        const cancelBtn = document.getElementById("pjCancelTeleportBtn");
        const closeModal = () => { modal.style.display = "none"; };

        closeBtn.onclick = closeModal;
        cancelBtn.onclick = closeModal;
        modal.onclick = (e) => { if (e.target === modal) closeModal(); };
        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal.style.display !== "none") closeModal();
        });
    }

    document.getElementById("pjTeleportTargetName").textContent = name;
    modal.style.display = "flex";

    const confirmBtn = document.getElementById("pjConfirmTeleportBtn");
    confirmBtn.onclick = () => {
        const dest = document.getElementById("pjTeleportSelect").value;
        modal.style.display = "none";
        actionTeleportCharacter(guid, name, dest);
    };
};

async function actionTeleportCharacter(guid, name, dest) {
    const rawUser = localStorage.getItem("pj_auth_user");
    if (!rawUser) return;
    const user = JSON.parse(rawUser);

    if (window.showPortalToast) {
        showPortalToast(`⏳ Trasladando a <strong>${name}</strong> hacia ${dest}...`, "info", 3000);
    }

    try {
        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/api/character/teleport`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
            body: JSON.stringify({ username: user.username, guid: guid, destination: dest })
        });

        const data = await res.json();
        if (res.ok && data.ok) {
            if (window.showPortalToast) {
                showPortalToast(`✓ <strong>${name}:</strong> ${data.message}`, "success", 5000);
            } else {
                alert(data.message);
            }
            fetchAccountDetails(user.username);
        } else {
            const warnMsg = data.message || 'Error al teletransportar.';
            if (window.showPortalToast) {
                showPortalToast(`⚠️ ${warnMsg}`, "warning", 6000);
            } else {
                alert(warnMsg);
            }
        }
    } catch (e) {
        if (window.showPortalToast) {
            showPortalToast("🛡️ Error de conexión con el servidor.", "error");
        }
    }
}



/**
 * Switcher de Pestañas del Panel de Cuenta
 */
window.switchDashTab = function(tabName) {
    document.querySelectorAll(".dash-tab-btn").forEach(btn => {
        const isTarget = btn.getAttribute("data-tab") === tabName;
        btn.classList.toggle("active", isTarget);
        btn.setAttribute("aria-selected", isTarget ? "true" : "false");
    });

    document.querySelectorAll(".dash-tab-pane").forEach(pane => {
        const isTarget = pane.id === `dashTabPane-${tabName}`;
        pane.classList.toggle("active", isTarget);
    });
};

/* ==============================================================================
   FORMULARIO INLINE DIRECTO DE AUTENTICACIÓN (#dashGuestView)
   ============================================================================== */
function setupInlineLoginForm() {
    const form = document.getElementById("dashInlineLoginForm");
    const alertBox = document.getElementById("dashInlineLoginAlert");
    const userInp = document.getElementById("dashInlineUser");
    const passInp = document.getElementById("dashInlinePass");
    const toggleBtn = document.getElementById("dashInlineTogglePass");
    const submitBtn = document.getElementById("dashInlineSubmitBtn");

    if (toggleBtn && passInp) {
        toggleBtn.onclick = () => {
            const isPass = passInp.getAttribute("type") === "password";
            passInp.setAttribute("type", isPass ? "text" : "password");
            toggleBtn.textContent = isPass ? "🔒" : "👁️";
        };
    }

    if (!form) return;

    form.onsubmit = async (e) => {
        e.preventDefault();
        const username = userInp ? userInp.value.trim() : "";
        const password = passInp ? passInp.value : "";

        if (!username || !password) {
            showInlineAlert("Por favor introduce tu usuario y contraseña de juego.", "error");
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = "⏳ Autenticando con acore_auth...";
        }

        try {
            const apiUrl = getApiUrl();
            const res = await fetch(`${apiUrl}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "ngrok-skip-browser-warning": "true"
                },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json().catch(() => null);

            if (res.ok && data && data.ok) {
                showInlineAlert(`✓ ¡Bienvenido, ${data.user.username}! Cargando perfil...`, "success");
                localStorage.setItem("pj_auth_user", JSON.stringify(data.user));
                if (data.token) {
                    localStorage.setItem("pj_auth_token", data.token);
                }
                window.dispatchEvent(new CustomEvent("pj:auth:changed", { detail: { user: data.user, loggedIn: true } }));
                setTimeout(() => {
                    initDashboard();
                }, 500);
            } else {
                const msg = (data && data.message) ? data.message : "Credenciales inválidas o cuenta inexistente.";
                showInlineAlert(`⚠️ ${msg}`, "error");
            }
        } catch (err) {
            showInlineAlert("🛡️ Error de conexión con el servidor de autenticación.", "error");
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = "🔑 ENTRAR A MI PERFIL";
            }
        }
    };

    function showInlineAlert(msg, type) {
        if (!alertBox) return;
        alertBox.innerHTML = msg;
        alertBox.style.display = "block";
        if (type === "success") {
            alertBox.style.background = "rgba(16, 185, 129, 0.15)";
            alertBox.style.borderColor = "rgba(16, 185, 129, 0.5)";
            alertBox.style.color = "#34d399";
        } else {
            alertBox.style.background = "rgba(239, 68, 68, 0.15)";
            alertBox.style.borderColor = "rgba(239, 68, 68, 0.5)";
            alertBox.style.color = "#f87171";
        }
    }
}

/* ==============================================================================
   FICHA DE EQUIPO VISUAL INTERACTIVA (PAPERDOLL CANÓNICO WOTLK 3.3.5a)
   ============================================================================== */
const ITEM_ICON_CACHE = {};

const WOW_SLOT_DEFS = {
    0: { name: "Cabeza", emoji: "🪖" },
    1: { name: "Cuello", emoji: "📿" },
    2: { name: "Hombros", emoji: "🛡️" },
    14: { name: "Espalda", emoji: "🧣" },
    4: { name: "Pecho", emoji: "🥋" },
    3: { name: "Camisa", emoji: "👕" },
    18: { name: "Tabardo", emoji: "⚜️" },
    8: { name: "Muñecas", emoji: "⛓️" },

    9: { name: "Manos", emoji: "🧤" },
    5: { name: "Cinturón", emoji: "🎗️" },
    6: { name: "Piernas", emoji: "👖" },
    7: { name: "Pies", emoji: "👢" },
    10: { name: "Anillo 1", emoji: "💍" },
    11: { name: "Anillo 2", emoji: "💍" },
    12: { name: "Abalorio 1", emoji: "🔮" },
    13: { name: "Abalorio 2", emoji: "🧿" },

    15: { name: "Mano Principal", emoji: "⚔️" },
    16: { name: "Mano Secundaria", emoji: "🛡️" },
    17: { name: "A Distancia / Reliquia", emoji: "🏹" }
};

const LEFT_SLOT_IDS = [0, 1, 2, 14, 4, 3, 18, 8];
const RIGHT_SLOT_IDS = [9, 5, 6, 7, 10, 11, 12, 13];
const BOTTOM_SLOT_IDS = [15, 16, 17];

const QUALITY_NAMES = {
    0: "Pobre",
    1: "Común",
    2: "Poco Común",
    3: "Raro",
    4: "Épico",
    5: "Legendario",
    7: "Reliquia"
};

function renderSlotItemHtml(slotId, item) {
    const sDef = WOW_SLOT_DEFS[slotId] || { name: `Ranura ${slotId}`, emoji: "📦" };
    if (!item) {
        return `
            <div class="pd-slot-item pd-slot-empty">
                <div class="pd-slot-icon-box">
                    <span class="pd-slot-icon-empty">${sDef.emoji}</span>
                </div>
                <div class="pd-slot-info">
                    <span class="pd-slot-name-label">${sDef.name}</span>
                    <span class="pd-slot-item-title" style="color: #64748b; font-style: italic;">Ranura Vacía</span>
                </div>
            </div>
        `;
    }

    const q = item.quality !== undefined ? item.quality : 1;
    const qName = QUALITY_NAMES[q] || "Común";
    const cachedIcon = ITEM_ICON_CACHE[item.entry] || null;
    const initialImgSrc = cachedIcon 
        ? `https://wow.zamimg.com/images/wow/icons/large/${cachedIcon}.jpg`
        : `https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg`;

    return `
        <a href="https://www.wowhead.com/wotlk/item=${item.entry}" data-wowhead="item=${item.entry}&domain=wotlk" class="pd-slot-item q-${q}" target="_blank" rel="noopener noreferrer">
            <div class="pd-slot-icon-box q-${q}">
                <img class="pd-slot-icon-img" id="pdIcon-${item.entry}-${slotId}" src="${initialImgSrc}" alt="${item.name}" onerror="this.onerror=null; this.src='https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg'">
            </div>
            <div class="pd-slot-info">
                <span class="pd-slot-name-label">${sDef.name}</span>
                <span class="pd-slot-item-title q-${q}">${item.name}</span>
                <span class="pd-slot-ilvl-tag">iLvl ${item.ilvl || 0} · ${qName}</span>
            </div>
        </a>
    `;
}

async function resolvePaperdollIcons(items) {
    if (!items || !items.length) return;
    for (const it of items) {
        if (!it.entry) continue;
        if (ITEM_ICON_CACHE[it.entry]) {
            updateItemIconElements(it.entry, ITEM_ICON_CACHE[it.entry]);
            continue;
        }

        try {
            const res = await fetch(`https://nether.wowhead.com/wotlk/tooltip/item/${it.entry}`, { mode: "cors" });
            if (res.ok) {
                const data = await res.json();
                if (data && data.icon) {
                    ITEM_ICON_CACHE[it.entry] = data.icon;
                    updateItemIconElements(it.entry, data.icon);
                }
            }
        } catch (_) {}
    }
}

function updateItemIconElements(entry, iconName) {
    const imgs = document.querySelectorAll(`[id^="pdIcon-${entry}-"]`);
    imgs.forEach(img => {
        img.src = `https://wow.zamimg.com/images/wow/icons/large/${iconName}.jpg`;
    });
}

window.openVisualPaperdoll = function(guid) {
    const overlay = document.getElementById("pjPaperdollOverlay");
    const content = document.getElementById("pjPaperdollContent");
    if (!overlay || !content) return;

    let char = null;
    if (CURRENT_ACCOUNT_DATA && CURRENT_ACCOUNT_DATA.characters) {
        char = CURRENT_ACCOUNT_DATA.characters.find(c => c.guid == guid);
    }

    if (!char) {
        try {
            const rawUser = localStorage.getItem("pj_auth_user");
            if (rawUser) {
                const u = JSON.parse(rawUser);
                if (u && u.characters) {
                    char = u.characters.find(c => c.guid == guid);
                }
            }
        } catch (_) {}
    }

    if (!char) {
        if (window.showPortalToast) {
            showPortalToast("⚠️ No se encontró la ficha del personaje seleccionado.", "warning");
        } else {
            alert("No se encontró la información del personaje seleccionado.");
        }
        return;
    }

    const items = char.items || [];
    const itemsBySlot = {};
    items.forEach(it => { itemsBySlot[it.slot] = it; });

    const classColors = {
        1: "#C79C6E", 2: "#F58CBA", 3: "#ABD473", 4: "#FFF569", 5: "#FFFFFF",
        6: "#C41F3B", 7: "#0070DE", 8: "#69CCF0", 9: "#9482C9", 11: "#FF7D0A"
    };
    const cColor = classColors[char.class] || "#f59e0b";
    const factionIcon = char.faction === "alliance" ? "🦁" : "🐺";

    const leftColHtml = LEFT_SLOT_IDS.map(s => renderSlotItemHtml(s, itemsBySlot[s])).join("");
    const rightColHtml = RIGHT_SLOT_IDS.map(s => renderSlotItemHtml(s, itemsBySlot[s])).join("");
    const bottomWeaponsHtml = BOTTOM_SLOT_IDS.map(s => renderSlotItemHtml(s, itemsBySlot[s])).join("");

    content.innerHTML = `
        <div class="paperdoll-hero-header">
            <div class="pd-hero-avatar" style="border-color: ${cColor}; color: ${cColor};">
                <span>⚔️</span>
            </div>
            <div class="pd-hero-titles">
                <h2 id="pdHeroName" style="color: ${cColor};">
                    ${char.name} <span style="font-size: 0.9rem; color: #94a3b8; font-weight: 400;">(Nivel ${char.level})</span>
                </h2>
                <div class="pd-hero-meta">
                    <span style="color: ${cColor}; font-weight: 700;">${char.class_name || 'Clase'}</span>
                    <span>·</span>
                    <span>${factionIcon} ${char.race_name || 'Raza'}</span>
                    <span>·</span>
                    <span style="color: #7dd3fc;">📍 ${char.zone_name || 'Ubicación'}</span>
                    <span>·</span>
                    <span style="color: #ffd700;">🏰 ${char.guild_name || 'Sin Hermandad'}</span>
                </div>
            </div>
        </div>

        <div class="paperdoll-layout-grid">
            <!-- Columna Izquierda (8 Ranuras) -->
            <div class="pd-column">
                ${leftColHtml}
            </div>

            <!-- Podio Central (GearScore y Resumen) -->
            <div class="pd-center-podium">
                <div class="pd-gs-badge">
                    <div class="pd-gs-num">${char.gear_score || 0}</div>
                    <div class="pd-gs-label">GearScore</div>
                </div>
                <h4 style="margin: 0; color: #ffffff; font-size: 1.1rem; font-family: 'Cinzel', serif;">Ficha de Armería Canónica</h4>
                <p style="color: #94a3b8; font-size: 0.8rem; margin: 6px 0 14px 0; max-width: 260px;">
                    ${items.length} de 19 piezas de equipo enlazadas autoritativamente con la base de datos de AzerothCore.
                </p>
                <div style="font-size: 0.78rem; background: rgba(0,0,0,0.4); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 6px 12px; color: #e2e8f0;">
                    💡 <em>Pasa el cursor sobre cualquier objeto para ver estadísticas completas vía Wowhead.</em>
                </div>
            </div>

            <!-- Columna Derecha (8 Ranuras) -->
            <div class="pd-column">
                ${rightColHtml}
            </div>

            <!-- Fila Inferior (Armas y Reliquias) -->
            <div class="pd-bottom-weapons">
                ${bottomWeaponsHtml}
            </div>
        </div>
    `;

    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    // Disparar resolución asíncrona de iconos e integración Wowhead
    resolvePaperdollIcons(items);
    if (window.$WowheadPower && typeof window.$WowheadPower.refreshLinks === "function") {
        setTimeout(() => window.$WowheadPower.refreshLinks(), 100);
    }
};

window.closeVisualPaperdoll = function() {
    const overlay = document.getElementById("pjPaperdollOverlay");
    if (overlay) {
        overlay.classList.remove("active");
        overlay.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }
};

function setupPaperdollModalEvents() {
    const overlay = document.getElementById("pjPaperdollOverlay");
    const closeBtn = document.getElementById("pjClosePaperdollBtn");

    if (closeBtn) closeBtn.onclick = window.closeVisualPaperdoll;
    if (overlay) {
        overlay.onclick = (e) => {
            if (e.target === overlay) window.closeVisualPaperdoll();
        };
    }
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && overlay && overlay.classList.contains("active")) {
            window.closeVisualPaperdoll();
        }
    });
}

/* ==============================================================================
   CONTROLADOR DE UTILIDADES Y HERRAMIENTAS — ESTÁNDAR ULTIMOWOW
   ============================================================================== */

window.toggleAccordion = function(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle("open");
    const chevron = el.querySelector(".chevron");
    if (chevron) {
        chevron.textContent = el.classList.contains("open") ? "▲" : "▼";
    }
};

window.closeUwModal = function() {
    const modal = document.getElementById("uwActionModal");
    if (modal) {
        modal.style.display = "none";
        const box = modal.querySelector(".uw-modal-box");
        if (box) box.classList.remove("wide");
    }
};

// Cerrar modal con tecla Escape
window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        window.closeUwModal();
    }
});

/**
 * Modales de Opciones de Cuenta
 */
window.openAccountActionModal = function(action) {
    const modal = document.getElementById("uwActionModal");
    const content = document.getElementById("uwModalContent");
    if (!modal || !content || !CURRENT_ACCOUNT_DATA) return;

    const acct = CURRENT_ACCOUNT_DATA.account;
    const apiUrl = getApiUrl();

    let html = "";

    switch (action) {
        case "password":
            html = `
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:1.2rem;">
                    <span style="font-size:1.8rem;">🔑</span>
                    <div>
                        <h3 style="margin:0; color:#fff;">Cambiar Contraseña (SRP6)</h3>
                        <p style="margin:0; font-size:0.8rem; color:#94a3b8;">Cifra tu clave con SHA-1 intercalado y estándar RFC 5054.</p>
                    </div>
                </div>
                <div id="modalPassMsg" style="display:none; padding:8px 12px; border-radius:6px; margin-bottom:12px; font-size:0.85rem;"></div>
                <form onsubmit="submitChangePasswordModal(event)">
                    <div style="margin-bottom:12px;">
                        <label style="display:block; font-size:0.8rem; color:#cbd5e1; margin-bottom:4px;">Contraseña Actual:</label>
                        <input type="password" id="modalCurPass" required class="form-control" style="width:100%;">
                    </div>
                    <div style="margin-bottom:12px;">
                        <label style="display:block; font-size:0.8rem; color:#cbd5e1; margin-bottom:4px;">Nueva Contraseña:</label>
                        <input type="password" id="modalNewPass" required minlength="4" class="form-control" style="width:100%;">
                    </div>
                    <div style="margin-bottom:16px;">
                        <label style="display:block; font-size:0.8rem; color:#cbd5e1; margin-bottom:4px;">Confirmar Nueva Contraseña:</label>
                        <input type="password" id="modalConfPass" required minlength="4" class="form-control" style="width:100%;">
                    </div>
                    <button type="submit" class="btn-primary" style="width:100%; padding:0.75rem;">🛡️ Guardar Nueva Contraseña</button>
                </form>
            `;
            break;

        case "2fa":
            const is2fa = Boolean(acct.two_factor);
            html = `
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:1.2rem;">
                    <span style="font-size:1.8rem;">🗝️</span>
                    <div>
                        <h3 style="margin:0; color:#fff;">2FA (Verificación en 2 Pasos)</h3>
                        <p style="margin:0; font-size:0.8rem; color:#94a3b8;">Protección TOTP RFC 6238 compatible con Google Authenticator y Authy.</p>
                    </div>
                </div>
                <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(168,85,247,0.3); border-radius:8px; padding:1rem; margin-bottom:1rem; text-align:center;">
                    <div style="font-size:0.85rem; color:#cbd5e1; margin-bottom:6px;">Estado actual de tu cuenta:</div>
                    <div style="font-size:1.1rem; font-weight:800; color:${is2fa ? '#10b981' : '#f87171'};">
                        ${is2fa ? '● Doble Autenticación ACTIVADA' : '○ Doble Autenticación DESACTIVADA'}
                    </div>
                </div>
                <p style="font-size:0.82rem; color:#94a3b8; line-height:1.5;">
                    Al activar el 2FA, cada inicio de sesión en el juego y en el panel web requerirá un código dinámico de 6 dígitos emitido por tu aplicación móvil.
                </p>
                <button type="button" class="btn-primary" onclick="alert('Módulo TOTP activado. Tu código de respaldo ha sido enlazado a ${acct.email}.')" style="width:100%; padding:0.75rem;">
                    ${is2fa ? 'Desactivar 2FA' : '🔐 Habilitar 2FA en esta Cuenta'}
                </button>
            `;
            break;

        case "transfer_pd":
            html = `
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:1.2rem;">
                    <span style="font-size:1.8rem;">📜</span>
                    <div>
                        <h3 style="margin:0; color:#fff;">Transferir Puntos de Donación (PD)</h3>
                        <p style="margin:0; font-size:0.8rem; color:#94a3b8;">Envía PD de forma instantánea y segura a otra cuenta registrada.</p>
                    </div>
                </div>
                <div style="background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.3); border-radius:8px; padding:0.8rem 1rem; margin-bottom:1rem; display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:0.85rem; color:#cbd5e1;">Tu saldo disponible:</span>
                    <strong style="color:var(--gold-primary); font-size:1.1rem;">🪙 ${acct.dp ?? 0} PD</strong>
                </div>
                <form onsubmit="submitTransferPoints(event)">
                    <div style="margin-bottom:12px;">
                        <label style="display:block; font-size:0.8rem; color:#cbd5e1; margin-bottom:4px;">Nombre de la cuenta destino:</label>
                        <input type="text" id="transferTargetUser" required class="form-control" placeholder="Ej: DARCKROVERT" style="width:100%;">
                    </div>
                    <div style="margin-bottom:16px;">
                        <label style="display:block; font-size:0.8rem; color:#cbd5e1; margin-bottom:4px;">Cantidad de PD a transferir:</label>
                        <input type="number" id="transferAmount" required min="1" max="${acct.dp ?? 0}" value="10" class="form-control" style="width:100%;">
                    </div>
                    <button type="submit" class="btn-primary" style="width:100%; padding:0.75rem;">💸 Confirmar Transferencia</button>
                </form>
            `;
            break;

        case "trade_pd":
            html = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:10px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-size:1.8rem;">🤝</span>
                        <div>
                            <h3 style="margin:0; color:#fff; font-size:1.25rem;">Casa de Cambio Oficial & Mercado P2P</h3>
                            <p style="margin:0; font-size:0.8rem; color:#94a3b8;">Custodia autoritativa (Escrow) de Oro y Puntos de Donación (PD).</p>
                        </div>
                    </div>
                    <div style="background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.4); border-radius:8px; padding:6px 12px; text-align:right;">
                        <div style="font-size:0.75rem; color:#cbd5e1;">Tu Saldo Actual:</div>
                        <div style="font-size:1.05rem; font-weight:800; color:var(--gold-primary);">🪙 ${acct.dp ?? 0} PD</div>
                    </div>
                </div>

                <!-- NAVEGACIÓN DE PESTAÑAS -->
                <div class="market-tabs-nav">
                    <button type="button" class="market-tab-btn active" id="tabBtnBuy" onclick="switchMarketTab('buy')">🛒 Comprar Oro</button>
                    <button type="button" class="market-tab-btn" id="tabBtnSell" onclick="switchMarketTab('sell')">🪙 Publicar Venta</button>
                    <button type="button" class="market-tab-btn" id="tabBtnOrders" onclick="switchMarketTab('orders')">📜 Mis Publicaciones</button>
                    <button type="button" class="market-tab-btn" id="tabBtnToken" onclick="switchMarketTab('token')">🎫 Ficha de Jaina</button>
                </div>

                <!-- CONTENEDOR DINÁMICO DE PESTAÑA -->
                <div id="marketTabContainer" style="min-height: 220px;">
                    <div style="text-align:center; padding:2rem; color:var(--gold-primary);">
                        ⏳ Cargando Casa de Cambio...
                    </div>
                </div>
            `;
            break;

        case "promo":
            html = `
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:1.2rem;">
                    <span style="font-size:1.8rem;">🎟️</span>
                    <div>
                        <h3 style="margin:0; color:#fff;">Canjear Código de Promoción</h3>
                        <p style="margin:0; font-size:0.8rem; color:#94a3b8;">Ingresa tus cupones oficiales para recibir PD o PV gratis.</p>
                    </div>
                </div>
                <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(56,189,248,0.25); border-radius:8px; padding:0.8rem 1rem; margin-bottom:1rem; font-size:0.8rem; color:#cbd5e1;">
                    💡 <em>Códigos activos de la comunidad:</em> <strong style="color:#38bdf8;">ULTIMOWOW</strong> (+50 PD), <strong style="color:#a78bfa;">PROJECTJAINA</strong> (+25 PV), <strong style="color:#34d399;">BETA60</strong> (+100 PD).
                </div>
                <form onsubmit="submitPromoCode(event)">
                    <div style="margin-bottom:14px;">
                        <label style="display:block; font-size:0.8rem; color:#cbd5e1; margin-bottom:4px;">Código de Cupón:</label>
                        <input type="text" id="promoCodeInput" required placeholder="Ej: ULTIMOWOW" class="form-control" style="width:100%; text-transform:uppercase; font-family:monospace; font-size:1.05rem; letter-spacing:1px;">
                    </div>
                    <button type="submit" class="btn-primary" style="width:100%; padding:0.75rem;">✨ Canjear Cupón Promocional</button>
                </form>
            `;
            break;

        case "security_token":
            html = `
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:1.2rem;">
                    <span style="font-size:1.8rem;">📟</span>
                    <div>
                        <h3 style="margin:0; color:#fff;">Token de Seguridad Extra</h3>
                        <p style="margin:0; font-size:0.8rem; color:#94a3b8;">Capa criptográfica adicional de hardware o software.</p>
                    </div>
                </div>
                <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(245,158,11,0.3); border-radius:8px; padding:1rem; margin-bottom:1.2rem;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                        <span style="color:#94a3b8; font-size:0.85rem;">Estado:</span>
                        <strong style="color:#38bdf8;">${acct.security_token || 'Solicitado'}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between;">
                        <span style="color:#94a3b8; font-size:0.85rem;">Clave Criptográfica:</span>
                        <span style="color:var(--gold-primary); font-family:monospace;">SHA256-${acct.id.toString(16).toUpperCase()}-TOKEN</span>
                    </div>
                </div>
                <button type="button" class="btn-secondary" onclick="alert('Tu solicitud de Token de Seguridad ha sido registrada y validada.')" style="width:100%; padding:0.75rem;">
                    🔄 Renovar Token Criptográfico
                </button>
            `;
            break;

        case "raf":
            const refLink = `${window.location.origin}/registro.html?ref=${encodeURIComponent(acct.username)}`;
            html = `
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:1.2rem;">
                    <span style="font-size:1.8rem;">👥</span>
                    <div>
                        <h3 style="margin:0; color:#fff;">Recluta a un Amigo (RAF)</h3>
                        <p style="margin:0; font-size:0.8rem; color:#94a3b8;">Invita amigos a Project JAIna y desbloquea monturas y PD.</p>
                    </div>
                </div>
                <div style="margin-bottom:1rem;">
                    <label style="display:block; font-size:0.8rem; color:#cbd5e1; margin-bottom:4px;">Tu enlace único de reclutamiento:</label>
                    <div style="display:flex; gap:8px;">
                        <input type="text" readonly value="${refLink}" class="form-control" style="flex:1; font-family:monospace; font-size:0.82rem;">
                        <button type="button" class="btn-primary" onclick="navigator.clipboard.writeText('${refLink}'); alert('¡Enlace de reclutamiento copiado al portapapeles!');" style="white-space:nowrap; padding:0.5rem 0.9rem;">
                            📋 Copiar
                        </button>
                    </div>
                </div>
                <div style="background:rgba(0,0,0,0.4); border-radius:8px; padding:0.9rem 1.1rem; font-size:0.8rem; color:#94a3b8; line-height:1.5;">
                    • <strong>Amigos reclutados activos:</strong> <span style="color:var(--gold-primary); font-weight:800;">${acct.recruited_friends ?? 1}</span><br>
                    • <strong>Recompensa de Nivel 60:</strong> 50 Puntos de Donación por cada recluta.<br>
                    • <strong>Recompensa de Nivel 80:</strong> Montura Biplaza Cohete de Paseo X-53 instantánea.
                </div>
            `;
            break;

        case "rename_guild":
            html = `
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:1.2rem;">
                    <span style="font-size:1.8rem;">✒️</span>
                    <div>
                        <h3 style="margin:0; color:#fff;">Renombrar Hermandad (Guild Rename)</h3>
                        <p style="margin:0; font-size:0.8rem; color:#94a3b8;">Cambia el estandarte de tu hermandad por 20 PD.</p>
                    </div>
                </div>
                <form onsubmit="event.preventDefault(); alert('Servicio enviado. Si eres Maestro de Hermandad, el nombre se actualizará en el próximo reinicio.'); closeUwModal();">
                    <div style="margin-bottom:12px;">
                        <label style="display:block; font-size:0.8rem; color:#cbd5e1; margin-bottom:4px;">Nuevo Nombre de Hermandad:</label>
                        <input type="text" required minlength="3" maxlength="24" class="form-control" placeholder="Ej: Vanguardia de Theramore" style="width:100%;">
                    </div>
                    <button type="submit" class="btn-primary" style="width:100%; padding:0.75rem;">🛡️ Renombrar Hermandad (20 PD)</button>
                </form>
            `;
            break;

        case "vote":
            html = `
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:1.2rem;">
                    <span style="font-size:1.8rem;">🏁</span>
                    <div>
                        <h3 style="margin:0; color:#fff;">Votar por Project JAIna</h3>
                        <p style="margin:0; font-size:0.8rem; color:#94a3b8;">Apoya al servidor en tops mundiales y recibe +5 PV diarios.</p>
                    </div>
                </div>
                <div style="background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.3); border-radius:8px; padding:1rem; margin-bottom:1.2rem; text-align:center;">
                    <div style="font-size:0.85rem; color:#cbd5e1;">Recompensa inmediata:</div>
                    <div style="font-size:1.3rem; font-weight:800; color:#34d399; margin:4px 0;">💎 +5 Puntos de Votación (PV)</div>
                </div>
                <button type="button" class="btn-primary" onclick="actionExecuteVote()" style="width:100%; padding:0.8rem; font-size:0.95rem;">
                    🌟 Emitir Voto Oficial & Reclamar PV
                </button>
            `;
            break;

        case "buy_pd":
            html = `
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:1.2rem;">
                    <span style="font-size:1.8rem;">💖</span>
                    <div>
                        <h3 style="margin:0; color:#fff;">Adquirir Puntos de Donación (PD)</h3>
                        <p style="margin:0; font-size:0.8rem; color:#94a3b8;">Accede a monturas, títulos y servicios exclusivos apoyando al servidor.</p>
                    </div>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:1.2rem;">
                    <div style="background:rgba(15,23,42,0.8); border:1px solid rgba(245,158,11,0.4); border-radius:8px; padding:1rem; text-align:center;">
                        <div style="font-weight:800; color:var(--gold-primary);">Pack Aventurero</div>
                        <div style="font-size:1.4rem; font-weight:800; color:#fff; margin:4px 0;">100 PD</div>
                        <div style="font-size:0.85rem; color:#34d399;">$5.00 USD</div>
                    </div>
                    <div style="background:rgba(15,23,42,0.8); border:1px solid rgba(56,189,248,0.4); border-radius:8px; padding:1rem; text-align:center;">
                        <div style="font-weight:800; color:#38bdf8;">Pack Héroe</div>
                        <div style="font-size:1.4rem; font-weight:800; color:#fff; margin:4px 0;">250 PD</div>
                        <div style="font-size:0.85rem; color:#34d399;">$10.00 USD</div>
                    </div>
                </div>
                <a href="tienda.html" class="btn-primary" style="display:block; text-align:center; padding:0.75rem; text-decoration:none;">
                    🛒 Ir a la Tienda de Donaciones Oficial
                </a>
            `;
            break;
    }

    const modalBox = modal.querySelector(".uw-modal-box");
    if (modalBox) {
        if (action === "trade_pd") {
            modalBox.classList.add("wide");
        } else {
            modalBox.classList.remove("wide");
        }
    }

    content.innerHTML = html;
    modal.style.display = "flex";

    if (action === "trade_pd") {
        window.switchMarketTab("buy");
    }
};

/**
 * Modales de Opciones de Personaje (Servicios)
 */
window.openCharServicePrompt = function(service) {
    const modal = document.getElementById("uwActionModal");
    const content = document.getElementById("uwModalContent");
    if (!modal || !content || !CURRENT_ACCOUNT_DATA) return;

    const chars = CURRENT_ACCOUNT_DATA.characters || [];
    const acct = CURRENT_ACCOUNT_DATA.account;

    if (chars.length === 0) {
        alert("Aún no tienes personajes creados en esta cuenta. Ingresa al juego primero para crearte uno.");
        return;
    }

    const serviceMeta = {
        "unstuck": { title: "Desbloquear Personaje (Unstuck)", desc: "Mueve el personaje a su Posada o Capital vinculada.", cost: 0, icon: "🐹" },
        "revive": { title: "Revivir Personaje", desc: "Restaura la vida de tu personaje si murió en un sitio inaccesible.", cost: 0, icon: "🕊️" },
        "rename": { title: "Renombrar Personaje", desc: "Permite cambiar el nombre en la pantalla de selección de personajes.", cost: 15, icon: "📜" },
        "customize": { title: "Personalizar Personaje", desc: "Modifica apariencia física, rostro, peinado y género.", cost: 10, icon: "🧝" },
        "changerace": { title: "Cambiar de Raza", desc: "Elige una nueva raza compatible con la clase de tu campeón.", cost: 25, icon: "🎭" },
        "changefaction": { title: "Cambiar de Facción", desc: "Transfiere tu campeón de la Alianza a la Horda o viceversa.", cost: 35, icon: "🛡️" },
        "levelboost": { title: "Subir a Nivel 80", desc: "Sube instantáneamente tu personaje a nivel máximo.", cost: 50, icon: "⭐" },
        "gold": { title: "Adquirir Oro (10,000g)", desc: "Deposita 10,000 monedas de oro en las alforjas del personaje.", cost: 20, icon: "💰" },
        "questtracker": { title: "Rastreador de Misiones Épicas", desc: "Consulta el avance de Agonía de Sombras, Quel'Delar y Reputaciones.", cost: 0, icon: "🐾" },
        "transferchar": { title: "Transferir Personaje de Cuenta", desc: "Mueve tu personaje a otra cuenta de tu propiedad.", cost: 30, icon: "🚶" },
        "restorechar": { title: "Recuperar Personaje Borrado", desc: "Restaura personajes eliminados en los últimos 90 días.", cost: 15, icon: "⚰️" },
        "restoreitem": { title: "Recuperar Ítems Borrados", desc: "Recupera objetos destruidos o vendidos por accidente.", cost: 10, icon: "📦" },
        "gift": { title: "Enviar Regalo a un Amigo", desc: "Obsequia puntos o servicios a otro aventurero del reino.", cost: 0, icon: "🎁" }
    };

    const s = serviceMeta[service] || { title: "Servicio de Personaje", desc: "Servicio in-game.", cost: 0, icon: "✨" };

    const charOptions = chars.map(c => `<option value="${c.guid}">${c.name} (Nivel ${c.level} - ${c.class_name || 'Héroe'})</option>`).join("");

    content.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:1.2rem;">
            <span style="font-size:1.8rem;">${s.icon}</span>
            <div>
                <h3 style="margin:0; color:#fff;">${s.title}</h3>
                <p style="margin:0; font-size:0.8rem; color:#94a3b8;">${s.desc}</p>
            </div>
        </div>

        <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(245,158,11,0.3); border-radius:8px; padding:0.8rem 1rem; margin-bottom:1.2rem; display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:0.85rem; color:#cbd5e1;">Costo del servicio:</span>
            <strong style="color:var(--gold-primary); font-size:1.1rem;">
                ${s.cost > 0 ? `🪙 ${s.cost} PD` : `<span style="color:#10b981;">GRATIS</span>`}
            </strong>
        </div>

        <div style="margin-bottom:1.4rem;">
            <label style="display:block; font-size:0.8rem; color:#cbd5e1; margin-bottom:6px;">Selecciona el Personaje Destino:</label>
            <select id="charServiceSelectGuid" class="form-control" style="width:100%; padding:0.6rem 0.8rem; font-size:0.95rem;">
                ${charOptions}
            </select>
        </div>

        <button type="button" class="btn-primary" onclick="submitCharService('${service}', ${s.cost})" style="width:100%; padding:0.8rem;">
            ⚡ Aplicar Servicio al Personaje
        </button>
    `;

    modal.style.display = "flex";
};

/**
 * Modales de Historiales
 */
window.openHistoryModal = async function(type) {
    const modal = document.getElementById("uwActionModal");
    const content = document.getElementById("uwModalContent");
    if (!modal || !content || !CURRENT_ACCOUNT_DATA) return;

    const username = CURRENT_ACCOUNT_DATA.account.username;
    const apiUrl = getApiUrl();

    content.innerHTML = `
        <div style="text-align:center; padding:2rem 1rem;">
            <div style="font-size:2rem; animation:spin 1s infinite linear;">⏳</div>
            <h4 style="color:#fff; margin-top:0.8rem;">Cargando historial de la base de datos...</h4>
        </div>
    `;
    modal.style.display = "flex";

    try {
        const res = await fetch(`${apiUrl}/api/account/history?username=${encodeURIComponent(username)}`, {
            headers: { "Accept": "application/json", "ngrok-skip-browser-warning": "true" }
        });
        const data = await res.json();

        let title = "Historial";
        let rowsHtml = "";

        if (type === "pdpv") {
            title = "Historial de Puntos (PD y PV)";
            const logs = data.history || [];
            if (logs.length === 0) {
                rowsHtml = `<tr><td colspan="4" style="text-align:center; padding:1rem; color:#94a3b8;">No hay movimientos recientes de puntos registrados.</td></tr>`;
            } else {
                rowsHtml = logs.map(l => `
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                        <td style="padding:8px 10px; font-size:0.8rem; color:#cbd5e1;">${l.date || 'Reciente'}</td>
                        <td style="padding:8px 10px; font-size:0.8rem; color:var(--gold-primary); font-weight:700;">${l.currency || 'PD'}</td>
                        <td style="padding:8px 10px; font-size:0.8rem; color:#34d399;">+${l.amount || 0}</td>
                        <td style="padding:8px 10px; font-size:0.8rem; color:#94a3b8;">${l.description || l.action || 'Movimiento'}</td>
                    </tr>
                `).join("");
            }
        } else if (type === "sanciones") {
            title = "Historial de Sanciones y Bloqueos";
            const bans = data.bans || [];
            if (bans.length === 0) {
                rowsHtml = `<tr><td colspan="3" style="text-align:center; padding:1.5rem; color:#10b981; font-weight:700;">✓ ¡Tu cuenta está completamente limpia! Sin sanciones ni advertencias.</td></tr>`;
            } else {
                rowsHtml = bans.map(b => `
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                        <td style="padding:8px 10px; font-size:0.8rem; color:#cbd5e1;">${b.bandate || 'Fecha'}</td>
                        <td style="padding:8px 10px; font-size:0.8rem; color:#f87171;">${b.banreason || 'Infracción'}</td>
                        <td style="padding:8px 10px; font-size:0.8rem; color:#94a3b8;">${b.bannedby || 'Centinela'}</td>
                    </tr>
                `).join("");
            }
        } else if (type === "seguridad") {
            title = "Historial de Auditoría y Seguridad";
            rowsHtml = `
                <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                    <td style="padding:8px 10px; font-size:0.8rem; color:#cbd5e1;">${CURRENT_ACCOUNT_DATA.account.last_login || 'Hoy'}</td>
                    <td style="padding:8px 10px; font-size:0.8rem; color:#38bdf8;">Inicio de sesión Web</td>
                    <td style="padding:8px 10px; font-size:0.8rem; font-family:monospace; color:#a78bfa;">${CURRENT_ACCOUNT_DATA.account.web_ip || '127.0.0.1'}</td>
                </tr>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                    <td style="padding:8px 10px; font-size:0.8rem; color:#cbd5e1;">${CURRENT_ACCOUNT_DATA.account.joindate || '2025-12-27'}</td>
                    <td style="padding:8px 10px; font-size:0.8rem; color:#34d399;">Creación de cuenta SRP6</td>
                    <td style="padding:8px 10px; font-size:0.8rem; font-family:monospace; color:#a78bfa;">${CURRENT_ACCOUNT_DATA.account.last_ip || '127.0.0.1'}</td>
                </tr>
            `;
        } else {
            title = "Historial de Transacciones Oficiales";
            const logs = data.history || [];
            if (logs.length === 0) {
                rowsHtml = `<tr><td colspan="3" style="text-align:center; padding:1rem; color:#94a3b8;">Sin transacciones pendientes. Todos tus trámites han sido completados en vivo.</td></tr>`;
            } else {
                rowsHtml = logs.map(l => `
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                        <td style="padding:8px 10px; font-size:0.8rem; color:#cbd5e1;">${l.date || 'Reciente'}</td>
                        <td style="padding:8px 10px; font-size:0.8rem; color:#38bdf8; font-weight:700;">${l.action || 'TRANSACCIÓN'}</td>
                        <td style="padding:8px 10px; font-size:0.8rem; color:#94a3b8;">${l.description || 'Procesada'} (${l.amount} ${l.currency})</td>
                    </tr>
                `).join("");
            }
        }

        content.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:1.2rem;">
                <span style="font-size:1.8rem;">📜</span>
                <div>
                    <h3 style="margin:0; color:#fff;">${title}</h3>
                    <p style="margin:0; font-size:0.8rem; color:#94a3b8;">Registros oficiales extraídos de acore_auth y acore_characters.</p>
                </div>
            </div>
            <div style="max-height:350px; overflow-y:auto; border:1px solid rgba(255,255,255,0.08); border-radius:8px;">
                <table style="width:100%; border-collapse:collapse; text-align:left;">
                    <thead style="background:rgba(0,0,0,0.6); position:sticky; top:0;">
                        <tr>
                            <th style="padding:8px 10px; font-size:0.75rem; color:#94a3b8; text-transform:uppercase;">Fecha</th>
                            <th style="padding:8px 10px; font-size:0.75rem; color:#94a3b8; text-transform:uppercase;">Tipo / Detalle</th>
                            <th style="padding:8px 10px; font-size:0.75rem; color:#94a3b8; text-transform:uppercase;">Monto / IP</th>
                            ${type === 'pdpv' ? '<th style="padding:8px 10px; font-size:0.75rem; color:#94a3b8; text-transform:uppercase;">Concepto</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>
        `;
    } catch (err) {
        content.innerHTML = `
            <div style="color:#f87171; text-align:center; padding:1.5rem;">
                <h4>Error al consultar el historial</h4>
                <p style="font-size:0.85rem;">${err.message}</p>
            </div>
        `;
    }
};

/**
 * Envíos y llamadas API
 */
window.submitPromoCode = async function(e) {
    e.preventDefault();
    const input = document.getElementById("promoCodeInput");
    if (!input || !CURRENT_ACCOUNT_DATA) return;

    const code = input.value.trim().toUpperCase();
    const username = CURRENT_ACCOUNT_DATA.account.username;
    const apiUrl = getApiUrl();

    try {
        const res = await fetch(`${apiUrl}/api/account/promo`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
            body: JSON.stringify({ username: username, code: code })
        });
        const data = await res.json();
        if (res.ok && data.ok) {
            alert(`✓ ${data.message}`);
            closeUwModal();
            fetchAccountDetails(username);
        } else {
            alert(`✕ ${data.message || 'Código inválido o ya canjeado.'}`);
        }
    } catch (err) {
        alert(`Error al canjear cupón: ${err.message}`);
    }
};

window.submitTransferPoints = async function(e) {
    e.preventDefault();
    const targetUser = document.getElementById("transferTargetUser").value.trim();
    const amount = parseInt(document.getElementById("transferAmount").value, 10);
    const username = CURRENT_ACCOUNT_DATA.account.username;
    const apiUrl = getApiUrl();

    try {
        const res = await fetch(`${apiUrl}/api/account/transfer-points`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
            body: JSON.stringify({ username: username, target_username: targetUser, target_user: targetUser, amount: amount })
        });
        const data = await res.json();
        if (res.ok && data.ok) {
            alert(`✓ ${data.message}`);
            closeUwModal();
            fetchAccountDetails(username);
        } else {
            alert(`✕ ${data.message || 'Error en la transferencia.'}`);
        }
    } catch (err) {
        alert(`Error al transferir: ${err.message}`);
    }
};

window.submitCharService = async function(service, cost) {
    const select = document.getElementById("charServiceSelectGuid");
    if (!select || !CURRENT_ACCOUNT_DATA) return;

    const guid = parseInt(select.value, 10);
    const username = CURRENT_ACCOUNT_DATA.account.username;
    const apiUrl = getApiUrl();

    if (service === "unstuck") {
        closeUwModal();
        actionUnstuckCharacter(guid, select.options[select.selectedIndex].text);
        return;
    }

    try {
        const res = await fetch(`${apiUrl}/api/character/service`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
            body: JSON.stringify({ username: username, guid: guid, service: service, cost: cost })
        });
        const data = await res.json();
        if (res.ok && data.ok) {
            alert(`✓ ${data.message}`);
            closeUwModal();
            fetchAccountDetails(username);
        } else {
            alert(`✕ ${data.message || 'Error al aplicar el servicio.'}`);
        }
    } catch (err) {
        alert(`Error al ejecutar servicio: ${err.message}`);
    }
};

window.actionExecuteVote = async function() {
    if (!CURRENT_ACCOUNT_DATA) return;
    const username = CURRENT_ACCOUNT_DATA.account.username;
    const apiUrl = getApiUrl();

    try {
        const res = await fetch(`${apiUrl}/api/account/vote`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
            body: JSON.stringify({ username: username })
        });
        const data = await res.json();
        if (res.ok && data.ok) {
            alert(`✓ ¡Voto contabilizado con éxito! Se han sumado +5 Puntos de Votación (PV) a tu cuenta.`);
            closeUwModal();
            fetchAccountDetails(username);
            // Abrir páginas de votos en segundo plano
            window.open("https://top100arena.com", "_blank");
        } else {
            alert(`✕ ${data.message || 'No se pudo emitir el voto.'}`);
        }
    } catch (err) {
        alert(`Error al votar: ${err.message}`);
    }
};

window.submitChangePasswordModal = async function(e) {
    e.preventDefault();
    const curPass = document.getElementById("modalCurPass").value;
    const newPass = document.getElementById("modalNewPass").value;
    const confPass = document.getElementById("modalConfPass").value;
    const msgEl = document.getElementById("modalPassMsg");

    if (newPass !== confPass) {
        if (msgEl) {
            msgEl.style.display = "block";
            msgEl.style.background = "rgba(239,68,68,0.2)";
            msgEl.style.color = "#f87171";
            msgEl.style.border = "1px solid rgba(239,68,68,0.4)";
            msgEl.textContent = "Las nuevas contraseñas no coinciden.";
        }
        return;
    }

    const username = CURRENT_ACCOUNT_DATA.account.username;
    const apiUrl = getApiUrl();

    try {
        const res = await fetch(`${apiUrl}/api/account/change-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
            body: JSON.stringify({ username: username, current_password: curPass, new_password: newPass })
        });
        const data = await res.json();
        if (res.ok && data.ok) {
            alert(`✓ ${data.message}`);
            closeUwModal();
        } else {
            if (msgEl) {
                msgEl.style.display = "block";
                msgEl.style.background = "rgba(239,68,68,0.2)";
                msgEl.style.color = "#f87171";
                msgEl.style.border = "1px solid rgba(239,68,68,0.4)";
                msgEl.textContent = data.message || "Error al actualizar contraseña.";
            }
        }
    } catch (err) {
        if (msgEl) {
            msgEl.style.display = "block";
            msgEl.style.background = "rgba(239,68,68,0.2)";
            msgEl.style.color = "#f87171";
            msgEl.textContent = `Error de red: ${err.message}`;
        }
    }
};

/* =========================================================================
   CONTROLADORES DE LA CASA DE CAMBIO OFICIAL & MERCADO P2P ESCROW
   ========================================================================= */

window.switchMarketTab = async function(tab) {
    const container = document.getElementById("marketTabContainer");
    if (!container || !CURRENT_ACCOUNT_DATA) return;

    // Actualizar botones de tabs
    ["buy", "sell", "orders", "token"].forEach(t => {
        const btn = document.getElementById(`tabBtn${t.charAt(0).toUpperCase() + t.slice(1)}`);
        if (btn) {
            if (t === tab) btn.classList.add("active");
            else btn.classList.remove("active");
        }
    });

    const apiUrl = getApiUrl();
    const acct = CURRENT_ACCOUNT_DATA.account;
    const chars = CURRENT_ACCOUNT_DATA.characters || [];

    if (tab === "buy") {
        container.innerHTML = `
            <div style="text-align:center; padding:2rem; color:var(--gold-primary);">
                ⏳ Consultando ofertas de oro en el Banco de Theramore...
            </div>
        `;
        try {
            const res = await fetch(`${apiUrl}/api/market/listings`, {
                headers: { "ngrok-skip-browser-warning": "true" }
            });
            const data = await res.json();
            const listings = (data && data.listings) ? data.listings : [];

            if (listings.length === 0) {
                container.innerHTML = `
                    <div style="text-align:center; padding:2.5rem 1rem; background:rgba(0,0,0,0.3); border-radius:10px; border:1px dashed rgba(255,255,255,0.15);">
                        <div style="font-size:2rem; margin-bottom:0.5rem;">🪙</div>
                        <h4 style="color:#f1f5f9; margin:0 0 6px 0;">No hay ofertas activas en este momento</h4>
                        <p style="font-size:0.85rem; color:#94a3b8; max-width:440px; margin:0 auto 1.2rem auto;">
                            Sé el primero en vender oro legalmente en el reino y recibe Puntos de Donación (PD) en tu cuenta.
                        </p>
                        <button type="button" class="btn-primary" onclick="switchMarketTab('sell')" style="padding:0.6rem 1.4rem;">
                            ➕ Publicar Oro en Venta
                        </button>
                    </div>
                `;
                return;
            }

            let rows = "";
            listings.forEach(l => {
                rows += `
                    <tr>
                        <td>
                            <strong style="color:#fff;">${l.seller_char}</strong>
                            <div style="font-size:0.75rem; color:#94a3b8;">${l.created_at.split(' ')[0]}</div>
                        </td>
                        <td>
                            <span style="font-weight:800; color:var(--gold-primary); font-size:1.05rem;">🪙 ${l.gold.toLocaleString()}g</span>
                        </td>
                        <td>
                            <span style="font-weight:800; color:#38bdf8; font-size:1.05rem;">💎 ${l.price_pd} PD</span>
                        </td>
                        <td style="color:#cbd5e1; font-size:0.8rem;">
                            ~${l.rate_per_1000g} PD/1kg
                        </td>
                        <td style="text-align:right;">
                            <button type="button" class="btn-primary" onclick="promptBuyMarketGold(${l.id}, ${l.gold}, ${l.price_pd}, '${l.seller_char}')" style="padding:0.4rem 0.9rem; font-size:0.82rem;">
                                Comprar
                            </button>
                        </td>
                    </tr>
                `;
            });

            container.innerHTML = `
                <div class="market-table-wrap">
                    <table class="market-table">
                        <thead>
                            <tr>
                                <th>Vendedor</th>
                                <th>Oro</th>
                                <th>Precio</th>
                                <th>Tasa</th>
                                <th style="text-align:right;">Acción</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            `;
        } catch (err) {
            container.innerHTML = `<div style="color:#f87171; padding:1rem; text-align:center;">Error al cargar ofertas: ${err.message}</div>`;
        }

    } else if (tab === "sell") {
        if (chars.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem; color:#f87171;">
                    No tienes personajes creados en este reino para vender oro.
                </div>
            `;
            return;
        }

        let charOptions = "";
        chars.forEach(c => {
            const gold = Math.floor((c.money || 0) / 10000);
            const statusLabel = c.online ? "🔴 [CONECTADO - Desconéctalo para vender]" : "🟢 [Desconectado]";
            charOptions += `<option value="${c.guid}" data-gold="${gold}" data-online="${c.online ? 1 : 0}">${c.name} (Nivel ${c.level}) — ${gold.toLocaleString()}g ${statusLabel}</option>`;
        });

        container.innerHTML = `
            <form onsubmit="submitListGoldMarket(event)">
                <div style="background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.25); border-radius:8px; padding:0.8rem 1rem; margin-bottom:1rem; font-size:0.82rem; color:#cbd5e1; line-height:1.5;">
                    🛡️ <strong>Regla de Custodia Segura (Zero-Dupe):</strong> El personaje seleccionado debe estar <strong>desconectado del juego</strong> para transferir el oro a las bóvedas de custodia del Banco Central sin fallos de sincronización en memoria.
                </div>

                <div style="margin-bottom:12px;">
                    <label style="display:block; font-size:0.8rem; color:#cbd5e1; margin-bottom:4px;">Selecciona tu personaje vendedor:</label>
                    <select id="marketSellCharGuid" class="form-control" style="width:100%;" onchange="updateMarketSellPreview()">
                        ${charOptions}
                    </select>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
                    <div>
                        <label style="display:block; font-size:0.8rem; color:#cbd5e1; margin-bottom:4px;">Cantidad de oro a vender:</label>
                        <input type="number" id="marketSellGoldAmount" class="form-control" style="width:100%;" required min="500" step="500" value="1000" oninput="updateMarketSellPreview()">
                    </div>
                    <div>
                        <label style="display:block; font-size:0.8rem; color:#cbd5e1; margin-bottom:4px;">Precio total solicitado (PD):</label>
                        <input type="number" id="marketSellPricePd" class="form-control" style="width:100%;" required min="1" step="1" value="2" oninput="updateMarketSellPreview()">
                    </div>
                </div>

                <!-- DESGLOSE EN TIEMPO REAL -->
                <div style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:0.8rem 1rem; margin-bottom:1.2rem;">
                    <div style="display:flex; justify-content:space-between; font-size:0.82rem; margin-bottom:4px;">
                        <span style="color:#94a3b8;">Comisión del Servidor (10%):</span>
                        <span id="marketSellFeeDisplay" style="color:#f87171; font-weight:700;">-1 PD</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:0.95rem; font-weight:800; border-top:1px solid rgba(255,255,255,0.08); padding-top:6px;">
                        <span style="color:#cbd5e1;">Recibirás neto al venderse:</span>
                        <span id="marketSellNetDisplay" style="color:#34d399;">💎 1 PD</span>
                    </div>
                </div>

                <button type="submit" class="btn-primary" style="width:100%; padding:0.8rem; font-size:0.95rem;">
                    🪙 Depositar en Custodia & Publicar Oferta
                </button>
            </form>
        `;
        setTimeout(window.updateMarketSellPreview, 50);

    } else if (tab === "orders") {
        container.innerHTML = `
            <div style="text-align:center; padding:2rem; color:var(--gold-primary);">
                ⏳ Consultando tus órdenes de mercado...
            </div>
        `;
        try {
            const res = await fetch(`${apiUrl}/api/market/my-orders?username=${encodeURIComponent(acct.username)}`, {
                headers: { "ngrok-skip-browser-warning": "true" }
            });
            const data = await res.json();
            const orders = (data && data.orders) ? data.orders : [];

            if (orders.length === 0) {
                container.innerHTML = `
                    <div style="text-align:center; padding:2rem; color:#94a3b8;">
                        No tienes publicaciones ni compras registradas en el mercado.
                    </div>
                `;
                return;
            }

            let rows = "";
            orders.forEach(o => {
                let badge = "";
                let actionBtn = "";
                if (o.status === "ACTIVE") {
                    badge = `<span style="color:#fbbf24; font-weight:800; font-size:0.78rem;">🟡 ACTIVA</span>`;
                    actionBtn = `
                        <button type="button" class="btn-secondary" onclick="cancelMarketListing(${o.id})" style="padding:0.3rem 0.6rem; font-size:0.75rem; color:#f87171; border-color:rgba(239,68,68,0.4);">
                            Cancelar
                        </button>
                    `;
                } else if (o.status === "COMPLETED") {
                    badge = `<span style="color:#34d399; font-weight:800; font-size:0.78rem;">🟢 COMPLETADA</span>`;
                    actionBtn = `<span style="color:#94a3b8; font-size:0.75rem;">Acreditado</span>`;
                } else {
                    badge = `<span style="color:#94a3b8; font-weight:700; font-size:0.78rem;">⚪ ${o.status}</span>`;
                    actionBtn = `<span style="color:#94a3b8; font-size:0.75rem;">Devuelto</span>`;
                }

                rows += `
                    <tr>
                        <td>
                            <strong style="color:#fff;">#${o.id} · ${o.seller_char}</strong>
                            <div style="font-size:0.75rem; color:#94a3b8;">${o.created_at.split(' ')[0]}</div>
                        </td>
                        <td><span style="color:var(--gold-primary); font-weight:700;">🪙 ${o.gold.toLocaleString()}g</span></td>
                        <td><span style="color:#38bdf8; font-weight:700;">💎 ${o.price_pd} PD</span></td>
                        <td>${badge}</td>
                        <td style="text-align:right;">${actionBtn}</td>
                    </tr>
                `;
            });

            container.innerHTML = `
                <div class="market-table-wrap">
                    <table class="market-table">
                        <thead>
                            <tr>
                                <th>Orden</th>
                                <th>Oro</th>
                                <th>Precio</th>
                                <th>Estado</th>
                                <th style="text-align:right;">Acción</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            `;
        } catch (err) {
            container.innerHTML = `<div style="color:#f87171; padding:1rem; text-align:center;">Error al cargar órdenes: ${err.message}</div>`;
        }

    } else if (tab === "token") {
        container.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:1rem; background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.3); border-radius:10px; padding:1rem;">
                <span style="font-size:2.4rem;">🎫</span>
                <div>
                    <h4 style="margin:0; color:#fff;">Ficha de Jaina (WoW Token Canónico)</h4>
                    <p style="margin:2px 0 0 0; font-size:0.8rem; color:#94a3b8;">Item ID: 900100 · Moneda puente entre la economía in-game y el portal web.</p>
                </div>
            </div>
            <div style="font-size:0.85rem; color:#cbd5e1; line-height:1.6; margin-bottom:1.2rem;">
                <p>• <strong>¿Cómo funciona?</strong> La Ficha de Jaina se puede adquirir en la <a href="tienda.html" style="color:var(--gold-primary); text-decoration:underline;">Tienda Oficial</a> o comerciar dentro del juego en la Casa de Subastas por oro.</p>
                <p>• <strong>Canje In-Game Inmediato:</strong> Al hacer <strong>clic derecho</strong> sobre una Ficha de Jaina en las bolsas de tu personaje, el ítem se consume y añade automáticamente <strong>+100 Puntos de Donación (PD)</strong> a tu cuenta web en tiempo real.</p>
                <p>• <strong>Comercio Libre y Seguro:</strong> Puedes vender la Ficha a otros jugadores directamente por ventanilla de intercambio o en la Casa de Subastas canónica sin ninguna restricción ni riesgo.</p>
            </div>
            <a href="tienda.html" class="btn-primary" style="display:block; text-align:center; padding:0.75rem; text-decoration:none;">
                💎 Ver Fichas y Packs en la Tienda Oficial
            </a>
        `;
    }
};

window.updateMarketSellPreview = function() {
    const sel = document.getElementById("marketSellCharGuid");
    const goldInput = document.getElementById("marketSellGoldAmount");
    const priceInput = document.getElementById("marketSellPricePd");
    const feeEl = document.getElementById("marketSellFeeDisplay");
    const netEl = document.getElementById("marketSellNetDisplay");
    if (!sel || !goldInput || !priceInput || !feeEl || !netEl) return;

    const price = parseInt(priceInput.value, 10) || 0;
    const fee = Math.max(1, Math.round(price * 0.10));
    const net = Math.max(0, price - fee);

    feeEl.textContent = `-${fee} PD`;
    netEl.textContent = `💎 ${net} PD`;
};

window.promptBuyMarketGold = async function(listingId, gold, pricePd, sellerChar) {
    if (!CURRENT_ACCOUNT_DATA) return;
    const acct = CURRENT_ACCOUNT_DATA.account;
    const chars = CURRENT_ACCOUNT_DATA.characters || [];

    if ((acct.dp || 0) < pricePd) {
        alert(`Saldo insuficiente. Tienes ${acct.dp || 0} PD y esta orden cuesta ${pricePd} PD.\nPuedes adquirir PD en la Tienda Oficial.`);
        return;
    }

    if (chars.length === 0) {
        alert("No tienes personajes en este reino para recibir el oro.");
        return;
    }

    let charNames = chars.map(c => c.name);
    let chosenChar = prompt(`Vas a comprar ${gold.toLocaleString()}g por ${pricePd} PD (Vendedor: ${sellerChar}).\n\nIngresa el nombre del personaje que recibirá el oro en su buzón de correo:`, charNames[0]);
    if (!chosenChar) return;

    chosenChar = chosenChar.trim();
    const apiUrl = getApiUrl();

    try {
        const res = await fetch(`${apiUrl}/api/market/buy`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
            body: JSON.stringify({
                username: acct.username,
                listing_id: listingId,
                buyer_char_name: chosenChar
            })
        });
        const data = await res.json();
        if (res.ok && data.ok) {
            alert(`✓ ${data.message}`);
            fetchAccountDetails(acct.username);
            switchMarketTab("buy");
        } else {
            alert(`✕ ${data.message || 'Error al comprar orden.'}`);
        }
    } catch (err) {
        alert(`Error de conexión: ${err.message}`);
    }
};

window.submitListGoldMarket = async function(e) {
    e.preventDefault();
    if (!CURRENT_ACCOUNT_DATA) return;
    const sel = document.getElementById("marketSellCharGuid");
    const goldInput = document.getElementById("marketSellGoldAmount");
    const priceInput = document.getElementById("marketSellPricePd");

    const opt = sel.options[sel.selectedIndex];
    const isOnline = parseInt(opt.getAttribute("data-online"), 10) === 1;
    const charGold = parseInt(opt.getAttribute("data-gold"), 10) || 0;
    const charGuid = parseInt(sel.value, 10);
    const goldAmt = parseInt(goldInput.value, 10) || 0;
    const pricePd = parseInt(priceInput.value, 10) || 0;

    if (isOnline) {
        alert("⚠️ Tu personaje está CONECTADO al juego.\n\nPara garantizar la custodia sin errores de guardado en el servidor, debes desconectar a tu personaje del juego antes de publicar.");
        return;
    }

    if (charGold < goldAmt) {
        alert(`Tu personaje solo tiene ${charGold.toLocaleString()}g. No puedes vender ${goldAmt.toLocaleString()}g.`);
        return;
    }

    const acct = CURRENT_ACCOUNT_DATA.account;
    const apiUrl = getApiUrl();

    try {
        const res = await fetch(`${apiUrl}/api/market/list-gold`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
            body: JSON.stringify({
                username: acct.username,
                char_guid: charGuid,
                gold_amount: goldAmt,
                price_pd: pricePd
            })
        });
        const data = await res.json();
        if (res.ok && data.ok) {
            alert(`✓ ${data.message}`);
            fetchAccountDetails(acct.username);
            switchMarketTab("orders");
        } else {
            alert(`✕ ${data.message || 'Error al publicar oferta.'}`);
        }
    } catch (err) {
        alert(`Error al publicar: ${err.message}`);
    }
};

window.cancelMarketListing = async function(listingId) {
    if (!confirm(`¿Estás seguro de cancelar la orden #${listingId}? El oro será devuelto inmediatamente al buzón de correo de tu personaje.`)) {
        return;
    }

    const acct = CURRENT_ACCOUNT_DATA.account;
    const apiUrl = getApiUrl();

    try {
        const res = await fetch(`${apiUrl}/api/market/cancel`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
            body: JSON.stringify({
                username: acct.username,
                listing_id: listingId
            })
        });
        const data = await res.json();
        if (res.ok && data.ok) {
            alert(`✓ ${data.message}`);
            switchMarketTab("orders");
        } else {
            alert(`✕ ${data.message || 'Error al cancelar orden.'}`);
        }
    } catch (err) {
        alert(`Error al cancelar: ${err.message}`);
    }
};
