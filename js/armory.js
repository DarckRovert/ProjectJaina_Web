/**
 * ============================================================================
 * Project JAIna — Armería Oficial & Salón de Campeones
 * Archivo: js/armory.js
 * Versión: 3.0 Hito-125 (Armería en Vivo con MySQL · Auto-refresh 60s · Modal con ítems reales)
 * ============================================================================
 * Sincronización híbrida:
 *  1. Carga instantánea canónica local (data/armory.json) → render inmediato offline.
 *  2. Sondeo en vivo /api/armory → GS real desde acore_characters, cada 60s.
 *  3. inspectCharacter → llama /api/armory/search?name=X → muestra ítems reales equipados.
 * ============================================================================
 */

const CANONICAL_BASELINE = [{
    name: "Gasket",
    class: "Brujo",
    race: "No-Muerto",
    level: 60,
    guild: "Project JAIna",
    online: false,
    gs: 850,
    spec: "Destruccion",
    role: "DPS a Distancia",
    title: "Administrador de Proyecto",
    lore: "Primer avatar registrado del Reino de Theramore."
}];

let allCharacters  = [...CANONICAL_BASELINE];
let currentFilter  = "all";
let currentSearch  = "";
let isServerOnline = false;
let _refreshTimer  = null;

document.addEventListener("DOMContentLoaded", () => { initArmory(); });

// ─────────────────────────────────────────────────────────────────────────────
// BOOTSTRAP
// ─────────────────────────────────────────────────────────────────────────────
async function initArmory() {
    setupFiltersAndSearch();
    setupModalEvents();
    setupSyncButton();
    await loadLocalArmorySnapshot();
    await fetchLiveArmory();
    _startAutoRefresh();
}

function _startAutoRefresh() {
    if (_refreshTimer) clearInterval(_refreshTimer);
    // Auto-refresh cada 60s cuando el servidor está en vivo
    _refreshTimer = setInterval(async () => {
        if (isServerOnline) await fetchLiveArmory();
    }, 60000);
}

// ─────────────────────────────────────────────────────────────────────────────
// CARGA LOCAL (GitHub Pages / offline)
// ─────────────────────────────────────────────────────────────────────────────
async function loadLocalArmorySnapshot() {
    try {
        const resp = await fetch(`data/armory.json?t=${Date.now()}`);
        if (resp.ok) {
            const data = await resp.json();
            if (Array.isArray(data) && data.length > 0) {
                allCharacters = data.map(c => ({ ...c, online: false }));
            }
        }
    } catch (_) {
        allCharacters = [...CANONICAL_BASELINE];
    }
    updateArmoryStatusBadge(false, "○ SERVIDOR DESCONECTADO (REGISTRO LOCAL EN DISCO)");
    renderPodium(allCharacters);
    renderArmoryRows(allCharacters);
}

// ─────────────────────────────────────────────────────────────────────────────
// FETCH EN VIVO (acore_characters via WebAPI)
// ─────────────────────────────────────────────────────────────────────────────
async function fetchLiveArmory() {
    const syncBtn = document.getElementById("btnSyncArmory");
    if (syncBtn) { syncBtn.disabled = true; syncBtn.innerHTML = `⏳ Sincronizando...`; }
    updateArmoryStatusBadge(false, "⏳ COMPROBANDO ESTADO DEL REINO...");

    try {
        const apiUrl = (typeof CONFIG !== "undefined" && CONFIG.getApiUrl)
            ? CONFIG.getApiUrl() : "http://127.0.0.1:8080";

        const ctrl = new AbortController();
        const tid  = setTimeout(() => ctrl.abort(), 3000);

        const resp = await fetch(`${apiUrl}/api/armory`, {
            signal: ctrl.signal,
            headers: { "Accept": "application/json", "ngrok-skip-browser-warning": "true" }
        });
        clearTimeout(tid);

        if (resp.ok) {
            const liveData = await resp.json();
            if (Array.isArray(liveData) && liveData.length > 0) {
                allCharacters  = liveData;
                isServerOnline = true;
                const ts = new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                updateArmoryStatusBadge(true, `● EN VIVO · acore_characters · Actualizado ${ts}`);
                renderPodium(allCharacters);
                renderArmoryRows(allCharacters);
                return;
            }
        }
        throw new Error("Respuesta vacía");
    } catch (_) {
        isServerOnline = false;
        allCharacters  = allCharacters.map(c => ({ ...c, online: false }));
        updateArmoryStatusBadge(false, "○ SERVIDOR DESCONECTADO (ÚLTIMO REGISTRO EN DISCO)");
        renderPodium(allCharacters);
        renderArmoryRows(allCharacters);
    } finally {
        if (syncBtn) { syncBtn.disabled = false; syncBtn.innerHTML = `🔄 Sincronizar en Tiempo Real`; }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────────────────────────────────────
function updateArmoryStatusBadge(online, text) {
    const badge = document.getElementById("armoryLiveBadge");
    if (!badge) return;
    badge.textContent = text;
    if (online) {
        badge.className = "hero-banner-status armory-badge-live";
        badge.style.cssText = "color:#39d353;border-color:rgba(57,211,83,.4);background:rgba(57,211,83,.12);";
    } else {
        badge.className = "hero-banner-status armory-badge-offline";
        badge.style.cssText = "color:#ffb74d;border-color:rgba(255,183,77,.4);background:rgba(255,183,77,.12);";
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// PÓDIUM (1, 2 ó 3+ personajes)
// ─────────────────────────────────────────────────────────────────────────────
function renderPodium(chars) {
    const pc = document.getElementById("championsPodium");
    if (!pc) return;
    if (!chars || chars.length === 0) {
        pc.className = "podium-grid podium-empty";
        pc.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:2rem;">
            No hay héroes registrados en el salón de honor todavía.</div>`;
        return;
    }

    const _card = (c, medal, rank, mod) => {
        const cb = getClassBadgeClass(c.class);
        const gsColor = c.gs >= 2000 ? "#ffd700" : c.gs >= 1200 ? "#00e5ff" : "#a0a0c0";
        return `<div class="podium-card ${mod}" onclick="inspectCharacter('${c.name}')">
            <div class="podium-crown">${medal}</div>
            <div class="podium-avatar-wrap">
                <div class="podium-avatar-initial">${c.name.charAt(0)}</div>
                <span class="podium-rank-badge">${rank}</span>
            </div>
            <div class="podium-char-name">${c.name}</div>
            <div class="podium-char-title">${c.title || "Héroe de Azeroth"}</div>
            <div class="podium-class-pill"><span class="badge-class ${cb}">${c.class}</span></div>
            <div class="podium-stats">
                <span>Lv ${c.level}</span> · <span style="color:${gsColor};font-weight:700;">${c.gs || 850} GS</span> · <span>${c.guild}</span>
            </div>
            <div style="margin-top:.6rem;font-size:.75rem;color:${c.online ? "var(--status-online)" : "var(--text-muted)"};">
                ${c.online ? "● Conectado en Mundo" : "○ Servidor Standby"}
            </div>
        </div>`;
    };

    if (chars.length === 1) {
        pc.className = "podium-grid podium-single";
        pc.innerHTML = _card(chars[0], "👑", "1º", "podium-gold");
    } else if (chars.length === 2) {
        pc.className = "podium-grid podium-double";
        pc.innerHTML = _card(chars[0], "👑", "1º", "podium-gold") +
                       _card(chars[1], "🥈", "2º", "podium-silver");
    } else {
        pc.className = "podium-grid podium-triple";
        pc.innerHTML = _card(chars[1], "🥈", "2º", "podium-silver") +
                       _card(chars[0], "👑", "1º", "podium-gold") +
                       _card(chars[2], "🥉", "3º", "podium-bronze");
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// TABLA DE ARMERÍA
// ─────────────────────────────────────────────────────────────────────────────
function renderArmoryRows(chars) {
    const body    = document.getElementById("armoryTableBody");
    const loading = document.getElementById("armoryLoading");
    if (!body) return;
    if (loading) loading.remove();

    const filtered = chars.filter(c => {
        const q = currentSearch;
        const matchesSearch = !q || c.name.toLowerCase().includes(q) ||
            (c.guild || "").toLowerCase().includes(q) ||
            (c.class || "").toLowerCase().includes(q);
        const matchesFilter = currentFilter === "all" || currentFilter === "online"
            ? (currentFilter === "online" ? !!c.online : true)
            : (c.class || "").toLowerCase() === currentFilter.toLowerCase();
        return matchesSearch && matchesFilter;
    });

    if (!filtered.length) {
        body.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:2.5rem;">
            No se encontraron héroes con ese filtro o búsqueda.</td></tr>`;
        return;
    }

    const QUALITY_COLOR = { 0:"#9d9d9d",1:"#ffffff",2:"#1eff00",3:"#0070dd",4:"#a335ee",5:"#ff8000" };

    body.innerHTML = filtered.map((c, i) => {
        const cb      = getClassBadgeClass(c.class);
        const status  = c.online
            ? `<span class="online-tag">● En Línea</span>`
            : `<span class="offline-tag">○ Desconectado</span>`;
        const gsColor = c.gs >= 2000 ? "#ffd700" : c.gs >= 1200 ? "#00e5ff" : "#a0a0c0";
        return `<tr class="armory-row" onclick="inspectCharacter('${c.name}')">
            <td class="rank-cell">#${i+1}</td>
            <td class="name-cell">
                <strong>${c.name}</strong>
                <div class="char-title-small">${c.title || "Héroe del Reino"}</div>
            </td>
            <td><span class="badge-class ${cb}">${c.class}</span></td>
            <td>${c.race}</td>
            <td class="level-cell">${c.level}</td>
            <td class="guild-cell">${c.guild}</td>
            <td>${status}</td>
            <td>
                <span style="color:${gsColor};font-weight:700;">${c.gs || "—"} GS</span>
                <button class="btn-inspect" onclick="event.stopPropagation();inspectCharacter('${c.name}')">🔍 Ver Ficha</button>
            </td>
        </tr>`;
    }).join("");
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL DE INSPECCIÓN — Hito #125: consulta /api/armory/search en vivo
// ─────────────────────────────────────────────────────────────────────────────
async function inspectCharacter(charName) {
    const modal     = document.getElementById("characterModal");
    const modalBody = document.getElementById("characterModalContent");
    if (!modal || !modalBody) return;

    // Mostrar spinner mientras carga
    modalBody.innerHTML = `<div style="text-align:center;padding:3rem;color:var(--text-muted);">
        ⏳ Consultando ficha de <strong>${charName}</strong>...</div>`;
    modal.classList.add("modal-visible");

    let char = null;
    let liveProfile = null;

    // Intentar obtener perfil completo con items del backend
    if (isServerOnline) {
        try {
            const apiUrl = (typeof CONFIG !== "undefined" && CONFIG.getApiUrl)
                ? CONFIG.getApiUrl() : "http://127.0.0.1:8080";
            const ctrl   = new AbortController();
            const tid    = setTimeout(() => ctrl.abort(), 3000);
            const resp   = await fetch(
                `${apiUrl}/api/armory/search?name=${encodeURIComponent(charName)}`,
                { signal: ctrl.signal, headers: { "ngrok-skip-browser-warning": "true" } }
            );
            clearTimeout(tid);
            if (resp.ok) {
                const data = await resp.json();
                if (data && data.found) liveProfile = data;
            }
        } catch (_) { /* fallback local */ }
    }

    // Fallback: datos del ranking local
    char = liveProfile || allCharacters.find(c => c.name.toLowerCase() === charName.toLowerCase()) || allCharacters[0];
    if (!char) { modal.classList.remove("modal-visible"); return; }

    const cb = getClassBadgeClass(char.class);
    const QUALITY_COLOR = { 0:"#9d9d9d",1:"#ffffff",2:"#1eff00",3:"#0070dd",4:"#a335ee",5:"#ff8000" };

    // Sección de ítems equipados (solo disponible con liveProfile)
    let itemsHtml = "";
    if (liveProfile && liveProfile.items && liveProfile.items.length > 0) {
        const rows = liveProfile.items.map(it => {
            const col = QUALITY_COLOR[it.quality] || "#fff";
            return `<tr>
                <td style="color:var(--text-muted);font-size:.78rem;">${it.slot_name}</td>
                <td style="color:${col};font-weight:600;">${it.name}</td>
                <td style="text-align:center;color:#a0c4ff;">${it.ilvl}</td>
                <td style="text-align:center;color:${col};font-size:.78rem;">${it.quality_name}</td>
                <td style="text-align:center;color:#00e5ff;">+${it.gs_contribution}</td>
            </tr>`;
        }).join("");
        itemsHtml = `
        <div class="inspect-lore-box" style="margin-top:1.2rem;">
            <div class="lore-box-title">⚔️ Equipo Verificado (acore_characters · item_template):</div>
            <div style="overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;font-size:.82rem;">
                    <thead>
                        <tr style="color:var(--text-muted);border-bottom:1px solid rgba(255,255,255,.08);">
                            <th style="text-align:left;padding:.3rem .5rem;">Slot</th>
                            <th style="text-align:left;padding:.3rem .5rem;">Ítem</th>
                            <th style="padding:.3rem .5rem;">iLvl</th>
                            <th style="padding:.3rem .5rem;">Calidad</th>
                            <th style="padding:.3rem .5rem;">GS</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>`;
    } else if (!liveProfile) {
        itemsHtml = `<div class="inspect-lore-box" style="margin-top:1rem;">
            <div class="lore-box-title">⚠️ Detalle de ítems no disponible (servidor offline)</div>
        </div>`;
    }

    // Estadísticas PvP y progresión
    const honor  = char.honor_points !== undefined ? char.honor_points : (char.honor || 0);
    const kills  = char.total_kills  !== undefined ? char.total_kills  : (char.kills || 0);
    const ach    = char.achievements || 0;
    const gold   = char.money_gold   !== undefined ? char.money_gold   : "—";
    const hours  = char.playtime_hours !== undefined ? `${char.playtime_hours}h` : "—";
    const gsColor = (char.gear_score || char.gs || 0) >= 2000 ? "#ffd700"
                  : (char.gear_score || char.gs || 0) >= 1200 ? "#00e5ff" : "#a0c4ff";

    modalBody.innerHTML = `
        <div class="inspect-header">
            <div class="inspect-avatar-box">
                <span class="inspect-avatar-initial">${char.name.charAt(0)}</span>
            </div>
            <div>
                <h2 class="inspect-name">${char.name}</h2>
                <div class="inspect-title-tag">${char.title || "Campeón de Azeroth"}</div>
                <div class="inspect-badges-row">
                    <span class="badge-class ${cb}">${char.class}</span>
                    <span class="inspect-pill">${char.race || ""}</span>
                    <span class="inspect-pill" style="color:var(--gold-primary);">Nivel ${char.level}${char.level_cap ? " / " + char.level_cap : ""}</span>
                    <span class="inspect-pill">${char.guild || "Sin hermandad"}</span>
                    ${liveProfile ? `<span class="inspect-pill" style="color:#39d353;border-color:rgba(57,211,83,.3);">● Datos en vivo</span>` : ""}
                </div>
            </div>
        </div>

        <div class="inspect-stats-grid">
            <div class="inspect-stat-card">
                <div class="stat-name">GearScore Real (DB)</div>
                <div class="stat-val" style="color:${gsColor};">${char.gear_score || char.gs || "—"} GS</div>
            </div>
            <div class="inspect-stat-card">
                <div class="stat-name">Especialización</div>
                <div class="stat-val" style="color:var(--gold-primary);">${char.spec || "Talentos Clásicos"}</div>
            </div>
            <div class="inspect-stat-card">
                <div class="stat-name">Rol</div>
                <div class="stat-val">${char.role || "DPS"}</div>
            </div>
            <div class="inspect-stat-card">
                <div class="stat-name">Estado</div>
                <div class="stat-val" style="color:${char.online ? "var(--status-online)" : "var(--text-muted)"};">
                    ${char.online ? "● En Mundo" : "○ Desconectado"}
                </div>
            </div>
            <div class="inspect-stat-card">
                <div class="stat-name">Puntos de Honor</div>
                <div class="stat-val" style="color:#ff6b6b;">${honor.toLocaleString()}</div>
            </div>
            <div class="inspect-stat-card">
                <div class="stat-name">Bajas en PvP</div>
                <div class="stat-val" style="color:#ff9800;">${kills.toLocaleString()}</div>
            </div>
            <div class="inspect-stat-card">
                <div class="stat-name">Logros</div>
                <div class="stat-val" style="color:#ffd700;">${ach} 🏆</div>
            </div>
            <div class="inspect-stat-card">
                <div class="stat-name">Oro · Tiempo</div>
                <div class="stat-val" style="color:#c8a800;">${gold}g · ${hours}</div>
            </div>
        </div>

        ${itemsHtml}

        <div class="inspect-lore-box" style="margin-top:1rem;">
            <div class="lore-box-title">📜 Registro Histórico:</div>
            <p>${char.lore || `Héroe registrado bajo la jurisdicción de <strong>${char.guild || "Project JAIna"}</strong>.`}</p>
        </div>
    `;
}

// ─────────────────────────────────────────────────────────────────────────────
// SETUP EVENTOS
// ─────────────────────────────────────────────────────────────────────────────
function setupFiltersAndSearch() {
    const inp   = document.getElementById("armorySearchInput");
    const chips = document.querySelectorAll(".filter-chip");
    if (inp) inp.addEventListener("input", e => { currentSearch = e.target.value.trim().toLowerCase(); renderArmoryRows(allCharacters); });
    chips.forEach(chip => chip.addEventListener("click", () => {
        chips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        currentFilter = chip.getAttribute("data-filter");
        renderArmoryRows(allCharacters);
    }));
}

function setupSyncButton() {
    const btn = document.getElementById("btnSyncArmory");
    if (btn) btn.addEventListener("click", () => fetchLiveArmory());
}

function setupModalEvents() {
    const modal    = document.getElementById("characterModal");
    const closeBtn = document.getElementById("closeCharModalBtn");
    if (!modal) return;
    if (closeBtn) closeBtn.addEventListener("click", () => modal.classList.remove("modal-visible"));
    modal.addEventListener("click", e => { if (e.target === modal) modal.classList.remove("modal-visible"); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") modal.classList.remove("modal-visible"); });
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────────────────────────────────────
function getClassBadgeClass(cls) {
    const map = {
        "Guerrero":"class-guerrero","Paladin":"class-paladin","Paladín":"class-paladin",
        "Cazador":"class-cazador","Picaro":"class-picaro","Pícaro":"class-picaro",
        "Sacerdote":"class-sacerdote","Caballero de la Muerte":"class-dk",
        "Chaman":"class-chaman","Chamán":"class-chaman",
        "Mago":"class-mago","Brujo":"class-brujo","Druida":"class-druida"
    };
    return map[cls] || "class-brujo";
}
