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

    // 3. Inspección automática vía Query Param (?inspect=Rogotten o ?name=Jaina)
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const autoInspect = urlParams.get("inspect") || urlParams.get("name") || urlParams.get("character");
        if (autoInspect) {
            setTimeout(() => inspectCharacter(autoInspect), 350);
        }
    } catch (_) {}
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
            normalizeStr(c.name).includes(normalizeStr(currentSearch)) ||
            normalizeStr(c.guild).includes(normalizeStr(currentSearch)) ||
            normalizeStr(c.class).includes(normalizeStr(currentSearch));

        let matchesFilter = true;
        if (currentFilter === "online") {
            matchesFilter = !!c.online;
        } else if (currentFilter !== "all") {
            matchesFilter = (normalizeStr(c.class) === normalizeStr(currentFilter));
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


/* ==============================================================================
   FICHA DE EQUIPO VISUAL INTERACTIVA (PAPERDOLL CANÓNICO WOTLK 3.3.5a L9)
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
    if (!item || !item.entry) {
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

    const q = item.quality !== undefined ? item.quality : 4;
    const qName = QUALITY_NAMES[q] || "Épico";
    const cachedIcon = ITEM_ICON_CACHE[item.entry] || item.icon || null;
    const initialImgSrc = (cachedIcon && !cachedIcon.startsWith("http"))
        ? `https://wow.zamimg.com/images/wow/icons/large/${cachedIcon}.jpg`
        : (cachedIcon || `https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg`);

    return `
        <a href="https://www.wowhead.com/wotlk/item=${item.entry}" data-wowhead="item=${item.entry}&domain=wotlk" class="pd-slot-item q-${q}" target="_blank" rel="noopener noreferrer">
            <div class="pd-slot-icon-box q-${q}">
                <img class="pd-slot-icon-img" id="pdArmoryIcon-${item.entry}-${slotId}" src="${initialImgSrc}" alt="${item.name}" onerror="this.onerror=null; this.src='https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg'">
            </div>
            <div class="pd-slot-info">
                <span class="pd-slot-name-label">${sDef.name}</span>
                <span class="pd-slot-item-title q-${q}">${item.name}</span>
                <span class="pd-slot-ilvl-tag">iLvl ${item.ilvl || item.ItemLevel || 0} · ${qName}</span>
            </div>
        </a>
    `;
}

async function resolveArmoryPaperdollIcons(items) {
    if (!items || !items.length) return;
    for (const it of items) {
        if (!it.entry) continue;
        if (ITEM_ICON_CACHE[it.entry]) {
            updateArmoryItemIconElements(it.entry, ITEM_ICON_CACHE[it.entry]);
            continue;
        }

        try {
            const res = await fetch(`https://nether.wowhead.com/wotlk/tooltip/item/${it.entry}`, { mode: "cors" });
            if (res.ok) {
                const data = await res.json();
                if (data && data.icon) {
                    ITEM_ICON_CACHE[it.entry] = data.icon;
                    try {
                        localStorage.setItem("jaina_icon_" + it.entry, data.icon);
                    } catch(_) {}
                    updateArmoryItemIconElements(it.entry, data.icon);
                }
            }
        } catch (_) {}
    }
}

function updateArmoryItemIconElements(entry, iconName) {
    const imgs = document.querySelectorAll(`[id^="pdArmoryIcon-${entry}-"]`);
    imgs.forEach(img => {
        img.src = `https://wow.zamimg.com/images/wow/icons/large/${iconName}.jpg`;
    });
}

async function inspectCharacter(charName) {
    const modal = document.getElementById("characterModal");
    const modalBody = document.getElementById("characterModalContent");
    if (!modal || !modalBody) return;

    modal.classList.add("modal-visible");
    modalBody.innerHTML = `
        <div style="text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
            <div class="equalizer-wave" style="margin: 0 auto 1.5rem; justify-content: center;">
                <span class="eq-bar" style="height: 30px;"></span>
                <span class="eq-bar" style="height: 50px;"></span>
                <span class="eq-bar" style="height: 40px;"></span>
                <span class="eq-bar" style="height: 25px;"></span>
            </div>
            <h3 style="color: #fff; margin-bottom: 0.5rem;">Consultando Registro Histórico...</h3>
            <p>Sondeando acore_characters para el campeón <strong>${charName}</strong></p>
        </div>
    `;

    let char = allCharacters.find(c => c.name.toLowerCase() === charName.toLowerCase()) || { name: charName };

    // Intentar consulta profunda contra /api/armory/search
    const apiUrl = (typeof CONFIG !== "undefined" && typeof CONFIG.getApiUrl === "function")
        ? CONFIG.getApiUrl()
        : "http://127.0.0.1:8080";

    try {
        const ctrl = new AbortController();
        const timeoutId = setTimeout(() => ctrl.abort(), 2600);
        const res = await fetch(`${apiUrl}/api/armory/search?name=${encodeURIComponent(charName)}`, {
            signal: ctrl.signal,
            headers: { "Accept": "application/json", "ngrok-skip-browser-warning": "true" }
        });
        clearTimeout(timeoutId);
        if (res.ok) {
            const profile = await res.json();
            if (profile && profile.found) {
                char = { ...char, ...profile };
            }
        }
    } catch (_) {}

    const classBadge = getClassBadgeClass(char.class || "Guerrero");
    const itemsMap = char.items || {};
    const itemsList = Object.values(itemsMap);

    const leftSlotsHtml = LEFT_SLOT_IDS.map(id => renderSlotItemHtml(id, itemsMap[id])).join("");
    const rightSlotsHtml = RIGHT_SLOT_IDS.map(id => renderSlotItemHtml(id, itemsMap[id])).join("");
    const bottomSlotsHtml = BOTTOM_SLOT_IDS.map(id => renderSlotItemHtml(id, itemsMap[id])).join("");

    modalBody.innerHTML = `
        <div class="inspect-header">
            <div class="inspect-avatar-box">
                <span class="inspect-avatar-initial">${(char.name || "C").charAt(0)}</span>
            </div>
            <div>
                <h2 class="inspect-name">${char.name}</h2>
                <div class="inspect-title-tag">${char.title || 'Campeón de Azeroth'}</div>
                <div class="inspect-badges-row">
                    <span class="badge-class ${classBadge}">${char.class || 'Guerrero'}</span>
                    <span class="inspect-pill">${char.race || 'Humano'}</span>
                    <span class="inspect-pill" style="color: var(--gold-primary);">Nivel ${char.level || 60} (Vanilla)</span>
                    <span class="inspect-pill">${char.guild || 'Sin Hermandad'}</span>
                </div>
            </div>
        </div>

        <!-- WOW PAPERDOLL CANÓNICO DE 18 RANURAS -->
        <div class="pd-slots-container" style="display: grid; grid-template-columns: 1fr 280px 1fr; gap: 14px; margin: 1.5rem 0;">
            <!-- Columna Izquierda -->
            <div class="pd-slots-col pd-slots-left" style="display: flex; flex-direction: column; gap: 8px;">
                ${leftSlotsHtml}
            </div>

            <!-- Podio Central de Estadísticas y Avatar -->
            <div class="pd-center-podium">
                <div class="pd-gs-badge">
                    <span class="pd-gs-num">${char.gear_score || char.gs || 850}</span>
                    <span class="pd-gs-label">GEARSCORE</span>
                </div>
                <div style="color: #fff; font-weight: 700; font-size: 1.05rem; margin-bottom: 0.3rem;">${char.spec || 'Talentos Clásicos'}</div>
                <div style="color: var(--text-muted); font-size: 0.82rem; margin-bottom: 1.2rem;">${char.role || 'DPS'} · ${char.gender || 'Aventurero'}</div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%; text-align: left; font-size: 0.8rem;">
                    <div style="background: rgba(0,0,0,0.3); padding: 6px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
                        <span style="color: var(--text-muted); display: block; font-size: 0.7rem;">Salud</span>
                        <strong style="color: #39d353;">${(char.health || 4500).toLocaleString()} HP</strong>
                    </div>
                    <div style="background: rgba(0,0,0,0.3); padding: 6px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
                        <span style="color: var(--text-muted); display: block; font-size: 0.7rem;">Poder</span>
                        <strong style="color: #38bdf8;">${(char.mana || 3200).toLocaleString()} MP</strong>
                    </div>
                    <div style="background: rgba(0,0,0,0.3); padding: 6px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
                        <span style="color: var(--text-muted); display: block; font-size: 0.7rem;">Oro Acumulado</span>
                        <strong style="color: #ffd700;">${(char.money_gold || 120).toLocaleString()}g</strong>
                    </div>
                    <div style="background: rgba(0,0,0,0.3); padding: 6px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
                        <span style="color: var(--text-muted); display: block; font-size: 0.7rem;">Tiempo de Juego</span>
                        <strong style="color: #fff;">${char.playtime_hours || 48}h</strong>
                    </div>
                </div>

                <div style="margin-top: 1rem; font-size: 0.8rem; color: ${char.online ? '#39d353' : '#94a3b8'};">
                    ${char.online ? '● En Línea en el Reino' : '○ Desconectado (Guardado en DB)'}
                </div>
            </div>

            <!-- Columna Derecha -->
            <div class="pd-slots-col pd-slots-right" style="display: flex; flex-direction: column; gap: 8px;">
                ${rightSlotsHtml}
            </div>

            <!-- Armas Inferiores -->
            <div class="pd-bottom-weapons">
                ${bottomSlotsHtml}
            </div>
        </div>

        <div class="inspect-lore-box">
            <div class="lore-box-title">📜 Registro Histórico & Logros:</div>
            <p>${char.lore || `Campeón consagrado del Reino. Ha alcanzado ${char.achievements || 12} logros, ${char.total_kills || 24} muertes de honor y ${char.honor_points || 450} puntos de honor en las campañas de Era Vanilla.`}</p>
        </div>
    `;

    // Resolver iconos de Wowhead y tooltips de forma no bloqueante
    resolveArmoryPaperdollIcons(itemsList);
    if (window.$WowheadPower && typeof window.$WowheadPower.refreshLinks === "function") {
        try { window.$WowheadPower.refreshLinks(); } catch (_) {}
    }
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

function normalizeStr(s) {
    return s ? String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";
}

function getClassBadgeClass(className) {
    const map = {
        "guerrero": "class-guerrero",
        "paladin": "class-paladin",
        "cazador": "class-cazador",
        "picaro": "class-picaro",
        "sacerdote": "class-sacerdote",
        "caballero de la muerte": "class-dk",
        "chaman": "class-chaman",
        "mago": "class-mago",
        "brujo": "class-brujo",
        "druida": "class-druida"
    };
    const key = normalizeStr(className);
    return map[key] || "class-brujo";
}
