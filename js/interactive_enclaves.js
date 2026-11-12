/**
 * Project Jaina — Visor Táctico de Baluartes y Enclaves (SSOT)
 * Permite explorar interactivamente los 6 enclaves territoriales
 * conquistables en Azeroth con coordenadas, bonificaciones y macros /way.
 */

const JAINA_ENCLAVES_DATA = [
    {
        id: "theramore_lighthouse",
        name: "🏰 Faro de la Costa de Theramore",
        zone: "Marjal Revolcafango (Bahía de Theramore)",
        coords: "71.8, 51.4",
        macro: "/way 71.8 51.4 Faro de la Costa de Theramore",
        strategicDesc: "Baluarte marítimo estratégico frente a la Bahía de Theramore y el fondeadero del Galeón de los Desertores. Cuenta con Heraldo Intendente, Cámara de Hermandad, Buzón y Fogata de Reposo.",
        buff: "Reposo de Baluarte (+6% Rested XP por minuto junto a la fogata y Santuario Nocturno)",
        guards: "Centinelas de Theramore (4979) / Brutos de Orgrimmar (3296)",
        facilities: "Heraldo Intendente (5061), Cámara de Hermandad (187295), Buzón (140908), Fogata (1798)",
        levelReq: "Hermandad Nivel 3+ · 2,500 Oro in-game"
    },
    {
        id: "azshara_coastal_refuge",
        name: "🍂 Refugio Costero de Azshara",
        zone: "Azshara (Meseta Costera)",
        coords: "53.2, 19.8",
        macro: "/way 53.2 19.8 Refugio Costero de Azshara",
        strategicDesc: "Enclave elevado sobre los acantilados otoñales de Azshara, dominando las ruinas élficas y las rutas marítimas del norte de Kalimdor.",
        buff: "Reposo de Baluarte (+6% Rested XP por minuto en el recinto y Santuario Nocturno)",
        guards: "Centinelas de Theramore (4979) / Brutos de Orgrimmar (3296)",
        facilities: "Heraldo Intendente (5061), Cámara de Hermandad (187295), Buzón (140908), Fogata (1798)",
        levelReq: "Hermandad Nivel 3+ · 2,500 Oro in-game"
    },
    {
        id: "westfall_lighthouse",
        name: "⚓ Faro de Páramos de Poniente",
        zone: "Páramos de Poniente (Westfall)",
        coords: "30.5, 85.8",
        macro: "/way 30.5 85.8 Faro de Páramos de Poniente",
        strategicDesc: "Histórico faro austral en la punta de Páramos de Poniente, bastión clave para las hermandades que operan en los Reinos del Este y Minas de la Muerte.",
        buff: "Reposo de Baluarte (+6% Rested XP por minuto en el recinto y Santuario Nocturno)",
        guards: "Centinelas de Theramore (4979) / Brutos de Orgrimmar (3296)",
        facilities: "Heraldo Intendente (5061), Cámara de Hermandad (187295), Buzón (140908), Fogata (1798)",
        levelReq: "Hermandad Nivel 3+ · 2,500 Oro in-game"
    },
    {
        id: "hillsbrad_cabin",
        name: "⚔️ Cabaña Solitaria de Trabalomas",
        zone: "Laderas de Trabalomas (Hillsbrad Foothills)",
        coords: "79.4, 67.2",
        macro: "/way 79.4 67.2 Cabaña Solitaria de Trabalomas",
        strategicDesc: "Fortín estratégico en la costa oriental de Laderas de Trabalomas, punto neurálgico de la disputa territorial entre Costasur y Molino Tarren.",
        buff: "Reposo de Baluarte (+6% Rested XP por minuto en el recinto y Santuario Nocturno)",
        guards: "Centinelas de Theramore (4979) / Brutos de Orgrimmar (3296)",
        facilities: "Heraldo Intendente (5061), Cámara de Hermandad (187295), Buzón (140908), Fogata (1798)",
        levelReq: "Hermandad Nivel 3+ · 2,500 Oro in-game"
    },
    {
        id: "faldirs_cove_keep",
        name: "🛡️ Torreón de la Caleta de Faldir",
        zone: "Tierras Altas de Arathi · Caleta de Faldir",
        coords: "31.8, 82.6",
        macro: "/way 31.8 82.6 Torreón de la Caleta de Faldir",
        strategicDesc: "Bastión oculto entre los acantilados de la Caleta de Faldir al sur de Arathi, resguardando las rutas marítimas entre Stromgarde y los Humedales.",
        buff: "Reposo de Baluarte (+6% Rested XP por minuto en el recinto y Santuario Nocturno)",
        guards: "Centinelas de Theramore (4979) / Brutos de Orgrimmar (3296)",
        facilities: "Heraldo Intendente (5061), Cámara de Hermandad (187295), Buzón (140908), Fogata (1798)",
        levelReq: "Hermandad Nivel 3+ · 2,500 Oro in-game"
    },
    {
        id: "feralas_coastal_refuge",
        name: "🌲 Refugio Costero de Feralas",
        zone: "Feralas · Costa Olvidada",
        coords: "43.6, 42.8",
        macro: "/way 43.6 42.8 Refugio Costero de Feralas",
        strategicDesc: "Enclave selvático frente a las aguas occidentales de Feralas y el Bastión Plumaluna, ideal para expediciones hacia La Masacre (Dire Maul).",
        buff: "Reposo de Baluarte (+6% Rested XP por minuto en el recinto y Santuario Nocturno)",
        guards: "Centinelas de Theramore (4979) / Brutos de Orgrimmar (3296)",
        facilities: "Heraldo Intendente (5061), Cámara de Hermandad (187295), Buzón (140908), Fogata (1798)",
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
                    if (window.showPortalToast) { window.showPortalToast("📋 Macro TomTom: <code>" + macro + "</code>", "info", 5000); }
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
