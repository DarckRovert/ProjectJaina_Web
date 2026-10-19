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

// Catálogo fallback (SSOT local) — sincronizado con store_catalog.json en WebAPI
const DEFAULT_CATALOG = [
    {
        id: "pack_welcome", category: "tokens", rarity: "raro", rarity_label: "BIENVENIDA",
        name: "Pack de Bienvenida al Reino",
        description: "4 Carteras de Tejido de Escarcha (20c) + Mascota Exclusiva 'Osezno de Blizzard' + 10 Fichas de Evento + 100 Tokens de Jaina.",
        price_pen: 7.00, price_usd: 1.99, price: "1.99", currency: "PEN", tokens: 100, icon: "🎁",
        rewards: [
            { type: "item", entry: 900100, count: 100, name: "Token de Jaina" },
            { type: "item", entry: 41599, count: 4, name: "Cartera de Tejido de Escarcha (20c)" },
            { type: "item", entry: 44819, count: 1, name: "Osezno de Blizzard" },
            { type: "item", entry: 910000, count: 10, name: "Ficha de Evento" }
        ]
    },
    {
        id: "pack_tier1", category: "tokens", rarity: "raro", rarity_label: "RARO",
        name: "Cofre de la Dama Valiente",
        description: "500 Tokens de Jaina + 4 Bolsas de Viajero Arcano (20c) + 10 Fichas de Evento para la Tesorería.",
        price_pen: 15.00, price_usd: 4.00, price: "4.00", currency: "PEN", tokens: 500, icon: "🪙",
        rewards: [
            { type: "item", entry: 900100, count: 500, name: "Token de Jaina" },
            { type: "item", entry: 910000, count: 10, name: "Ficha de Evento" },
            { type: "item", entry: 21841, count: 4, name: "Bolsa de Viajero Arcano" }
        ]
    },
    {
        id: "pack_tier2", category: "mounts", rarity: "epico", rarity_label: "ÉPICO",
        name: "Arsenal Arcano de Theramore",
        description: "1,500 Tokens de Jaina + Montura Épica Terrestre y Voladora 'Tigre Espectral Raudo' (310% vel).",
        price_pen: 35.00, price_usd: 9.50, price: "9.50", currency: "PEN", tokens: 1500, icon: "🐉",
        rewards: [
            { type: "item", entry: 900100, count: 1500, name: "Token de Jaina" },
            { type: "mount", entry: 49284, count: 1, name: "Reins of the Swift Spectral Tiger", data: "49284" }
        ]
    },
    {
        id: "pack_tier3", category: "mounts", rarity: "legendario", rarity_label: "LEGENDARIO",
        name: "Soberano de Dalaran",
        description: "3,500 Tokens de Jaina + Riendas del Destrero Celestial Titánico + Título Honorífico 'Soberano de Theramore'.",
        price_pen: 65.00, price_usd: 17.50, price: "17.50", currency: "PEN", tokens: 3500, icon: "👑",
        rewards: [
            { type: "item", entry: 900100, count: 3500, name: "Token de Jaina" },
            { type: "mount", entry: 54811, count: 1, name: "Celestial Steed", data: "74856" },
            { type: "title", entry: 145, count: 1, name: "Soberano de Theramore" }
        ]
    },
    {
        id: "pack_tier4", category: "mounts", rarity: "mitico", rarity_label: "MÍTICO",
        name: "Bendición del Consejo de los Seis",
        description: "8,000 Tokens de Jaina + Montura Mítica 'Invencible de Arthas' (Riendas de Invencible con huellas de escarcha).",
        price_pen: 120.00, price_usd: 32.00, price: "32.00", currency: "PEN", tokens: 8000, icon: "🔮",
        rewards: [
            { type: "item", entry: 900100, count: 8000, name: "Token de Jaina" },
            { type: "mount", entry: 50818, count: 1, name: "Invincible's Reins", data: "72286" }
        ]
    },
    {
        id: "pack_club_kirintor", category: "services", rarity: "legendario", rarity_label: "MEMBRESÍA VIP",
        name: "Membresía Mensual: Club Kirin Tor",
        description: "Acceso VIP completo al Pase de Batalla + 300 Tokens de Jaina mensuales + 20 Fichas de Evento + Rango Honorífico Kirin Tor.",
        price_pen: 18.00, price_usd: 5.00, price: "5.00", currency: "PEN", tokens: 300, icon: "🏰",
        rewards: [
            { type: "vip", entry: 1, count: 1, name: "Acceso VIP Pase de Batalla" },
            { type: "item", entry: 900100, count: 300, name: "Token de Jaina" },
            { type: "item", entry: 910000, count: 20, name: "Ficha de Evento" }
        ]
    },
    {
        id: "pack_supporter", category: "battlepass", rarity: "epico", rarity_label: "PASE VIP",
        name: "Pase de Batalla VIP Project JAIna",
        description: "Desbloquea los 100 niveles prémium del Pase de Batalla de la temporada actual con cosméticos exclusivos.",
        price_pen: 25.00, price_usd: 7.00, price: "7.00", currency: "PEN", tokens: 0, icon: "🏆",
        rewards: [
            { type: "vip", entry: 1, count: 1, name: "Acceso VIP Pase de Batalla" }
        ]
    },
    {
        id: "pack_bp_skip5", category: "battlepass", rarity: "epico", rarity_label: "SALTO TIERS",
        name: "Acelerador de Pase (+5 Niveles)",
        description: "Acredita +5 niveles instantáneos a tu Pase de Batalla activo (hasta Nivel 50) para reclamar recompensas de temporada.",
        price_pen: 10.00, price_usd: 2.80, price: "2.80", currency: "PEN", tokens: 0, icon: "⚡",
        rewards: [
            { type: "bp_levels", entry: 5, count: 5, name: "+5 Niveles de Pase de Batalla" }
        ]
    },
    {
        id: "pack_dual_spec", category: "services", rarity: "raro", rarity_label: "COMODIDAD",
        name: "Desbloqueo de Doble Especialización",
        description: "1,000 monedas de oro (1,000g) en mano/correo para activar de inmediato la Doble Especialización con tu instructor de clase + 100 Tokens.",
        price_pen: 10.00, price_usd: 2.80, price: "2.80", currency: "PEN", tokens: 100, icon: "⚖️",
        rewards: [
            { type: "money", entry: 10000000, count: 1, name: "1,000 Monedas de Oro (1,000g)" },
            { type: "item", entry: 900100, count: 100, name: "Token de Jaina" }
        ]
    },
    {
        id: "service_rename", category: "services", rarity: "especial", rarity_label: "SERVICIO",
        name: "Servicio: Cambio de Nombre, Raza o Facción",
        description: "400 Tokens de Jaina para canjear servicios cosméticos y de identidad de personaje con Kaelia Sombraetérea.",
        price_pen: 12.00, price_usd: 3.50, price: "3.50", currency: "PEN", tokens: 400, icon: "📜",
        rewards: [
            { type: "item", entry: 900100, count: 400, name: "Token de Jaina" }
        ]
    },
    {
        id: "wings_celestial", category: "wings", rarity: "epico", rarity_label: "AURA MÍSTICA",
        name: "Alas Angelicales Celestiales (Blancas / Rojas)",
        description: "Desbloqueo inmediato in-game de las Alas Angelicales Blancas animadas + 15 Fichas de Evento.",
        price_pen: 20.00, price_usd: 5.50, price: "5.50", currency: "PEN", tokens: 600, icon: "🪽",
        rewards: [
            { type: "aura", entry: 1, count: 1, name: "Alas Angelicales Blancas", data: "exp" },
            { type: "item", entry: 910000, count: 15, name: "Ficha de Evento" }
        ]
    },
    {
        id: "wings_demonic", category: "wings", rarity: "epico", rarity_label: "AURA MÍSTICA",
        name: "Alas Demoníacas del Abismo (4 Variantes)",
        description: "Desbloqueo in-game de las Alas Demoníacas Rojas con partículas de fuego vil + 15 Fichas de Evento.",
        price_pen: 20.00, price_usd: 5.50, price: "5.50", currency: "PEN", tokens: 700, icon: "🦇",
        rewards: [
            { type: "aura", entry: 4, count: 1, name: "Alas Demoníacas Rojas", data: "oro" },
            { type: "item", entry: 910000, count: 15, name: "Ficha de Evento" }
        ]
    },
    {
        id: "wings_elements", category: "wings", rarity: "legendario", rarity_label: "ELEMENTAL",
        name: "Alas de Hielo de Rasganorte & Fuego de Ragnaros",
        description: "Desbloqueo de las legendarias Alas de Hielo de Sindragosa con estela de escarcha + 20 Fichas de Evento.",
        price_pen: 25.00, price_usd: 7.00, price: "7.00", currency: "PEN", tokens: 800, icon: "❄️",
        rewards: [
            { type: "aura", entry: 13, count: 1, name: "Alas de Hielo", data: "rep" },
            { type: "item", entry: 910000, count: 20, name: "Ficha de Evento" }
        ]
    },
    {
        id: "wings_collection_17", category: "wings", rarity: "mitico", rarity_label: "COLECCIÓN SUPREMA",
        name: "Colección Completa de las 17 Alas Místicas de Dalaran",
        description: "50 Fichas de Evento + Desbloqueo permanente de las 17 variantes de alas en tu cuenta de juego.",
        price_pen: 50.00, price_usd: 13.50, price: "13.50", currency: "PEN", tokens: 1800, icon: "✨",
        rewards: [
            { type: "aura", entry: 1, count: 1, name: "Alas Angelicales Blancas" },
            { type: "aura", entry: 4, count: 1, name: "Alas Demoníacas Rojas" },
            { type: "aura", entry: 13, count: 1, name: "Alas de Hielo" },
            { type: "item", entry: 910000, count: 50, name: "Ficha de Evento" }
        ]
    },
    {
        id: "transmog_pass_single", category: "transmog", rarity: "raro", rarity_label: "ILUSIÓN",
        name: "Pase de Ilusión Transparente (Individual)",
        description: "350 Tokens de Jaina para transfigurar ranuras invisibles de equipamiento con Kaelia Sombraetérea.",
        price_pen: 10.00, price_usd: 2.80, price: "2.80", currency: "PEN", tokens: 350, icon: "👗",
        rewards: [
            { type: "item", entry: 900100, count: 350, name: "Token de Jaina" }
        ]
    },
    {
        id: "transmog_fullset_turtle", category: "transmog", rarity: "legendario", rarity_label: "EXCLUSIVO JAINACORE",
        name: "Guardarropa Invisible Completo (Set Total de 9 Ranuras)",
        description: "850 Tokens de Jaina para transfigurar el vestidor completo de 9 piezas transparentes sin perder gemas ni stats.",
        price_pen: 25.00, price_usd: 6.80, price: "6.80", currency: "PEN", tokens: 850, icon: "✨",
        rewards: [
            { type: "item", entry: 900100, count: 850, name: "Token de Jaina" }
        ]
    }
];

// Colores de rareza canónicos de WoW
const RARITY_COLORS = {
    raro:       { border:"#0070dd", glow:"rgba(0,112,221,.25)",  text:"#0070dd" },
    epico:      { border:"#a335ee", glow:"rgba(163,53,238,.25)", text:"#a335ee" },
    legendario: { border:"#ff8000", glow:"rgba(255,128,0,.28)",  text:"#ff8000" },
    mitico:     { border:"#ffd700", glow:"rgba(255,215,0,.30)",  text:"#ffd700" },
    especial:   { border:"#1eff00", glow:"rgba(30,255,0,.20)",   text:"#1eff00" }
};

let selectedPackage   = null;
let currentCatalog    = [...DEFAULT_CATALOG];
let currentCategory   = "all";
let currentCurrency   = "PEN";    // Moneda por defecto: Soles peruanos (PEN S/.)
let currentPaymentMethod = "yape"; // Medio por defecto: Yape / Plin (Perú)
let _validatedChar    = null;     // Resultado de validación en vivo del personaje

document.addEventListener("DOMContentLoaded", () => { initShop(); });

// ─────────────────────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────────────────────
function initShop() {
    renderCatalogCards(currentCatalog);
    setupCategoryFilters();
    setupCheckoutListeners();
    loadRemoteCatalog();
    loadServerFundingGoal();
    setCurrency("PEN");
}

// ─────────────────────────────────────────────────────────────────────────────
// SELECTOR DE DIVISAS (PEN S/. vs USD $)
// ─────────────────────────────────────────────────────────────────────────────
function setCurrency(curr) {
    currentCurrency = curr === "USD" ? "USD" : "PEN";
    
    const btnPEN = document.getElementById("currBtnPEN");
    const btnUSD = document.getElementById("currBtnUSD");
    
    if (btnPEN && btnUSD) {
        if (currentCurrency === "PEN") {
            btnPEN.style.background = "#0284c7";
            btnPEN.style.color = "#ffffff";
            btnUSD.style.background = "transparent";
            btnUSD.style.color = "#94a3b8";
        } else {
            btnUSD.style.background = "#0284c7";
            btnUSD.style.color = "#ffffff";
            btnPEN.style.background = "transparent";
            btnPEN.style.color = "#94a3b8";
        }
    }
    
    renderCatalogCards(currentCatalog);
    
    if (selectedPackage) {
        updateCheckoutSummary();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// SELECTOR DE MÉTODO DE PAGO (Yape / Plin vs PayPal)
// ─────────────────────────────────────────────────────────────────────────────
function setPaymentMethod(method) {
    currentPaymentMethod = method;
    const yapeCard = document.getElementById("methodCardYape");
    const paypalCard = document.getElementById("methodCardPaypal");
    const yapeContainer = document.getElementById("yapeDetailsContainer");
    const paypalContainer = document.getElementById("paypal-button-container");
    
    if (method === "yape") {
        if (yapeCard) {
            yapeCard.style.background = "rgba(115, 34, 134, 0.35)";
            yapeCard.style.border = "2px solid #c084fc";
        }
        if (paypalCard) {
            paypalCard.style.background = "rgba(2, 132, 199, 0.08)";
            paypalCard.style.border = "1px solid rgba(56, 189, 248, 0.25)";
        }
        if (yapeContainer) yapeContainer.style.display = "block";
        if (paypalContainer) paypalContainer.style.display = "none";
    } else {
        if (paypalCard) {
            paypalCard.style.background = "rgba(2, 132, 199, 0.25)";
            paypalCard.style.border = "2px solid #38bdf8";
        }
        if (yapeCard) {
            yapeCard.style.background = "rgba(115, 34, 134, 0.1)";
            yapeCard.style.border = "1px solid rgba(168, 85, 247, 0.25)";
        }
        if (yapeContainer) yapeContainer.style.display = "none";
        if (paypalContainer) {
            paypalContainer.style.display = "block";
            if (selectedPackage) {
                initPayPalButton(selectedPackage.id, selectedPackage.price_usd || selectedPackage.price);
            }
        }
    }
}

function generateRefCode() {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `PJ-REF-${randomNum}`;
}

function updateCheckoutSummary() {
    if (!selectedPackage) return;
    const summary = document.getElementById("selectedPkgSummary");
    if (!summary) return;
    
    const penStr = `S/. ${Number(selectedPackage.price_pen || 0).toFixed(2)}`;
    const usdStr = `$${Number(selectedPackage.price_usd || selectedPackage.price || 0).toFixed(2)} USD`;
    
    summary.innerHTML = `Has seleccionado: <strong style="color:#ffd700;">${selectedPackage.name}</strong> por <strong style="color:#38bdf8;">${penStr}</strong> <span style="color:#94a3b8;font-size:0.9rem;">(${usdStr})</span>`;
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
                return;
            }
        }
    } catch (_) { /* fallback al catálogo local */ }

    // Fallback secundario estático a data/store_catalog.json
    try {
        const respLocal = await fetch("data/store_catalog.json");
        if (respLocal.ok) {
            const dataLocal = await respLocal.json();
            if (Array.isArray(dataLocal) && dataLocal.length > 0) {
                currentCatalog = dataLocal;
                renderCatalogCards(currentCatalog);
                console.info("[Tienda] Catálogo cargado desde data/store_catalog.json");
            }
        }
    } catch (_) { /* fallback a DEFAULT_CATALOG */ }
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
        const tokens = pkg.tokens ? `<div style="font-size:.8rem;color:${r.text};margin-top:.3rem;font-weight:600;">🪙 ${Number(pkg.tokens).toLocaleString()} Tokens de Jaina</div>` : "";
        
        let rewardsHtml = "";
        if (pkg.rewards && pkg.rewards.length > 0) {
            const itemsList = pkg.rewards.map(rw => {
                let icon = "🎁";
                if (rw.type === "mount") icon = "🐎";
                else if (rw.type === "title") icon = "👑";
                else if (rw.type === "aura") icon = "🪽";
                else if (rw.type === "vip") icon = "⭐";
                else if (rw.type === "money") icon = "💰";
                else if (rw.type === "bp_levels") icon = "⚡";
                else if (rw.name && rw.name.includes("Token")) icon = "🪙";
                return `<span style="display:inline-block;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:4px;padding:2px 6px;margin:2px 2px 0 0;font-size:0.73rem;color:#e2e8f0;">${icon} ${rw.count > 1 ? rw.count + 'x ' : ''}${rw.name}</span>`;
            }).join("");
            rewardsHtml = `<div style="margin-top:0.45rem;display:flex;flex-wrap:wrap;gap:2px;">${itemsList}</div>`;
        }

        const pricePen = Number(pkg.price_pen || pkg.price || 0).toFixed(2);
        const priceUsd = Number(pkg.price_usd || pkg.price || 0).toFixed(2);
        const displayPrice = currentCurrency === "PEN" 
            ? `S/. ${pricePen} <span style="font-size:0.75rem;color:#94a3b8;">PEN</span>`
            : `$${priceUsd} <span style="font-size:0.75rem;color:#94a3b8;">USD</span>`;

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
                ${rewardsHtml}
            </div>
            <div class="shop-card-bottom">
                <div class="shop-price">${displayPrice}</div>
                <button class="btn-primary btn-block"
                        style="border-color:${r.border};background:linear-gradient(135deg,${r.glow},transparent);"
                        onclick="selectPackage('${pkg.id}','${pkg.name}',${pkg.price_pen || 0},${pkg.price_usd || 0})">
                    ✨ Adquirir Recompensa
                </button>
            </div>
        </div>`;
    }).join("");
}

// ─────────────────────────────────────────────────────────────────────────────
// SELECCIÓN DE PAQUETE
// ─────────────────────────────────────────────────────────────────────────────
function selectPackage(id, name, price_pen, price_usd) {
    selectedPackage = { id, name, price_pen, price_usd, price: price_usd };

    const checkout = document.getElementById("checkoutSection");
    updateCheckoutSummary();

    const refElem = document.getElementById("yapeRefCode");
    if (refElem) {
        refElem.innerText = generateRefCode();
    }

    setPaymentMethod(currentPaymentMethod);

    if (checkout) { 
        checkout.style.display = "block"; 
        checkout.scrollIntoView({ behavior:"smooth", block:"center" }); 
    }

    const inp = document.getElementById("targetCharacterName");
    const charName = inp?.value.trim();
    if (charName && charName.length >= 2) {
        _validateCharacterLive();
    } else {
        const btnContainer = document.getElementById("paypal-button-container");
        if (btnContainer && currentPaymentMethod === "paypal") btnContainer.innerHTML = "";
    }
}

function closeCheckout() {
    const c = document.getElementById("checkoutSection");
    if (c) c.style.display = "none";
    _clearCharBadge();
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIRMACIÓN DE PAGO VÍA YAPE / PLIN
// ─────────────────────────────────────────────────────────────────────────────
async function confirmYapePayment() {
    const charName = document.getElementById("targetCharacterName")?.value.trim();
    const feedback = document.getElementById("paymentFeedback");
    const refCode  = document.getElementById("yapeRefCode")?.innerText.trim() || generateRefCode();

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
        feedback.className     = "payment-feedback-box success-box";
        const penAmount = Number(selectedPackage.price_pen || 0).toFixed(2);
        feedback.innerHTML     = `
            <div style="font-size:1.05rem;font-weight:800;color:#38bdf8;">📲 Solicitud de Acreditación Registrada</div>
            <p style="margin:8px 0;font-size:0.9rem;line-height:1.5;">
                Hemos registrado tu orden para <strong>${charName}</strong> por el paquete <strong>${selectedPackage.name}</strong> (<strong>S/. ${penAmount}</strong>).
            </p>
            <div style="background:rgba(0,0,0,0.4);border:1px dashed #38bdf8;padding:8px 12px;border-radius:6px;margin:8px 0;">
                Código de Referencia: <strong style="color:#ffd700;letter-spacing:1px;">${refCode}</strong>
            </div>
            <p style="margin:6px 0;font-size:0.83rem;color:#cbd5e1;">
                El sistema valida el comprobante y el buzón postal de Dalaran despachará tus recompensas de inmediato (o directamente a tus bolsas si estás conectado).
            </p>
        `;
    }
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
                if (currentPaymentMethod === "paypal" && selectedPackage) {
                    initPayPalButton(selectedPackage.id, selectedPackage.price_usd || selectedPackage.price);
                }
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
        if (currentPaymentMethod === "paypal" && selectedPackage) {
            initPayPalButton(selectedPackage.id, selectedPackage.price_usd || selectedPackage.price);
        }
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
    } catch (err) {
        if (feedback) {
            feedback.className = "payment-feedback-box error-box";
            feedback.innerHTML = `<div>⚠️ <strong>Servidor Offline o Inaccesible</strong></div>
                <p style="margin-top:5px;font-size:.88rem;">
                No se pudo comunicar con el Gateway WebAPI (${err.message}). La simulación en tiempo real requiere que el clúster esté en línea.</p>`;
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
            if (!charName) { 
                alert("Ingresa el nombre de tu personaje para recibir la recompensa."); 
                throw new Error("Nombre requerido"); 
            }
            if (!selectedPackage || !selectedPackage.price) {
                alert("Selecciona un paquete válido.");
                throw new Error("Paquete no seleccionado");
            }
            return actions.order.create({
                purchase_units: [{ 
                    amount: { value: String(selectedPackage.price) }, 
                    description: `Project JAIna - ${selectedPackage.name} (Personaje: ${charName})` 
                }]
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

function setupCheckoutListeners() {
    const inp = document.getElementById("targetCharacterName");
    if (inp && !inp.dataset.listenerBound) {
        inp.addEventListener("input", _debounce(_validateCharacterLive, 600));
        inp.dataset.listenerBound = "true";
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// TELEMETRÍA DE SOSTENIBILIDAD & META COMUNITARIA (ZERO-P2W)
// ─────────────────────────────────────────────────────────────────────────────
async function loadServerFundingGoal() {
    try {
        const resp = await fetch("data/server_goal.json");
        if (!resp.ok) return;
        const data = await resp.json();

        const targetPen = Number(data.monthly_target_pen || 180).toFixed(2);
        const raisedPen = Number(data.current_raised_pen || 0).toFixed(2);
        const targetUsd = Number(data.monthly_target_usd || 49.20).toFixed(2);
        const raisedUsd = Number(data.current_raised_usd || 0).toFixed(2);
        const pct = Math.min(100, Math.max(0, (Number(data.current_raised_pen || 0) / Number(data.monthly_target_pen || 180)) * 100)).toFixed(1);

        const fillEl = document.getElementById("fundingProgressFill");
        const raisedEl = document.getElementById("fundingRaisedText");
        const targetEl = document.getElementById("fundingTargetText");
        const pctEl = document.getElementById("fundingPctText");
        const suppEl = document.getElementById("fundingSupportersCount");
        const monthEl = document.getElementById("fundingMonthLabel");

        if (fillEl) fillEl.style.width = `${pct}%`;
        if (raisedEl) raisedEl.innerText = `S/. ${raisedPen} PEN ($${raisedUsd} USD)`;
        if (targetEl) targetEl.innerText = `S/. ${targetPen} PEN ($${targetUsd} USD)`;
        if (pctEl) pctEl.innerText = `${pct}%`;
        if (suppEl && data.supporters_count !== undefined) suppEl.innerText = data.supporters_count;
        if (monthEl && data.month_name) monthEl.innerText = data.month_name;
    } catch (_) {
        // Fallback a los valores estáticos presentes en el DOM
    }
}

