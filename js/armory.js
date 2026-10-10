/**
 * ============================================================================
 * Project JAIna — Armería Oficial & Salón de Campeones
 * Archivo: js/armory.js
 * Versión: 2.5 Mythos (Empirismo Estricto & Telemetría Canónica)
 * ============================================================================
 * Sincronización híbrida bidireccional:
 * 1. Carga inmediata de instantánea canónica local (data/armory.json) para
 *    soporte offline y GitHub Pages (HTTPS sin mixed-content).
 * 2. Sondeo en vivo hacia ProjectJaina_WebAPI (/api/armory) para actualización
 *    en tiempo real desde acore_characters cuando el clúster está encendido.
 * 3. Detección visual rigurosa: Si el servidor está apagado, se declara
 *    ○ SERVIDOR DESCONECTADO y ningún personaje figura ficticiamente en línea.
 * ============================================================================
 */

const CANONICAL_BASELINE = [
    {
        name: "Gasket",
        class: "Brujo",
        race: "No-Muerto",
        level: 60,
        guild: "Project JAIna",
        online: false,
        gs: 850,
        spec: "Destrucción",
        role: "DPS a Distancia",
        title: "Administrador de Proyecto",
        lore: "Primer avatar registrado del Reino de Theramore. Ostenta privilegios administrativos y enlace directo con la red neuronal de Lore."
    }
];

let allCharacters = [...CANONICAL_BASELINE];
let currentFilter = "all";
let currentSearch = "";
let isServerOnline = false;

document.addEventListener("DOMContentLoaded", () => {
    initArmory();
});

async function initArmory() {
    setupFiltersAndSearch();
    setupModalEvents();
    setupSyncButton();

    // 1. Carga instantánea canónica en disco para render instantáneo
    await loadLocalArmorySnapshot();

    // 2. Probar conexión en vivo contra el micro-backend
    await fetchLiveArmory();
}

/**
 * Carga el registro estático data/armory.json (SSOT en disco)
 */
async function loadLocalArmorySnapshot() {
    try {
        const resp = await fetch(`data/armory.json?t=${Date.now()}`);
        if (resp.ok) {
            const data = await resp.json();
            if (Array.isArray(data) && data.length > 0) {
                // Si el servidor está apagado o no comprobado, forzamos status offline
                allCharacters = data.map(c => ({ ...c, online: false }));
            }
        }
    } catch (err) {
        console.warn("[Armería] Usando instantánea de respaldo integrada:", err);
        allCharacters = [...CANONICAL_BASELINE];
    }

    updateArmoryStatusBadge(false, "○ SERVIDOR DESCONECTADO (REGISTRO LOCAL EN DISCO)");
    renderPodium(allCharacters);
    renderArmoryRows(allCharacters);
}

/**
 * Sondea el micro-backend en vivo para obtener los datos de acore_characters
 */
async function fetchLiveArmory() {
    const syncBtn = document.getElementById("btnSyncArmory");
    if (syncBtn) {
        syncBtn.disabled = true;
        syncBtn.innerHTML = `⏳ Sincronizando...`;
    }

    updateArmoryStatusBadge(false, "⏳ COMPROBANDO ESTADO DEL REINO...");

    try {
        const apiUrl = (typeof CONFIG !== "undefined" && CONFIG.getApiUrl)
            ? CONFIG.getApiUrl()
            : "http://127.0.0.1:8080";

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const response = await fetch(`${apiUrl}/api/armory`, {
            method: "GET",
            signal: controller.signal,
            headers: {
                "Accept": "application/json",
                "ngrok-skip-browser-warning": "true"
            }
        });
        clearTimeout(timeoutId);

        if (response.ok) {
            const liveData = await response.json();
            if (Array.isArray(liveData) && liveData.length > 0) {
                allCharacters = liveData;
                isServerOnline = true;
                updateArmoryStatusBadge(true, "● SERVIDOR EN VIVO (SINCRONIZADO CON ACORE_CHARACTERS)");
                renderPodium(allCharacters);
                renderArmoryRows(allCharacters);
                return;
            }
        }
        throw new Error("Respuesta inválida o vacía");
    } catch (e) {
        // Servidor offline / Túnel inactivo
        isServerOnline = false;
        // En modo offline, forzamos que ningún personaje muestre 'online'
        allCharacters = allCharacters.map(c => ({ ...c, online: false }));
        updateArmoryStatusBadge(false, "○ SERVIDOR DESCONECTADO (ÚLTIMO REGISTRO EN DISCO)");
        renderPodium(allCharacters);
        renderArmoryRows(allCharacters);
    } finally {
        if (syncBtn) {
            syncBtn.disabled = false;
            syncBtn.innerHTML = `🔄 Sincronizar en Tiempo Real`;
        }
    }
}

function updateArmoryStatusBadge(online, text) {
    const badge = document.getElementById("armoryLiveBadge");
    if (!badge) return;

    badge.textContent = text;
    if (online) {
        badge.className = "hero-banner-status armory-badge-live";
        badge.style.color = "#39d353";
        badge.style.borderColor = "rgba(57, 211, 83, 0.4)";
        badge.style.background = "rgba(57, 211, 83, 0.12)";
    } else {
        badge.className = "hero-banner-status armory-badge-offline";
        badge.style.color = "#ffb74d";
        badge.style.borderColor = "rgba(255, 183, 77, 0.4)";
        badge.style.background = "rgba(255, 183, 77, 0.12)";
    }
}

/**
 * Renderizado adaptable del Podio:
 * Soporta de 1 a N personajes sin romper la grilla visual.
 */
function renderPodium(chars) {
    const podiumContainer = document.getElementById("championsPodium");
    if (!podiumContainer) return;

    if (!chars || chars.length === 0) {
        podiumContainer.className = "podium-grid podium-empty";
        podiumContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">
                No hay héroes registrados en el salón de honor todavía.
            </div>
        `;
        return;
    }

    // Caso 1: Un solo campeón (ej: Gasket como primer héroe)
    if (chars.length === 1) {
        podiumContainer.className = "podium-grid podium-single";
        const c = chars[0];
        const classBadge = getClassBadgeClass(c.class);
        podiumContainer.innerHTML = `
            <div class="podium-card podium-gold" onclick="inspectCharacter('${c.name}')" style="max-width: 360px; margin: 0 auto; width: 100%;">
                <div class="podium-crown">👑</div>
                <div class="podium-avatar-wrap">
                    <div class="podium-avatar-initial">${c.name.charAt(0)}</div>
                    <span class="podium-rank-badge">1º</span>
                </div>
                <div class="podium-char-name">${c.name}</div>
                <div class="podium-char-title">${c.title || 'Campeón Supremo del Reino'}</div>
                <div class="podium-class-pill"><span class="badge-class ${classBadge}">${c.class}</span></div>
                <div class="podium-stats">
                    <span>Lv ${c.level} (Vanilla)</span> · <span>${c.gs || 850} GS</span> · <span>${c.guild}</span>
                </div>
                <div style="margin-top: 0.8rem; font-size: 0.75rem; color: ${c.online ? 'var(--status-online)' : 'var(--text-muted)'};">
                    ${c.online ? '● Conectado en Mundo' : '○ Servidor Desconectado'}
                </div>
            </div>
        `;
        return;
    }

    // Caso 2: Dos campeones (1º Oro, 2º Plata)
    if (chars.length === 2) {
        podiumContainer.className = "podium-grid podium-double";
        const ranks = [
            { place: "1º", medal: "👑", label: "CAMPEÓN", classMod: "podium-gold", c: chars[0] },
            { place: "2º", medal: "🥈", label: "PLATA", classMod: "podium-silver", c: chars[1] }
        ];

        podiumContainer.innerHTML = ranks.map(r => {
            const c = r.c;
            const classBadge = getClassBadgeClass(c.class);
            return `
                <div class="podium-card ${r.classMod}" onclick="inspectCharacter('${c.name}')">
                    <div class="podium-crown">${r.medal}</div>
                    <div class="podium-avatar-wrap">
                        <div class="podium-avatar-initial">${c.name.charAt(0)}</div>
                        <span class="podium-rank-badge">${r.place}</span>
                    </div>
                    <div class="podium-char-name">${c.name}</div>
                    <div class="podium-char-title">${c.title || 'Héroe de Azeroth'}</div>
                    <div class="podium-class-pill"><span class="badge-class ${classBadge}">${c.class}</span></div>
                    <div class="podium-stats">
                        <span>Lv ${c.level}</span> · <span>${c.gs || 850} GS</span> · <span>${c.guild}</span>
                    </div>
                </div>
            `;
        }).join("");
        return;
    }

    // Caso 3: Tres o más campeones (Orden visual tradicional: 2º Plata, 1º Oro al centro, 3º Bronce)
    podiumContainer.className = "podium-grid podium-triple";
    const ranks = [
        { place: "2º", medal: "🥈", label: "PLATA", classMod: "podium-silver", c: chars[1] },
        { place: "1º", medal: "👑", label: "CAMPEÓN SUPREMO", classMod: "podium-gold", c: chars[0] },
        { place: "3º", medal: "🥉", label: "BRONCE", classMod: "podium-bronze", c: chars[2] }
    ];

    podiumContainer.innerHTML = ranks.map(r => {
        const c = r.c;
        const classBadge = getClassBadgeClass(c.class);
        return `
            <div class="podium-card ${r.classMod}" onclick="inspectCharacter('${c.name}')">
                <div class="podium-crown">${r.medal}</div>
                <div class="podium-avatar-wrap">
                    <div class="podium-avatar-initial">${c.name.charAt(0)}</div>
                    <span class="podium-rank-badge">${r.place}</span>
                </div>
                <div class="podium-char-name">${c.name}</div>
                <div class="podium-char-title">${c.title || 'Héroe de Azeroth'}</div>
                <div class="podium-class-pill"><span class="badge-class ${classBadge}">${c.class}</span></div>
                <div class="podium-stats">
                    <span>Lv ${c.level}</span> · <span>${c.gs || 850} GS</span> · <span>${c.guild}</span>
                </div>
            </div>
        `;
    }).join("");
}

function renderArmoryRows(chars) {
    const tableBody = document.getElementById("armoryTableBody");
    const loadingRow = document.getElementById("armoryLoading");
    if (!tableBody) return;
    if (loadingRow) loadingRow.remove();

    let filtered = chars.filter(c => {
        const matchesSearch = !currentSearch ||
            c.name.toLowerCase().includes(currentSearch) ||
            c.guild.toLowerCase().includes(currentSearch) ||
            c.class.toLowerCase().includes(currentSearch);

        let matchesFilter = true;
        if (currentFilter === "online") {
            matchesFilter = !!c.online;
        } else if (currentFilter !== "all") {
            matchesFilter = (c.class.toLowerCase() === currentFilter.toLowerCase());
        }

        return matchesSearch && matchesFilter;
    });

    if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2.5rem;">No se encontraron héroes que coincidan con la búsqueda o filtro seleccionado.</td></tr>`;
        return;
    }

    tableBody.innerHTML = filtered.map((c, idx) => {
        const classClass = getClassBadgeClass(c.class);
        const statusBadge = c.online
            ? `<span class="online-tag">● En Línea</span>`
            : `<span class="offline-tag">○ Desconectado</span>`;

        return `
            <tr class="armory-row" onclick="inspectCharacter('${c.name}')">
                <td class="rank-cell">#${idx + 1}</td>
                <td class="name-cell">
                    <strong>${c.name}</strong>
                    <div class="char-title-small">${c.title || 'Héroe del Reino'}</div>
                </td>
                <td><span class="badge-class ${classClass}">${c.class}</span></td>
                <td>${c.race}</td>
                <td class="level-cell">${c.level}</td>
                <td class="guild-cell">${c.guild}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn-inspect" onclick="event.stopPropagation(); inspectCharacter('${c.name}')">
                        🔍 Ver Ficha
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

function setupFiltersAndSearch() {
    const searchInput = document.getElementById("armorySearchInput");
    const chips = document.querySelectorAll(".filter-chip");

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            currentSearch = e.target.value.trim().toLowerCase();
            renderArmoryRows(allCharacters);
        });
    }

    chips.forEach(chip => {
        chip.addEventListener("click", () => {
            chips.forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            currentFilter = chip.getAttribute("data-filter");
            renderArmoryRows(allCharacters);
        });
    });
}

function setupSyncButton() {
    const syncBtn = document.getElementById("btnSyncArmory");
    if (syncBtn) {
        syncBtn.addEventListener("click", () => {
            fetchLiveArmory();
        });
    }
}

function inspectCharacter(charName) {
    const char = allCharacters.find(c => c.name.toLowerCase() === charName.toLowerCase()) || allCharacters[0];
    if (!char) return;

    const modal = document.getElementById("characterModal");
    const modalBody = document.getElementById("characterModalContent");
    if (!modal || !modalBody) return;

    const classBadge = getClassBadgeClass(char.class);

    modalBody.innerHTML = `
        <div class="inspect-header">
            <div class="inspect-avatar-box">
                <span class="inspect-avatar-initial">${char.name.charAt(0)}</span>
            </div>
            <div>
                <h2 class="inspect-name">${char.name}</h2>
                <div class="inspect-title-tag">${char.title || 'Campeón de Azeroth'}</div>
                <div class="inspect-badges-row">
                    <span class="badge-class ${classBadge}">${char.class}</span>
                    <span class="inspect-pill">${char.race}</span>
                    <span class="inspect-pill" style="color: var(--gold-primary);">Nivel ${char.level} (Vanilla)</span>
                    <span class="inspect-pill">${char.guild}</span>
                </div>
            </div>
        </div>

        <div class="inspect-stats-grid">
            <div class="inspect-stat-card">
                <div class="stat-name">Puntuación de Equipo (GS)</div>
                <div class="stat-val" style="color: #00e5ff;">${char.gs || 850} GS</div>
            </div>
            <div class="inspect-stat-card">
                <div class="stat-name">Especialización</div>
                <div class="stat-val" style="color: var(--gold-primary);">${char.spec || 'Talentos de Era Clásica'}</div>
            </div>
            <div class="inspect-stat-card">
                <div class="stat-name">Rol de Combate</div>
                <div class="stat-val">${char.role || 'DPS'}</div>
            </div>
            <div class="inspect-stat-card">
                <div class="stat-name">Estado en Reino</div>
                <div class="stat-val" style="color: ${char.online ? 'var(--status-online)' : 'var(--text-muted)'};">
                    ${char.online ? '● Conectado (En Mundo)' : '○ Desconectado (Servidor Standby)'}
                </div>
            </div>
        </div>

        <div class="inspect-lore-box">
            <div class="lore-box-title">📜 Registro Histórico del Campeón:</div>
            <p>${char.lore || `Héroe registrado bajo la jurisdicción de <strong>${char.guild}</strong>. Ha participado en campañas de la Era Clásica de Azeroth con acceso a los sagrarios de Theramore y Dalaran.`}</p>
        </div>
    `;

    modal.classList.add("modal-visible");
}

function setupModalEvents() {
    const modal = document.getElementById("characterModal");
    const closeBtn = document.getElementById("closeCharModalBtn");
    if (!modal) return;

    if (closeBtn) {
        closeBtn.addEventListener("click", () => modal.classList.remove("modal-visible"));
    }
    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.remove("modal-visible");
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") modal.classList.remove("modal-visible");
    });
}

function getClassBadgeClass(className) {
    const map = {
        "Guerrero": "class-guerrero",
        "Paladín": "class-paladin",
        "Cazador": "class-cazador",
        "Pícaro": "class-picaro",
        "Sacerdote": "class-sacerdote",
        "Caballero de la Muerte": "class-dk",
        "Chamán": "class-chaman",
        "Mago": "class-mago",
        "Brujo": "class-brujo",
        "Druida": "class-druida"
    };
    return map[className] || "class-brujo";
}
