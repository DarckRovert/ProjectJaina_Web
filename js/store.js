/**
 * Project Jaina / Project Jaina — Tienda Oficial & Integración PayPal SDK
 */

let selectedPackage = null;

document.addEventListener("DOMContentLoaded", () => {
    loadShopCatalog();
});

async function loadShopCatalog() {
    const container = document.getElementById("shopCardsContainer");
    if (!container) return;

    try {
        const apiUrl = CONFIG.getApiUrl();
        const response = await fetch(`${apiUrl}/api/shop/catalog`);
        const catalog = await response.json();

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
    } catch (e) {
        container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--status-offline); padding: 2rem;">No se pudo cargar el catálogo de donaciones. Conectando con servidor local...</div>`;
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
        btnContainer.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem;">⏳ Inicializando pasarela segura de PayPal (${CONFIG.PAYPAL_CLIENT_ID})...</p>`;
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
                    description: `Project Jaina: ${selectedPackage.name}`,
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
                        feedbackDiv.style.color = "var(--status-offline)";
                        feedbackDiv.innerHTML = `⚠️ Pago capturado en PayPal, pero la auto-entrega reportó: ${resData.message}. Un GM revisará tu entrega de inmediato.`;
                    }
                } catch (e) {
                    feedbackDiv.style.color = "var(--status-offline)";
                    feedbackDiv.innerHTML = `⚠️ Pago completado en PayPal (ID: ${data.orderID}). Si el servidor no estaba en línea, contacta al staff para entrega manual.`;
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
