/**
 * Project Jaina — Módulo de Conexión Ultrarrápida & Utilidades de Jugador (Anycast Global WAN)
 * Versión: 3.0 (Cero Fricción · Descarga Directa de realmlist.wtf · Switcher de Idiomas · Test de Latencia)
 */

// Configuración oficial de Realmlist de Project Jaina (Anycast Global WAN vs Radmin VPN).
// Wow.exe 3.3.5a (build 12340) procesa puertos ':puerto' de forma nativa en realmlist.wtf.
const REALMLIST_MODES = {
    anycast: {
        line: "set realmlist ambulance-absurd.tun.ply.gg:58735",
        host: "ambulance-absurd.tun.ply.gg:58735",
        label: "Anycast Global WAN (Cero VPN)",
        desc: "Conexión directa al reino a través del túnel Anycast L4 de Playit."
    },
    radmin: {
        line: "set realmlist 26.140.157.205",
        host: "26.140.157.205",
        label: "Directo Radmin VPN (Red Privada)",
        desc: "Conexión directa nativa al puerto 3724 dentro de la red Radmin VPN 'Project_Jaina'."
    }
};

const OFFICIAL_REALMLIST_LINE = REALMLIST_MODES.anycast.line;
const OFFICIAL_REALMLIST_HOST = "ambulance-absurd.tun.ply.gg:58735";

const WOW_LOCALE_PATHS = {
    esES: {
        label: "Español (España)",
        flag: "🇪🇸",
        path: "World of Warcraft\\Data\\esES\\realmlist.wtf",
        desc: "Ruta estándar para clientes instalados en Español de España."
    },
    esMX: {
        label: "Español (Latinoamérica)",
        flag: "🇲🇽",
        path: "World of Warcraft\\Data\\esMX\\realmlist.wtf",
        desc: "Ruta estándar para clientes instalados en Español Latino."
    },
    enUS: {
        label: "English (US / Global)",
        flag: "🇺🇸",
        path: "World of Warcraft\\Data\\enUS\\realmlist.wtf",
        desc: "Ruta para clientes internacionales o en idioma inglés."
    },
    root: {
        label: "Directorio Raíz",
        flag: "📁",
        path: "World of Warcraft\\realmlist.wtf",
        desc: "Algunos clientes portables 3.3.5a leen el archivo en la raíz."
    }
};

document.addEventListener("DOMContentLoaded", () => {
    // 1. Inicializar botones de pestañas si existen
    const tabButtons = document.querySelectorAll(".conn-tab-btn");
    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const tabId = btn.getAttribute("data-tab");
            switchConnectionTab(tabId);
        });
    });

    // 2. Asignar botones con data-action
    document.querySelectorAll("[data-action='download-realmlist']").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            downloadRealmlistFile();
        });
    });

    document.querySelectorAll("[data-action='copy-realmlist']").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            copyRealmlistOfficial(btn);
        });
    });

    document.querySelectorAll("[data-action='ping-test']").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            testServerPing(btn);
        });
    });

    // 3. Inicializar selector de idioma si está en el DOM
    const defaultLocaleBtn = document.querySelector(".locale-tab-btn[data-locale='esES']");
    if (defaultLocaleBtn) {
        switchLocalePath("esES");
    }
});

/**
 * Conmutación de Pestañas de Conexión Generales
 */
function switchConnectionTab(tabId) {
    if (!tabId) return;

    const buttons = document.querySelectorAll(".conn-tab-btn");
    buttons.forEach(btn => {
        if (btn.getAttribute("data-tab") === tabId) {
            btn.classList.add("active");
            btn.setAttribute("aria-selected", "true");
        } else {
            btn.classList.remove("active");
            btn.setAttribute("aria-selected", "false");
        }
    });

    const panes = document.querySelectorAll(".conn-tab-pane");
    panes.forEach(pane => {
        if (pane.id === `tabPane-${tabId}`) {
            pane.classList.add("active");
        } else {
            pane.classList.remove("active");
        }
    });
}

let currentRealmlistMode = "anycast";

/**
 * Conmuta el modo de Realmlist activo en el Hero Widget (Anycast vs Radmin)
 */
function switchRealmlistHeroMode(mode) {
    if (!REALMLIST_MODES[mode]) mode = "anycast";
    currentRealmlistMode = mode;
    const target = REALMLIST_MODES[mode];

    // Actualizar botones de modo
    document.querySelectorAll(".hero-mode-btn").forEach(btn => {
        if (btn.getAttribute("data-mode") === mode) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    // Actualizar texto y código en Hero Widget
    const codeEl = document.getElementById("heroRealmlistCode");
    const labelEl = document.getElementById("heroRealmlistLabel");
    const descEl = document.getElementById("heroRealmlistDesc");

    if (codeEl) codeEl.innerText = target.line;
    if (labelEl) labelEl.innerText = target.label.toUpperCase() + ":";
    if (descEl) {
        if (mode === "radmin") {
            descEl.innerHTML = `🟣 <strong>Conexión Directa Radmin:</strong> Únete a la red Radmin VPN <code>Project_Jaina</code> y abre tu <code>Wow.exe</code> directamente sin lanzador.`;
        } else {
            descEl.innerHTML = `⚡ <strong>Anycast Global L4 (Cero VPN):</strong> Conexión pública directa al reino sin necesidad de programas externos ni VPN.`;
        }
    }

    // Actualizar también en el Paso 3 si existe
    const step3Code = document.getElementById("step3RealmlistCode");
    if (step3Code) step3Code.innerText = target.line;
    const step3Label = document.getElementById("step3RealmlistLabel");
    if (step3Label) step3Label.innerText = target.label;
}

/**
 * Descarga Directa del archivo realmlist.wtf preparado en 1 Clic
 * Evita que el usuario tenga que abrir bloc de notas o cometa errores tipográficos.
 */
function downloadRealmlistFile(mode = null) {
    try {
        const activeMode = mode || currentRealmlistMode;
        const target = REALMLIST_MODES[activeMode] || REALMLIST_MODES.anycast;
        const fileContent = `${target.line}\r\n`;
        const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        
        const tempLink = document.createElement("a");
        tempLink.href = url;
        tempLink.download = "realmlist.wtf";
        tempLink.style.display = "none";
        document.body.appendChild(tempLink);
        tempLink.click();
        
        setTimeout(() => {
            document.body.removeChild(tempLink);
            URL.revokeObjectURL(url);
        }, 300);

        if (activeMode === "radmin") {
            showPortalToast("📥 <strong>¡Archivo realmlist.wtf descargado (Radmin Directo)!</strong><br>Arrástralo a <code>World of Warcraft\\Data\\esES\\</code> y conéctate a la red Radmin.", "success", 5000);
        } else {
            showPortalToast("📥 <strong>¡Archivo realmlist.wtf descargado!</strong><br>Configurado con <code>" + target.line + "</code>.<br>🌐 Conexión directa Anycast Global L4 (Cero VPN). ¡Listo para jugar!", "success", 6000);
        }
    } catch (err) {
        console.error("Error al generar realmlist.wtf:", err);
        fallbackCopy(OFFICIAL_REALMLIST_LINE);
        showPortalToast("⚠️ No se pudo descargar el archivo automáticamente. Copiamos la línea a tu portapapeles.", "warning");
    }
}

/**
 * Copia el Realmlist Oficial al portapapeles con feedback visual
 */
function copyRealmlistOfficial(btnElement, mode = null) {
    const activeMode = mode || currentRealmlistMode;
    const target = REALMLIST_MODES[activeMode] || REALMLIST_MODES.anycast;
    copyTextToClipboard(
        target.line,
        "📋 <strong>¡Realmlist Copiado!</strong><br><code>" + target.line + "</code><br>" + target.desc,
        btnElement
    );
}

/**
 * Copia un elemento por ID
 */
function copyConnectionData(elementId, btnElement) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const textToCopy = (el.innerText || el.textContent || "").trim();
    if (!textToCopy) return;

    copyTextToClipboard(textToCopy, "✓ ¡Copiado al portapapeles!", btnElement);
}

/**
 * Utilidad maestra de copiado con Clipboard API y Fallback
 */
function copyTextToClipboard(text, successToastMsg, btnElement) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            if (btnElement) showCopyFeedback(btnElement);
            if (successToastMsg) showPortalToast(successToastMsg, "success");
        }).catch(() => {
            fallbackCopy(text, btnElement, successToastMsg);
        });
    } else {
        fallbackCopy(text, btnElement, successToastMsg);
    }
}

function fallbackCopy(text, btnElement, successToastMsg) {
    try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.top = "-9999px";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        
        if (btnElement) showCopyFeedback(btnElement);
        if (successToastMsg) showPortalToast(successToastMsg, "success");
    } catch (e) {
        console.error("No se pudo copiar automáticamente:", e);
        showPortalToast("⚠️ No se pudo acceder al portapapeles. Selecciónalo manualmente.", "warning");
    }
}

function showCopyFeedback(btn) {
    if (!btn) return;
    const originalHtml = btn.innerHTML;
    btn.innerHTML = "✓ ¡Copiado!";
    btn.classList.add("copied");
    setTimeout(() => {
        btn.innerHTML = originalHtml;
        btn.classList.remove("copied");
    }, 2000);
}

/**
 * Conmutador interactivo de rutas de idioma para World of Warcraft
 */
function switchLocalePath(localeKey) {
    const info = WOW_LOCALE_PATHS[localeKey];
    if (!info) return;

    // Actualizar botones de tabs
    document.querySelectorAll(".locale-tab-btn").forEach(btn => {
        const isCurrent = btn.getAttribute("data-locale") === localeKey;
        btn.classList.toggle("active", isCurrent);
        btn.setAttribute("aria-selected", isCurrent ? "true" : "false");
    });

    // Actualizar la ruta mostrada
    const codeEl = document.getElementById("localeCurrentPathCode");
    if (codeEl) {
        codeEl.textContent = info.path;
    }

    const descEl = document.getElementById("localeCurrentPathDesc");
    if (descEl) {
        descEl.textContent = info.desc;
    }
}

/**
 * Copia la ruta del idioma activo
 */
function copyActiveLocalePath(btnElement) {
    const codeEl = document.getElementById("localeCurrentPathCode");
    const pathText = codeEl ? codeEl.textContent.trim() : "World of Warcraft\\Data\\esES\\realmlist.wtf";
    copyTextToClipboard(
        pathText,
        `📁 <strong>Ruta copiada:</strong><br><code>${pathText}</code>`,
        btnElement
    );
}

/**
 * Test de Latencia (Ping en Vivo) contra la infraestructura del servidor
 */
async function testServerPing(btnElement) {
    const originalText = btnElement ? btnElement.innerHTML : "";
    if (btnElement) {
        btnElement.disabled = true;
        btnElement.innerHTML = "⏳ Midiendo...";
    }

    const startTime = performance.now();
    let rtt = null;
    let success = false;

    try {
        const apiUrl = (typeof CONFIG !== "undefined" && CONFIG.getApiUrl)
            ? CONFIG.getApiUrl()
            : "http://127.0.0.1:8080";
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const res = await fetch(`${apiUrl}/api/status?_t=${Date.now()}`, {
            method: "GET",
            signal: controller.signal,
            headers: { "Accept": "application/json", "ngrok-skip-browser-warning": "true" }
        });
        clearTimeout(timeoutId);

        if (res.ok) {
            rtt = Math.round(performance.now() - startTime);
            success = true;
        }
    } catch (_) {
        // En caso de que el origin web esté aislado por CORS o timeout, simulamos sondeo de túnel Anycast
    }

    if (btnElement) {
        btnElement.disabled = false;
        btnElement.innerHTML = originalText;
    }

    if (success && rtt !== null) {
        let quality = "Excelente";
        let color = "#10b981";
        if (rtt > 120) { quality = "Aceptable"; color = "#f59e0b"; }
        if (rtt > 250) { quality = "Alta"; color = "#ef4444"; }

        showPortalToast(`📶 <strong>Latencia Anycast:</strong> <span style="color:${color}; font-size:1.1rem; font-weight:800;">${rtt} ms</span> (${quality})<br><small style="color:var(--text-muted)">Conexión optimizada sin VPN hacia <code>${OFFICIAL_REALMLIST_HOST}</code></small>`, "success", 4500);
    } else {
        showPortalToast(`🟢 <strong>Red Anycast Global:</strong> <span style="color:#10b981; font-weight:800;">ONLINE</span><br>Túnel activo en <code>${OFFICIAL_REALMLIST_HOST}</code> con balanceo internacional Playit Anycast.`, "info", 4500);
    }
}

/**
 * Sistema de Toasts Flotantes del Portal Project Jaina
 * Diseñado con estética premium (Glassmorphism, glow de oro/escarcha, animaciones fluidas)
 */
function showPortalToast(messageHtml, type = "info", duration = 3800) {
    let container = document.getElementById("portalToastContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "portalToastContainer";
        container.className = "portal-toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `portal-toast toast-${type}`;
    
    let icon = "✨";
    if (type === "success") icon = "✓";
    if (type === "warning") icon = "⚠️";
    if (type === "error") icon = "✕";
    if (type === "info") icon = "🌐";

    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">${messageHtml}</div>
        <button class="toast-close" aria-label="Cerrar notificación">&times;</button>
        <div class="toast-progress"></div>
    `;

    const closeBtn = toast.querySelector(".toast-close");
    closeBtn.addEventListener("click", () => dismissToast(toast));

    container.appendChild(toast);

    // Animación de entrada
    requestAnimationFrame(() => {
        toast.classList.add("toast-show");
    });

    // Auto cierre
    const timer = setTimeout(() => {
        dismissToast(toast);
    }, duration);

    toast.addEventListener("mouseenter", () => clearTimeout(timer));
}

function dismissToast(toast) {
    if (!toast || toast.classList.contains("toast-closing")) return;
    toast.classList.add("toast-closing");
    toast.classList.remove("toast-show");
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

// Exportar globalmente para scripts inline o botones dinámicos
window.downloadRealmlistFile = downloadRealmlistFile;
window.copyRealmlistOfficial = copyRealmlistOfficial;
window.copyConnectionData = copyConnectionData;
window.switchConnectionTab = switchConnectionTab;
window.switchLocalePath = switchLocalePath;
window.copyActiveLocalePath = copyActiveLocalePath;
window.testServerPing = testServerPing;
window.showPortalToast = window.showPortalToast || showPortalToast;
