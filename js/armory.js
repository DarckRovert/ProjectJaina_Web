/**
 * ============================================================================
 * Project JAIna — Armería Oficial & Salón de Campeones v7.1
 * Archivo: js/armory.js
 * Garantías L9:
 *  1. Paperdoll 19-Slot ("0".."18") responsivo en Desktop, Tablet y Móvil.
 *  2. Cero tormenta de XHRs: usa iconos pre-verificados de armory.json + guardia entry < 900000.
 *  3. Telemetría Censal en Vivo (Balance Alianza vs Horda, GearScore medio, Horas y Kills).
 *  4. Ordenamiento reactivo (GS, Muertes con Honor, Horas, Nivel, Nombre) y Deep-Link (?inspect=).
 * ============================================================================
 */

const ALLIANCE_RACES_SET = new Set(["Humano", "Enano", "Elfo de la Noche", "Gnomo", "Draenei"]);

let allCharacters = [];
let currentFilter = "all";
let currentFaction = "all";
let currentSort = "gs_desc";
let currentSearch = "";
let isServerOnline = false;

document.addEventListener("DOMContentLoaded", () => {
    initArmory();
});

async function initArmory() {
    setupFiltersAndSearch();
    setupModalEvents();
    setupSyncButton();

    await loadLocalArmorySnapshot();
    await fetchLiveArmory();

    try {
        const urlParams = new URLSearchParams(window.location.search);
        const autoInspect = urlParams.get("inspect") || urlParams.get("name") || urlParams.get("character");
        if (autoInspect) {
            setTimeout(() => inspectCharacter(autoInspect), 250);
        }
    } catch (_) {}
}

function getHeroFaction(c) {
    if (c.faction) return c.faction;
    return ALLIANCE_RACES_SET.has(c.race) ? "Alianza" : "Horda";
}

async function loadLocalArmorySnapshot() {
    try {
        const resp = await fetch(`data/armory.json?v=20261030_v710`);
        if (resp.ok) {
            const data = await resp.json();
            if (Array.isArray(data) && data.length > 0) {
                allCharacters = data.map(c => ({ ...c, faction: getHeroFaction(c), online: false }));
            }
        }
    } catch (err) {
        console.warn("[Armería] Error leyendo data/armory.json:", err);
    }

    updateArmoryStatusBadge(false, "● INSTANTÁNEA CANÓNICA VERIFICADA (ACORE_CHARACTERS SSOT)");
    renderCensusTelemetry(allCharacters);
    renderPodium(getSortedCharacters(allCharacters));
    renderArmoryRows(allCharacters);
}

async function fetchLiveArmory() {
    const syncBtn = document.getElementById("btnSyncArmory");
    if (syncBtn) {
        syncBtn.disabled = true;
        syncBtn.innerHTML = `⏳ Sincronizando...`;
    }

    try {
        const apiUrl = (typeof CONFIG !== "undefined" && CONFIG.getApiUrl)
            ? CONFIG.getApiUrl()
            : "http://127.0.0.1:8080";

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2400);

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
                allCharacters = liveData.map(c => ({ ...c, faction: getHeroFaction(c) }));
                isServerOnline = true;
                updateArmoryStatusBadge(true, "● SERVIDOR EN VIVO (SINCRONIZADO CON ACORE_CHARACTERS)");
                renderCensusTelemetry(allCharacters);
                renderPodium(getSortedCharacters(allCharacters));
                renderArmoryRows(allCharacters);
                return;
            }
        }
        throw new Error("Offline");
    } catch (_) {
        isServerOnline = false;
        allCharacters = allCharacters.map(c => ({ ...c, online: false }));
        updateArmoryStatusBadge(false, "○ MODO RESGUARDO · INSTANTÁNEA CANÓNICA DEL REINO");
        renderCensusTelemetry(allCharacters);
        renderPodium(getSortedCharacters(allCharacters));
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
        badge.style.color = "#38bdf8";
        badge.style.borderColor = "rgba(56, 189, 248, 0.4)";
        badge.style.background = "rgba(56, 189, 248, 0.12)";
    }
}

function renderCensusTelemetry(chars) {
    const bar = document.getElementById("armoryCensusBar");
    if (!bar || !chars || chars.length === 0) return;

    const total = chars.length;
    const allyCount = chars.filter(c => getHeroFaction(c) === "Alianza").length;
    const hordeCount = total - allyCount;
    const allyPct = Math.round((allyCount / total) * 100);
    const hordePct = 100 - allyPct;

    const avgGs = Math.round(chars.reduce((acc, c) => acc + (Number(c.gs || c.gear_score) || 0), 0) / total);
    const topGs = Math.max(...chars.map(c => Number(c.gs || c.gear_score) || 0));
    const totalHours = chars.reduce((acc, c) => acc + (Number(c.playtime_hours) || 0), 0);
    const totalKills = chars.reduce((acc, c) => acc + (Number(c.kills || c.total_kills) || 0), 0);

    bar.innerHTML = `
        <div class="armory-census-card">
            <div style="display:flex;justify-content:space-between;font-size:0.76rem;font-weight:800;letter-spacing:0.04em;">
                <span style="color:#60a5fa;">🦁 ALIANZA ${allyPct}% (${allyCount})</span>
                <span style="color:#f87171;">(${hordeCount}) ${hordePct}% HORDA 🐺</span>
            </div>
            <div class="faction-balance-track">
                <div class="faction-balance-ally" style="width:${allyPct}%;"></div>
            </div>
            <div style="font-size:0.75rem;color:#94a3b8;margin-top:0.4rem;">Equilibrio poblacional del Top ${total}</div>
        </div>
        <div class="armory-census-card">
            <div style="font-size:0.74rem;color:#94a3b8;text-transform:uppercase;font-weight:700;">GearScore Medio / Récord</div>
            <div style="font-size:1.35rem;font-weight:900;color:#fbbf24;margin-top:2px;">${avgGs.toLocaleString()} GS <span style="font-size:0.82rem;color:#38bdf8;font-weight:700;">(Máx: ${topGs.toLocaleString()})</span></div>
            <div style="font-size:0.75rem;color:#94a3b8;">Era Clásica · Tier 2 BiS Nivel 60</div>
        </div>
        <div class="armory-census-card">
            <div style="font-size:0.74rem;color:#94a3b8;text-transform:uppercase;font-weight:700;">Veteranía de Campaña</div>
            <div style="font-size:1.35rem;font-weight:900;color:#f8fafc;margin-top:2px;">${totalHours.toLocaleString()} h <span style="font-size:0.82rem;color:#34d399;font-weight:700;">· ${totalKills.toLocaleString()} HKs</span></div>
            <div style="font-size:0.75rem;color:#94a3b8;">Horas acumuladas &amp; Muertes con Honor</div>
        </div>
    `;
}

function getSortedCharacters(chars) {
    const copy = [...(chars || [])];
    if (currentSort === "gs_desc") {
        copy.sort((a, b) => (Number(b.gs || b.gear_score) || 0) - (Number(a.gs || a.gear_score) || 0));
    } else if (currentSort === "kills_desc") {
        copy.sort((a, b) => (Number(b.kills || b.total_kills) || 0) - (Number(a.kills || a.total_kills) || 0));
    } else if (currentSort === "hours_desc") {
        copy.sort((a, b) => (Number(b.playtime_hours) || 0) - (Number(a.playtime_hours) || 0));
    } else if (currentSort === "level_desc") {
        copy.sort((a, b) => (Number(b.level) || 0) - (Number(a.level) || 0) || ((Number(b.gs) || 0) - (Number(a.gs) || 0)));
    } else if (currentSort === "name_asc") {
        copy.sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "es"));
    }
    return copy;
}

function renderPodium(chars) {
    const podiumContainer = document.getElementById("championsPodium");
    if (!podiumContainer) return;

    if (!chars || chars.length === 0) {
        podiumContainer.className = "podium-grid podium-empty";
        podiumContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">No hay héroes registrados todavía.</div>`;
        return;
    }

    const top3 = chars.slice(0, 3);
    if (top3.length < 3) {
        podiumContainer.className = "podium-grid podium-single";
        const c = top3[0];
        const classBadge = getClassBadgeClass(c.class);
        podiumContainer.innerHTML = `
            <div class="podium-card podium-gold" onclick="inspectCharacter('${escapeJsStr(c.name)}')" style="max-width: 360px; margin: 0 auto; width: 100%;">
                <div class="podium-crown">👑</div>
                <div class="podium-avatar-wrap">
                    <div class="podium-avatar-initial">${c.name.charAt(0)}</div>
                    <span class="podium-rank-badge">1º</span>
                </div>
                <div class="podium-char-name">${c.name}</div>
                <div class="podium-char-title">${c.title || 'Campeón Supremo del Reino'}</div>
                <div class="podium-class-pill"><span class="badge-class ${classBadge}">${c.class}</span></div>
                <div class="podium-stats"><span>Lv ${c.level}</span> · <span>${c.gs || 1950} GS</span> · <span>${c.guild}</span></div>
            </div>
        `;
        return;
    }

    podiumContainer.className = "podium-grid podium-triple";
    const ranks = [
        { place: "2º", medal: "🥈", classMod: "podium-silver", c: top3[1] },
        { place: "1º", medal: "👑", classMod: "podium-gold", c: top3[0] },
        { place: "3º", medal: "🥉", classMod: "podium-bronze", c: top3[2] }
    ];

    podiumContainer.innerHTML = ranks.map(r => {
        const c = r.c;
        const classBadge = getClassBadgeClass(c.class);
        const facIcon = getHeroFaction(c) === "Alianza" ? "🦁" : "🐺";
        return `
            <div class="podium-card ${r.classMod}" onclick="inspectCharacter('${escapeJsStr(c.name)}')">
                <div class="podium-crown">${r.medal}</div>
                <div class="podium-avatar-wrap">
                    <div class="podium-avatar-initial">${c.name.charAt(0)}</div>
                    <span class="podium-rank-badge">${r.place}</span>
                </div>
                <div class="podium-char-name">${facIcon} ${c.name}</div>
                <div class="podium-char-title">${c.title || 'Héroe de Azeroth'}</div>
                <div class="podium-class-pill"><span class="badge-class ${classBadge}">${c.class} · ${c.spec || ''}</span></div>
                <div class="podium-stats">
                    <span>Lv ${c.level}</span> · <strong style="color:#fbbf24;">${c.gs || 1950} GS</strong> · <span>${c.guild}</span>
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

    let filtered = getSortedCharacters(chars).filter(c => {
        const matchesSearch = !currentSearch ||
            normalizeStr(c.name).includes(normalizeStr(currentSearch)) ||
            normalizeStr(c.guild).includes(normalizeStr(currentSearch)) ||
            normalizeStr(c.class).includes(normalizeStr(currentSearch)) ||
            normalizeStr(c.race).includes(normalizeStr(currentSearch));

        let matchesFilter = true;
        if (currentFilter === "online") {
            matchesFilter = !!c.online;
        } else if (currentFilter !== "all") {
            matchesFilter = (normalizeStr(c.class) === normalizeStr(currentFilter));
        }

        let matchesFaction = true;
        if (currentFaction !== "all") {
            matchesFaction = (getHeroFaction(c) === currentFaction);
        }

        return matchesSearch && matchesFilter && matchesFaction;
    });

    if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 2.5rem;">No se encontraron campeones con los filtros actuales.</td></tr>`;
        return;
    }

    tableBody.innerHTML = filtered.map((c, idx) => {
        const classClass = getClassBadgeClass(c.class);
        const facIcon = getHeroFaction(c) === "Alianza" ? "🦁" : "🐺";
        const statusBadge = c.online
            ? `<span class="online-tag">● En Línea</span>`
            : `<span class="offline-tag">○ Guardado</span>`;

        return `
            <tr class="armory-row" onclick="inspectCharacter('${escapeJsStr(c.name)}')">
                <td class="rank-cell">#${idx + 1}</td>
                <td class="name-cell">
                    <strong>${facIcon} ${c.name}</strong>
                    <div class="char-title-small">${c.title || 'Héroe del Reino'} · ${c.spec || c.role || ''}</div>
                </td>
                <td><span class="badge-class ${classClass}">${c.class}</span></td>
                <td>${c.race}</td>
                <td class="level-cell">${c.level}</td>
                <td><strong style="color:#fbbf24;">${(c.gs || c.gear_score || 1950).toLocaleString()}</strong></td>
                <td class="guild-cell">${c.guild || '—'}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn-inspect" onclick="event.stopPropagation(); inspectCharacter('${escapeJsStr(c.name)}')">
                        🔍 Ver Equipo
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

function setupFiltersAndSearch() {
    const searchInput = document.getElementById("armorySearchInput");
    const chips = document.querySelectorAll(".filter-chip");
    const facSel = document.getElementById("armoryFactionSelect");
    const sortSel = document.getElementById("armorySortSelect");

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

    if (facSel) {
        facSel.addEventListener("change", (e) => {
            currentFaction = e.target.value;
            renderArmoryRows(allCharacters);
        });
    }

    if (sortSel) {
        sortSel.addEventListener("change", (e) => {
            currentSort = e.target.value;
            renderPodium(getSortedCharacters(allCharacters));
            renderArmoryRows(allCharacters);
        });
    }
}

function setupSyncButton() {
    const syncBtn = document.getElementById("btnSyncArmory");
    if (syncBtn) {
        syncBtn.addEventListener("click", () => fetchLiveArmory());
    }
}

/* ==============================================================================
   FICHA DE EQUIPO VISUAL INTERACTIVA (PAPERDOLL CANÓNICO 19-SLOT "0".."18")
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
    0: "Pobre", 1: "Común", 2: "Poco Común", 3: "Raro", 4: "Épico", 5: "Legendario", 7: "Reliquia"
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
                    <span class="pd-slot-item-title" style="color: #64748b; font-style: italic;">Ranura Libre (2M)</span>
                </div>
            </div>
        `;
    }

    const entryNum = Number(item.entry) || 0;
    const isCanonical = entryNum > 0 && entryNum < 900000;
    const q = item.quality !== undefined ? item.quality : 4;
    const qName = QUALITY_NAMES[q] || "Épico";
    const cachedIcon = item.icon || ITEM_ICON_CACHE[entryNum] || null;
    const initialImgSrc = (cachedIcon && !cachedIcon.startsWith("http"))
        ? `https://wow.zamimg.com/images/wow/icons/large/${cachedIcon}.jpg`
        : (cachedIcon || `https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg`);

    const innerHtml = `
        <div class="pd-slot-icon-box q-${q}">
            <img class="pd-slot-icon-img" id="pdArmoryIcon-${entryNum}-${slotId}" src="${initialImgSrc}" alt="${item.name}" onerror="this.onerror=null; this.src='https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg'">
        </div>
        <div class="pd-slot-info">
            <span class="pd-slot-name-label">${sDef.name}</span>
            <span class="pd-slot-item-title q-${q}">${item.name}</span>
            <span class="pd-slot-ilvl-tag">iLvl ${item.ilvl || item.ItemLevel || 60} · ${qName}</span>
        </div>
    `;

    if (isCanonical) {
        return `<a href="https://www.wowhead.com/wotlk/item=${entryNum}" data-wowhead="item=${entryNum}&domain=wotlk" class="pd-slot-item q-${q}" target="_blank" rel="noopener noreferrer">${innerHtml}</a>`;
    }
    return `<div class="pd-slot-item q-${q}" title="Objeto Soberano Exclusivo de Project JAIna (#${entryNum})">${innerHtml}</div>`;
}

async function resolveArmoryPaperdollIcons(items) {
    if (!items || !items.length) return;
    for (const it of items) {
        const entryNum = Number(it && it.entry) || 0;
        // Cero XHR si el ítem ya trae su icono verificado o es un ítem soberano >= 900000
        if (!entryNum || entryNum >= 900000 || it.icon) continue;
        if (ITEM_ICON_CACHE[entryNum]) {
            updateArmoryItemIconElements(entryNum, ITEM_ICON_CACHE[entryNum]);
            continue;
        }
        try {
            const res = await fetch(`https://nether.wowhead.com/wotlk/tooltip/item/${entryNum}`, { mode: "cors" });
            if (res.ok) {
                const data = await res.json();
                if (data && data.icon) {
                    ITEM_ICON_CACHE[entryNum] = data.icon;
                    updateArmoryItemIconElements(entryNum, data.icon);
                }
            }
        } catch (_) {}
    }
}

function updateArmoryItemIconElements(entry, iconName) {
    document.querySelectorAll(`[id^="pdArmoryIcon-${entry}-"]`).forEach(img => {
        img.src = `https://wow.zamimg.com/images/wow/icons/large/${iconName}.jpg`;
    });
}

function shareHeroProfileLink(charName) {
    const url = new URL(window.location.href);
    url.searchParams.set("inspect", charName);
    const shareStr = url.toString();
    navigator.clipboard.writeText(shareStr).then(() => {
        if (window.showPortalToast) {
            window.showPortalToast(`🔗 Enlace directo al perfil de <strong>${charName}</strong> copiado al portapapeles.`, "success", 3500);
        }
    }).catch(() => {
        if (window.showPortalToast) {
            window.showPortalToast(`🔗 Perfil: <code>${shareStr}</code>`, "info", 4500);
        }
    });
}
window.shareHeroProfileLink = shareHeroProfileLink;

async function inspectCharacter(charName) {
    const modal = document.getElementById("characterModal");
    const modalBody = document.getElementById("characterModalContent");
    if (!modal || !modalBody) return;

    modal.classList.add("modal-visible");
    modalBody.innerHTML = `
        <div style="text-align: center; padding: 3.5rem 1rem; color: var(--text-muted);">
            <h3 style="color: #fff; margin-bottom: 0.5rem;">⏳ Consultando Ficha de Campeón...</h3>
            <p>Sincronizando armamento de <strong>${charName}</strong></p>
        </div>
    `;

    let char = allCharacters.find(c => c.name.toLowerCase() === charName.toLowerCase()) || { name: charName };

    const apiUrl = (typeof CONFIG !== "undefined" && typeof CONFIG.getApiUrl === "function")
        ? CONFIG.getApiUrl()
        : "http://127.0.0.1:8080";

    try {
        const ctrl = new AbortController();
        const timeoutId = setTimeout(() => ctrl.abort(), 2200);
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
    const fac = getHeroFaction(char);
    const facBadge = fac === "Alianza" ? "🦁 Alianza" : "🐺 Horda";

    const leftSlotsHtml = LEFT_SLOT_IDS.map(id => renderSlotItemHtml(id, itemsMap[String(id)] || itemsMap[id])).join("");
    const rightSlotsHtml = RIGHT_SLOT_IDS.map(id => renderSlotItemHtml(id, itemsMap[String(id)] || itemsMap[id])).join("");
    const bottomSlotsHtml = BOTTOM_SLOT_IDS.map(id => renderSlotItemHtml(id, itemsMap[String(id)] || itemsMap[id])).join("");

    modalBody.innerHTML = `
        <div class="inspect-header" style="justify-content:space-between;flex-wrap:wrap;gap:1rem;">
            <div style="display:flex;align-items:center;gap:1rem;">
                <div class="inspect-avatar-box">
                    <span class="inspect-avatar-initial">${(char.name || "C").charAt(0)}</span>
                </div>
                <div>
                    <h2 class="inspect-name">${char.name}</h2>
                    <div class="inspect-title-tag">${char.title || 'Campeón de Azeroth'}</div>
                    <div class="inspect-badges-row">
                        <span class="badge-class ${classBadge}">${char.class || 'Guerrero'}</span>
                        <span class="inspect-pill">${facBadge} · ${char.race || 'Humano'}</span>
                        <span class="inspect-pill" style="color: var(--gold-primary);">Nivel ${char.level || 60} (Cap 60)</span>
                        <span class="inspect-pill">${char.guild || 'Sin Hermandad'}</span>
                    </div>
                </div>
            </div>
            <button type="button" class="btn-inspect" onclick="shareHeroProfileLink('${escapeJsStr(char.name)}')" style="align-self:flex-start;">
                🔗 Compartir Perfil
            </button>
        </div>

        <!-- PAPERDOLL RESPONSIVO DE 19 RANURAS ("0".."18") -->
        <div class="pd-slots-container pd-slots-responsive" style="margin: 1.4rem 0;">
            <div class="pd-slots-col pd-slots-left" style="display: flex; flex-direction: column; gap: 8px;">
                ${leftSlotsHtml}
            </div>

            <div class="pd-center-podium pd-center-stage">
                <div class="pd-gs-badge">
                    <span class="pd-gs-num">${char.gear_score || char.gs || 1985}</span>
                    <span class="pd-gs-label">GEARSCORE</span>
                </div>
                <div style="color: #fff; font-weight: 700; font-size: 1.05rem; margin-bottom: 0.3rem;">${char.spec || 'Talentos Clásicos'}</div>
                <div style="color: var(--text-muted); font-size: 0.82rem; margin-bottom: 1.1rem;">${char.role || 'DPS'} · ${char.gender || 'Héroe'}</div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%; text-align: left; font-size: 0.8rem;">
                    <div style="background: rgba(0,0,0,0.35); padding: 6px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.07);">
                        <span style="color: var(--text-muted); display: block; font-size: 0.7rem;">Salud Máxima</span>
                        <strong style="color: #39d353;">${(char.health || 4850).toLocaleString()} HP</strong>
                    </div>
                    <div style="background: rgba(0,0,0,0.35); padding: 6px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.07);">
                        <span style="color: var(--text-muted); display: block; font-size: 0.7rem;">Maná / Recurso</span>
                        <strong style="color: #38bdf8;">${(char.mana || 5200).toLocaleString()}</strong>
                    </div>
                    <div style="background: rgba(0,0,0,0.35); padding: 6px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.07);">
                        <span style="color: var(--text-muted); display: block; font-size: 0.7rem;">Muertes Honor</span>
                        <strong style="color: #f87171;">${(char.kills || char.total_kills || 140).toLocaleString()} HKs</strong>
                    </div>
                    <div style="background: rgba(0,0,0,0.35); padding: 6px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.07);">
                        <span style="color: var(--text-muted); display: block; font-size: 0.7rem;">Tiempo Jugado</span>
                        <strong style="color: #fff;">${char.playtime_hours || 64}h</strong>
                    </div>
                </div>

                <div style="margin-top: 1rem; font-size: 0.8rem; color: ${char.online ? '#39d353' : '#94a3b8'};">
                    ${char.online ? '● En Línea en el Reino' : '○ Guardado en acore_characters'}
                </div>
            </div>

            <div class="pd-slots-col pd-slots-right" style="display: flex; flex-direction: column; gap: 8px;">
                ${rightSlotsHtml}
            </div>

            <div class="pd-bottom-weapons" style="grid-column: 1 / -1;">
                ${bottomSlotsHtml}
            </div>
        </div>

        <div class="inspect-lore-box">
            <div class="lore-box-title">📜 Crónica del Campeón &amp; Hazañas:</div>
            <p>${char.lore || `Veterano consagrado de la Era Clásica en Project JAIna con ${(char.kills || 120)} victorias de honor y ${(char.honor || 1500)} puntos de prestigio.`}</p>
        </div>
    `;

    resolveArmoryPaperdollIcons(itemsList);
    if (window.$WowheadPower && typeof window.$WowheadPower.refreshLinks === "function") {
        try { window.$WowheadPower.refreshLinks(); } catch (_) {}
    }
}

function setupModalEvents() {
    const modal = document.getElementById("characterModal");
    const closeBtn = document.getElementById("closeCharModalBtn");
    if (!modal) return;
    if (closeBtn) closeBtn.addEventListener("click", () => modal.classList.remove("modal-visible"));
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("modal-visible"); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") modal.classList.remove("modal-visible"); });
}

function normalizeStr(s) {
    return s ? String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";
}

function escapeJsStr(s) {
    return String(s || "").replace(/\\/g, "\\\\").replace(/'/g, "\\'");
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
    return map[normalizeStr(className)] || "class-mago";
}
