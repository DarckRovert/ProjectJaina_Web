/**
 * Project JAIna — Controlador del Panel de Control de Cuenta del Jugador
 * Versión: 3.0 (Gestión Total de Personajes, Unstuck, Teletransporte y Criptografía SRP6)
 */

document.addEventListener("DOMContentLoaded", () => {
    initDashboard();

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
            setupSecurityForm(data.account);
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
    const gmEl = document.getElementById("dashAcctGmTitle");
    const emailEl = document.getElementById("dashAcctEmail");
    const joinEl = document.getElementById("dashAcctJoinDate");
    const loginEl = document.getElementById("dashAcctLastLogin");
    const ipEl = document.getElementById("dashAcctLastIp");
    const factionEl = document.getElementById("dashAcctFaction");
    const charCountEl = document.getElementById("dashCharCountBadge");

    if (nameEl) nameEl.textContent = account.username;
    if (idEl) idEl.textContent = `#${account.id}`;
    if (gmEl) {
        gmEl.textContent = account.gmtitle || "Aventurero de Azeroth";
        if (account.gmlevel > 0) {
            gmEl.className = "dash-gm-badge active";
        }
    }
    if (emailEl) emailEl.textContent = account.email;
    if (joinEl) joinEl.textContent = account.joindate;
    if (loginEl) loginEl.textContent = account.last_login;
    if (ipEl) ipEl.textContent = account.last_ip;
    if (charCountEl) charCountEl.textContent = `${charCount} ${charCount === 1 ? 'Campeón' : 'Campeones'}`;

    if (factionEl) {
        let fIcon = "🦁";
        let fName = "Alianza & Theramore";
        if (account.clan === "HORDE") {
            fIcon = "🐺";
            fName = "La Horda de Orgrimmar";
        } else if (account.clan === "KIRIN_TOR") {
            fIcon = "🔮";
            fName = "Kirin Tor de Dalaran";
        }
        factionEl.innerHTML = `${fIcon} ${fName}`;
    }
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

        return `
            <div class="dash-char-card" id="charCard-${c.guid}">
                <div class="dash-char-header">
                    <div class="char-portrait-box" style="border-color: ${cColor};">
                        <span class="char-portrait-icon">⚔️</span>
                        <span class="char-lvl-tag" style="background:${cColor}; color:#000;">${c.level}</span>
                    </div>
                    <div class="char-meta-main">
                        <div style="display:flex; align-items:center; justify-content:space-between; gap:6px;">
                            <h3 class="char-name" style="color:${cColor};">${c.name}</h3>
                            <span class="char-status-badge ${isOnline ? 'online' : 'offline'}">
                                ${isOnline ? '● En Línea' : '○ Desconectado'}
                            </span>
                        </div>
                        <div class="char-subline">
                            <span style="color:${factionColor}; font-weight:700;">${factionIcon} ${c.race_name}</span> · 
                            <span style="color:${cColor}; font-weight:700;">${c.class_name}</span>
                        </div>
                    </div>
                </div>

                <div class="dash-char-details">
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
                <div class="dash-char-actions">
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
 * Formulario de Cambio de Contraseña SRP6
 */
function setupSecurityForm(account) {
    const form = document.getElementById("dashPasswordForm");
    const msgBox = document.getElementById("dashSecurityMsg");
    if (!form) return;

    form.onsubmit = async (e) => {
        e.preventDefault();

        const currentPass = document.getElementById("dashCurrentPass").value;
        const newPass = document.getElementById("dashNewPass").value;
        const confirmPass = document.getElementById("dashConfirmPass").value;

        if (newPass !== confirmPass) {
            showSecurityMsg("Las contraseñas nuevas no coinciden.", "error");
            return;
        }

        if (newPass.length < 4) {
            showSecurityMsg("La nueva contraseña debe tener al menos 4 caracteres.", "error");
            return;
        }

        showSecurityMsg("⏳ Generando nuevo Salt y Verifier SRP6...", "info");

        try {
            const apiUrl = getApiUrl();
            const res = await fetch(`${apiUrl}/api/account/change-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
                body: JSON.stringify({
                    username: account.username,
                    current_password: currentPass,
                    new_password: newPass
                })
            });

            const data = await res.json();
            if (res.ok && data.ok) {
                showSecurityMsg(`✓ ${data.message}`, "success");
                form.reset();
                if (window.showPortalToast) {
                    showPortalToast("🔒 ¡Contraseña actualizada exitosamente con SRP6!", "success");
                }
            } else {
                showSecurityMsg(`⚠️ ${data.message || 'Error al cambiar contraseña.'}`, "error");
            }
        } catch (err) {
            showSecurityMsg("🛡️ Error de conexión con el servidor de autenticación.", "error");
        }
    };

    function showSecurityMsg(txt, type) {
        if (!msgBox) return;
        msgBox.innerHTML = txt;
        msgBox.style.display = "block";
        if (type === "success") {
            msgBox.style.background = "rgba(16, 185, 129, 0.15)";
            msgBox.style.borderColor = "rgba(16, 185, 129, 0.5)";
            msgBox.style.color = "#34d399";
        } else if (type === "error") {
            msgBox.style.background = "rgba(239, 68, 68, 0.15)";
            msgBox.style.borderColor = "rgba(239, 68, 68, 0.5)";
            msgBox.style.color = "#f87171";
        } else {
            msgBox.style.background = "rgba(56, 189, 248, 0.15)";
            msgBox.style.borderColor = "rgba(56, 189, 248, 0.5)";
            msgBox.style.color = "#38bdf8";
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
