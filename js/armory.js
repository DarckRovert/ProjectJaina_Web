/**
 * Project Jaina / Project Jaina — Armería y Ranking de Personajes
 */

document.addEventListener("DOMContentLoaded", () => {
    loadArmoryData();
});

async function loadArmoryData() {
    const tableBody = document.getElementById("armoryTableBody");
    const loadingRow = document.getElementById("armoryLoading");

    if (!tableBody) return;

    try {
        const apiUrl = CONFIG.getApiUrl();
        const response = await fetch(`${apiUrl}/api/armory`, {
            method: "GET",
            headers: { "Accept": "application/json" }
        });

        if (response.ok) {
            const characters = await response.json();
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
        } else {
            throw new Error("HTTP error");
        }
    } catch (e) {
        if (loadingRow) {
            loadingRow.innerHTML = `<td colspan="7" style="text-align: center; color: var(--status-offline);">No se pudo conectar con la base de datos de personajes. Verifica que tu servidor esté encendido.</td>`;
        }
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
