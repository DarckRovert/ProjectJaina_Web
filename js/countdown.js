/**
 * ============================================================================
 * Project JAIna — Relojes Maestros de Apertura & Telemetría Progresiva en Vivo
 * Archivo: js/countdown.js
 * Versión: 3.0 Mythos (Precisión Atómica & Estándar de Excelencia Visual)
 * ============================================================================
 */

(function () {
    'use strict';

    // ------------------------------------------------------------------------
    // CONSTANTES Y CONFIGURACIÓN TEMPORAL (SSOT)
    // ------------------------------------------------------------------------
    // Apertura Oficial Solicitada: 24 de Noviembre de 2026 (UTC-5 / Lima/Bogotá)
    const GRAND_OPENING_TARGET = new Date('2026-11-24T00:00:00-05:00').getTime();
    const PROJECT_CREATION_START = new Date('2026-10-01T00:00:00-05:00').getTime();
    const PROGRESSION_SSOT_URL = 'data/progression.json';

    // Estado interno sincronizado de telemetría de servidor
    let serverBootEpoch = null;
    let serverUptimeSeconds = 0;
    let isServerLive = false;
    let progressionMetadata = null;

    // ------------------------------------------------------------------------
    // INICIALIZACIÓN
    // ------------------------------------------------------------------------
    document.addEventListener('DOMContentLoaded', () => {
        initGrandOpeningCountdown();
        initServerLiveChronometer();
    });

    // ------------------------------------------------------------------------
    // 1. CONTADOR DE CUENTA REGRESIVA PARA LA GRAN APERTURA (24/11/2026)
    // ------------------------------------------------------------------------
    function initGrandOpeningCountdown() {
        function updateOpeningClock() {
            const now = Date.now();
            const diff = GRAND_OPENING_TARGET - now;

            const daysEl = document.getElementById('openingDays');
            const hoursEl = document.getElementById('openingHours');
            const minutesEl = document.getElementById('openingMinutes');
            const secondsEl = document.getElementById('openingSeconds');
            const progressFillEl = document.getElementById('openingProgressFill');

            if (diff <= 0) {
                if (daysEl) daysEl.textContent = '00';
                if (hoursEl) hoursEl.textContent = '00';
                if (minutesEl) minutesEl.textContent = '00';
                if (secondsEl) secondsEl.textContent = '00';
                if (progressFillEl) progressFillEl.style.width = '100%';

                const titleEl = document.querySelector('.opening-title');
                if (titleEl) {
                    titleEl.innerHTML = '⚔️ ¡EL PORTAL ESTÁ ABIERTO! · EL REINO ESTÁ ACTIVO ⚔️';
                    titleEl.style.color = 'var(--gold-primary)';
                }
                return;
            }

            const totalSeconds = Math.floor(diff / 1000);
            const days = Math.floor(totalSeconds / 86400);
            const hours = Math.floor((totalSeconds % 86400) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
            if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
            if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
            if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');

            // Barra de progreso temporal (Desde inicio del proyecto hasta 24/11/2026)
            if (progressFillEl) {
                const totalSpan = GRAND_OPENING_TARGET - PROJECT_CREATION_START;
                const elapsedSpan = now - PROJECT_CREATION_START;
                let pct = (elapsedSpan / totalSpan) * 100;
                pct = Math.max(0, Math.min(100, pct));
                progressFillEl.style.width = pct.toFixed(1) + '%';
            }
        }

        updateOpeningClock();
        setInterval(updateOpeningClock, 1000);
    }

    // ------------------------------------------------------------------------
    // 2. CRONÓMETRO DE REINO EN VIVO & TELEMETRÍA DE TRANSICIÓN DE ERAS
    // ------------------------------------------------------------------------
    async function initServerLiveChronometer() {
        // Cargar metadatos canónicos de progresión
        await fetchProgressionSSOT();

        // Sondeo inicial contra el servidor/API
        await syncServerTelemetry();

        // Reloj tickeando en vivo local cada segundo para el Uptime
        setInterval(tickLocalChronometers, 1000);

        // Sondeo de telemetría de servidor periódica cada 12 segundos
        setInterval(syncServerTelemetry, 12000);
    }

    async function fetchProgressionSSOT() {
        try {
            const resp = await fetch(PROGRESSION_SSOT_URL + '?t=' + Date.now());
            if (resp.ok) {
                progressionMetadata = await resp.json();
                renderProgressionChronometer();
            }
        } catch (e) {
            console.warn('[Countdown] Usando fallback local para progresión:', e);
        }
    }

    async function syncServerTelemetry() {
        try {
            const apiUrl = (typeof CONFIG !== 'undefined' && CONFIG.getApiUrl) 
                ? CONFIG.getApiUrl() 
                : 'http://127.0.0.1:8080';

            const resp = await fetch(`${apiUrl}/api/status`, {
                method: 'GET',
                headers: { 
                    'Accept': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                }
            });

            if (resp.ok) {
                const data = await resp.json();
                isServerLive = (data.status === 'ONLINE' || data.world_online === true);
                
                if (data.server_uptime_seconds !== undefined) {
                    serverUptimeSeconds = Number(data.server_uptime_seconds) || 0;
                } else if (data.server_start_time) {
                    const startEpoch = new Date(data.server_start_time).getTime();
                    serverUptimeSeconds = Math.max(0, Math.floor((Date.now() - startEpoch) / 1000));
                } else if (isServerLive) {
                    // Servidor detectado activo por socket, calcular desde inicio relativo o persistido
                    if (!serverBootEpoch) {
                        serverBootEpoch = Date.now() - (serverUptimeSeconds * 1000);
                    }
                }

                // Actualizar parámetros adicionales si vienen de la API
                if (data.world_tickrate_ms) {
                    const tickEl = document.getElementById('paramTickrate');
                    if (tickEl) tickEl.textContent = `~${data.world_tickrate_ms} ms (Estable)`;
                }
            } else {
                throw new Error('API offline');
            }
        } catch (err) {
            // Servidor en modo autónomo/espera
            isServerLive = false;
            // Si el servidor está en standby, calculamos tiempo de sesión relativo a la fase activa
            if (progressionMetadata && progressionMetadata.server_start_time) {
                const fallbackStart = new Date(progressionMetadata.server_start_time).getTime();
                serverUptimeSeconds = Math.max(0, Math.floor((Date.now() - fallbackStart) / 1000));
            }
        }

        renderServerTelemetryUI();
    }

    function tickLocalChronometers() {
        // Solo incrementar uptime continuo si el servidor está activo en vivo
        if (isServerLive) {
            serverUptimeSeconds++;
        }
        renderServerTelemetryUI();
        renderProgressionChronometer();
    }

    function renderServerTelemetryUI() {
        const uptimeStr = isServerLive 
            ? formatDuration(serverUptimeSeconds) 
            : '00d 00h 00m 00s (STANDBY)';

        // Barra de estado hero
        const serverUptimeEl = document.getElementById('serverUptime');
        if (serverUptimeEl) {
            serverUptimeEl.textContent = uptimeStr;
        }

        // HUD de Línea de Fases
        const hudServerUptimeEl = document.getElementById('hudServerUptime');
        if (hudServerUptimeEl) {
            hudServerUptimeEl.textContent = uptimeStr;
        }

        // Indicador de Era & Cap en Hero
        const activeEraCapEl = document.getElementById('activeEraCap');
        if (activeEraCapEl && progressionMetadata) {
            const cap = progressionMetadata.active_level_cap || 60;
            const phaseId = (progressionMetadata.active_phase_id || 'vanilla').toLowerCase();
            const phaseLabel = phaseId === 'vanilla' ? 'Vanilla' : (phaseId === 'tbc' ? 'TBC' : 'WotLK');
            activeEraCapEl.textContent = `${phaseLabel} (Lv ${cap})`;
        }
    }

    function renderProgressionChronometer() {
        if (!progressionMetadata) return;

        const now = Date.now();

        // 1. Tiempo transcurrido en la era activa (TBC)
        const phaseStart = progressionMetadata.current_phase_start 
            ? new Date(progressionMetadata.current_phase_start).getTime()
            : new Date('2026-10-01T00:00:00-05:00').getTime();
        
        const phaseElapsedSec = Math.max(0, Math.floor((now - phaseStart) / 1000));
        const tbcElapsedEl = document.getElementById('tbcElapsedTime');
        if (tbcElapsedEl) {
            tbcElapsedEl.textContent = `Tiempo en Era: ${formatShortDuration(phaseElapsedSec)}`;
        }

        // 2. Tiempo restante para la siguiente transición (WotLK Naxxramas)
        const nextTarget = progressionMetadata.next_phase_target
            ? new Date(progressionMetadata.next_phase_target).getTime()
            : new Date('2027-01-15T00:00:00-05:00').getTime();

        const remainingSec = Math.max(0, Math.floor((nextTarget - now) / 1000));
        const nextPhaseCountdownEl = document.getElementById('nextPhaseCountdown');
        if (nextPhaseCountdownEl) {
            nextPhaseCountdownEl.textContent = `Apertura en: ${formatShortDuration(remainingSec)}`;
        }

        // 3. Barra de porcentaje de transición de era
        const totalPhaseSpan = nextTarget - phaseStart;
        const currentElapsedSpan = now - phaseStart;
        let progressPct = 0;
        if (totalPhaseSpan > 0) {
            progressPct = Math.min(100, Math.max(0, (currentElapsedSpan / totalPhaseSpan) * 100));
        }

        const gaugeTextEl = document.getElementById('transitionPercentText');
        const gaugeFillEl = document.getElementById('transitionGaugeFill');
        if (gaugeTextEl) {
            gaugeTextEl.textContent = progressPct.toFixed(1) + '%';
        }
        if (gaugeFillEl) {
            gaugeFillEl.style.width = progressPct.toFixed(1) + '%';
        }
    }

    // ------------------------------------------------------------------------
    // UTILIDADES DE FORMATEO TEMPORAL
    // ------------------------------------------------------------------------
    function formatDuration(totalSec) {
        const days = Math.floor(totalSec / 86400);
        const hours = Math.floor((totalSec % 86400) / 3600);
        const minutes = Math.floor((totalSec % 3600) / 60);
        const seconds = totalSec % 60;

        const dStr = String(days).padStart(2, '0') + 'd';
        const hStr = String(hours).padStart(2, '0') + 'h';
        const mStr = String(minutes).padStart(2, '0') + 'm';
        const sStr = String(seconds).padStart(2, '0') + 's';

        return `${dStr} ${hStr} ${mStr} ${sStr}`;
    }

    function formatShortDuration(totalSec) {
        const days = Math.floor(totalSec / 86400);
        const hours = Math.floor((totalSec % 86400) / 3600);
        const minutes = Math.floor((totalSec % 3600) / 60);

        return `${days}d ${hours}h ${minutes}m`;
    }

})();
