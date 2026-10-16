/**
 * Project Jaina — Módulo de Guía de Conexión & Utilidades de Copiado (Anycast Global WAN)
 * Versión: 2.5 (Experiencia de Usuario Simplificada - Cero VPN)
 */

document.addEventListener("DOMContentLoaded", () => {
    const tabButtons = document.querySelectorAll(".conn-tab-btn");
    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const tabId = btn.getAttribute("data-tab");
            switchConnectionTab(tabId);
        });
    });
});

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

function copyConnectionData(elementId, btnElement) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const textToCopy = (el.innerText || el.textContent || "").trim();
    if (!textToCopy) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            showCopyFeedback(btnElement);
        }).catch(() => {
            fallbackCopy(textToCopy, btnElement);
        });
    } else {
        fallbackCopy(textToCopy, btnElement);
    }
}

function fallbackCopy(text, btnElement) {
    try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        showCopyFeedback(btnElement);
    } catch (e) {
        console.error("No se pudo copiar el texto automáticamente", e);
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
