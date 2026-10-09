/**
 * Project Jaina / Project Jaina — Telemetría en Vivo & Navegación
 */

document.addEventListener("DOMContentLoaded", () => {
    updateTelemetry();
    // Sondeo de estado cada 10 segundos
    setInterval(updateTelemetry, 10000);
});

async function updateTelemetry() {
    const apiUrl = CONFIG.getApiUrl();
    const statusDot = document.getElementById("statusDot");
    const statusText = document.getElementById("statusText");
    const onlinePlayers = document.getElementById("onlinePlayers");
    const totalAccounts = document.getElementById("totalAccounts");
    const jainaCount = document.getElementById("jainaCount");
    const communityCount = document.getElementById("communityCount");

    try {
        const response = await fetch(`${apiUrl}/api/status`, {
            method: "GET",
            headers: { 
                "Accept": "application/json",
                "ngrok-skip-browser-warning": "true"
            }
        });

        if (response.ok) {
            const data = await response.json();
            
            if (statusDot) {
                statusDot.className = data.status === "ONLINE" ? "pulse-dot" : "pulse-dot offline";
            }
            if (statusText) {
                statusText.innerText = data.status;
                statusText.style.color = data.status === "ONLINE" ? "var(--status-online)" : "var(--status-offline)";
            }
            if (onlinePlayers) {
                onlinePlayers.innerText = data.online_characters || 0;
            }
            if (totalAccounts) {
                totalAccounts.innerText = data.total_accounts || 0;
            }
            if (jainaCount) {
                jainaCount.innerText = `${data.online_characters || 0} Guerreros`;
            }
            if (communityCount) {
                communityCount.innerText = `${data.total_accounts || 0} Seguidores`;
            }
        } else {
            throw new Error("HTTP Status Error");
        }
    } catch (error) {
        if (statusDot) statusDot.className = "pulse-dot offline";
        if (statusText) {
            statusText.innerText = "MANTENIMIENTO";
            statusText.style.color = "var(--status-offline)";
        }
    }
}
