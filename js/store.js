/**
 * Project JAIna — Tienda Oficial & Integración PayPal SDK Resiliente
 * Soporta filtros por categoría, insignias de rareza WoW y simulación in-game.
 */

const DEFAULT_CATALOG = [
    {
        id: "pack_tier1",
        category: "tokens",
        rarity: "raro",
        rarity_label: "RARO",
        name: "Cofre de la Dama Valiente",
        description: "500 Tokens de Jaina para la Tienda Visual in-game + 20 Bolsas de 36 Casillas para tu personaje + Mascota Pingüino de Rasganorte.",
        icon: "🪙",
        price: "5.00"
    },
    {
        id: "pack_tier2",
        category: "mounts",
        rarity: "epico",
        rarity_label: "ÉPICO",
        name: "Arsenal Arcano de Theramore",
        description: "1,500 Tokens de Jaina + Montura Épica Voladora 'Draco del Viento de Hielo' (310% vel) + Compañero Dracónico de Compañía.",
        icon: "🐉",
        price: "15.00"
    },
    {
        id: "pack_tier3",
        category: "mounts",
        rarity: "legendario",
        rarity_label: "LEGENDARIO",
        name: "Soberano de Dalaran",
        description: "3,500 Tokens de Jaina + Riendas del Destrero Celestial + Título Honorífico 'Soberano de Theramore' + Acceso VIP Prioritario al Reino.",
        icon: "👑",
        price: "30.00"
    },
    {
        id: "pack_tier4",
        category: "mounts",
        rarity: "mitico",
        rarity_label: "MÍTICO",
        name: "Bendición del Consejo de los Seis",
        description: "8,000 Tokens de Jaina + Montura 'Invencible de Arthas' + Cambio de Raza/Facción Gratuito + Set Completo de Transfiguración Mítica.",
        icon: "🔮",
        price: "60.00"
    },
    {
        id: "pack_supporter",
        category: "battlepass",
        rarity: "epico",
        rarity_label: "PASE VIP",
        name: "Pase de Batalla VIP Project JAIna",
        description: "Desbloquea los 100 niveles prémium del Pase de Batalla de la temporada actual al instante, con cosméticos y títulos exclusivos.",
        icon: "🏆",
        price: "10.00"
    },
    {
        id: "service_rename",
        category: "services",
        rarity: "especial",
        rarity_label: "SERVICIO",
        name: "Servicio: Cambio de Nombre o Raza",
        description: "Rebautiza o renueva la apariencia/raza de tu héroe en el reino con activación directa en la pantalla de selección de personajes.",
        icon: "📜",
        price: "4.00"
    }
];

let selectedPackage = null;
let currentCatalog = [...DEFAULT_CATALOG];
let currentCategory = "all";

document.addEventListener("DOMContentLoaded", () => {
    initShop();
});

function initShop() {
    renderCatalogCards(currentCatalog);
    setupCategoryFilters();
    loadRemoteCatalog();
}

function renderCatalogCards(catalog) {
    const container = document.getElementById("shopCardsContainer");
    if (!container) return;

    const filtered = (currentCategory === "all")
        ? catalog
        : catalog.filter(p => p.category === currentCategory);

    if (filtered.length === 0) {
        container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">No hay paquetes en esta categoría.</div>`;
        return;
    }

    container.innerHTML = filtered.map(pkg => {
        const rarityClass = `rarity-${pkg.rarity || 'epico'}`;
        return `
            <div class="shop-card ${rarityClass}" id="card-${pkg.id}">
                <div class="shop-card-badge">${pkg.rarity_label || 'ÉPICO'}</div>
                <div class="shop-card-top">
                    <div class="shop-icon">${pkg.icon}</div>
                    <div class="shop-title">${pkg.name}</div>
                    <div class="shop-desc">${pkg.description}</div>
                </div>
                <div class="shop-card-bottom">
                    <div class="shop-price">$${pkg.price} <span>USD</span></div>
                    <button class="btn-primary btn-block" onclick="selectPackage('${pkg.id}', '${pkg.name}', '${pkg.price}')">
                        ✨ Adquirir Recompensa
                    </button>
                </div>
            </div>
        `;
    }).join("");
}

function setupCategoryFilters() {
    const buttons = document.querySelectorAll(".shop-cat-btn");
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentCategory = btn.getAttribute("data-category");
            renderCatalogCards(currentCatalog);
        });
    });
}

function selectPackage(id, name, price) {
    selectedPackage = { id, name, price };
    const checkout = document.getElementById("checkoutSection");
    const summary = document.getElementById("selectedPkgSummary");

    if (summary) {
        summary.innerHTML = `Has seleccionado: <strong>${name}</strong> por <strong>$${price} USD</strong>`;
    }

    if (checkout) {
        checkout.style.display = "block";
        checkout.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    // Inicializar PayPal SDK si está disponible
    initPayPalButton(id, price);
}

function closeCheckout() {
    const checkout = document.getElementById("checkoutSection");
    if (checkout) checkout.style.display = "none";
}

function simulateTestDonation() {
    const charName = document.getElementById("targetCharacterName")?.value.trim();
    const feedback = document.getElementById("paymentFeedback");

    if (!charName) {
        alert("Por favor escribe el nombre exacto de tu personaje antes de continuar.");
        document.getElementById("targetCharacterName")?.focus();
        return;
    }

    if (feedback) {
        feedback.style.display = "block";
        feedback.className = "payment-feedback-box success-box";
        feedback.innerHTML = `
            <div>🎉 <strong>¡Recompensa Simulada con Éxito!</strong></div>
            <p style="margin-top: 5px; font-size: 0.88rem;">
                Se ha generado la orden de prueba para el personaje <strong>${charName.toUpperCase()}</strong>.
                En el servidor real, el comando SOAP entregará automáticamente el correo con los Tokens de Jaina.
            </p>
        `;
    }
}

async function loadRemoteCatalog() {
    try {
        const apiUrl = (typeof CONFIG !== 'undefined' && CONFIG.getApiUrl) ? CONFIG.getApiUrl() : 'http://127.0.0.1:8080';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const response = await fetch(`${apiUrl}/api/shop/catalog`, {
            signal: controller.signal,
            headers: { "Accept": "application/json" }
        });
        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                currentCatalog = data;
                renderCatalogCards(currentCatalog);
            }
        }
    } catch (e) {
        // En espera de conexión SOAP
    }
}

function initPayPalButton(packageId, price) {
    const container = document.getElementById("paypal-button-container");
    if (!container) return;
    container.innerHTML = "";

    // Si window.paypal no existe, inyectar el script con CONFIG.PAYPAL_CLIENT_ID
    const clientId = (typeof CONFIG !== 'undefined' && CONFIG.PAYPAL_CLIENT_ID) ? CONFIG.PAYPAL_CLIENT_ID : "sb";
    
    if (!window.paypal) {
        const script = document.createElement("script");
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
        script.onload = () => renderPayPal(container, packageId, price);
        document.head.appendChild(script);
    } else {
        renderPayPal(container, packageId, price);
    }
}

function renderPayPal(container, packageId, price) {
    if (!window.paypal || !window.paypal.Buttons) {
        container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem; text-align: center;">Pasarela de PayPal lista para activación con Client ID de producción.</p>`;
        return;
    }

    window.paypal.Buttons({
        createOrder: (data, actions) => {
            const charName = document.getElementById("targetCharacterName")?.value.trim();
            if (!charName) {
                alert("Por favor ingresa el nombre de tu personaje para recibir la recompensa.");
                throw new Error("Nombre de personaje requerido");
            }
            return actions.order.create({
                purchase_units: [{
                    amount: { value: price },
                    description: `Project JAIna - ${selectedPackage.name} (Destinatario: ${charName})`
                }]
            });
        },
        onApprove: async (data, actions) => {
            const details = await actions.order.capture();
            const feedback = document.getElementById("paymentFeedback");
            if (feedback) {
                feedback.style.display = "block";
                feedback.className = "payment-feedback-box success-box";
                feedback.innerHTML = `🎉 ¡Gracias ${details.payer.name.given_name}! Pago completado. Tus tokens están en camino a tu buzón in-game.`;
            }
        }
    }).render(container);
}
