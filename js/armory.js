/**
 * Project JAIna — Armería & Cuadro de Honor
 * Incluye Podio Top 3, buscador en vivo, filtros por clase y modal de inspección.
 */

const DEFAULT_ARMORY_SNAPSHOT = [
    { name: "Darckrovert", class: "Paladín", race: "Humano", level: 80, guild: "Project JAIna", online: true, gs: 6150, spec: "Reprensión", role: "DPS / Ofensivo", title: "el Vencedor Soberano" },
    { name: "Gasket", class: "Brujo", race: "No-muerto", level: 80, guild: "Project JAIna", online: true, gs: 6020, spec: "Destrucción", role: "DPS a Distancia", title: "el Conjurador Oscuro" },
    { name: "Elnazzareno", class: "Guerrero", race: "Humano", level: 80, guild: "Soberanos de Theramore", online: true, gs: 5980, spec: "Protección", role: "Tanque Principal", title: "el Bastión Inquebrantable" },
    { name: "Proudmoore", class: "Mago", race: "Humano", level: 80, guild: "Consejo de Kirin Tor", online: true, gs: 5920, spec: "Escarcha", role: "DPS Arcano", title: "Archimago de Dalaran" },
    { name: "Evaayllon", class: "Sacerdote", race: "Humano", level: 80, guild: "Soberanos de Theramore", online: false, gs: 5850, spec: "Disciplina", role: "Sanador de Banda", title: "la Purificadora" },
    { name: "Freemaduro", class: "Caballero de la Muerte", race: "No-muerto", level: 80, guild: "Project JAIna", online: false, gs: 5800, spec: "Profano", role: "DPS de Plaga", title: "el Caballero Maldito" },
    { name: "Otrokin", class: "Mago", race: "Gnomo", level: 80, guild: "Consejo de Kirin Tor", online: false, gs: 5740, spec: "Fuego", role: "DPS de Asedio", title: "el Piroclasta" },
    { name: "Teriantropo", class: "Druida", race: "Elfo de la Noche", level: 80, guild: "Círculo Cenarion", online: false, gs: 5690, spec: "Restauración", role: "Sanador Silvano", title: "el Guardián del Sueño" },
    { name: "Unodos", class: "Pícaro", race: "Humano", level: 80, guild: "Project JAIna", online: false, gs: 5630, spec: "Combate", role: "DPS Melé", title: "la Sombra Letal" },
    { name: "FranFranco", class: "Chamán", race: "Tauren", level: 80, guild: "Cluster Master", online: false, gs: 5600, spec: "Mejora", role: "DPS Elemental", title: "Hijo de la Tierra" },
    { name: "Tervosh", class: "Mago", race: "Humano", level: 80, guild: "Consejo de Kirin Tor", online: false, gs: 5540, spec: "Arcano", role: "DPS de Élite", title: "Consejero Arcano" },
    { name: "Dolida", class: "Pícaro", race: "Humano", level: 80, guild: "Guardia Real de Theramore", online: true, gs: 5500, spec: "Asesinato", role: "DPS Sigiloso", title: "la Hoja Rápida" },
    { name: "Screwdink", class: "Cazador", race: "Gnomo", level: 80, guild: "Ingenieros de Dalaran", online: false, gs: 5450, spec: "Puntería", role: "DPS Físico", title: "el Francotirador" },
    { name: "Kaelthas", class: "Mago", race: "Elfo de Sangre", level: 80, guild: "El Sol Sangrante", online: false, gs: 5400, spec: "Fuego", role: "DPS Ígneo", title: "el Señor Solar" },
    { name: "Varian", class: "Guerrero", race: "Humano", level: 80, guild: "Alianza de Ventormenta", online: false, gs: 5380, spec: "Armas", role: "Comandante Melé", title: "el Lobo Fantasma" }
];

let allCharacters = [...DEFAULT_ARMORY_SNAPSHOT];
let currentFilter = "all";
let currentSearch = "";

document.addEventListener("DOMContentLoaded", () => {
    initArmory();
});

async function initArmory() {
    renderPodium(allCharacters);
    renderArmoryRows(allCharacters);
    setupFiltersAndSearch();
    setupModalEvents();
    await fetchLiveArmory();
}

function renderPodium(chars) {
    const podiumContainer = document.getElementById("championsPodium");
    if (!podiumContainer || chars.length < 3) return;

    const top3 = [chars[1], chars[0], chars[2]]; // orden visual: 2º (Plata), 1º (Oro - Centro), 3º (Bronce)
    const ranks = [
        { place: "2º", medal: "🥈", label: "PLATA", classMod: "podium-silver", idx: 1 },
        { place: "1º", medal: "👑", label: "CAMPEÓN SUPREMO", classMod: "podium-gold", idx: 0 },
        { place: "3º", medal: "🥉", label: "BRONCE", classMod: "podium-bronze", idx: 2 }
    ];

    podiumContainer.innerHTML = ranks.map(r => {
        const c = chars[r.idx];
        const classBadge = getClassBadgeClass(c.class);
        return `
            <div class="podium-card ${r.classMod}" onclick="inspectCharacter('${c.name}')">
                <div class="podium-crown">${r.medal}</div>
                <div class="podium-avatar-wrap">
                    <div class="podium-avatar-initial">${c.name.charAt(0)}</div>
                    <span class="podium-rank-badge">${r.place}</span>
                </div>
                <div class="podium-char-name">${c.name}</div>
                <div class="podium-char-title">${c.title || 'Campeón de Azeroth'}</div>
                <div class="podium-class-pill"><span class="badge-class ${classBadge}">${c.class}</span></div>
                <div class="podium-stats">
                    <span>Lv ${c.level}</span> · <span>${c.gs || 5800} GS</span> · <span>${c.guild}</span>
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
            matchesFilter = (c.class === currentFilter);
        }

        return matchesSearch && matchesFilter;
    });

    if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2rem;">No se encontraron héroes que coincidan con la búsqueda.</td></tr>`;
        return;
    }

    tableBody.innerHTML = filtered.map((c, idx) => {
        const classClass = getClassBadgeClass(c.class);
        const statusBadge = c.online 
            ? `<span class="online-tag">● Online</span>`
            : `<span class="offline-tag">○ Offline</span>`;

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

function inspectCharacter(charName) {
    const char = allCharacters.find(c => c.name.toLowerCase() === charName.toLowerCase()) || allCharacters[0];
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
                <div class="inspect-title-tag">${char.title || 'Veterano de Northrend'}</div>
                <div class="inspect-badges-row">
                    <span class="badge-class ${classBadge}">${char.class}</span>
                    <span class="inspect-pill">${char.race}</span>
                    <span class="inspect-pill" style="color: var(--gold-primary);">Nivel ${char.level}</span>
                    <span class="inspect-pill">${char.guild}</span>
                </div>
            </div>
        </div>

        <div class="inspect-stats-grid">
            <div class="inspect-stat-card">
                <div class="stat-name">Puntuación de Equipo (GS)</div>
                <div class="stat-val" style="color: #00e5ff;">${char.gs || 5800} GS</div>
            </div>
            <div class="inspect-stat-card">
                <div class="stat-name">Especialización</div>
                <div class="stat-val" style="color: var(--gold-primary);">${char.spec || 'Doble Talento'}</div>
            </div>
            <div class="inspect-stat-card">
                <div class="stat-name">Rol de Combate</div>
                <div class="stat-val">${char.role || 'DPS'}</div>
            </div>
            <div class="inspect-stat-card">
                <div class="stat-name">Estado en Reino</div>
                <div class="stat-val" style="color: ${char.online ? 'var(--status-online)' : 'var(--text-muted)'};">
                    ${char.online ? 'Conectado (En Mundo)' : 'Desconectado'}
                </div>
            </div>
        </div>

        <div class="inspect-lore-box">
            <div class="lore-box-title">📜 Registro Histórico del Campeón:</div>
            <p>Héroe registrado bajo la jurisdicción de <strong>${char.guild}</strong>. Ha participado en campañas activas de la era actual y ostenta acceso irrestricto a los sagrarios de Dalaran y Theramore.</p>
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

async function fetchLiveArmory() {
    try {
        const apiUrl = (typeof CONFIG !== 'undefined' && CONFIG.getApiUrl) ? CONFIG.getApiUrl() : 'http://127.0.0.1:8080';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const response = await fetch(`${apiUrl}/api/armory`, {
            method: "GET",
            signal: controller.signal,
            headers: { "Accept": "application/json" }
        });
        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                allCharacters = data;
                renderPodium(allCharacters);
                renderArmoryRows(allCharacters);
            }
        }
    } catch (e) {
        // En espera de conexión con MySQL
    }
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
    return map[className] || "class-mago";
}
