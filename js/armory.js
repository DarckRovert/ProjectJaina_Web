/**
 * Project JAIna — Armería y Ranking de Personajes
 * Modo Híbrido: Snapshot oficial de Temporada con sincronización automática en vivo.
 */

const DEFAULT_ARMORY_SNAPSHOT = [
    { name: "Gasket", class: "Brujo", race: "No-muerto", level: 80, guild: "Project JAIna", online: true },
    { name: "Elnazzareno", class: "Guerrero", race: "Humano", level: 80, guild: "Soberanos de Theramore", online: true },
    { name: "Darckrovert", class: "Paladín", race: "Humano", level: 80, guild: "Project JAIna", online: false },
    { name: "Evaayllon", class: "Sacerdote", race: "Humano", level: 80, guild: "Soberanos de Theramore", online: false },
    { name: "Freemaduro", class: "Caballero de la Muerte", race: "No-muerto", level: 80, guild: "Project JAIna", online: false },
    { name: "Otrokin", class: "Mago", race: "Gnomo", level: 80, guild: "Consejo de Kirin Tor", online: false },
    { name: "Teriantropo", class: "Druida", race: "Elfo de la Noche", level: 80, guild: "Círculo Cenarion", online: false },
    { name: "Unodos", class: "Pícaro", race: "Humano", level: 80, guild: "Project JAIna", online: false },
    { name: "FranFranco", class: "Chamán", race: "Tauren", level: 80, guild: "Cluster Master", online: false },
    { name: "Tervosh", class: "Mago", race: "Humano", level: 80, guild: "Consejo de Kirin Tor", online: false },
    { name: "Proudmoore", class: "Mago", race: "Humano", level: 80, guild: "Soberanos de Theramore", online: true },
    { name: "Dolida", class: "Pícaro", race: "Humano", level: 80, guild: "Guardia Real de Theramore", online: true },
    { name: "Screwdink", class: "Cazador", race: "Gnomo", level: 80, guild: "Ingenieros de Dalaran", online: false },
    { name: "Kaelthas", class: "Mago", race: "Elfo de Sangre", level: 80, guild: "El Sol Sangrante", online: false },
    { name: "Varian", class: "Guerrero", race: "Humano", level: 80, guild: "Alianza de Ventormenta", online: false }
];

document.addEventListener("DOMContentLoaded", () => {
    loadArmoryData();
});

function renderArmoryRows(characters) {
    const tableBody = document.getElementById("armoryTableBody");
    const loadingRow = document.getElementById("armoryLoading");
    if (!tableBody) return;

    if (loadingRow) loadingRow.remove();

    if (!characters || characters.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">Aún no hay personajes creados en el reino. ¡Sé el primero en entrar!</td></tr>`;
        return;
    }

    tableBody.innerHTML = characters.map((c, idx) => {
        const classClass = getClassBadgeClass(c.class);
        const statusBadge = c.online 
            ? `<span style="color: var(--status-online); font-weight: bold;">● Online</span>`
            : `<span style="color: var(--text-muted);">○ Offline</span>`;

        return `
            <tr>
                <td style="font-family: 'Cinzel', serif; font-weight: bold; color: var(--gold-primary);">#${idx + 1}</td>
                <td style="font-weight: 700; color: #ffffff;">${c.name}</td>
                <td><span class="badge-class ${classClass}">${c.class}</span></td>
                <td>${c.race}</td>
                <td style="font-weight: 800; color: var(--gold-primary);">${c.level}</td>
                <td style="color: var(--text-secondary);">${c.guild}</td>
                <td>${statusBadge}</td>
            </tr>
        `;
    }).join("");
}

async function loadArmoryData() {
    const tableBody = document.getElementById("armoryTableBody");
    if (!tableBody) return;

    // 1. Despliegue instantáneo del snapshot de la temporada oficial
    renderArmoryRows(DEFAULT_ARMORY_SNAPSHOT);

    // 2. Intento no bloqueante de refresco en vivo desde AzerothCore
    try {
        const apiUrl = CONFIG.getApiUrl();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const response = await fetch(`${apiUrl}/api/armory`, {
            method: "GET",
            signal: controller.signal,
            headers: { "Accept": "application/json" }
        });
        clearTimeout(timeoutId);

        if (response.ok) {
            const characters = await response.json();
            if (Array.isArray(characters) && characters.length > 0) {
                renderArmoryRows(characters);
            }
        }
    } catch (e) {
        // En GitHub Pages o servidor local apagado, el ranking de la temporada ya está visible.
        // Cero mensajes de error intrusivos para los visitantes.
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
    return map[className] || "class-guerrero";
}
