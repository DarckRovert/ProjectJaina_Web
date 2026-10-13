/**
 * Project JAIna — Tienda de Cosméticos Sin Pay-to-Win
 * Archivo: js/store.js
 * Versión: 4.0 Hito-126
 * ─────────────────────────────────────────────────────────────────────────────
 * Nuevas funciones Hito #126:
 *  1. loadRemoteCatalog()   → fetch /api/shop/catalog en vivo desde WebAPI.
 *  2. renderCatalogCards()  → cards enriquecidas con insignia de rareza WoW.
 *  3. selectPackage()       → valida personaje en vivo (/api/armory/search)
 *                             antes de renderizar PayPal SDK.
 *  4. simulateTestDonation()→ POST /api/shop/simulate_delivery con feedback.
 *  5. CharValidationBadge   → muestra GS, clase y guild del destinatario real.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Catálogo fallback (SSOT local) — sincronizado con SHOP_CATALOG en WebAPI
const DEFAULT_CATALOG = [
    // 🪽 CATEGORÍA: ALAS MÍSTICAS & AURAS (Catálogo 59_SpellVisualCatalog)
    { id:"wings_celestial",    category:"wings",    rarity:"epico",     rarity_label:"AURA MÍSTICA",      name:"Alas Angelicales Celestiales (Blancas / Rojas)",        description:"Canaliza auras sagradas radiantes. Visible para todos los jugadores en el mundo mientras caminas, combates o vuelas.", icon:"🪽", price:"6.00" },
    { id:"wings_demonic",      category:"wings",    rarity:"epico",     rarity_label:"AURA MÍSTICA",      name:"Alas Demoníacas del Abismo (4 Variantes)",             description:"Auras de fuego vil y vacío cósmico. Despliega alas demoníacas con efecto de partículas ardientes persistentes.", icon:"🦇", price:"7.00" },
    { id:"wings_elements",     category:"wings",    rarity:"legendario",rarity_label:"ELEMENTAL",         name:"Alas de Hielo de Rasganorte & Fuego de Ragnaros",      description:"El poder polar del Rey Exánime y llamas de Tierras de Fuego. Incluye Alas de Dragón y de Brasas Volcánicas.", icon:"❄️", price:"9.00" },
    { id:"wings_collection_17",category:"wings",    rarity:"mitico",    rarity_label:"COLECCIÓN SUPREMA", name:"Colección Completa de las 17 Alas Místicas de Dalaran", description:"Desbloqueo vitalicio de las 17 variantes de alas del catálogo de Kaelia Sombraetérea para toda tu cuenta.", icon:"✨", price:"18.00" },

    // 👗 CATEGORÍA: GUARDARROPA TRANSPARENTE (ESTILO TURTLE WOW)
    { id:"transmog_pass_single",category:"transmog",rarity:"raro",      rarity_label:"ILUSIÓN",           name:"Pase de Ilusión Transparente (Individual)",            description:"Permite ocultar hombreras, pechera, pantalones o cualquier ranura con Kaelia Sombraetérea, manteniendo el 100% de estadísticas.", icon:"👗", price:"3.50" },
    { id:"transmog_fullset_turtle",category:"transmog",rarity:"legendario",rarity_label:"EDICIÓN TURTLE",name:"Guardarropa Invisible Completo (Set Total de 9 Ranuras)",description:"El icónico sistema de Turtle WoW: oculta todo tu set de armadura para lucir tu anatomía sin perder armadura, gemas ni stats.", icon:"✨", price:"8.50" },

    // 🪙 TOKENS & SERVICIOS
    { id:"pack_tier1",    category:"tokens",     rarity:"raro",      rarity_label:"RARO",      name:"Cofre de la Dama Valiente",        description:"500 Tokens de Jaina + 20 Bolsas de 36 Casillas + Mascota Pingüino de Rasganorte.",       icon:"🪙",  price:"5.00"  },
    { id:"pack_tier2",    category:"mounts",     rarity:"epico",     rarity_label:"ÉPICO",     name:"Arsenal Arcano de Theramore",      description:"1,500 Tokens + Montura Épica Voladora 'Draco del Viento de Hielo' (310% vel) + Compañero Dracónico.", icon:"🐉",  price:"15.00" },
    { id:"pack_tier3",    category:"mounts",     rarity:"legendario",rarity_label:"LEGENDARIO",name:"Soberano de Dalaran",              description:"3,500 Tokens + Riendas del Destrero Celestial + Título 'Soberano de Theramore' + Acceso VIP.",  icon:"👑",  price:"30.00" },
    { id:"pack_tier4",    category:"mounts",     rarity:"mitico",    rarity_label:"MÍTICO",    name:"Bendición del Consejo de los Seis",description:"8,000 Tokens + Montura 'Invencible de Arthas' + Cambio de Raza/Facción + Set de Transfiguración Mítica.", icon:"🔮",  price:"60.00" },
    { id:"pack_supporter",category:"battlepass", rarity:"epico",     rarity_label:"PASE VIP",  name:"Pase de Batalla VIP Project JAIna",description:"Desbloquea los 100 niveles prémium del Pase de Batalla con cosméticos y títulos exclusivos.",    icon:"🏆",  price:"10.00" },
    { id:"service_rename",category:"services",   rarity:"especial",  rarity_label:"SERVICIO",  name:"Servicio: Cambio de Nombre o Raza",description:"Rebautiza o renueva la raza de tu héroe con activación directa en pantalla de selección.",       icon:"📜",  price:"4.00"  }
];

// Colores de rareza canónicos de WoW
const RARITY_COLORS = {
    raro:       { border:"#0070dd", glow:"rgba(0,112,221,.25)",  text:"#0070dd" },
    epico:      { border:"#a335ee", glow:"rgba(163,53,238,.25)", text:"#a335ee" },
    legendario: { border:"#ff8000", glow:"rgba(255,128,0,.28)",  text:"#ff8000" },
    mitico:     { border:"#ffd700", glow:"rgba(255,215,0,.30)",  text:"#ffd700" },
    especial:   { border:"#1eff00", glow:"rgba(30,255,0,.20)",   text:"#1eff00" }
};

let selectedPackage  = null;
let currentCatalog   = [...DEFAULT_CATALOG];
let currentCategory  = "all";
let _validatedChar   = null;    // Resultado de validación en vivo del personaje

document.addEventListener("DOMContentLoaded", () => { initShop(); });

// ─────────────────────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────────────────────
function initShop() {
    renderCatalogCards(currentCatalog);
    setupCategoryFilters();
    loadRemoteCatalog();
}

// ─────────────────────────────────────────────────────────────────────────────
// CATÁLOGO REMOTO
// ─────────────────────────────────────────────────────────────────────────────
async function loadRemoteCatalog() {
    try {
        const apiUrl = _getApiUrl();
        const ctrl   = new AbortController();
        setTimeout(() => ctrl.abort(), 2500);
        const resp = await fetch(`${apiUrl}/api/shop/catalog`, {
            signal: ctrl.signal,
            headers: { "Accept": "application/json", "ngrok-skip-browser-warning": "true" }
        });
        if (resp.ok) {
            const data = await resp.json();
            if (Array.isArray(data) && data.length > 0) {
                currentCatalog = data;
                renderCatalogCards(currentCatalog);
                console.info("[Tienda] Catálogo cargado desde WebAPI:", data.length, "paquetes.");
            }
        }
    } catch (_) { /* fallback al catálogo local */ }
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDER TARJETAS
// ─────────────────────────────────────────────────────────────────────────────
function renderCatalogCards(catalog) {
    const container = document.getElementById("shopCardsContainer");
    if (!container) return;

    const filtered = currentCategory === "all"
        ? catalog
        : catalog.filter(p => p.category === currentCategory);

    if (!filtered.length) {
        container.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:2rem;">
            No hay paquetes en esta categoría todavía.</div>`;
        return;
    }

    container.innerHTML = filtered.map(pkg => {
        const r = RARITY_COLORS[pkg.rarity] || RARITY_COLORS.epico;
        const tokens = pkg.tokens ? `<div style="font-size:.8rem;color:${r.text};margin-top:.3rem;">🪙 ${Number(pkg.tokens).toLocaleString()} Tokens de Jaina</div>` : "";
        return `
        <div class="shop-card rarity-${pkg.rarity}"
             id="card-${pkg.id}"
             style="border-color:${r.border};box-shadow:0 0 18px ${r.glow};"
             onmouseenter="this.style.transform='translateY(-6px) scale(1.02)'"
             onmouseleave="this.style.transform=''">
            <div class="shop-card-badge" style="background:${r.border};color:#fff;">${pkg.rarity_label || "ÉPICO"}</div>
            <div class="shop-card-top">
                <div class="shop-icon">${pkg.icon || "✨"}</div>
                <div class="shop-title" style="color:${r.text};">${pkg.name}</div>
                <div class="shop-desc">${pkg.description}</div>
                ${tokens}
            </div>
            <div class="shop-card-bottom">
                <div class="shop-price">$${pkg.price} <span>USD</span></div>
                <button class="btn-primary btn-block"
                        style="border-color:${r.border};background:linear-gradient(135deg,${r.glow},transparent);"
                        onclick="selectPackage('${pkg.id}','${pkg.name}','${pkg.price}')">
                    ✨ Adquirir Recompensa
                </button>
            </div>
        </div>`;
    }).join("");
}

// ─────────────────────────────────────────────────────────────────────────────
// SELECCIÓN DE PAQUETE
// ─────────────────────────────────────────────────────────────────────────────
function selectPackage(id, name, price) {
    selectedPackage  = { id, name, price };
    _validatedChar   = null;

    const checkout = document.getElementById("checkoutSection");
    const summary  = document.getElementById("selectedPkgSummary");
    if (summary) summary.innerHTML = `Has seleccionado: <strong>${name}</strong> por <strong>$${price} USD</strong>`;
    if (checkout) { checkout.style.display = "block"; checkout.scrollIntoView({ behavior:"smooth", block:"center" }); }

    // Limpiar badge de validación previo
    _clearCharBadge();
    // Vincular validación en tiempo real al campo de personaje
    const inp = document.getElementById("targetCharacterName");
    if (inp) {
        inp.oninput = null;
        inp.addEventListener("input", _debounce(_validateCharacterLive, 700));
    }
}

function closeCheckout() {
    const c = document.getElementById("checkoutSection");
    if (c) c.style.display = "none";
    _clearCharBadge();
}

// ─────────────────────────────────────────────────────────────────────────────
// VALIDACIÓN EN VIVO DEL PERSONAJE (Hito #126 — /api/armory/search)
// ─────────────────────────────────────────────────────────────────────────────
async function _validateCharacterLive() {
    const inp      = document.getElementById("targetCharacterName");
    const charName = inp?.value.trim();
    if (!charName || charName.length < 2) { _clearCharBadge(); return; }

    _showCharBadge("⏳", "#a0a0c0", `Verificando «${charName}» en acore_characters...`);

    try {
        const apiUrl = _getApiUrl();
        const ctrl   = new AbortController();
        setTimeout(() => ctrl.abort(), 3000);
        const resp = await fetch(
            `${apiUrl}/api/armory/search?name=${encodeURIComponent(charName)}`,
            { signal: ctrl.signal, headers: { "ngrok-skip-browser-warning": "true" } }
        );
        if (resp.ok) {
            const data = await resp.json();
            if (data.found) {
                _validatedChar = data;
                const gsColor = data.gear_score >= 2000 ? "#ffd700" : data.gear_score >= 1200 ? "#00e5ff" : "#a0c4ff";
                _showCharBadge("✅", "#39d353",
                    `<strong>${data.name}</strong> · ${data.class} Nv${data.level} · 
                     <span style="color:${gsColor}">${data.gear_score} GS</span> · 
                     ${data.guild} · ${data.achievements} logros`
                );
                initPayPalButton(selectedPackage.id, selectedPackage.price);
            } else {
                _validatedChar = null;
                _showCharBadge("❌", "#ff5252", `«${charName}» no encontrado en acore_characters. Verifica el nombre exacto.`);
            }
        } else if (resp.status === 404) {
            _validatedChar = null;
            _showCharBadge("❌", "#ff5252", `«${charName}» no existe en el servidor. ¿Ya creaste tu cuenta?`);
        } else {
            _showCharBadge("⚠️", "#ffb74d", "Servidor offline. La entrega será validada por el operador.");
        }
    } catch (_) {
        _showCharBadge("⚠️", "#ffb74d", "No se pudo verificar online. La entrega se procesará manualmente.");
        initPayPalButton(selectedPackage?.id, selectedPackage?.price);
    }
}

function _showCharBadge(icon, color, html) {
    let badge = document.getElementById("charValidationBadge");
    if (!badge) {
        badge = document.createElement("div");
        badge.id = "charValidationBadge";
        badge.style.cssText = "margin-top:.8rem;padding:.6rem 1rem;border-radius:8px;font-size:.84rem;border:1px solid;transition:all .3s;";
        document.getElementById("targetCharacterName")?.parentElement?.after(badge);
    }
    badge.style.color        = color;
    badge.style.borderColor  = color + "55";
    badge.style.background   = color + "11";
    badge.innerHTML          = `${icon} ${html}`;
    badge.style.display      = "block";
}

function _clearCharBadge() {
    const b = document.getElementById("charValidationBadge");
    if (b) b.style.display = "none";
    _validatedChar = null;
}

// ─────────────────────────────────────────────────────────────────────────────
// SIMULACIÓN DE ENTREGA (Prueba de Clúster)
// ─────────────────────────────────────────────────────────────────────────────
async function simulateTestDonation() {
    const charName = document.getElementById("targetCharacterName")?.value.trim();
    const feedback = document.getElementById("paymentFeedback");

    if (!charName) {
        alert("Escribe el nombre exacto de tu personaje antes de continuar.");
        document.getElementById("targetCharacterName")?.focus();
        return;
    }
    if (!selectedPackage) {
        alert("Selecciona un paquete de la tienda primero.");
        return;
    }

    if (feedback) {
        feedback.style.display = "block";
        feedback.className     = "payment-feedback-box";
        feedback.innerHTML     = `⏳ Verificando personaje <strong>${charName}</strong> en la base de datos...`;
    }

    try {
        const apiUrl = _getApiUrl();
        const res = await fetch(`${apiUrl}/api/shop/simulate_delivery`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
            body: JSON.stringify({ character_name: charName, package_id: selectedPackage.id })
        });
        const data = await res.json();
        if (res.ok && data.ok) {
            feedback.className = "payment-feedback-box success-box";
            feedback.innerHTML = `<div>🎉 <strong>¡Verificación Exitosa!</strong></div>
                <p style="margin-top:5px;font-size:.88rem;">${data.message}</p>`;
        } else {
            feedback.className = "payment-feedback-box error-box";
            feedback.innerHTML = `<div>⚠️ <strong>Validación Fallida</strong></div>
                <p style="margin-top:5px;font-size:.88rem;">${data.message || "No se pudo verificar."}</p>`;
        }
    } catch (_) {
        if (feedback) {
            feedback.className = "payment-feedback-box success-box";
            feedback.innerHTML = `<div>🎉 <strong>¡Simulación Local Registrada!</strong></div>
                <p style="margin-top:5px;font-size:.88rem;">
                Orden para <strong>${charName.toUpperCase()}</strong> · paquete <strong>${selectedPackage.name}</strong> 
                en cola. El servidor la procesará cuando esté en línea.</p>`;
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYPAL SDK
// ─────────────────────────────────────────────────────────────────────────────
function initPayPalButton(packageId, price) {
    const container = document.getElementById("paypal-button-container");
    if (!container) return;
    container.innerHTML = "";

    const clientId = (typeof CONFIG !== "undefined" && CONFIG.PAYPAL_CLIENT_ID)
        ? CONFIG.PAYPAL_CLIENT_ID : "sb";

    if (!window.paypal) {
        const script = document.createElement("script");
        script.src     = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
        script.onload  = () => _renderPayPalButtons(container, packageId, price);
        script.onerror = () => {
            container.innerHTML = `<p style="color:var(--text-muted);font-size:.85rem;text-align:center;">
                Pasarela PayPal lista para activación con Client ID de producción.</p>`;
        };
        document.head.appendChild(script);
    } else {
        _renderPayPalButtons(container, packageId, price);
    }
}

function _renderPayPalButtons(container, packageId, price) {
    if (!window.paypal?.Buttons) {
        container.innerHTML = `<p style="color:var(--text-muted);font-size:.85rem;text-align:center;">
            Pasarela PayPal lista para activación con Client ID de producción.</p>`;
        return;
    }

    window.paypal.Buttons({
        createOrder: (data, actions) => {
            const charName = document.getElementById("targetCharacterName")?.value.trim();
            if (!charName) { alert("Ingresa el nombre de tu personaje para recibir la recompensa."); throw new Error("Nombre requerido"); }
            return actions.order.create({
                purchase_units: [{ amount: { value: price }, description: `Project JAIna - ${selectedPackage?.name || packageId} (Personaje: ${charName})` }]
            });
        },
        onApprove: async (data, actions) => {
            const feedback = document.getElementById("paymentFeedback");
            const charName = document.getElementById("targetCharacterName")?.value.trim();
            if (feedback) { feedback.style.display = "block"; feedback.className = "payment-feedback-box"; feedback.innerHTML = `⏳ Confirmando orden con el servidor de juego...`; }
            try {
                const details = await actions.order.capture();
                const apiUrl  = _getApiUrl();
                const res = await fetch(`${apiUrl}/api/shop/paypal/capture`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
                    body: JSON.stringify({ order_id: details.id, character_name: charName, package_id: selectedPackage?.id, payer_email: details.payer?.email_address || "" })
                });
                const result = await res.json();
                if (res.ok && result.ok) {
                    feedback.className = "payment-feedback-box success-box";
                    feedback.innerHTML = `🎉 ¡Gracias ${details.payer?.name?.given_name || charName}! ${result.message}`;
                } else {
                    feedback.className = "payment-feedback-box error-box";
                    feedback.innerHTML = `⚠️ Pago en PayPal OK pero el servidor reportó: ${result.message || "Error de entrega"}. Contacta soporte con Order ID: ${details.id}.`;
                }
            } catch (err) {
                if (feedback) { feedback.className = "payment-feedback-box error-box"; feedback.innerHTML = `❌ Error: ${err.message}`; }
            }
        }
    }).render(container);
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTROS DE CATEGORÍA
// ─────────────────────────────────────────────────────────────────────────────
function setupCategoryFilters() {
    document.querySelectorAll(".shop-cat-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".shop-cat-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentCategory = btn.getAttribute("data-category");
            renderCatalogCards(currentCatalog);
        });
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────────────────────────────────────
function _getApiUrl() {
    return (typeof CONFIG !== "undefined" && CONFIG.getApiUrl) ? CONFIG.getApiUrl() : "http://127.0.0.1:8080";
}

function _debounce(fn, ms) {
    let t;
    return function(...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), ms); };
}
