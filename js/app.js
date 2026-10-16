/**
 * Project Jaina — Telemetría en Vivo & Coordinación de Estado del Reino (SSOT)
 * Versión: 3.1 Mythos (Resiliente, Cero Peticiones Fantasma, Sincronización Global)
 */

document.addEventListener("DOMContentLoaded", () => {
    updateTelemetry();
    // Sondeo único y coordinado cada 10 segundos
    setInterval(updateTelemetry, 10000);
});

async function updateTelemetry() {
    const apiUrl = (typeof CONFIG !== "undefined" && CONFIG.getApiUrl)
        ? CONFIG.getApiUrl()
        : "http://127.0.0.1:8080";

    const statusDot = document.getElementById("statusDot");
    const statusText = document.getElementById("statusText");
    const onlinePlayers = document.getElementById("onlinePlayers");
    const totalAccounts = document.getElementById("totalAccounts");
    const activeEraCap = document.getElementById("activeEraCap");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    try {
        const response = await fetch(`${apiUrl}/api/status`, {
            method: "GET",
            signal: controller.signal,
            headers: { 
                "Accept": "application/json",
                "ngrok-skip-browser-warning": "true"
            }
        });
        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            const isOnline = (data.status === "ONLINE" || data.world_online === true);
            
            if (statusDot) {
                statusDot.className = isOnline ? "pulse-dot" : "pulse-dot offline";
            }
            if (statusText) {
                statusText.innerText = isOnline ? "ONLINE" : (data.status || "MANTENIMIENTO");
                statusText.style.color = isOnline ? "var(--status-online)" : "var(--status-offline)";
            }
            if (onlinePlayers) {
                onlinePlayers.innerText = isOnline ? (data.online_characters || 0) : 0;
            }
            if (totalAccounts) {
                totalAccounts.innerText = data.total_accounts || 0;
            }
            if (activeEraCap && data.active_phase_name) {
                activeEraCap.innerText = `${data.active_phase_name} (Lv ${data.active_level_cap || 60})`;
            }

            // Notificación reactiva al bus interno (evita doble petición en countdown.js)
            window.dispatchEvent(new CustomEvent("jaina:telemetry", { detail: { ...data, isOnline } }));
        } else {
            throw new Error(`HTTP Error: ${response.status}`);
        }
    } catch (error) {
        clearTimeout(timeoutId);

        if (statusDot) statusDot.className = "pulse-dot offline";
        if (statusText) {
            statusText.innerText = "MANTENIMIENTO";
            statusText.style.color = "var(--status-offline)";
        }
        if (onlinePlayers) {
            onlinePlayers.innerText = 0; // Cero jugadores fantasma durante caídas
        }

        window.dispatchEvent(new CustomEvent("jaina:telemetry", { 
            detail: { status: "OFFLINE", isOnline: false, server_uptime_seconds: 0 } 
        }));
    }
}

