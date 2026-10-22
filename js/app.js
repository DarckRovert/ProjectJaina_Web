/**
 * Project Jaina — Telemetría en Vivo & Coordinación de Estado del Reino (SSOT)
 * Versión: 3.1 Mythos (Resiliente, Cero Peticiones Fantasma, Sincronización Global)
 */

document.addEventListener("DOMContentLoaded", () => {
    updateTelemetry();
    loadServerFundingGoal();
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

            // Actualización de Métricas Dual-Realm & Tri-Facción
            updateDualRealmUI(data, isOnline);
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

        updateDualRealmUI({ status: "OFFLINE" }, false);
    }
}

function updateDualRealmUI(data, isOnline) {
    // Reino 1: Project Jaina (Anycast L4)
    const jainaStatusBadge = document.getElementById("realmJainaStatus");
    if (jainaStatusBadge) {
        jainaStatusBadge.className = isOnline ? "realm-ping-badge" : "realm-ping-badge offline";
        jainaStatusBadge.innerHTML = isOnline 
            ? `🟢 <span style="color: #34d399;">ONLINE</span> (~18ms)`
            : `🔴 <span style="color: #f87171;">MANTENIMIENTO</span>`;
    }

    // Reino 2: Forja de Hierro - PvP Hardcore (Perú)
    const forjaStatusBadge = document.getElementById("realmForjaStatus");
    if (forjaStatusBadge) {
        const isForjaOnline = Boolean(data && data.realm2_online);
        forjaStatusBadge.style.background = isForjaOnline ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)";
        forjaStatusBadge.style.borderColor = isForjaOnline ? "rgba(16, 185, 129, 0.35)" : "rgba(245, 158, 11, 0.35)";
        forjaStatusBadge.style.color = isForjaOnline ? "#34d399" : "#f59e0b";
        forjaStatusBadge.innerHTML = isForjaOnline
            ? `🟢 <span style="color: #34d399;">ONLINE</span> (Playit Anycast)`
            : `🟡 <span style="color: #f59e0b;">STANDBY</span> (Playit Anycast)`;
    }

    // Reino 3: WanitosGym - Laboratorio (España)
    const wanitosStatusBadge = document.getElementById("realmWanitosStatus");
    if (wanitosStatusBadge) {
        const isWanitosOnline = Boolean(data && data.realm3_online);
        wanitosStatusBadge.style.background = isWanitosOnline ? "rgba(16, 185, 129, 0.12)" : "rgba(168, 85, 247, 0.12)";
        wanitosStatusBadge.style.borderColor = isWanitosOnline ? "rgba(16, 185, 129, 0.35)" : "rgba(168, 85, 247, 0.35)";
        wanitosStatusBadge.style.color = isWanitosOnline ? "#34d399" : "#c084fc";
        wanitosStatusBadge.innerHTML = isWanitosOnline
            ? `🟢 <span style="color: #34d399;">ONLINE</span> (Radmin VPN)`
            : `🟣 <span style="color: #c084fc;">STANDBY</span> (Radmin VPN)`;
    }

    // Balance Bi-Facción Canónico (Alianza vs Horda)
    const barAlliance = document.getElementById("factionSliceAlliance");
    const barHorde = document.getElementById("factionSliceHorde");

    let rawAlliance = (data.faction_alliance_pct !== undefined) ? data.faction_alliance_pct : 52;
    let rawHorde = (data.faction_horde_pct !== undefined) ? data.faction_horde_pct : 48;
    
    // Normalizar a 100% entre ambas facciones
    const total = (rawAlliance + rawHorde) > 0 ? (rawAlliance + rawHorde) : 100;
    const pctAlliance = Math.round((rawAlliance / total) * 100);
    const pctHorde = 100 - pctAlliance;

    if (barAlliance) barAlliance.style.width = `${pctAlliance}%`;
    if (barHorde) barHorde.style.width = `${pctHorde}%`;

    const txtAlliance = document.getElementById("factionPctAlliance");
    const txtHorde = document.getElementById("factionPctHorde");

    if (txtAlliance) txtAlliance.textContent = `${pctAlliance}%`;
    if (txtHorde) txtHorde.textContent = `${pctHorde}%`;
}

// ─────────────────────────────────────────────────────────────────────────────
// TELEMETRÍA DE SOSTENIBILIDAD & META COMUNITARIA (ZERO-P2W)
// ─────────────────────────────────────────────────────────────────────────────
async function loadServerFundingGoal() {
    let data = null;
    try {
        const apiUrl = (typeof CONFIG !== "undefined" && CONFIG.getApiUrl)
            ? CONFIG.getApiUrl()
            : "http://127.0.0.1:8080";
        const ctrl = new AbortController();
        const timeout = setTimeout(() => ctrl.abort(), 2000);
        const respRemote = await fetch(`${apiUrl}/api/shop/goal`, {
            signal: ctrl.signal,
            headers: { "Accept": "application/json", "ngrok-skip-browser-warning": "true" }
        });
        clearTimeout(timeout);
        if (respRemote.ok) {
            data = await respRemote.json();
        }
    } catch (_) {}

    if (!data) {
        try {
            const respLocal = await fetch("data/server_goal.json");
            if (respLocal.ok) {
                data = await respLocal.json();
            }
        } catch (_) {}
    }

    if (!data) return;

    try {
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


