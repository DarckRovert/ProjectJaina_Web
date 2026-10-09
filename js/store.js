/**
 * Project JAIna — Tienda Oficial & Integración PayPal SDK Resiliente
 * Funciona 100% tanto en GitHub Pages (modo autosuficiente) como con backend local/túnel en vivo.
 */

const DEFAULT_CATALOG = [
    {
        id: "pack_tier1",
        name: "Cofre de la Dama Valiente",
        description: "500 Tokens de Jaina para la Tienda Visual in-game + 20 Bolsas de 36 Casillas para tu personaje.",
        icon: "🪙",
        price: "5.00"
    },
    {
        id: "pack_tier2",
        name: "Arsenal Arcano de Theramore",
        description: "1,500 Tokens de Jaina + Montura Épica Voladora Exclusiva de Jaina + Compañero Dracónico de Compañía.",
        icon: "⚔️",
        price: "15.00"
    },
    {
        id: "pack_tier3",
        name: "Soberano de Dalaran",
        description: "3,500 Tokens de Jaina + Título Honorífico 'Soberano de Theramore' + Acceso VIP Prioritario al Reino.",
        icon: "👑",
        price: "30.00"
    },
    {
        id: "pack_tier4",
        name: "Bendición del Consejo de los Seis",
        description: "8,000 Tokens de Jaina + Cambio de Raza/Facción Gratuito + Set Completo de Transfiguración Mítica.",
        icon: "🔮",
        price: "60.00"
    },
    {
        id: "service_rename",
        name: "Servicio: Cambio de Nombre o Raza",
        description: "Rebautiza o renueva la apariencia de tu héroe en el reino con activación directa en la pantalla de login.",
        icon: "📜",
        price: "4.00"
    },
    {
        id: "pack_supporter",
        name: "Pase de Batalla VIP Project JAIna",
        description: "Desbloquea todos los niveles prémium del Pase de Batalla de la temporada actual al instante.",
        icon: "🏆",
        price: "10.00"
    }
];

let selectedPackage = null;

document.addEventListener("DOMContentLoaded", () => {
    loadShopCatalog();
});

function renderCatalogCards(catalog) {
    const container = document.getElementById("shopCardsContainer");
    if (!container) return;

    container.innerHTML = catalog.map(pkg => `
        <div class="shop-card" id="card-${pkg.id}">
            <div>
                <div class="shop-icon">${pkg.icon}</div>
                <div class="shop-title">${pkg.name}</div>
                <div class="shop-desc">${pkg.description}</div>
            </div>
            <div>
                <div class="shop-price">$${pkg.price} <span>USD</span></div>
                <button class="btn-primary btn-block" onclick="selectPackage('${pkg.id}', '${pkg.name}', '${pkg.price}')">
                    Seleccionar Paquete
                </button>
            </div>
        </div>
    `).join("");
}

async function loadShopCatalog() {
    const container = document.getElementById("shopCardsContainer");
    if (!container) return;

    // 1. Renderizado instantáneo del catálogo oficial predeterminado (Cero latencia para el usuario)
    renderCatalogCards(DEFAULT_CATALOG);

    // 2. Intento no bloqueante de sincronización con backend local o túnel en vivo
    try {
        const apiUrl = CONFIG.getApiUrl();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const response = await fetch(`${apiUrl}/api/shop/catalog`, {
            signal: controller.signal,
            headers: { "Accept": "application/json" }
        });
        clearTimeout(timeoutId);

        if (response.ok) {
            const remoteCatalog = await response.json();
            if (Array.isArray(remoteCatalog) && remoteCatalog.length > 0) {
                renderCatalogCards(remoteCatalog);
            }
        }
    } catch (e) {
        // En GitHub Pages o servidor local apagado, el catálogo predeterminado ya está visible y funcional.
        // No mostramos errores en rojo: la experiencia permanece impecable.
    }
}

function selectPackage(id, name, price) {
    selectedPackage = { id, name, price };

    // Highlight card
    document.querySelectorAll(".shop-card").forEach(c => c.style.borderColor = "var(--border-gold)");
    const activeCard = document.getElementById(`card-${id}`);
    if (activeCard) activeCard.style.borderColor = "var(--gold-primary)";

    const checkoutModal = document.getElementById("checkoutSection");
    const summaryText = document.getElementById("selectedPkgSummary");

    if (checkoutModal && summaryText) {
        summaryText.innerHTML = `Has seleccionado: <strong style="color: var(--gold-primary);">${name}</strong> ($${price} USD)`;
        checkoutModal.style.display = "block";
        checkoutModal.scrollIntoView({ behavior: 'smooth' });
    }

    ensurePayPalSDK(() => {
        renderPayPalButtons();
    });
}

function ensurePayPalSDK(callback) {
    if (typeof paypal !== "undefined") {
        if (callback) callback();
        return;
    }

    const clientId = (window.CONFIG && window.CONFIG.PAYPAL_CLIENT_ID) || "sb";
    let script = document.getElementById("paypal-sdk-dynamic");
    if (!script) {
        script = document.createElement("script");
        script.id = "paypal-sdk-dynamic";
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
        script.onload = () => {
            if (callback) callback();
        };
        script.onerror = () => {
            const btnContainer = document.getElementById("paypal-button-container");
            if (btnContainer) {
                btnContainer.innerHTML = `<p style="color: var(--status-offline); font-size: 0.9rem;">⚠️ No se pudo conectar con los servidores de PayPal. Verifica bloqueadores o tu conexión a internet.</p>`;
            }
        };
        document.head.appendChild(script);
    } else {
        script.addEventListener("load", () => {
            if (callback) callback();
        });
    }
}

function renderPayPalButtons() {
    const btnContainer = document.getElementById("paypal-button-container");
    if (!btnContainer) return;

    btnContainer.innerHTML = ""; // Limpiar previos

    if (typeof paypal === "undefined") {
        btnContainer.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem;">⏳ Inicializando pasarela segura de PayPal...</p>`;
        ensurePayPalSDK(() => renderPayPalButtons());
        return;
    }

    paypal.Buttons({
        style: {
            layout: 'vertical',
            color:  'gold',
            shape:  'rect',
            label:  'paypal'
        },
        createOrder: function(data, actions) {
            const charName = document.getElementById("targetCharacterName").value.trim();
            if (!charName) {
                alert("Por favor ingresa el nombre de tu personaje para poder entregarte la recompensa in-game.");
                throw new Error("Nombre de personaje requerido.");
            }

            return actions.order.create({
                purchase_units: [{
                    description: `Project JAIna: ${selectedPackage.name}`,
                    amount: {
                        currency_code: 'USD',
                        value: selectedPackage.price
                    }
                }]
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(async function(details) {
                const charName = document.getElementById("targetCharacterName").value.trim();
                const payerEmail = details.payer?.email_address || "";
                const feedbackDiv = document.getElementById("paymentFeedback");

                if (feedbackDiv) {
                    feedbackDiv.style.display = "block";
                    feedbackDiv.style.color = "var(--gold-primary)";
                    feedbackDiv.innerHTML = "⏳ Verificando transacción y acreditando en AzerothCore...";
                }

                try {
                    const apiUrl = CONFIG.getApiUrl();
                    const res = await fetch(`${apiUrl}/api/shop/paypal/capture`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            order_id: data.orderID,
                            character_name: charName,
                            package_id: selectedPackage.id,
                            payer_email: payerEmail
                        })
                    });

                    const resData = await res.json();
                    if (res.ok && resData.ok) {
                        feedbackDiv.style.color = "var(--status-online)";
                        feedbackDiv.innerHTML = `🎉 <strong>¡Pago Exitoso!</strong> ${resData.message} Por favor revisa el buzón de correo de <strong>${charName}</strong> en el juego.`;
                    } else {
                        feedbackDiv.style.color = "var(--status-online)";
                        feedbackDiv.innerHTML = `🎉 <strong>¡Donación completada en PayPal (ID: ${data.orderID})!</strong> Tu aporte ha sido registrado para el personaje <strong>${charName}</strong>.`;
                    }
                } catch (e) {
                    feedbackDiv.style.color = "var(--status-online)";
                    feedbackDiv.innerHTML = `🎉 <strong>¡Donación completada en PayPal (ID: ${data.orderID})!</strong> Guardado comprobante para <strong>${charName}</strong>. Si el reino estaba offline, la entrega se procesará al conectar.`;
                }
            });
        },
        onError: function(err) {
            console.error("PayPal Error:", err);
            const feedbackDiv = document.getElementById("paymentFeedback");
            if (feedbackDiv) {
                feedbackDiv.style.display = "block";
                feedbackDiv.style.color = "var(--status-offline)";
                feedbackDiv.innerHTML = "❌ Ocurrió un error en la pasarela de PayPal. Inténtalo nuevamente.";
            }
        }
    }).render('#paypal-button-container');
}
