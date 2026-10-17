/**
 * Project Jaina — Visor Táctico de Baluartes y Enclaves (SSOT)
 * Permite explorar interactivamente los 6 enclaves territoriales
 * conquistables en Azeroth con coordenadas, bonificaciones y macros /way.
 */

const JAINA_ENCLAVES_DATA = [
    {
        id: "deserters_tower",
        name: "🏰 Torre de los Desertores",
        zone: "Marjal Revolcafango (Bahía de Theramore)",
        coords: "58.2, 54.6",
        macro: "/way 58.2 54.6 Torre de los Desertores",
        strategicDesc: "Fortín marítimo estratégico ubicado en la entrada de la Bahía de Theramore. Clave para el control naval y el monitoreo de los movimientos corsarios.",
        buff: "Viento Marino de Theramore (+10% Velocidad de montura y Rested XP acelerado)",
        guards: "Centinelas de Theramore / Renegados del Marjal",
        facilities: "Heraldo Intendente Naval, Escriba de Enclave, Puerto de Embarque",
        levelReq: "Hermandad Nivel 3+ · 2,500 Oro in-game"
    },
    {
        id: "goldenbraid_farm",
        name: "🌾 Granja de Ceñidorada",
        zone: "Páramos de Poniente (Westfall)",
        coords: "44.6, 52.8",
        macro: "/way 44.6 52.8 Granja de Ceñidorada",
        strategicDesc: "Punto neurálgico agropecuario y despensa logística en Reinos del Este. Rodeado de molinos y fortificaciones ligeras.",
        buff: "Cosecha del Pionero (+15% Regeneración de vida/maná fuera de combate y doble Rested XP)",
        guards: "Milicia del Pueblo / Combatientes Defias",
        facilities: "Supervisor Agrícola, Forja de Campaña, Establos de Monturas",
        levelReq: "Hermandad Nivel 3+ · 2,500 Oro in-game"
    },
    {
        id: "mace_bastion",
        name: "🛡️ Bastión de la Maza",
        zone: "Montañas de Crestagrana (Redridge)",
        coords: "32.4, 48.0",
        macro: "/way 32.4 48.0 Bastión de la Maza",
        strategicDesc: "Atalaya defensiva de montaña con línea de visión sobre todo el lago Siempregrana y los pasos orcos de Roca Negra.",
        buff: "Templanza de Roca (+5% Armadura y -50% Coste de reparación de equipo)",
        guards: "Batallón de Crestagrana / Mercenarios de la Maza",
        facilities: "Maestro de Armas, Yunque Maestro de Herrería, Vigía de Montaña",
        levelReq: "Hermandad Nivel 3+ · 2,500 Oro in-game"
    },
    {
        id: "crusade_watch",
        name: "⚔️ Atalaya de la Cruzada",
        zone: "Tierras de la Peste del Este (Plaguelands)",
        coords: "61.8, 38.2",
        macro: "/way 61.8 38.2 Atalaya de la Cruzada",
        strategicDesc: "Puesto de avanzada táctico de la Cruzada Argenta, guardando las fronteras contra los remanentes de la Plaga rumbo a Stratholme.",
        buff: "Vigor de la Luz del Alba (+10% Daño Sagrado/Mágico contra No-muertos)",
        guards: "Cruzados Argenta / Caballeros Oscuros",
        facilities: "Alquimista de Campaña, Mesa de Estrategia, Sagrario Consagrado",
        levelReq: "Hermandad Nivel 3+ · 2,500 Oro in-game"
    },
    {
        id: "southcoast_lighthouse",
        name: "⚓ Faro de la Costa Sur",
        zone: "Tanaris / Mares del Sur",
        coords: "72.4, 46.8",
        macro: "/way 72.4 46.8 Faro de la Costa Sur",
        strategicDesc: "Torre faro que domina las aguas profundas del sur de Kalimdor, proporcionando avistamiento temprano sobre buques piratas y flotas enemigas.",
        buff: "Gracia de las Mareas (Respiración acuática permanente en costas de Tanaris y velocidad de nado +30%)",
        guards: "Marineros Bonvapor / Corsarios Velas Negras",
        facilities: "Vigía de Faro, Mercader Bonvapor, Batería de Cañones Costeros",
        levelReq: "Hermandad Nivel 3+ · 2,500 Oro in-game"
    },
    {
        id: "ashenvale_redoubt",
        name: "🌲 Reducto de Vallefresno",
        zone: "Bosque de Vallefresno (Ashenvale)",
        coords: "48.2, 63.4",
        macro: "/way 48.2 63.4 Reducto de Vallefresno",
        strategicDesc: "Enclave ancestral oculto en el corazón del follaje de Vallefresno, bastión constante de escaramuzas entre los Centinelas y la Horda.",
        buff: "Manto de Elune (+10% Velocidad de sigilo y monturas en terrenos boscosos)",
        guards: "Centinelas Kaldorei / Batallón Grito de Guerra",
        facilities: "Santuario de Elune, Proveedora de Flechas y Remedios, Puesto de Exploración",
        levelReq: "Hermandad Nivel 3+ · 2,500 Oro in-game"
    }
];

document.addEventListener("DOMContentLoaded", () => {
    initEnclavesRadar();
});

function initEnclavesRadar() {
    const navContainer = document.getElementById("enclavesPillsNav");
    const detailContainer = document.getElementById("enclaveDetailView");

    if (!navContainer || !detailContainer) return;

    // Renderizado de botones de navegación
    navContainer.innerHTML = JAINA_ENCLAVES_DATA.map((enc, idx) => `
        <button class="enclave-nav-btn ${idx === 0 ? 'active' : ''}" data-id="${enc.id}">
            ${enc.name}
        </button>
    `).join("");

    const renderEnclave = (enc) => {
        detailContainer.innerHTML = `
            <div>
                <div style="font-size: 0.72rem; color: var(--gold-primary); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                    ENCLAVE CONQUISTABLE · ${enc.zone}
                </div>
                <h3 style="font-family: 'Cinzel', serif; font-size: 1.35rem; color: #ffffff; margin-bottom: 0.6rem;">
                    ${enc.name}
                </h3>
                <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 1rem;">
                    ${enc.strategicDesc}
                </p>

                <div style="margin-bottom: 1rem;">
                    <span class="enclave-stat-chip" style="color: #60a5fa; border-color: rgba(96, 165, 250, 0.3);">
                        📍 Coords: <strong>${enc.coords}</strong>
                    </span>
                    <button class="copy-way-btn" id="copyWayBtn" data-macro="${enc.macro}" title="Copiar macro /way de TomTom para pegar en el juego">
                        📋 Copiar /way
                    </button>
                    <span class="enclave-stat-chip" style="color: #f59e0b; border-color: rgba(245, 158, 11, 0.3);">
                        👑 Requisito: ${enc.levelReq}
                    </span>
                </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 1rem; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <div style="font-size: 0.74rem; font-weight: 700; color: #38bdf8; margin-bottom: 0.4rem; text-transform: uppercase;">
                        ✨ Bonificación Territorial Activa
                    </div>
                    <div style="font-size: 0.82rem; color: #e2e8f0; font-weight: 600; margin-bottom: 0.8rem; background: rgba(56, 189, 248, 0.1); padding: 0.5rem 0.8rem; border-radius: 6px; border-left: 3px solid #38bdf8;">
                        ${enc.buff}
                    </div>

                    <div style="font-size: 0.74rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.3rem; text-transform: uppercase;">
                        🛡️ Facciones Defensoras y NPCs
                    </div>
                    <div style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 0.6rem;">
                        <strong>Guardias:</strong> ${enc.guards}
                    </div>
                    <div style="font-size: 0.78rem; color: var(--text-secondary);">
                        <strong>Servicios:</strong> ${enc.facilities}
                    </div>
                </div>

                <div style="margin-top: 1rem; padding-top: 0.8rem; border-top: 1px solid rgba(255, 255, 255, 0.08); display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.72rem; color: #2ecc71; font-weight: 700;">● Sistema 100% Anti-P2W (Oro In-Game)</span>
                    <a href="wiki/index.html" style="font-size: 0.74rem; color: var(--gold-primary); text-decoration: none; font-weight: 700;">Guía en Wiki ➔</a>
                </div>
            </div>
        `;

        // Lógica de copia al portapapeles
        const copyBtn = document.getElementById("copyWayBtn");
        if (copyBtn) {
            copyBtn.addEventListener("click", async () => {
                const macro = copyBtn.getAttribute("data-macro");
                let success = false;

                if (navigator.clipboard && navigator.clipboard.writeText) {
                    try {
                        await navigator.clipboard.writeText(macro);
                        success = true;
                    } catch (err) {
                        success = false;
                    }
                }

                if (!success) {
                    try {
                        const tempEl = document.createElement("textarea");
                        tempEl.value = macro;
                        tempEl.style.position = "fixed";
                        tempEl.style.opacity = "0";
                        document.body.appendChild(tempEl);
                        tempEl.select();
                        success = document.execCommand("copy");
                        document.body.removeChild(tempEl);
                    } catch (e) {
                        success = false;
                    }
                }

                if (success) {
                    const originalText = copyBtn.innerHTML;
                    copyBtn.innerHTML = "✅ ¡Copiado!";
                    copyBtn.style.background = "#2ecc71";
                    copyBtn.style.color = "#0b1120";
                    setTimeout(() => {
                        copyBtn.innerHTML = originalText;
                        copyBtn.style.background = "";
                        copyBtn.style.color = "";
                    }, 2000);
                } else {
                    prompt("Copia este comando /way para tu addon TomTom:", macro);
                }
            });
        }
    };

    // Renderizar el primer enclave por defecto
    renderEnclave(JAINA_ENCLAVES_DATA[0]);

    // Delegación de eventos para las pestañas
    navContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".enclave-nav-btn");
        if (!btn) return;

        navContainer.querySelectorAll(".enclave-nav-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const targetId = btn.getAttribute("data-id");
        const found = JAINA_ENCLAVES_DATA.find(enc => enc.id === targetId);
        if (found) renderEnclave(found);
    });
}
